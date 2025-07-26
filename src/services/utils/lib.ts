import jwt from "jsonwebtoken";
import env from "../../config.js";

export const generateWebToken = async (id: string) => {
  const token = jwt.sign({ id }, env.SECRET_KEY, {expiresIn: '1h'});
  return token;
};
