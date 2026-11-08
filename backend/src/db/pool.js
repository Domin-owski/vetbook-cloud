import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("Brak zmiennej środowiskowej DATABASE_URL");
}

const isLocalDatabase =
  process.env.DATABASE_URL.includes("@localhost") ||
  process.env.DATABASE_URL.includes("@127.0.0.1");

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDatabase
    ? false
    : {
        rejectUnauthorized: false,
      },
});

pool.on("error", (error) => {
  console.error("Błąd połączenia z PostgreSQL:", error);
});