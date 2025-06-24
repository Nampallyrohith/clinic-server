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
  // POST
  insertAdminQuery: `
    INSERT INTO admin (user_name, email, password) 
    VALUES ($1, $2, $3) RETURNING id;
  `,

  insertPatientAndReturnIdQuery: `
    INSERT INTO patients (patient_name, patient_age, patient_gender, mobile, patient_address)
    VALUES($1, $2, $3, $4) RETURNING id;
  `,

  insertCaseDetailsByPatientIdQuery: `
    INSERT INTO cases (patient_id, case_type, case_description, treatment_type)
    VALUES($1, $2, $3, $4) RETURNING id;
  `,

  insertVisitDetailsByCaseIdQuery: `
    INSERT INTO visits (case_id, visit_date, amount, payment_type, payment_status )
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
