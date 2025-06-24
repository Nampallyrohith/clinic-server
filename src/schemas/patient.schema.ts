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

export const caseDetailsBody = z.object({
  caseType: z.string().trim().min(1),
  caseDescription: z.string().trim().min(1),
  treatmentType: z.string().trim().min(1),
  date: z.string().trim().min(1),
});

export const visitDetailsBody = z.object({
  caseId: z.coerce.number(),
  visitDate: z.string().trim().min(1),
  paymentType: z.enum(["Online", "Cash"]),
  paymentStatus: z.enum(["success", "failure"]),
  amount: z.coerce.number(),
});

export const addNewPatientBody = patientBody.extend({
  ...caseDetailsBody.shape,
  ...visitDetailsBody.shape,
});

export type AddPatientSchema = z.infer<typeof addNewPatientBody>;
