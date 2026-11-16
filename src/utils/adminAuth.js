export const clearAdminSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminEmail");
};

const getAdminTokenPayload = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
};

const isAdminTokenExpired = (token) => {
  const payload = getAdminTokenPayload(token);
  if (!payload || typeof payload.exp !== "number") {
    return true;
  }
  return payload.exp * 1000 <= Date.now();
};

/** Route guard: valid stored admin JWT (present and not past exp). */
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;
  if (isAdminTokenExpired(token)) {
    clearAdminSession();
    return false;
  }
  return true;
};

export const handleAdminUnauthorized = () => {
  clearAdminSession();
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
};