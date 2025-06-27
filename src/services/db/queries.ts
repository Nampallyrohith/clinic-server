export const QUERIES = {
  // GET
  fetchAdminByEmailQuery: `
    SELECT * FROM admin WHERE email=$1;
  `,

  checkAdminByIdQuery: `
    SELECT EXISTS (
      SELECT 1 FROM admin WHERE id=$1
    );
  `,

  fetchAdminByIdQuery: `
    SELECT 
      id, 
      user_name AS "userName", 
      email,
      created_at AS "createdAt" 
    FROM admin WHERE id=$1;
  `,

  checkPatientExistsByIdQuery: `
    SELECT EXISTS (
      SELECT 1 FROM patients WHERE id=$1
    );
  `,

  checkCaseExistsByCaseIdQuery: `
    SELECT EXISTS (
      SELECT 1 FROM cases WHERE id=$1
    );
  `,

  fetchPatientsDropdownQuery: `
    SELECT id AS "patientId", 
           patient_name AS "patientName",
           mobile AS "mobileNo"
    FROM patients;
  `,

  fetchPatientDetailsByIdQuery: `
    SELECT 
      p.id as "patientId",
      p.patient_name as "patientName",
      p.patient_age as "patientAge",
      p.mobile as "mobileNo",
      p.patient_gender as "patientGender",
      p.patient_address as "patientAddress",
      p.created_at as "firstVisitOn",

      JSON_AGG(
        JSON_BUILD_OBJECT(
          'caseId', c.id,
          'caseType', c.case_type,
          'caseDescription', c.case_description,
          'treatmentType', c.treatment_type,
          'visitType', c.visit_type,
          'caseBookedOn', c.registered_date,
          'visits', (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'visitDate', v.visit_date,
                'paidAmount', v.amount,
                'paymentType', v.payment_type,
                'paymentStatus', v.payment_status
              ) ORDER BY v.visit_date DESC
            )
            FROM visits v
            WHERE v.case_id = c.id
          )
        ) ORDER BY c.registered_date
      ) AS "cases"

    FROM patients p
    JOIN cases c ON c.patient_id = p.id
    WHERE p.id = $1
    GROUP BY p.id;
  `,

  fetchPatientsByDateQuery: `
    SELECT 
        p.id AS "patientId",
        p.patient_name AS "patientName",
        p.patient_age AS "patientAge",
        p.mobile AS "mobileNo",
        p.patient_gender AS "patientGender",
        p.patient_address AS "patientAddress",
        p.created_at AS "firstVisitOn",

        JSON_AGG(
          JSON_BUILD_OBJECT(
            'caseType', c.case_type,
            'caseDescription', c.case_description,
            'treatmentType', c.treatment_type,
            'visitType', c.visit_type,
            'caseBookedOn', c.registered_date,
            'visits', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'visitDate', v.visit_date,
                  'paidAmount', v.amount,
                  'paymentType', v.payment_type,
                  'paymentStatus', v.payment_status
                ) ORDER BY v.visit_date
              )
              FROM visits v
              WHERE v.case_id = c.id AND DATE(v.visit_date) = $1
            )
          )
          ORDER BY c.registered_date
        ) AS "cases"

      FROM patients p
      JOIN cases c ON c.patient_id = p.id
      WHERE EXISTS (
        SELECT 1 FROM visits v 
        WHERE v.case_id = c.id AND DATE(v.visit_date) = $1
      )
      GROUP BY p.id;
  `,
  // POST
  insertAdminQuery: `
    INSERT INTO admin (user_name, email, password) 
    VALUES ($1, $2, $3) RETURNING id;
  `,

  insertPatientAndReturnIdQuery: `
    INSERT INTO patients (patient_name, patient_age, patient_gender, mobile, patient_address)
    VALUES($1, $2, $3, $4, $5) RETURNING id;
  `,

  insertCaseDetailsByPatientIdQuery: `
    INSERT INTO cases (patient_id, case_type, case_description, treatment_type, visit_type)
    VALUES($1, $2, $3, $4, $5) RETURNING id;
  `,

  insertVisitDetailsByCaseIdQuery: `
    INSERT INTO visits (case_id, visit_date, amount, payment_type, payment_status)
    VALUES ($1, $2, $3, $4, $5);
  `,

  // PUT
  updateProfileQuery: `
    UPDATE admin
      SET user_name=$2
    WHERE id=$1;
  `,

  updatePasswordQuery: `
    UPDATE admin
      SET password=$2
    WHERE email=$1;
  `,
};
