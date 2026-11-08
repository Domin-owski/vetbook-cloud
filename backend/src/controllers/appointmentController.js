import { pool } from "../db/pool.js";

const returnedFields = `
  id,
  TO_CHAR(appointment_date, 'YYYY-MM-DD') AS date,
  TO_CHAR(appointment_time, 'HH24:MI') AS time,
  doctor,
  service,
  available
`;

export async function getAppointments(request, response, next) {
  try {
    const result = await pool.query(`
      SELECT ${returnedFields}
      FROM appointments
      ORDER BY appointment_date, appointment_time
    `);

    response.status(200).json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getAppointment(request, response, next) {
  try {
    const result = await pool.query(
      `
        SELECT ${returnedFields}
        FROM appointments
        WHERE id = $1
      `,
      [request.params.id],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        error: "Nie znaleziono wizyty",
      });
    }

    response.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function createAppointment(request, response, next) {
  try {
    const { date, time, doctor, service, available } = request.body;

    const result = await pool.query(
      `
        INSERT INTO appointments (
          appointment_date,
          appointment_time,
          doctor,
          service,
          available
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${returnedFields}
      `,
      [date, time, doctor, service, available],
    );

    response.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(request, response, next) {
  try {
    const { date, time, doctor, service, available } = request.body;

    const result = await pool.query(
      `
        UPDATE appointments
        SET
          appointment_date = COALESCE($1::date, appointment_date),
          appointment_time = COALESCE($2::time, appointment_time),
          doctor = COALESCE($3, doctor),
          service = COALESCE($4, service),
          available = COALESCE($5::boolean, available)
        WHERE id = $6
        RETURNING ${returnedFields}
      `,
      [
        date ?? null,
        time ?? null,
        doctor ?? null,
        service ?? null,
        available ?? null,
        request.params.id,
      ],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        error: "Nie znaleziono wizyty",
      });
    }

    response.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deleteAppointment(request, response, next) {
  try {
    const result = await pool.query(
      `
        DELETE FROM appointments
        WHERE id = $1
        RETURNING ${returnedFields}
      `,
      [request.params.id],
    );

    if (result.rows.length === 0) {
      return response.status(404).json({
        error: "Nie znaleziono wizyty",
      });
    }

    response.status(200).json({
      message: "Wizyta została usunięta",
      appointment: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}