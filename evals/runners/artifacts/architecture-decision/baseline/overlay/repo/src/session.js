export function sessionOwnerKey(session) {
  return session.orgId;
}

export function sessionPlatformRouter() {
  return ["auth-service", "org-service", "edge-cache"];
}
