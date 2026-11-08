import { z } from "zod";

const appointmentSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data musi mieć format RRRR-MM-DD"),

  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Godzina musi mieć format GG:MM"),

  doctor: z
    .string()
    .min(3, "Nazwa lekarza musi mieć co najmniej 3 znaki"),

  service: z
    .string()
    .min(3, "Nazwa usługi musi mieć co najmniej 3 znaki"),

  available: z.boolean({
    message: "Pole available musi mieć wartość true albo false",
  }),
});

const appointmentUpdateSchema = appointmentSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Należy podać co najmniej jedno pole do zmiany",
  });

function validate(schema) {
  return (request, response, next) => {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      return response.status(400).json({
        error: "Nieprawidłowe dane",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    request.body = result.data;
    next();
  };
}

export const validateAppointment = validate(appointmentSchema);

export const validateAppointmentUpdate = validate(
  appointmentUpdateSchema,
);