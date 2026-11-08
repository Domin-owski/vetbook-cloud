import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/api.js";

const WEEK_DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];

const DOCTORS = [
  "lek. wet. Anna Kowalska",
  "lek. wet. Piotr Nowak",
];

const EMPTY_FORM = {
  date: "",
  time: "",
  doctor: "",
  service: "",
  available: true,
};

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatLongDate(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(2026, 10, 1),
  );
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  async function apiRequest(path = "", options = {}) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/appointments${path}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
          ...options,
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.error ?? "Nie udało się wykonać operacji",
        );
      }

      return data;
    } catch (requestError) {
      if (requestError instanceof TypeError) {
        throw new Error(
          "Brak połączenia z API. Sprawdź, czy backend jest uruchomiony.",
        );
      }

      throw requestError;
    }
  }

  async function loadAppointments() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest();
      setAppointments(data);

      if (data.length > 0) {
        const firstDate =
          data.find((appointment) => appointment.available)?.date ??
          data[0].date;

        setSelectedDate((currentDate) => {
          const nextDate =
            currentDate &&
            data.some(
              (appointment) =>
                appointment.date === currentDate,
            )
              ? currentDate
              : firstDate;

          const [year, month] = nextDate.split("-").map(Number);
          setVisibleMonth(new Date(year, month - 1, 1));

          return nextDate;
        });
      } else {
        setSelectedDate(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((grouped, appointment) => {
      grouped[appointment.date] ??= [];
      grouped[appointment.date].push(appointment);

      return grouped;
    }, {});
  }, [appointments]);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(
    year,
    month + 1,
    0,
  ).getDate();
  const emptyDays =
    (new Date(year, month, 1).getDay() + 6) % 7;
  const selectedAppointments =
    appointmentsByDate[selectedDate] ?? [];

  function getDayStatus(dateKey) {
    const dayAppointments =
      appointmentsByDate[dateKey] ?? [];

    if (dayAppointments.length === 0) {
      return "empty";
    }

    if (
      dayAppointments.some(
        (appointment) => appointment.available,
      )
    ) {
      return "available";
    }

    return "busy";
  }

  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1);
    setVisibleMonth(nextMonth);

    const firstAppointment = appointments.find(
      (appointment) => {
        const [appointmentYear, appointmentMonth] =
          appointment.date.split("-").map(Number);

        return (
          appointmentYear === nextMonth.getFullYear() &&
          appointmentMonth === nextMonth.getMonth() + 1
        );
      },
    );

    setSelectedDate(firstAppointment?.date ?? null);
  }

  function updateForm(event) {
    const { name, value, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));
  }

  function validateForm() {
    const errors = {};

    if (!form.date) {
      errors.date = "Wybierz datę";
    }

    if (!/^\d{2}:\d{2}$/.test(form.time)) {
      errors.time = "Wybierz godzinę";
    }

    if (!form.doctor) {
      errors.doctor = "Wybierz lekarza";
    }

    if (form.service.trim().length < 3) {
      errors.service = "Wpisz nazwę usługi";
    }

    return errors;
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setEditingId(null);
  }

  async function saveAppointment(event) {
    event.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setError("Popraw dane w formularzu");
      setSuccess("");
      return;
    }

    try {
      setError("");
      setSuccess("");
      setWorkingId(editingId ?? "new");

      const appointmentData = {
        date: form.date,
        time: form.time,
        doctor: form.doctor,
        service: form.service.trim(),
        available: form.available,
      };

      if (editingId) {
        await apiRequest(`/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(appointmentData),
        });

        setSuccess("Wizyta została zaktualizowana");
      } else {
        await apiRequest("", {
          method: "POST",
          body: JSON.stringify(appointmentData),
        });

        setSuccess("Nowa wizyta została dodana");
      }

      setSelectedDate(form.date);
      resetForm();
      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId(null);
    }
  }

  function startEditing(appointment) {
    setEditingId(appointment.id);

    setForm({
      date: appointment.date,
      time: appointment.time,
      doctor: appointment.doctor,
      service: appointment.service,
      available: appointment.available,
    });

    setFormErrors({});
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 250,
      behavior: "smooth",
    });
  }

  async function reserveAppointment(id) {
    try {
      setWorkingId(id);
      setError("");
      setSuccess("");

      await apiRequest(`/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          available: false,
        }),
      });

      setSuccess("Termin został zarezerwowany");
      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId(null);
    }
  }

  async function removeAppointment(id) {
    const confirmed = window.confirm(
      "Czy na pewno chcesz usunąć tę wizytę?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setWorkingId(id);
      setError("");
      setSuccess("");

      await apiRequest(`/${id}`, {
        method: "DELETE",
      });

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Wizyta została usunięta");
      await loadAppointments();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <section className="booking-section">
      <div className="booking-heading">
        <div>
          <span className="eyebrow">Kalendarz wizyt</span>
          <h2>Wybierz dogodny dzień</h2>
          <p>
            Kliknij zieloną datę, aby zobaczyć dostępne
            godziny.
          </p>
        </div>

        <div
          className="calendar-legend"
          aria-label="Legenda kalendarza"
        >
          <span>
            <i className="legend-dot available-dot" />
            Wolne terminy
          </span>

          <span>
            <i className="legend-dot busy-dot" />
            Brak wolnych terminów
          </span>
        </div>
      </div>

      {error && (
        <div className="status-message error-message">
          {error}
        </div>
      )}

      {success && (
        <div className="status-message success-message">
          {success}
        </div>
      )}

      {loading && (
        <div className="status-message">
          Ładowanie wizyt…
        </div>
      )}

      <form
        className="appointment-form-card"
        onSubmit={saveAppointment}
      >
        <div>
          <span className="eyebrow">
            {editingId ? "Edycja wizyty" : "Nowa wizyta"}
          </span>

          <h3>
            {editingId
              ? "Zmień dane terminu"
              : "Dodaj termin do kalendarza"}
          </h3>
        </div>

        <div className="form-grid">
          <label>
            Data
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={updateForm}
            />

            {formErrors.date && (
              <small>{formErrors.date}</small>
            )}
          </label>

          <label>
            Godzina
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={updateForm}
            />

            {formErrors.time && (
              <small>{formErrors.time}</small>
            )}
          </label>

          <label>
            Lekarz
            <select
              name="doctor"
              value={form.doctor}
              onChange={updateForm}
            >
              <option value="">Wybierz lekarza</option>

              {DOCTORS.map((doctor) => (
                <option value={doctor} key={doctor}>
                  {doctor}
                </option>
              ))}
            </select>

            {formErrors.doctor && (
              <small>{formErrors.doctor}</small>
            )}
          </label>

          <label>
            Usługa
            <input
              type="text"
              name="service"
              value={form.service}
              onChange={updateForm}
              placeholder="Konsultacja ogólna"
            />

            {formErrors.service && (
              <small>{formErrors.service}</small>
            )}
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={updateForm}
            />
            Termin dostępny
          </label>

          <div className="form-actions">
            <button
              type="submit"
              disabled={workingId !== null}
            >
              {editingId ? "Zapisz zmiany" : "Dodaj wizytę"}
            </button>

            {editingId && (
              <button
                type="button"
                className="secondary-button"
                onClick={resetForm}
              >
                Anuluj
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="booking-layout">
        <div className="calendar-card">
          <div className="calendar-toolbar">
            <button
              className="month-button"
              type="button"
              onClick={() => changeMonth(-1)}
              aria-label="Poprzedni miesiąc"
            >
              ‹
            </button>

            <h3>
              {new Intl.DateTimeFormat("pl-PL", {
                month: "long",
                year: "numeric",
              }).format(visibleMonth)}
            </h3>

            <button
              className="month-button"
              type="button"
              onClick={() => changeMonth(1)}
              aria-label="Następny miesiąc"
            >
              ›
            </button>
          </div>

          <div className="calendar-grid calendar-weekdays">
            {WEEK_DAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="calendar-grid calendar-days">
            {Array.from({ length: emptyDays }).map(
              (_, index) => (
                <span
                  className="calendar-spacer"
                  key={`empty-${index}`}
                />
              ),
            )}

            {Array.from(
              { length: daysInMonth },
              (_, index) => {
                const day = index + 1;
                const dateKey = toDateKey(
                  year,
                  month,
                  day,
                );
                const status = getDayStatus(dateKey);
                const dayAppointments =
                  appointmentsByDate[dateKey] ?? [];

                const availableCount =
                  dayAppointments.filter(
                    (appointment) =>
                      appointment.available,
                  ).length;

                return (
                  <button
                    className={`calendar-day day-${status} ${
                      selectedDate === dateKey
                        ? "day-selected"
                        : ""
                    }`}
                    type="button"
                    key={dateKey}
                    onClick={() =>
                      setSelectedDate(dateKey)
                    }
                  >
                    <strong>{day}</strong>

                    {status !== "empty" && (
                      <small>
                        {status === "available"
                          ? `${availableCount} wolne`
                          : "zajęte"}
                      </small>
                    )}
                  </button>
                );
              },
            )}
          </div>
        </div>

        <div className="slots-card">
          {selectedDate ? (
            <>
              <div className="slots-header">
                <span className="eyebrow">
                  Wybrany dzień
                </span>
                <h3>{formatLongDate(selectedDate)}</h3>
              </div>

              {selectedAppointments.length > 0 ? (
                <div className="slots-list">
                  {selectedAppointments.map(
                    (appointment) => (
                      <article
                        className={`slot ${
                          appointment.available
                            ? "slot-available"
                            : "slot-busy"
                        }`}
                        key={appointment.id}
                      >
                        <div className="slot-time">
                          {appointment.time}
                        </div>

                        <div className="slot-details">
                          <h4>{appointment.service}</h4>
                          <p>{appointment.doctor}</p>

                          <span>
                            {appointment.available
                              ? "Dostępny"
                              : "Zajęty"}
                          </span>
                        </div>

                        <div className="slot-actions">
                          <button
                            className="reserve-button"
                            type="button"
                            disabled={
                              !appointment.available ||
                              workingId ===
                                appointment.id
                            }
                            onClick={() =>
                              reserveAppointment(
                                appointment.id,
                              )
                            }
                          >
                            {appointment.available
                              ? "Rezerwuj"
                              : "Niedostępny"}
                          </button>

                          <button
                            className="edit-button"
                            type="button"
                            onClick={() =>
                              startEditing(appointment)
                            }
                          >
                            Edytuj
                          </button>

                          <button
                            className="delete-button"
                            type="button"
                            disabled={
                              workingId === appointment.id
                            }
                            onClick={() =>
                              removeAppointment(
                                appointment.id,
                              )
                            }
                          >
                            Usuń
                          </button>
                        </div>
                      </article>
                    ),
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <span>—</span>
                  <h4>Brak zaplanowanych terminów</h4>
                  <p>
                    Wybierz zielony dzień w kalendarzu.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span>↖</span>
              <h4>Wybierz datę</h4>
              <p>Kliknij dzień w kalendarzu.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}