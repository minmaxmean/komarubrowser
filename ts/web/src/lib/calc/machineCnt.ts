import Fraction from 'fraction.js';
import type { Recipe } from '@komarubrowser/common/db/recipe.js';
import { applyChance } from '$lib/constants';
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
const commonItem = (consumer: Recipe, producer: Recipe): string => {
  const common = consumer.inputs.find((input) =>
    producer.outputs.some((out) => out.i === input.i),
  )?.i;
  if (!common) {
    throw new CalcError(`recipies ${consumer.id} and ${producer.id} has no common item`, [
      consumer.id,
      producer.id,
    ]);
  }
  return common;
};

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
  // srlog('machineCnt', machineCnt);
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

  const _bps = (r: Recipe, common: string, type: 'inputs' | 'outputs'): Fraction => {
    const dur = effeciteDurs.get(r.id);
    const val = r[type]
      .filter((ing) => ing.i === common)
      .reduce((val, ing) => {
        return val.add(applyChance(new Fraction(ing.a).div(dur ?? r.duration), ing.c));
      }, new Fraction(0));
    if (val.equals(0)) {
      throw new CalcError(`_bps for ${r.id} turned out to be 0`, [r.id]);
    }
    return val;
  };

  const rev_top_sorted = rev_top_sort(machines.keys().toArray(), poopsTo);
  // console.log('rev_top_sorted:', rev_top_sorted);
  // Push to left: consumer (known) -> producer (unknown)
  rev_top_sorted.forEach((myId) => {
    const myCnt = machineCnt.get(myId);
    const me = machines.get(myId);
    if (!myCnt || !me) return;
    eatsFrom.get(myId)?.forEach((targetId) => {
      const target = machines.get(targetId);
      if (anchors.has(targetId) || !target) return;
      const common = commonItem(me, target);
      const targetBpt = _bps(target, common, 'outputs');
      const myBpt = _bps(me, common, 'inputs');
      const targetAddCnt = myBpt.mul(myCnt).div(targetBpt);
      // console.log(`${myId} -> ${targetId}`);
      // console.log(
      //   `myBps: ${myBpt.mul(20).toString()} / targetBps: ${targetBpt.mul(20).toString()} = ${targetAddCnt.toString()}`,
      // );
      machineCnt.set(targetId, targetAddCnt.add(machineCnt.get(targetId) ?? 0));
      // srlog('machineCnt', machineCnt);
    });
  });

  // Push to right: producer (known) -> consumer (unknown)
  // console.log('top_sorted:', [...rev_top_sorted].reverse());
  [...rev_top_sorted].reverse().forEach((myId) => {
    const myCnt = machineCnt.get(myId);
    const me = machines.get(myId);
    if (!myCnt || !me) return;
    poopsTo.get(myId)?.forEach((targetId) => {
      const target = machines.get(targetId);
      if (anchors.has(targetId) || !target) return;
      const common = commonItem(target, me);
      const targetBpt = _bps(target, common, 'inputs');
      const myBpt = _bps(me, common, 'outputs');
      const targetAddCnt = myBpt.mul(myCnt).div(targetBpt);

      machineCnt.set(targetId, targetAddCnt.add(machineCnt.get(targetId) ?? 0));
      // srlog('machineCnt', machineCnt);
    });
  });
  // srlog('machineCnt', machineCnt);
  return machineCnt;
};
