import { AddPatientSchema } from "../schemas/patient.schema.js";
import { client } from "./db/client.js";
import { QUERIES } from "./db/queries.js";
import { InvalidCaseId, InvalidPatientId } from "./error.js";

export const addCaseDetailsOfPatientById = async (
  patientId: string,
  caseType: string,
  caseDescription: string,
  treatmentType: string
) => {
  try {
    const isPatientExists = await client.query(
      QUERIES.checkPatientExistsByIdQuery,
      [patientId]
    );
    if (!isPatientExists.rows[0].EXISTS)
      throw new InvalidPatientId("Invalid Patient Id");
    const id = (
      await client.query(QUERIES.insertCaseDetailsByPatientIdQuery, [
        patientId,
        caseType,
        caseDescription,
        treatmentType,
      ])
    ).rows[0].id;
    return id;
  } catch (e) {
    throw e;
  }
};

export const addVisitsDetailsOfPatientByCaseId = async (
  caseId: number,
  visitDate: string,
  amount: number,
  paymentType: string,
  paymentStatus: string
) => {
  try {
    const isCasesExists = await client.query(
      QUERIES.checkCaseExistsByCaseIdQuery,
      [caseId]
    );
    if (!isCasesExists.rows[0].EXISTS)
      throw new InvalidCaseId("Invalid case Id");

    await client.query(QUERIES.insertVisitDetailsByCaseIdQuery, [
      caseId,
      visitDate,
      amount,
      paymentType,
      paymentStatus,
    ]);
  } catch (e) {
    throw e;
  }
};

export const addNewPatient = async (patientDetails: AddPatientSchema) => {
  try {
    await client.query("BEGIN");

    const patientId = (
      await client.query(QUERIES.insertPatientAndReturnIdQuery, [
        patientDetails.patientName,
        patientDetails.patientAge,
        patientDetails.patientGender,
        patientDetails.mobile,
        patientDetails.patientAddress,
      ])
    ).rows[0].id;

    const caseId = await addCaseDetailsOfPatientById(
      patientId,
      patientDetails.caseType,
      patientDetails.caseDescription,
      patientDetails.treatmentType
    );

    await addVisitsDetailsOfPatientByCaseId(
      caseId,
      patientDetails.date,
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
