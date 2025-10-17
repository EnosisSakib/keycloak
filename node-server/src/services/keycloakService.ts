export async function getServiceAccountToken() {
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", "nodeclient");
  params.append("client_secret", process.env.NODE_CLIENT_SECRET || "");

  const res = await fetch(
    `${process.env.KEYCLOAK_URL}/realms/myrealm/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  const data = await res.json();
  return data.access_token;
}

export async function getUsers() {
  try {
    const token = await getServiceAccountToken();
    const res = await fetch(
      `${process.env.KEYCLOAK_URL}/admin/realms/myrealm/users`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return await res.json();
  } catch (err) {
    console.error("getUsers error:", err);
  }
}
