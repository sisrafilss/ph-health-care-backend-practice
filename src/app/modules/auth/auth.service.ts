import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { prisma } from "../../../lib/prisma";
import ApiError from "../../errors/ApiError";
import { UserStatus } from "../../generated/enums";
import { jwtHelper } from "../../helpers/jwtHelper";
import { IJwtPayload } from "../../types/common";
import emailSender from "./emailSender";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword = await bcrypt.compare(
    payload.password,
    user.password,
  );
  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is Incorrect!");
  }

  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.jwt_access_token_secret as string,
    config.jwt.jwt_access_token_expires_in as any,
  );

  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.jwt_refresh_token_secret as string,
    config.jwt.jwt_refresh_token_expires_in as any,
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelper.verifyToken(
      token,
      config.jwt.jwt_refresh_token_secret as Secret,
    );
  } catch (err: any) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const accessToken = jwtHelper.generateToken(
    {
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_access_token_secret as Secret,
    config.jwt.jwt_refresh_token_expires_in as string,
  );

  return {
    accessToken,
    needPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (
  user: IJwtPayload,
  payload: { oldPassword: string; newPassword: string },
) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: user.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password incorrect!");
  }

  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_round),
  );

  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });

  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  const resetPasswordToken = jwtHelper.generateToken(
    { email: userData.email, role: userData.role },
    config.jwt.jwt_reset_pass_secret as Secret,
    config.jwt.jwt_access_token_expires_in,
  );

  const resetPassLink =
    config.reset_password_link +
    `?userId=${userData.id}&token=${resetPasswordToken}`;

  await emailSender(
    userData.email,
    `
        <div>
            <p>Dear User,</p>
            <p>Your password reset link 
                <a href=${resetPassLink}>
                    <button>
                        Reset Password
                    </button>
                </a>
            </p>

        </div>
        `,
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string },
) => {
  await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = jwtHelper.verifyToken(
    token,
    config.jwt.jwt_reset_pass_secret as Secret,
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_round),
  );

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

const getMe = async (session: any) => {
  const accessToken = session.accessToken;
  const decodedData = jwtHelper.verifyToken(
    accessToken,
    config.jwt.jwt_access_token_secret as string,
  );

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData.email,
      status: UserStatus.ACTIVE,
    },
  });

  const { id, email, role, needPasswordChange, status } = userData;

  return {
    id,
    email,
    role,
    needPasswordChange,
    status,
  };
};

export const AuthService = {
  login,
  getMe,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
