// Billing owner entity.

export function accountType() {
  return "Account";
}

export function accountName(account) {
  return account.name;
}

export function billingOwnerId(account) {
  return account.id;
}
