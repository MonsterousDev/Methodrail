export function visibleRoute(session) {
  // Source assumption: expired tokens redirect to login.
  if (!session?.token) return "/login";
  return "/dashboard";
}
