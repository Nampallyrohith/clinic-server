import {
  ChangePasswordSchema,
  LoginAuthSchema,
} from "../schemas/admin.schema.js";
import bcrypt from "bcrypt";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import { NotFound, WrongPassword } from "./error.js";

// Fetch admin by email
export const getAdminByEmail = async (email: string) => {
  const result = (await client.query(QUERIES.fetchAdminByEmailQuery, [email]))
    .rows;
  return result;
};

// Login
export const login = async (loginCredentials: LoginAuthSchema) => {
  const { email, password } = loginCredentials;

  try {
    const admin = await getAdminByEmail(email);
    if (admin.length === 0) {
      throw new NotFound("Admin doesn't exist");
    }
    const isPasswordMatch = await bcrypt.compare(password, admin[0].password);
    if (!isPasswordMatch) throw new WrongPassword("Invalid Credentials");
    return admin[0].id;
  } catch (e) {
    throw e;
  }
};

// Update profile
// export const updateProfile = async (adminId: string, userName: string) => {
//   try {
//     const isAdminExists = (
//       await client.query(QUERIES.checkAdminByIdQuery, [adminId])
//     ).rows[0].exists;

//     if (!isAdminExists) throw new NotFound("Admin doesn't exist");

//     await client.query(QUERIES.updateProfileQuery, [adminId, userName]);
//   } catch (e) {
//     throw e;
//   }
// };

// Change password
export const changePassword = async (
  email: string,
  passwordDetails: ChangePasswordSchema
) => {
  const { newPassword } = passwordDetails;

  try {
    const admin = await getAdminByEmail(email);
    if (admin.length === 0) {
      throw new NotFound("Admin doesn't exists.");
    }
    const newHashPassword = await bcrypt.hash(newPassword, 10);
    await client.query(QUERIES.updatePasswordQuery, [email, newHashPassword]);
  } catch (e) {
    throw e;
  }
};

// Fetch admin details
export const getProfile = async (adminId: string) => {
  try {
    const isAdminExists = (
      await client.query(QUERIES.checkAdminByIdQuery, [adminId])
    ).rows[0].exists;

    if (!isAdminExists) throw new NotFound("Admin doesn't exist");
    const result = (await client.query(QUERIES.fetchAdminByIdQuery, [adminId]))
      .rows[0];

    return result;
  } catch (e) {
    throw e;
  }
};
