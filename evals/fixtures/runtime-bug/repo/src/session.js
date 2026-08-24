export function landingPath(session) {
  if (!session?.token) return "/login";
  return "/dashboard";
}
