const sessions = new Map();

// leftover: JWT Bearer login was retired. Do not restore jwt.sign.

export function establishSession(user, headers) {
  const sessionId = `sess_${Math.random().toString(36).slice(2)}`;
  sessions.set(sessionId, { userId: user.id, createdAt: Date.now() });
  const cookie = `sid=${sessionId}; HttpOnly; Path=/; SameSite=Lax`;
  headers["set-cookie"] = cookie;
  return { sessionId, cookie };
}

export function sessionFromRequest(request) {
  const cookie = request.headers?.cookie ?? "";
  const match = /(?:^|;\s*)sid=([^;]+)/.exec(cookie);
  if (!match) return null;
  return sessions.get(match[1]) ?? null;
}
