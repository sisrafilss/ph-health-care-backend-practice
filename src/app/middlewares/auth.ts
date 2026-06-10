import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
import ApiError from "../errors/ApiError";
import { jwtHelper } from "../helpers/jwtHelper";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: JwtPayload },
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.cookies.accessToken;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_access_token_secret as string,
      );

      req.user = verifyUser;

      if (roles.length && !roles.includes(verifyUser.role)) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized");
      }

      next();
    } catch (error) {
      console.log(error);
      next(error);
    }
  };
};

export default auth;
