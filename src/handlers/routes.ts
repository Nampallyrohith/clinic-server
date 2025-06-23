import { Request, Response, Router } from "express";
import { authBody, changePasswordBody } from "../schemas/admin.schema.js";
import { changePassword, getProfile, login } from "../services/admin.js";
import { generateWebToken } from "../services/utils/lib.js";
import { NotFound, WrongPassword } from "../services/error.js";

export type RouteHandler = (req: Request, res: Response) => void;
export const defineRoute = (handler: RouteHandler) => handler;

export const router = Router();

// Define routes
router.get(
  "/health",
  defineRoute((req, res) => {
    res.json({ status: "OK" });
  })
);

// Login API
router.post(
  "/admin-login",
  defineRoute(async (req, res) => {
    const loginCredentials = authBody.parse(req.body);
    try {
      const id = await login(loginCredentials);
      const token = await generateWebToken(id);

      res.status(200).send({ message: "Login successful", token });
    } catch (e: any) {
      if (e instanceof NotFound) {
        res.status(400).send({ error: e.message });
      }
      if (e instanceof WrongPassword) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// Update profile API
// router.put(
//   "/update-profile/:adminId",
//   defineRoute(async (req, res) => {
//     const { adminId } = req.params;
//     const { userName } = req.body;

//     try {
//       await updateProfile(adminId, userName);
//       res.status(200).send({ message: "Profile updated successfully" });
//     } catch (e: any) {
//       if (e instanceof NotFound) {
//         res.status(400).send({ error: e.message });
//       }
//       console.log(e);
//       res.status(500).send({ error: "Something went wrong!" });
//     }
//   })
// );

// Change password API
router.put(
  "/change-password/:email",
  defineRoute(async (req, res) => {
    const passwordDetails = changePasswordBody.parse(req.body);
    const { email } = req.params;

    try {
      await changePassword(email, passwordDetails);
      res.status(200).send({ message: "Password updated successfully" });
    } catch (e: any) {
      if (e instanceof NotFound) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// Get admin details API
router.get(
  "/admin/:adminId",
  defineRoute(async (req, res) => {
    const { adminId } = req.params;
    try {
      const response = await getProfile(adminId);
      res
        .status(200)
        .send({
          message: "Admin details retrieved successfully",
          adminInfo: response,
        });
    } catch (e: any) {
      if (e instanceof NotFound) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);
