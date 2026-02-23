#!/usr/bin/env python
#MISE description="Build a manifest for extracted pngs"
#MISE dir="{{config_root}}"
#MISE sources=["{{env.assets_dir}}/extracted"]
#MISE outputs=["{{env.raw_assets_dir}}/dump/manifest.json"]
#MISE depends=["assets:extract"]

import os
import sys
import json
from concurrent.futures import Future, ThreadPoolExecutor, as_completed
from typing import TypedDict

try:
  from PIL import Image
except ImportError:
  print("Error: Pillow is not installed in the current environment.")
  print("Run `pip install Pillow` while your mise environment is active.")
  sys.exit(1)

class ManifestItem(TypedDict):
  filename: str
  width: int
  height: int
  jar: str
  mod: str
  type: str

Manifest = list[ManifestItem]


def get_png_info(file_path: str, jar_name: str, mod_id: str, item_type: str, filename: str)-> ManifestItem | None:
  """
  Uses Pillow to safely read the image header without decoding pixels.
  """
  try:
    with Image.open(file_path) as img:
      width, height = img.size
      
    item: ManifestItem = {
      "jar": jar_name,
      "mod": mod_id,
      "type": item_type,
      "filename": filename,
      "width": width,
      "height": height
    }
    return item
  except Exception as e:
    print(f"Warning: Failed to parse {file_path} - {e}")
    return None

def build_manifest_parallel(base_dir: str, max_workers: int | None=None) -> Manifest:
  extracted_dir = os.path.join(base_dir, "extracted")
  
  if not os.path.exists(extracted_dir):
    print(f"Error: Directory {extracted_dir} does not exist.")
    sys.exit(1)

  tasks: list[Future[ManifestItem | None]] = []
  
  with ThreadPoolExecutor(max_workers=max_workers) as executor:
    for jar in os.scandir(extracted_dir):
      if not jar.is_dir(): continue
      for mod in os.scandir(jar.path):
        if not mod.is_dir(): continue
        for item_type in os.scandir(mod.path):
          if not item_type.is_dir(): continue
          for file in os.scandir(item_type.path):
            if not file.name.endswith(".png"): continue
            task = executor.submit(
              get_png_info, 
              file.path, jar.name, mod.name, item_type.name, file.name
            )
            tasks.append(task)
    
    print(f"Queued {len(tasks)} images for processing. Reading headers...")
    
    manifest: Manifest = []
    for future in as_completed(tasks):
      result = future.result()
      if result:
        manifest.append(result)
        
  return manifest

if __name__ == "__main__":
  # Pull the directory dynamically from the environment variable mise injects
  assets_dir = os.environ.get("assets_dir")
  raw_assets_dir = os.environ.get("raw_assets_dir")
  
  if not assets_dir:
    print("Error: 'assets_dir' environment variable is not set.")
    print("Make sure your mise.toml defines this variable.")
    sys.exit(1)

  if not raw_assets_dir:
    print("Error: 'raw_assets_dir' environment variable is not set.")
    print("Make sure your mise.toml defines this variable.")
    sys.exit(1)
    
  print(f"Building manifest for {assets_dir}...")
  manifest_data = build_manifest_parallel(assets_dir)
  
  output_path = os.path.join(raw_assets_dir,"dump", "manifest.json")
  with open(output_path, "w") as f:
    # Save as minified JSON
    json.dump(manifest_data, f, indent = 2)
    
  print(f"Manifest successfully generated at {output_path}")
