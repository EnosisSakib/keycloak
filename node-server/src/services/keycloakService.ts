const jwt = require("jsonwebtoken");

class KeycloakService {
  private baseUrl: string;
  private realm: string;
  private clientId: string;
  private clientSecret: string;
  private tokenUrl: string;
  private userListUrl: string;

  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseUrl = process.env.KEYCLOAK_URL || "";
    this.realm = process.env.NODE_KEYCLOAK_REALM || "myrealm";
    this.clientId = process.env.NODE_CLIENT_ID || "nodeclient";
    this.clientSecret = process.env.NODE_CLIENT_SECRET || "";

    this.tokenUrl = `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    this.userListUrl = `${this.baseUrl}/admin/realms/${this.realm}/users`;
  }

  private async getServiceAccountToken() {
    if (this.cachedToken && Date.now() < this.tokenExpiry) {
      return this.cachedToken;
    }

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

    const expiresIn = data.expires_in ? data.expires_in * 1000 : 60000;
    this.cachedToken = data.access_token;
    this.tokenExpiry = Date.now() + expiresIn - 5000;

    return this.cachedToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = await this.getServiceAccountToken();

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    return fetch(url, { ...options, headers });
  }

  async getUsers() {
    const res = await this.fetchWithAuth(this.userListUrl);
    if (!res.ok) throw new Error(`Failed to fetch users: ${await res.text()}`);
    return res.json();
  }

  async addRole(name: string, description: string) {
    const url = `${this.baseUrl}/admin/realms/${this.realm}/roles`;

    const res = await this.fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });

    if (res.status === 201) return { success: true };

    const text = await res.text();
    console.error("Failed to create role:", res.status, text);
    return { success: false, message: text };
  }

  async getRoles() {
    const res = await this.fetchWithAuth(`${this.baseUrl}/admin/realms/${this.realm}/roles`);
    return res.json();
  }

  async getUserRole(userId: string) {
    const res = await this.fetchWithAuth(`${this.userListUrl}/${userId}/role-mappings`);
    return res.json();
  }

  async getUserAvailableRole(userId: string) {
    const res = await this.fetchWithAuth(`${this.userListUrl}/${userId}/role-mappings/realm/available`);
    return res.json();
  }

  async addUserRole(userId: string, role: any) {
    const res = await this.fetchWithAuth(`${this.userListUrl}/${userId}/role-mappings/realm`, {
      method: "POST",
      body: JSON.stringify([role]),
    });
    return { success: res.status === 204 };
  }

  async removeUserRole(userId: string, role: any) {
    const res = await this.fetchWithAuth(`${this.userListUrl}/${userId}/role-mappings/realm`, {
      method: "DELETE",
      body: JSON.stringify([role]),
    });
    return { success: res.status === 204 };
  }

  decodeTokenData(token: string) {
    const rsa256key = `-----BEGIN PUBLIC KEY-----\n${process.env.RSA_256_KEY}\n-----END PUBLIC KEY-----\n`;
    return jwt.verify(token, rsa256key, { algorithms: ["RS256"] });
  }
}

export const keycloakService = new KeycloakService();
