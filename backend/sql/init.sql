CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    doctor VARCHAR(120) NOT NULL,
    service VARCHAR(120) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO appointments (
    appointment_date,
    appointment_time,
    doctor,
    service,
    available
)
SELECT *
FROM (
    VALUES
        ('2026-11-12'::date, '09:00'::time, 'lek. wet. Anna Kowalska', 'Konsultacja ogólna', true),
        ('2026-11-12'::date, '10:30'::time, 'lek. wet. Anna Kowalska', 'Szczepienie', false),
        ('2026-11-13'::date, '12:00'::time, 'lek. wet. Piotr Nowak', 'Badanie kontrolne', true),
        ('2026-11-17'::date, '08:30'::time, 'lek. wet. Anna Kowalska', 'Szczepienie', true)
) AS seed(appointment_date, appointment_time, doctor, service, available)
WHERE NOT EXISTS (
    SELECT 1 FROM appointments
);