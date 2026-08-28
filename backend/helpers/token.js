// helpers/token.js
// Lightweight, zero-dependency HMAC-SHA256 stateless token for Serverless Vercel & Express
const crypto = require("crypto");

const SECRET = process.env.SESSION_SECRET || "sahara_jwt_secure_key_2026_super";

function signToken(payload, expiresInMs = 7 * 24 * 60 * 60 * 1000) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + expiresInMs });
  const b64Data = Buffer.from(data).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(b64Data).digest("base64url");
  return `${b64Data}.${signature}`;
}

function verifyToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64Data, signature] = parts;
  const expectedSig = crypto.createHmac("sha256", SECRET).update(b64Data).digest("base64url");
  if (signature !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(b64Data, "base64url").toString("utf8"));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

module.exports = { signToken, verifyToken };
