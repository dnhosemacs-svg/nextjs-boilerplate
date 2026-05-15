type SessionUserLike = {
  name?: string | null;
  email?: string | null;
};

export function sessionUserLabel(user: SessionUserLike): string {
  return user.name?.trim() || user.email?.trim() || "Usuario";
}
