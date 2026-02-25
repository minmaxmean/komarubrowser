#!/usr/bin/env bash
set -e

START_MC_SERVER=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --start_mc_server)
      START_MC_SERVER="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

if [ -z "$star_t_dir" ]; then
  echo "Error: star_t_dir environment variable is not set"
  exit 1
fi
if [ ! -d "$star_t_dir" ] || [ -z "$(ls -A "$star_t_dir")" ]; then
  echo "Error: star_t_dir is empty or doesn't exist"
  exit 1
fi

if [ -z "$dumps_from_mod_dir" ]; then
  echo "Error: dumps_from_mod_dir environment variable is not set"
  exit 1
fi

if ! command -v rcon-cli &> /dev/null; then
  echo "Error: rcon-cli is not installed"
  echo "See https://github.com/itzg/rcon-cli"
  exit 1
fi

OUTPUT_DIR="$dumps_from_mod_dir"
mkdir -p $OUTPUT_DIR

LOG_FILE="/tmp/komaru/star_t.log"

if [ "$START_MC_SERVER" = "true" ]; then
  echo "Stopping existing server on port 26767..."
  lsof -ti:26767 | xargs kill  || true
  rm -f /tmp/komaru/star_t.log
  mkdir -p /tmp/komaru

  echo "Starting Minecraft server..."
  mise run //minecraft/star_t:dev > "$LOG_FILE" 2>&1 &
  echo "  Minecraft server logs available at $LOG_FILE"
  echo "  tail -f -n10 $LOG_FILE"
  SERVER_PID=$!


  SLEEP_TIME=10

  echo "Waiting for HTTP server at localhost:6767..."
  while ! http "http://localhost:6767/api/ping" &> /dev/null; do
    echo "  HTTP server is not up yet, sleeping for $SLEEP_TIME sec"
  sleep $SLEEP_TIME
  done
  echo "HTTP server is ready!"
else
  echo "Skipping server start, using existing server..."
fi

echo "Dumping recipes to $OUTPUT_DIR/recipes.json..."
http ":6767/api/recipes" --sorted --pretty=format > "$OUTPUT_DIR/recipes.json"

echo "Dumping ingredients to $OUTPUT_DIR/ingredients.json..."
http ":6767/api/ingredients" --sorted --pretty=format > "$OUTPUT_DIR/ingredients.json"

RCON_PORT="${RCON_PORT:-27676}"
RCON_PASSWORD="${RCON_PASSWORD:-67}"

if [ "$START_MC_SERVER" = "true" ]; then
  echo "Stopping server..."
  echo "  RCON_PORT=$RCON_PORT"
  echo "  RCON_PASSWORD=$RCON_PASSWORD"
  rcon-cli --host localhost --port "$RCON_PORT" --password "$RCON_PASSWORD" stop
else
  echo "Skipping server stop (using existing server)"
fi

echo "Done!"
