import type { Member, MemberResult, Settlement, CalcResult } from "../types";

export function calculate(
  members: Member[],
  rate: number
): CalcResult {
  const memberResults: MemberResult[] = members.map((m) => {
    const totalInvest = m.investMedals * rate + m.investCash;
    const totalCollect = m.collectMedals * rate + m.collectCash;
    return {
      id: m.id,
      name: m.name,
      totalInvest,
      totalCollect,
      profit: totalCollect - totalInvest,
      share: 0,
      diff: 0,
    };
  });

  const totalInvest = memberResults.reduce((s, m) => s + m.totalInvest, 0);
  const totalCollect = memberResults.reduce((s, m) => s + m.totalCollect, 0);
  const totalProfit = totalCollect - totalInvest;

  // 全員の収支が同じになるように分配
  // 取り分 = 自分の投資額 + 利益 / 人数
  for (const mr of memberResults) {
    mr.share = Math.round(mr.totalInvest + totalProfit / members.length);
    mr.diff = mr.share - mr.totalCollect;
  }

  // 丸め誤差を補正
  const shareSum = memberResults.reduce((s, m) => s + m.share, 0);
  if (shareSum !== totalCollect && memberResults.length > 0) {
    memberResults[0].share += totalCollect - shareSum;
    memberResults[0].diff = memberResults[0].share - memberResults[0].totalCollect;
  }

  const settlements = calcSettlements(memberResults);

  return { totalInvest, totalCollect, totalProfit, members: memberResults, settlements };
}

function calcSettlements(members: MemberResult[]): Settlement[] {
  const payers = members
    .filter((m) => m.diff < 0)
    .map((m) => ({ name: m.name, amount: -m.diff }))
    .sort((a, b) => b.amount - a.amount);

  const receivers = members
    .filter((m) => m.diff > 0)
    .map((m) => ({ name: m.name, amount: m.diff }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let pi = 0;
  let ri = 0;

  while (pi < payers.length && ri < receivers.length) {
    const transfer = Math.min(payers[pi].amount, receivers[ri].amount);
    if (transfer > 0) {
      settlements.push({
        from: payers[pi].name,
        to: receivers[ri].name,
        amount: transfer,
      });
    }
    payers[pi].amount -= transfer;
    receivers[ri].amount -= transfer;
    if (payers[pi].amount === 0) pi++;
    if (receivers[ri].amount === 0) ri++;
  }

  return settlements;
}
