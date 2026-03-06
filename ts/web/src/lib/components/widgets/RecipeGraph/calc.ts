import type { Recipe } from '@komarubrowser/common/db/recipe';
import type { Customs } from './customs';
import type { EdgeType, NodeType, RecipeNodeData } from './graph';

export type NodeCalcState = {
  isAuto: boolean;
  machineCnt?: number;
};

export const initCalcState = (nodeId: string, customs: Customs): NodeCalcState => {
  if (!customs.manualMachines.includes(nodeId)) return { isAuto: true };
  return { isAuto: false, machineCnt: customs.manualMachinesCnt[nodeId] ?? 0 };
};

const simplifyMap: Record<string, string> = {
  'gtceu:large_chemical_reactor/sulfuric_acid_from_trioxide': 'H2SO4',
  'gtceu:large_chemical_reactor/sulfur_trioxide': 'SO3',
  'gtceu:large_chemical_reactor/sulfur_dioxide_from_sulfur': 'SO2',
  'gtceu:electrolyzer/water_electrolysis': 'O2',
};

function s<T>(id: Map<string, T>): Record<string, T>;
// function s<T>(id: Record<string, T>): Record<string, T>;
function s(id: string[]): string[];
function s(id: string): string;
function s(
  input: string | string[] | Map<string, unknown>,
): string | string[] | Record<string, unknown> {
  if (typeof input === 'string') return simplifyMap[input] ?? input;
  if (Array.isArray(input)) return input.map((item) => s(item));
  if (input instanceof Map)
    return Object.fromEntries(input.entries().map(([key, values]) => [s(key), values]));
  throw Error(`Unknown input: ${input}`);
}

type EdgeMap = Map<string, Set<string>>;

function addEdge(edges: EdgeMap, source: string, target: string) {
  const targets = edges.get(source) ?? new Set();
  targets.add(target);
  edges.set(source, targets);
}

function _rev_top_sort(node_id: string, edges: EdgeMap, visited: Set<string>, ans: string[]) {
  visited.add(node_id);
  edges.get(node_id)?.forEach((to) => {
    if (!visited.has(to)) _rev_top_sort(to, edges, visited, ans);
  });
  ans.push(node_id);
}

function rev_top_sort(nodes: string[], edges: EdgeMap): string[] {
  const ans: string[] = [];
  const visited = new Set<string>();
  nodes.forEach((node_id) => {
    if (visited.has(node_id)) return;
    _rev_top_sort(node_id, edges, visited, ans);
  });
  return ans;
}

function _calc_ratio(consumer: Recipe, producer: Recipe, consumerCnt: number): number {
  const consumedItem = consumer.inputs.find((input) =>
    producer.output_ids.includes(input.accepted_ids[0]),
  );
  if (!consumedItem) {
    throw Error(`recipies ${consumer.id} and ${producer.id} has no common item`);
  }
  const producedItem = producer.outputs.find(
    (output) => output.accepted_ids[0] === consumedItem.accepted_ids[0],
  );
  if (!producedItem) {
    throw Error(`recipies ${consumer.id} and ${producer.id} has no common item`);
  }
  const consumed_pt = (consumerCnt * consumedItem.amount) / consumer.duration;
  console.log(
    `  ${s(consumer.id)}: (${consumerCnt} * ${consumedItem.amount}) / ${consumer.duration} = ${consumed_pt}`,
  );
  const produced_pt = producedItem.amount / producer.duration;
  console.log(
    `  ${s(producer.id)} = ${producedItem.amount}/ ${producer.duration} = ${produced_pt}`,
  );
  return consumed_pt / produced_pt;
}

export const calcMachineCnt = (flowNodes: NodeType[], flowEdges: EdgeType[]) => {
  const machines: Map<string, RecipeNodeData> = new Map();
  const machineCnt: Map<string, number> = new Map();
  flowNodes.forEach((n) => {
    machines.set(n.id, n.data);
    const cnt = n.data.calcState.machineCnt;
    if (!n.data.calcState.isAuto && cnt) machineCnt.set(n.id, cnt);
  });
  console.log('machines:', s(machines));
  const anchors = machines
    .entries()
    .filter(([_, data]) => !data.calcState.isAuto)
    .map(([id]) => id)
    .toArray();
  if (anchors.length === 0) {
    throw Error('at least 1 anchor should be provided');
  }
  const poopsTo: Map<string, Set<string>> = new Map();
  const eatsFrom: Map<string, Set<string>> = new Map();
  console.log('outputsTo:');
  flowEdges.forEach(({ source, target }) => {
    addEdge(poopsTo, source, target);
    addEdge(eatsFrom, target, source);
  });

  const rev_top_sorted = rev_top_sort(machines.keys().toArray(), poopsTo);
  console.log('rev_top_sorted:', s(rev_top_sorted));
  console.log('machineCnt:', s(machineCnt));
  rev_top_sorted.forEach((cId) => {
    const cCnt = machineCnt.get(cId)!;
    if (!cCnt) return;
    eatsFrom.get(cId)?.forEach((pId) => {
      const pCnt = machineCnt.get(pId) ?? 0;
      console.log(`${s(pId)} based on ${s(cId)} * ${cCnt}:`);
      const pAddCnt = _calc_ratio(machines.get(cId)!.recipe, machines.get(pId)!.recipe, cCnt);
      machineCnt.set(pId, pAddCnt + pCnt);
      console.log(`${s(pId)} -> ${s(cId)} went from ${pCnt} to ${pAddCnt + pCnt}`);
    });
  });
  console.log('machineCnt:', s(machineCnt));
  [...rev_top_sorted].reverse().forEach((pId) => {
    let pCnt = machineCnt.get(pId)!;
    if (!pCnt) return;
    const poopTargets = poopsTo.get(pId);
    if (!poopTargets) return;
    const remainingPoopTargets = [...poopTargets].filter((cId) => {
      const cCnt = machineCnt.get(cId);
      if (!cCnt) return true;
      console.log(`${s(cId)} based on ${s(pId)} * ${cCnt}:`);
      const cAdditionCnt = _calc_ratio(machines.get(cId)!.recipe, machines.get(pId)!.recipe, cCnt);
      pCnt -= cAdditionCnt;
      if (pCnt < 0) throw Error(`something bad happned pCnt ${pCnt} went below zero for ${pId}`);
      return false;
    });

    if (remainingPoopTargets.length === 0) return;

    if (remainingPoopTargets.length > 1)
      throw Error(`don't know how to split output from ${pId} between ${remainingPoopTargets}`);
    const cId = poopTargets.values().toArray()[0];
    const cCurCnt = machineCnt.get(cId) ?? 0;
    console.log(`${s(cId)} based on ${s(pId)} * ${pCnt}:`);
    const cAdditionCnt =
      1 / _calc_ratio(machines.get(cId)!.recipe, machines.get(pId)!.recipe, pCnt);
    machineCnt.set(cId, cAdditionCnt + cCurCnt);
    console.log(`${s(pId)} <- ${s(cId)} went from ${cCurCnt} to ${cAdditionCnt}`);
  });
  console.log('machineCnt:', s(machineCnt));
  return machineCnt;
};
