export const QUERIES = {
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
  insertAdminQuery: `
        INSERT INTO admin(user_name, email, password) 
        VALUES($1, $2, $3) RETURNING id;
    `,

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
