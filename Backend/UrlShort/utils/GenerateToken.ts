import { SignJWT, jwtVerify } from "jose";
import { createSecretKey } from "crypto";

let Key = process.env.JWT_SECRET;

let JWT_SECRET = createSecretKey(String(Key), "utf-8");

export async function SignToken({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) {
  try {
    const Signrefresh = new SignJWT({
      userId: userId,
      type: "refresh",
      sessionId: sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .setIssuer(process.env.JWT_ISSUER ? process.env.JWT_ISSUER : "")
      .setAudience(process.env.JWT_AUDIENCE ? process.env.JWT_AUDIENCE : "")
      .sign(JWT_SECRET);

    const Signaccess = new SignJWT({
      userId: userId,
      type: "access",
      sessionId: sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setIssuer(process.env.JWT_ISSUER ? process.env.JWT_ISSUER : "")
      .setAudience(process.env.JWT_AUDIENCE ? process.env.JWT_AUDIENCE : "")
      .sign(JWT_SECRET);

    return { Signaccess, Signrefresh };
  } catch (error) {
    console.error(error);
    let Signaccess = undefined;
    let Signrefresh = undefined;
    return { Signaccess, Signrefresh };
  }
}

export async function SignAccessToken({
  userId,
  sessionId,
}: {
  userId: string;
  sessionId: string;
}) {
  try {
    const Signaccess = new SignJWT({
      userId: userId,
      type: "access",
      sessionId: sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .setIssuer(process.env.JWT_ISSUER ? process.env.JWT_ISSUER : "")
      .setAudience(process.env.JWT_AUDIENCE ? process.env.JWT_AUDIENCE : "")
      .sign(JWT_SECRET);

    return { Signaccess };
  } catch (error) {
    console.error(error);
    let Signaccess = undefined;
    return { Signaccess };
  }
}

export const VerifyToken = async (Token: string) => {
  try {
    let { payload } = await jwtVerify(String(Token), JWT_SECRET, {
      issuer: process.env.JWT_ISSUER, // issuer
      audience: process.env.JWT_AUDIENCE, // audience
    });

    return { payload };
  } catch (error) {
    let payload = undefined;
    return { payload };
  }
};
