import { RegisterInput } from "./auth.schema";
import { generateId } from "../../core/gereteId";
import { types } from "util";

export default class authModel {
  id: number;
  publicId: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;

  constructor(
    id: number,
    publicId: string,
    name: string,
    email: string,
    password: string,
    phone: string,
    createdAt?: Date | string,
    updatedAt?: Date | string,
    lastLogin?: Date | string,
  ) {
    this.id = id;
    this.publicId = publicId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.createdAt =
      typeof createdAt === "string"
        ? createdAt
        : (createdAt ?? new Date()).toISOString();
    this.updatedAt =
      typeof updatedAt === "string"
        ? updatedAt
        : (updatedAt ?? new Date()).toISOString();
    this.lastLogin =
      typeof lastLogin === "string"
        ? lastLogin
        : (lastLogin ?? new Date()).toISOString();
  }

  static fromCreateData(data: RegisterInput): authModel {
    const now = new Date();
    return new authModel(
      0,
      generateId(),
      data.name,
      data.email,
      data.password,
      now.toISOString(),
      now.toISOString(),
      now.toISOString(),
    );
  }
}
