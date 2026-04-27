import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const generateToken = (payload: JwtPayload, secret: Secret, expiresIn: any) => {
  return jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  }) as SignOptions;
};

export const jwtHelper = {
  generateToken,
};
