export const roundMoney = value => Number(value.toFixed(2));

export function calculateBill(items, discountPercent) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = roundMoney(subtotal * discountPercent / 100);
  return {
    subtotal,
    discount,
    total: roundMoney(subtotal - discount)
  };
}

export function validateTender(method, total, received, split) {
  const toPaise = amount => Number.isFinite(amount) && amount >= 0 && roundMoney(amount) === amount
    ? Math.round(amount * 100)
    : NaN;
  const due = toPaise(total);
  if (!Number.isSafeInteger(due)) return 'The payable total is invalid.';
  if (method === 'Cash') {
    const cash = toPaise(received);
    if (!Number.isSafeInteger(cash) || cash < due) {
      return 'Enter cash received at least equal to the total, with up to two decimal places.';
    }
  } else if (method === 'Split') {
    const cash = toPaise(split?.cash);
    const upi = toPaise(split?.upi);
    if (!Number.isSafeInteger(cash) || !Number.isSafeInteger(upi) || cash + upi !== due) {
      return 'Cash and UPI must be nonnegative and add up to the total.';
    }
  } else if (method !== 'UPI' && method !== 'Card') {
    return 'Choose a valid payment method.';
  }
  return '';
}
