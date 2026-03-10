import Fraction from 'fraction.js';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import type { CalculatedEdge } from './edges';
import type { EffectiveDurations } from './effective';
import type { MachineCount } from './store.svelte';

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

export class CalcError extends Error {
  constructor(
    message: string,
    public bad_machines: string[],
  ) {
    super(message);
  }
}

function _calc_ratio(
  consumer: Recipe,
  producer: Recipe,
  consumerCnt: Fraction,
  consumerEffectiveDur: Fraction | undefined,
  producerEffecitDur: Fraction | undefined,
): Fraction {
  const consumedItem = consumer.inputs.find((input) =>
    producer.outputs.some((out) => out.i === input.i),
  );
  if (!consumedItem) {
    throw new CalcError(`recipies ${consumer.id} and ${producer.id} has no common item`, [
      consumer.id,
      producer.id,
    ]);
  }
  const producedItem = producer.outputs.find((output) => output.i === consumedItem.i);
  if (!producedItem) {
    throw new CalcError(`recipies ${consumer.id} and ${producer.id} has no common item`, [
      consumer.id,
      producer.id,
    ]);
  }
  const consumed_pt = consumerCnt
    .mul(consumedItem.a)
    .div(consumerEffectiveDur ?? consumer.duration);
  const produced_pt = new Fraction(producedItem.a).div(producerEffecitDur ?? producer.duration);
  return consumed_pt.div(produced_pt);
}

export const calcMachineCnt = (
  recipes: Recipe[],
  edges: CalculatedEdge[],
  anchorCnt: MachineCount,
  effeciteDurs: EffectiveDurations,
): MachineCount => {
  if (recipes.length === 0) {
    return new Map();
  }
  const machines: Map<string, Recipe> = new Map();
  const machineCnt: MachineCount = new Map();
  recipes.forEach((r) => {
    machines.set(r.id, r);
    const cnt = anchorCnt.get(r.id);
    if (cnt) {
      machineCnt.set(r.id, new Fraction(cnt));
    }
  });
  const anchors = new Set(machineCnt.keys());
  if (anchors.size === 0) {
    throw new CalcError(
      'at least 1 anchor should be provided',
      recipes.map((r) => r.id),
    );
  }
  const poopsTo: Map<string, Set<string>> = new Map();
  const eatsFrom: Map<string, Set<string>> = new Map();
  edges.forEach(({ source, target }) => {
    addEdge(poopsTo, source, target);
    addEdge(eatsFrom, target, source);
  });

  const rev_top_sorted = rev_top_sort(machines.keys().toArray(), poopsTo);
  rev_top_sorted.forEach((cId) => {
    const cCnt = machineCnt.get(cId)!;
    if (!cCnt) return;
    eatsFrom.get(cId)?.forEach((pId) => {
      if (anchors.has(pId)) return;
      const pCnt = machineCnt.get(pId) ?? 0;
      const pAddCnt = _calc_ratio(
        machines.get(cId)!,
        machines.get(pId)!,
        cCnt,
        effeciteDurs.get(cId),
        effeciteDurs.get(pId),
      );
      machineCnt.set(pId, new Fraction(pAddCnt.add(pCnt)));
    });
  });

  [...rev_top_sorted].reverse().forEach((pId) => {
    let pCnt = machineCnt.get(pId)!;
    if (!pCnt) return;
    const poopTargets = poopsTo.get(pId);
    if (!poopTargets) return;
    const remainingPoopTargets = [...poopTargets].filter((cId) => {
      if (anchors.has(cId)) return false;
      const cCnt = machineCnt.get(cId);
      if (!cCnt) return true;
      const cAdditionCnt = _calc_ratio(
        machines.get(cId)!,
        machines.get(pId)!,
        cCnt,
        effeciteDurs.get(cId),
        effeciteDurs.get(pId),
      );
      pCnt = pCnt.sub(cAdditionCnt);
      if (pCnt.lt(0))
        throw new CalcError(`something bad happned pCnt ${pCnt} went below zero for ${pId}`, [
          pId,
          cId,
        ]);
      return false;
    });
    if (pCnt.equals(0)) return;
    if (remainingPoopTargets.length === 0) return;
    if (remainingPoopTargets.length > 1)
      throw new CalcError(
        `don't know how to split output from ${pId} between ${remainingPoopTargets}`,
        [pId],
      );
    const cId = poopTargets.values().toArray()[0];
    const cCurCnt = machineCnt.get(cId) ?? new Fraction(0);
    const cAdditionCnt = _calc_ratio(
      machines.get(cId)!,
      machines.get(pId)!,
      pCnt,
      effeciteDurs.get(cId),
      effeciteDurs.get(pId),
    ).inverse();
    machineCnt.set(cId, new Fraction(cAdditionCnt.add(cCurCnt)));
  });
  return machineCnt;
};
