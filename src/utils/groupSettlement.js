/**
 * Computes net balance per member from a list of group expenses.
 * Positive balance  → person is owed money (others pay them).
 * Negative balance → person owes money (they pay others).
 *
 * @param {Array} members  - [{ uid, name }]
 * @param {Array} expenses - [{ paidBy: memberUID, splitAmong: memberUID[], amount }]
 * @returns {{ [memberUID]: number }}
 */
export function computeBalances(members, expenses) {
  const balance = {};
  members.forEach((m) => {
    balance[m.uid] = 0;
  });

  expenses.forEach((exp) => {
    if (!exp.splitAmong || exp.splitAmong.length === 0) return;
    const share = exp.amount / exp.splitAmong.length;

    // Payer gets full credit
    balance[exp.paidBy] = (balance[exp.paidBy] || 0) + exp.amount;

    // Each person in the split owes their share
    exp.splitAmong.forEach((id) => {
      balance[id] = (balance[id] || 0) - share;
    });
  });

  return balance;
}

/**
 * Greedy debt-simplification algorithm.
 * Produces the minimal set of transactions to fully settle all balances.
 *
 * @param {Array} members  - same members array
 * @param {{ [memberUID]: number }} balances
 * @returns {Array} [{ from: memberUID, to: memberUID, amount: number }]
 */
export function settleDebts(members, balances) {
  const creditors = []; // owed money (positive balance)
  const debtors = [];   // owe money   (negative balance)

  Object.entries(balances).forEach(([id, bal]) => {
    if (bal > 0.005) creditors.push({ id, amount: bal });
    else if (bal < -0.005) debtors.push({ id, amount: -bal });
  });

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const settle = Math.min(creditors[i].amount, debtors[j].amount);
    transactions.push({
      from: debtors[j].id,
      to: creditors[i].id,
      amount: Math.round(settle * 100) / 100,
    });
    creditors[i].amount -= settle;
    debtors[j].amount -= settle;
    if (creditors[i].amount < 0.005) i++;
    if (debtors[j].amount < 0.005) j++;
  }

  return transactions;
}
