import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

export const connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASS,
  database: process.env.MYSQL_DBNAME,
});

export const ConnectMysql = async () => {
  connection.connect();
  connection.query(
    "SELECT 1 + 1 AS solution",
    (err: any, rows: any, fields: any) => {
      if (err) throw err;

      console.log("mysql connected");
    },
  );
  connection.end();
};
