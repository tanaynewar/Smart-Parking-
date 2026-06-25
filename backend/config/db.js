import mysql from "mysql2/promise";

const db = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "TANnew123$",
    database:"internship",
});
console.log("MySQL Connected Successfully");
export default db;