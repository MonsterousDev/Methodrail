export function submitPayment(invoice) {
  return {
    pspReference: `adyen_${invoice.id}`,
    merchantAccount: "MethodrailCOM",
    resultCode: "Authorised",
    amount: { value: invoice.cents, currency: invoice.currency ?? "USD" },
    shopperReference: invoice.customerId,
  };
}
