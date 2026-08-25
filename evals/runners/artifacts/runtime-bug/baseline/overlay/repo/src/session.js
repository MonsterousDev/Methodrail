export function landingPath(session) {
  if (!session?.token) return "/login";
  if (session.expired) return "/login";
  return "/dashboard";
}
