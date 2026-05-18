import { UserRole } from "../generated/enums";

export type IJwtPayload = {
  email: string;
  role: UserRole;
};
