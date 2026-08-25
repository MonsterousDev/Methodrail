import { createSubscription } from "./stripe.js";
import { submitPayment } from "./adyen.js";

export function subscribe(customer, plan) {
  if (!customer?.id || !plan?.priceId) {
    throw new Error("subscribe requires customer.id and plan.priceId");
  }
  return createSubscription(customer, plan);
}

export function chargeInvoice(invoice) {
  if (!invoice?.id || typeof invoice.cents !== "number") {
    throw new Error("chargeInvoice requires invoice.id and invoice.cents");
  }
  return submitPayment(invoice);
}
