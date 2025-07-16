import { AddPatientSchema } from "../schemas/patient.schema.js";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import { InvalidCaseId, InvalidPatientId } from "./error.js";

export const addNewPatient = async (patientDetails: AddPatientSchema) => {
  try {
    await client.query("BEGIN");

    const patientId = (
      await client.query(QUERIES.insertPatientAndReturnIdQuery, [
        patientDetails.patientName,
        patientDetails.patientDOB,
        patientDetails.patientGender,
        patientDetails.mobile,
        patientDetails.patientAddress,
      ])
    ).rows[0].id;

    await client.query("COMMIT");

    await addCaseDetailsOfPatientById(
      patientId,
      patientDetails.cases,
      patientDetails.caseDescription,
      patientDetails.visitDate,
      patientDetails.visitType,
      patientDetails.amount,
      patientDetails.paymentType,
      patientDetails.paymentStatus
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
};

export const addCaseDetailsOfPatientById = async (
  patientId: string,
  cases: {
    caseType: string;
    treatmentType: string;
  }[],
  caseDescription: string,
  visitDate: string,
  visitType: "Home" | "Clinic" | "Consultation",
  amount: number,
  paymentType: "Online" | "Cash",
  paymentStatus: "paid" | "not-paid"
) => {
  try {
    await client.query("BEGIN");

    const isPatientExists = await client.query(
      QUERIES.checkPatientExistsByIdQuery,
      [patientId]
    );

    if (!isPatientExists.rows[0]?.exists) {
      throw new InvalidPatientId("Invalid Patient Id");
    }

    for (const c of cases) {
      const caseResult = await client.query(
        QUERIES.insertCaseDetailsByPatientIdQuery,
        [
          patientId,
          c.caseType,
          caseDescription,
          c.treatmentType,
          visitType,
          amount,
        ]
      );

      const caseId = caseResult.rows[0].id;

      await client.query("COMMIT");

      await addVisitsDetailsOfPatientByCaseId(
        caseId,
        visitDate,
        paymentType,
        paymentStatus
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
};

export const addVisitsDetailsOfPatientByCaseId = async (
  caseId: number,
  visitDate: string,
  paymentType: "Online" | "Cash",
  paymentStatus: "paid" | "not-paid"
) => {
  try {
    const isCasesExists = await client.query(
      QUERIES.checkCaseExistsByCaseIdQuery,
      [caseId]
    );
    if (!isCasesExists.rows[0].exists)
      throw new InvalidCaseId("Invalid case Id");

    await client.query(QUERIES.insertVisitDetailsByCaseIdQuery, [
      caseId,
      visitDate,
      paymentType,
      paymentStatus,
    ]);
  } catch (e) {
    throw e;
  }
};

export const patientsDropdown = async () => {
  try {
    const result = (await client.query(QUERIES.fetchPatientsDropdownQuery))
      .rows;
    return result;
  } catch (e) {
    throw e;
  }
};

export const patientDetailsById = async (patientId: string) => {
  try {
    const result = (
      await client.query(QUERIES.fetchPatientDetailsByIdQuery, [patientId])
    ).rows[0];
    return result;
  } catch (e) {
    throw e;
  }
};

export const getPatientsByDate = async (date: string) => {
  try {
    const result = (
      await client.query(QUERIES.fetchPatientsByDateQuery, [date])
    ).rows;
    return result;
  } catch (e) {
    throw e;
  }
};

export const updateCaseStatus = async (caseId: string, isCaseOpen: boolean) => {
  try {
    const isCaseExists = await client.query(
      QUERIES.checkCaseExistsByCaseIdQuery,
      [caseId]
    );

    if (!isCaseExists.rows[0].exists) {
      throw new InvalidCaseId("Invalid case Id");
    }

    await client.query(QUERIES.updateCaseStatusQuery, [caseId, isCaseOpen]);
  } catch (e) {
    throw e;
  }
};
