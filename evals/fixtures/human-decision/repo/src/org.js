// Billing owner entity. Customer emails sometimes say "account";
// product copy sometimes says "organization". Neither is a rename instruction.

export function organizationType() {
  return "Organization";
}

export function organizationName(org) {
  return org.name;
}

export function billingOwnerId(org) {
  return org.id;
}
