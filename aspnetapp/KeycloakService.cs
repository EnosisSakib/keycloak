using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;

public class KeycloakService
{
    private readonly string _baseUrl;
    private readonly string _realm;
    private readonly string _clientId;
    private readonly string _clientSecret;

    private readonly string _tokenUrl;
    private readonly string _userListUrl;

    private string _cachedToken;
    private DateTime _tokenExpiry;

    private readonly HttpClient _httpClient;

    public KeycloakService()
    {
        _baseUrl = "http://localhost:8080";
        _realm =  "myrealm";
        _clientId = "nodeclient";
        _clientSecret = "v8Z9mTdKACG7rORIlWBMVOl2y9n9D2xC";

        _tokenUrl = $"{_baseUrl}/realms/{_realm}/protocol/openid-connect/token";
        _userListUrl = $"{_baseUrl}/admin/realms/{_realm}/users";

        _httpClient = new HttpClient();
    }

    private async Task<string> GetServiceAccountTokenAsync()
    {
        if (!string.IsNullOrEmpty(_cachedToken) && DateTime.UtcNow < _tokenExpiry)
        {
            return _cachedToken;
        }

        var content = new FormUrlEncodedContent(new[]
        {
            new KeyValuePair<string, string>("grant_type", "client_credentials"),
            new KeyValuePair<string, string>("client_id", _clientId),
            new KeyValuePair<string, string>("client_secret", _clientSecret)
        });

        var response = await _httpClient.PostAsync(_tokenUrl, content);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (!root.TryGetProperty("access_token", out var accessToken))
            throw new Exception("Failed to get access token");

        _cachedToken = accessToken.GetString();
        int expiresIn = root.TryGetProperty("expires_in", out var exp) ? exp.GetInt32() : 60;
        _tokenExpiry = DateTime.UtcNow.AddSeconds(expiresIn - 5); // 5 sec buffer

        return _cachedToken;
    }

    private async Task<HttpResponseMessage> FetchWithAuthAsync(string url, HttpMethod method, object body = null)
    {
        var token = await GetServiceAccountTokenAsync();
        var request = new HttpRequestMessage(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        if (body != null)
        {
            var json = JsonSerializer.Serialize(body);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        }

        return await _httpClient.SendAsync(request);
    }

    public async Task<JsonElement> GetUsersAsync()
    {
        var res = await FetchWithAuthAsync(_userListUrl, HttpMethod.Get);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json).RootElement;
    }

    public async Task<bool> AddRoleAsync(string name, string description)
    {
        var url = $"{_baseUrl}/admin/realms/{_realm}/roles";
        var res = await FetchWithAuthAsync(url, HttpMethod.Post, new { name, description });

        return res.StatusCode == System.Net.HttpStatusCode.Created;
    }

    public async Task<JsonElement> GetRolesAsync()
    {
        var res = await FetchWithAuthAsync($"{_baseUrl}/admin/realms/{_realm}/roles", HttpMethod.Get);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json).RootElement;
    }

    public async Task<JsonElement> GetUserRoleAsync(string userId)
    {
        var res = await FetchWithAuthAsync($"{_userListUrl}/{userId}/role-mappings", HttpMethod.Get);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json).RootElement;
    }

    public async Task<JsonElement> GetUserAvailableRoleAsync(string userId)
    {
        var res = await FetchWithAuthAsync($"{_userListUrl}/{userId}/role-mappings/realm/available", HttpMethod.Get);
        res.EnsureSuccessStatusCode();
        var json = await res.Content.ReadAsStringAsync();
        return JsonDocument.Parse(json).RootElement;
    }

    public async Task<bool> AddUserRoleAsync(string userId, object role)
    {
        var res = await FetchWithAuthAsync($"{_userListUrl}/{userId}/role-mappings/realm", HttpMethod.Post, new[] { role });
        return res.StatusCode == System.Net.HttpStatusCode.NoContent;
    }

    public async Task<bool> RemoveUserRoleAsync(string userId, object role)
    {
        var res = await FetchWithAuthAsync($"{_userListUrl}/{userId}/role-mappings/realm", HttpMethod.Delete, new[] { role });
        return res.StatusCode == System.Net.HttpStatusCode.NoContent;
    }

    public JwtSecurityToken DecodeTokenData(string token)
    {
        var publicKeyPem = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvjuH9aBjjt4cmlhYZiARmARKU3GTulNcWF+BsWzE/rQOpltV3SlI70i56dQ9StJGyNTKFT89f64MyBz7lvHunj2fYG/WMCPkKXQKyvM7pr3bSVrU9xTRJh8czmGm9bY+12lyFvTn2SnfFAeAp9/hXBFw8IWemZvbEoF6lI+FYaN1MleIBY3IYZ0bMQOaBgFjaqRB45S8Hc0NK3lhEW2MqX04bZkD/7LRiBywZYENwkQ1eGt8i+fzeU9UxvX3nZU2HEnCGDjRuoUT24GJflK5BRWpiIwCGnPPZsxLgfM29DkRC3lIh319XUTsw01dZQgvhbVHjlktKrJBrcUWqnvgRwIDAQAB";
        var rsa = RSA.Create();
        rsa.ImportFromPem(publicKeyPem);

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            RequireSignedTokens = true,
            IssuerSigningKey = new RsaSecurityKey(rsa),
            ValidateLifetime = true
        };

        var handler = new JwtSecurityTokenHandler();
        handler.ValidateToken(token, validationParameters, out var validatedToken);
        return (JwtSecurityToken)validatedToken;
    }
}
