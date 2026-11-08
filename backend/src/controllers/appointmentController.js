let appointments = [
  {
    id: 1,
    date: "2026-11-12",
    time: "09:00",
    doctor: "lek. wet. Anna Kowalska",
    service: "Konsultacja ogólna",
    available: true,
  },
  {
    id: 2,
    date: "2026-11-12",
    time: "10:30",
    doctor: "lek. wet. Anna Kowalska",
    service: "Szczepienie",
    available: false,
  },
  {
    id: 3,
    date: "2026-11-13",
    time: "12:00",
    doctor: "lek. wet. Piotr Nowak",
    service: "Badanie kontrolne",
    available: true,
  },
];

let nextId = 4;

export function getAppointments(request, response) {
  response.status(200).json(appointments);
}

export function getAppointment(request, response) {
  const id = Number(request.params.id);
  const appointment = appointments.find((item) => item.id === id);

  if (!appointment) {
    return response.status(404).json({
      error: "Nie znaleziono wizyty",
    });
  }

  response.status(200).json(appointment);
}

export function createAppointment(request, response) {
  const appointment = {
    id: nextId++,
    ...request.body,
  };

  appointments.push(appointment);

  response.status(201).json(appointment);
}

export function updateAppointment(request, response) {
  const id = Number(request.params.id);
  const index = appointments.findIndex((item) => item.id === id);

  if (index === -1) {
    return response.status(404).json({
      error: "Nie znaleziono wizyty",
    });
  }

  appointments[index] = {
    ...appointments[index],
    ...request.body,
    id,
  };

  response.status(200).json(appointments[index]);
}

export function deleteAppointment(request, response) {
  const id = Number(request.params.id);
  const index = appointments.findIndex((item) => item.id === id);

  if (index === -1) {
    return response.status(404).json({
      error: "Nie znaleziono wizyty",
    });
  }

  const deletedAppointment = appointments.splice(index, 1)[0];

  response.status(200).json({
    message: "Wizyta została usunięta",
    appointment: deletedAppointment,
  });
}