import { z } from "zod";

const patientBody = z.object({
  patientName: z.string().trim().min(1),
  patientAge: z.string().trim().min(1),
  patientGender: z.enum(["Male", "Female", "Others"]),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  patientAddress: z.string().trim().min(1),
});

export const visitDetailsBody = z.object({
  visitDate: z.string().trim().min(1),
  visitType: z.enum(["Home", "Clinic"]),
  paymentType: z.enum(["Online", "Cash"]),
  amount: z.coerce.number(),
});

export const caseDetailsBody = visitDetailsBody.extend({
  caseType: z.string().trim().min(1),
  caseDescription: z.string().trim().min(1),
  treatmentType: z.string().trim().min(1),
});

export const addNewPatientBody = patientBody.extend({
  ...caseDetailsBody.shape,
  ...visitDetailsBody.shape,
});

export type AddPatientSchema = z.infer<typeof addNewPatientBody>;
