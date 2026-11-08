import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("Brak zmiennej środowiskowej DATABASE_URL");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (error) => {
  console.error("Błąd połączenia z PostgreSQL:", error);
});