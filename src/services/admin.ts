import {
  ChangePasswordSchema,
  LoginAuthSchema,
} from "../schemas/admin.schema.js";
import bcrypt from "bcrypt";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import env from "../config.js";
import { AdminExists, NotFound, WrongPassword } from "./error.js";

export const getAdminByEmail = async (email: string) => {
  const result = (await client.query(QUERIES.fetchAdminByEmailQuery, [email]))
    .rows;
  return result;
};

export const login = async (loginCredentials: LoginAuthSchema) => {
  const { email, password } = loginCredentials;

  try {
    const user = await getAdminByEmail(email);
    if (user.length === 0) {
      throw new NotFound("User doesn't exists.");
    }
    const isPasswordMatch = await bcrypt.compare(password, user[0].password);
    if (!isPasswordMatch) throw new WrongPassword("Invalid Credentials");
    return user[0].id;
  } catch (e) {
    throw e;
  }
};

export const updateProfile = async (userId: string, userName: string) => {
  try {
    const isUserExists = (
      await client.query(QUERIES.checkAdminByIdQuery, [userId])
    ).rows[0].exists;

    if (!isUserExists) throw new NotFound("User doesn't exists");

    await client.query(QUERIES.updateProfileQuery, [userId, userName]);
  } catch (e) {
    throw e;
  }
};

export const changePassword = async (
  email: string,
  passwordDetails: ChangePasswordSchema
) => {
  const { newPassword } = passwordDetails;

  try {
    const user = await getAdminByEmail(email);
    if (user.length === 0) {
      throw new NotFound("User doesn't exists.");
    }
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    await client.query(QUERIES.updatePasswordQuery, [email, newHashPassword]);
  } catch (e) {
    throw e;
  }
};

export const getProfile = async (userId: string) => {
  try {
    const isUserExists = (
      await client.query(QUERIES.checkAdminByIdQuery, [userId])
    ).rows[0].exists;

    if (!isUserExists) throw new NotFound("User doesn't exists");
    const result = (await client.query(QUERIES.fetchAdminByIdQuery, [userId]))
      .rows[0];

    return result;
  } catch (e) {
    throw e;
  }
};
