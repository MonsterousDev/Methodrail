export function landingPath(session) {
  if (!session?.token) return "/login";
  if (session.expired) return "/login";
  if (session.expiresAt && Date.parse(String(session.expiresAt)) < Date.now()) return "/login";
  return "/dashboard";
}
