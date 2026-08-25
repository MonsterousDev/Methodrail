// Billing owner entity.

export function organizationType() {
  return "Account";
}

export function organizationName(org) {
  return org.name;
}

export function billingOwnerId(org) {
  return org.id;
}
