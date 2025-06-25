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
        Number(patientDetails.patientAge),
        patientDetails.patientGender,
        patientDetails.mobile,
        patientDetails.patientAddress,
      ])
    ).rows[0].id;

    await client.query("COMMIT");

    await addCaseDetailsOfPatientById(
      patientId,
      patientDetails.caseType,
      patientDetails.caseDescription,
      patientDetails.treatmentType,
      patientDetails.visitDate,
      patientDetails.amount,
      patientDetails.paymentType
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
};

export const addCaseDetailsOfPatientById = async (
  patientId: string,
  caseType: string,
  caseDescription: string,
  treatmentType: string,
  visitDate: string,
  amount: number,
  paymentType: string
) => {
  try {
    await client.query("BEGIN");

    const isPatientExists = await client.query(
      QUERIES.checkPatientExistsByIdQuery,
      [patientId]
    );

    if (!isPatientExists.rows[0].exists)
      throw new InvalidPatientId("Invalid Patient Id");

    const caseId = (
      await client.query(QUERIES.insertCaseDetailsByPatientIdQuery, [
        patientId,
        caseType,
        caseDescription,
        treatmentType,
      ])
    ).rows[0].id;

    await client.query("COMMIT");

    await addVisitsDetailsOfPatientByCaseId(
      caseId,
      visitDate,
      amount,
      paymentType
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }
};

export const addVisitsDetailsOfPatientByCaseId = async (
  caseId: number,
  visitDate: string,
  amount: number,
  paymentType: string
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
      amount,
      paymentType,
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
