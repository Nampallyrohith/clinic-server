import { Request, Response, Router } from "express";
import { authBody, changePasswordBody } from "../schemas/admin.schema.js";
import {
  changePassword,
  chartsData,
  getProfile,
  login,
} from "../services/admin.js";
import { generateWebToken } from "../services/utils/lib.js";
import {
  InvalidCaseId,
  InvalidPatientId,
  NotFound,
  WrongPassword,
} from "../services/error.js";
import {
  addNewPatientBody,
  caseDetailsBody,
  visitDetailsBody,
} from "../schemas/patient.schema.js";
import {
  addCaseDetailsOfPatientById,
  addNewPatient,
  addVisitsDetailsOfPatientByCaseId,
  getPatientsByDate,
  patientDetailsById,
  patientsDropdown,
  updateCaseStatus,
} from "../services/patient.js";

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
      res.status(200).send({
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

// Add new patient with case details and visit details
router.post(
  "/add-new-patient",
  defineRoute(async (req, res) => {
    const patientDetails = addNewPatientBody.parse(req.body);
    try {
      await addNewPatient(patientDetails);
      res.status(200).send({
        message: "Added new patient successfully",
      });
    } catch (e: any) {
      if (e instanceof InvalidPatientId) {
        res.status(400).send({ error: e.message });
      }
      if (e instanceof InvalidCaseId) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// new case by existing patient id
router.post(
  "/add-new-case/:patientId",
  defineRoute(async (req, res) => {
    const { patientId } = req.params;
    const caseDetails = caseDetailsBody.parse(req.body);
    try {
      await addCaseDetailsOfPatientById(
        patientId,
        caseDetails.cases,
        caseDetails.caseDescription,
        caseDetails.visitDate,
        caseDetails.visitType,
        caseDetails.amount,
        caseDetails.paymentType,
        caseDetails.paymentStatus
      );
      res.status(200).send({
        message: "Added new case details successfully",
      });
    } catch (e: any) {
      if (e instanceof InvalidPatientId) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// new visits by existing case id
router.post(
  "/add-new-visit/:caseId",
  defineRoute(async (req, res) => {
    const { caseId } = req.params;
    const visitDetails = visitDetailsBody.parse(req.body);
    try {
      await addVisitsDetailsOfPatientByCaseId(
        caseId,
        visitDetails.visitDate,
        visitDetails.paymentType,
        visitDetails.paymentStatus
      );
      res.status(200).send({
        message: "Added new patient visits successfully",
      });
    } catch (e: any) {
      if (e instanceof InvalidCaseId) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// patient options
router.get(
  "/patients-dropdown",
  defineRoute(async (req, res) => {
    try {
      const response = await patientsDropdown();
      res.status(200).send({
        message: "Patients retreived successfully",
        patientsDropdown: response,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// patient details
router.get(
  "/patient-details/:patientId",
  defineRoute(async (req, res) => {
    const { patientId } = req.params;

    try {
      const response = await patientDetailsById(patientId);
      res.status(200).send({
        message: "Patient details retreived successfully",
        patientDetails: response,
      });
    } catch (e: any) {
      if (e instanceof InvalidPatientId) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

// patient daily wise details
router.get(
  "/daily-wise-patients/:selectedDate",
  defineRoute(async (req, res) => {
    const { selectedDate } = req.params;
    if (!selectedDate) {
      res.status(400).send({ error: "Invalid date or undefined." });
    }
    try {
      const response = await getPatientsByDate(selectedDate);
      res.status(200).send({
        message: "Date wise patient retreived successfully",
        dateWisePatients: response,
      });
    } catch (e: any) {
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

router.put(
  "/update-case-status/:caseId",
  defineRoute(async (req, res) => {
    const { caseId } = req.params;
    const { isCaseOpen } = req.body;

    try {
      await updateCaseStatus(caseId, isCaseOpen);

      res.status(200).send({
        message: "Case status updated successfully",
      });
    } catch (e: any) {
      if (e instanceof InvalidCaseId) {
        res.status(400).send({ error: e.message });
      }
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);

router.get(
  "/charts-data",
  defineRoute(async (req, res) => {
    try {
      const response = await chartsData();
      res.status(200).send({
        message: "Charts data successfully retrieved",
        chartsData: response,
      });
    } catch (e) {
      console.log(e);
      res.status(500).send({ error: "Something went wrong!" });
    }
  })
);
