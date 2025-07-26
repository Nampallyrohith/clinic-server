import { z } from "zod";

const patientBody = z.object({
  patientName: z.string().trim().min(1),
  patientDOB: z.string().trim().min(1),
  patientGender: z.enum(["Male", "Female", "Others"]),
  mobile: z
    .string()
    .regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  patientAddress: z.string().trim().min(1),
});

export const visitDetailsBody = z.object({
  visitDate: z.string().trim().min(1),
  paymentType: z.enum(["Online", "Cash"]),
  paymentStatus: z.enum(["paid", "not-paid"]),
});

export const caseDetailsBody = visitDetailsBody.extend({
  cases: z.array(
    z.object({
      caseType: z.string().trim().min(1),
      treatmentsGiven: z
        .array(z.string().min(1))
        .min(1, "At least one treatment is required"),
    })
  ),
  caseDescription: z.string().trim().min(1),
  visitType: z.enum(["Home", "Clinic", "Consultation"]),
  amount: z.coerce.number(),
});

export const addNewPatientBody = patientBody.extend({
  ...caseDetailsBody.shape,
  ...visitDetailsBody.shape,
});

export type AddPatientSchema = z.infer<typeof addNewPatientBody>;
