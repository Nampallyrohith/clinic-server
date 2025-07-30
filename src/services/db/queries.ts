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
      p.patient_dob as "patientDOB",
      p.mobile as "mobileNo",
      p.patient_gender as "patientGender",
      p.patient_address as "patientAddress",
      p.created_at as "firstVisitOn",

      JSON_AGG(
        JSON_BUILD_OBJECT(
          'caseId', c.id,
          'caseType', c.case_type,
          'caseDescription', c.case_description,
          'treatmentsGiven', (
            SELECT ARRAY_AGG(ct.treatment_type)
            FROM case_treatments ct
            WHERE ct.case_id = c.id
          ),
          'visitType', c.visit_type,
          'amountPerVisit', c.amount_per_visit,
          'isCaseOpen', c.is_case_open,
          'caseBookedOn', c.registered_date,
          'visits', (
            SELECT JSON_AGG(
              JSON_BUILD_OBJECT(
                'visitDate', v.visit_date,
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
        p.patient_dob AS "patientDOB",
        p.mobile AS "mobileNo",
        p.patient_gender AS "patientGender",
        p.patient_address AS "patientAddress",
        p.created_at AS "firstVisitOn",

        JSON_AGG(
          JSON_BUILD_OBJECT(
            'caseType', c.case_type,
            'caseDescription', c.case_description,
            'treatmentsGiven', (
              SELECT ARRAY_AGG(ct.treatment_type)
              FROM case_treatments ct
              WHERE ct.case_id = c.id
            ),
            'visitType', c.visit_type,
            'amountPerVisit', c.amount_per_visit,
            'caseBookedOn', c.registered_date,
            'visits', (
              SELECT JSON_AGG(
                JSON_BUILD_OBJECT(
                  'visitDate', v.visit_date,
                  'paymentType', v.payment_type,
                  'paymentStatus', v.payment_status
                ) ORDER BY v.visit_date DESC
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

  fetchPatientGenderChartDataQuery: `
    select patient_gender as "patientGender",
           count(*) as total
    from patients
    group by patient_gender;
  `,

  fetchCaseTypeChartDataQuery: `
    select case_type as caseType, count(*) as total from cases group by case_type;
  `,

  fetchVisitsPerMonthChartDataQuery: `
      select DATE_TRUNC('month', visit_date) as month, count(*) as total
      from visits
      group by month
      order by month;
  `,

  fetchRevenuePerMonthChartDataQuery: `
      select
        DATE_TRUNC('month', registered_date) as month,
        COALESCE(SUM(CASE WHEN v.payment_status = 'paid' THEN c.amount_per_visit ELSE 0 END), 0) AS "revenue"
      from cases c 
      join visits v on c.id = v.case_id
      group by month
      order by month;
  `,

  fetchPaymentStatusChartDataQuery: `
      select payment_status as "paymentStatus", count(*) from visits group by payment_status;
  `,

  fetchAgeDistributionChartDataQuery: `
    select 
      case 
        when age < 18 then '0-17'
        when age between 18 and 35 then '15-35'
        when age between 36 and 60 then '36-60'
        else '60+'
      end as "ageGroup",
      count(*) as total

      from (
      select extract(year from age(current_date, patient_dob)) as age 
      from patients
      ) as age_data
       group by "ageGroup";
  `,

  fetchPatientStatsQuery: `
      SELECT
        (SELECT COUNT(*) FROM patients) AS "totalPatients",
        
        COALESCE(SUM(CASE WHEN v.payment_status = 'paid' THEN c.amount_per_visit ELSE 0 END), 0) AS "totalAmountReceived",

        COALESCE(SUM(CASE WHEN v.payment_status = 'not-paid' THEN c.amount_per_visit ELSE 0 END), 0) AS "totalAmountPending"

    FROM visits v
    JOIN cases c ON v.case_id = c.id;
  `,

  fetchOpenCasesByPatientIdQuery: `
    SELECT
      c.id AS "caseId",
      c.case_type AS "caseType",
      c.visit_type AS "visitType",
      c.registered_date AS "caseBookedOn"
    FROM cases c
    WHERE c.patient_id = $1 AND c.is_case_open = true;
  `,

  // POST
  insertAdminQuery: `
    INSERT INTO admin (user_name, email, password) 
    VALUES ($1, $2, $3) RETURNING id;
  `,

  insertPatientAndReturnIdQuery: `
    INSERT INTO patients (patient_name, patient_dob, patient_gender, mobile, patient_address)
    VALUES($1, $2, $3, $4, $5) RETURNING id;
  `,

  insertCaseDetailsByPatientIdQuery: `
    INSERT INTO cases (patient_id, case_type, case_description, visit_type, amount_per_visit)
    VALUES($1, $2, $3, $4, $5) RETURNING id;
  `,

  insertCaseTreatmentByCaseIdQuery: `
    INSERT INTO case_treatments (case_id, treatment_type)
    VALUES ($1, $2);
  `,

  insertVisitDetailsByCaseIdQuery: `
    INSERT INTO visits (case_id, visit_date, payment_type, payment_status)
    VALUES ($1, $2, $3, $4);
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

  updateCaseStatusQuery: `
    UPDATE cases
      SET is_case_open=$2
    WHERE id=$1;
  `,
};
