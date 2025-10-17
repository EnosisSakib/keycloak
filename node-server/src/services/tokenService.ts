const jwt = require("jsonwebtoken");

export function decodeTokenData(token: string) {
  const rsa256key = `-----BEGIN PUBLIC KEY-----\n${process.env.RSA_256_KEY}\n-----END PUBLIC KEY-----\n`;
  return jwt.verify(token, rsa256key, { algorithms: ["RS256"] });
}
