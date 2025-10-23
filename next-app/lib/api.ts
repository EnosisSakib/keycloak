const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

async function apiFetch(path: string, options: RequestInit = {}) {
  console.log(`${API_BASE}${path}`);
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error [${res.status}]: ${text}`);
  }

  if (res.status === 204) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchRoles() {
  return await apiFetch(`/roles`);
}

export async function addRole(roleName: string, description: string) {
  return await apiFetch(`/roles`, {
    method: "POST",
    body: JSON.stringify({ name: roleName, description }),
  });
}

export async function getUsers() {
  const data = await apiFetch("/users");
  return data.users || [];
}

export async function getUserRoles(userId: string) {
  const data = await apiFetch(`/roles/user${userId}`);
  return data.realmMappings || [];
}

export async function getAvailableRoles(userId: string) {
  const data = await apiFetch(`/roles/user${userId}/available`);
  return data || [];
}
export async function addUserRole(userId: string, role: any) {
  return apiFetch(`/roles/user${userId}/addrole`, {
    method: "POST",
    body: JSON.stringify(role),
  });
}

export async function removeUserRole(userId: string, role: any) {
  return apiFetch(`/roles/user${userId}/removerole`, {
    method: "DELETE",
    body: JSON.stringify(role),
  });
}
