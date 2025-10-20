const jwt = require("jsonwebtoken");

class KeycloakService {
  private baseUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
  private tokenUrl: string;
  private userListUrl: string;

  constructor() {
    this.baseUrl = process.env.KEYCLOAK_URL || "";
    this.realm = process.env.NODE_KEYCLOAK_REALM || "myrealm";
    this.clientId = process.env.NODE_CLIENT_ID || "nodeclient";
    this.clientSecret = process.env.NODE_CLIENT_SECRET || "";

    this.tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    this.userListUrl = `${this.baseUrl}/admin/realms/${this.realm}/users`;
  }

  async getServiceAccountToken() {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", this.clientId);
    params.append("client_secret", this.clientSecret);

    const res = await fetch(this.tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await res.json();
    if (!data.access_token) throw new Error("Failed to get access token");
    return data.access_token;
  }

  async getUsers() {
    const token = await this.getServiceAccountToken();
    const res = await fetch(this.userListUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Failed to fetch users: ${err}`);
    }

    return res.json();
  }

  decodeTokenData(token: string) {
    const rsa256key = `-----BEGIN PUBLIC KEY-----\n${process.env.RSA_256_KEY}\n-----END PUBLIC KEY-----\n`;
    return jwt.verify(token, rsa256key, { algorithms: ["RS256"] });
  }
}

export const keycloakService = new KeycloakService();
