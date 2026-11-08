import { useMemo, useState } from "react";
import appointments from "../data/appointments.json";

const WEEK_DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];

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
  const firstDate = appointments[0]?.date ?? new Date().toISOString().slice(0, 10);
  const [initialYear, initialMonth] = firstDate.split("-").map(Number);
  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialYear, initialMonth - 1, 1),
  );
  const [selectedDate, setSelectedDate] = useState(
    appointments.find((appointment) => appointment.available)?.date ?? firstDate,
  );
  const [reservedIds, setReservedIds] = useState([]);

  const appointmentsByDate = useMemo(() => {
    return appointments.reduce((grouped, appointment) => {
      grouped[appointment.date] ??= [];
      grouped[appointment.date].push(appointment);
      return grouped;
    }, {});
  }, []);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const emptyDays = (new Date(year, month, 1).getDay() + 6) % 7;
  const selectedAppointments = appointmentsByDate[selectedDate] ?? [];

  function isAvailable(appointment) {
    return appointment.available && !reservedIds.includes(appointment.id);
  }

  function getDayStatus(dateKey) {
    const dayAppointments = appointmentsByDate[dateKey] ?? [];
    if (dayAppointments.length === 0) return "empty";
    if (dayAppointments.some(isAvailable)) return "available";
    return "busy";
  }

  function changeMonth(offset) {
    const nextMonth = new Date(year, month + offset, 1);
    setVisibleMonth(nextMonth);

    const firstDayWithAppointments = appointments.find((appointment) => {
      const [appointmentYear, appointmentMonth] = appointment.date.split("-").map(Number);
      return (
        appointmentYear === nextMonth.getFullYear() &&
        appointmentMonth === nextMonth.getMonth() + 1
      );
    });

    setSelectedDate(firstDayWithAppointments?.date ?? null);
  }

  function reserveAppointment(id) {
    setReservedIds((current) => [...current, id]);
  }

  return (
    <section className="booking-section">
      <div className="booking-heading">
        <div>
          <span className="eyebrow">Kalendarz wizyt</span>
          <h2>Wybierz dogodny dzień</h2>
          <p>Kliknij zieloną datę, aby zobaczyć dostępne godziny.</p>
        </div>

        <div className="calendar-legend" aria-label="Legenda kalendarza">
          <span><i className="legend-dot available-dot" />Wolne terminy</span>
          <span><i className="legend-dot busy-dot" />Brak wolnych terminów</span>
        </div>
      </div>

      <div className="booking-layout">
        <div className="calendar-card">
          <div className="calendar-toolbar">
            <button className="month-button" type="button" onClick={() => changeMonth(-1)} aria-label="Poprzedni miesiąc">‹</button>
            <h3>
              {new Intl.DateTimeFormat("pl-PL", {
                month: "long",
                year: "numeric",
              }).format(visibleMonth)}
            </h3>
            <button className="month-button" type="button" onClick={() => changeMonth(1)} aria-label="Następny miesiąc">›</button>
          </div>

          <div className="calendar-grid calendar-weekdays">
            {WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="calendar-grid calendar-days">
            {Array.from({ length: emptyDays }).map((_, index) => (
              <span className="calendar-spacer" key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const dateKey = toDateKey(year, month, day);
              const status = getDayStatus(dateKey);
              const dayAppointments = appointmentsByDate[dateKey] ?? [];
              const availableCount = dayAppointments.filter(isAvailable).length;

              return (
                <button
                  className={`calendar-day day-${status} ${selectedDate === dateKey ? "day-selected" : ""}`}
                  type="button"
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  aria-label={`${day} dzień miesiąca, ${status === "available" ? `${availableCount} wolnych terminów` : status === "busy" ? "brak wolnych terminów" : "brak zaplanowanych wizyt"}`}
                >
                  <strong>{day}</strong>
                  {status !== "empty" && (
                    <small>{status === "available" ? `${availableCount} wolne` : "zajęte"}</small>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="slots-card">
          {selectedDate ? (
            <>
              <div className="slots-header">
                <span className="eyebrow">Wybrany dzień</span>
                <h3>{formatLongDate(selectedDate)}</h3>
              </div>

              {selectedAppointments.length > 0 ? (
                <div className="slots-list">
                  {selectedAppointments.map((appointment) => {
                    const available = isAvailable(appointment);
                    const reserved = reservedIds.includes(appointment.id);

                    return (
                      <article className={`slot ${available ? "slot-available" : "slot-busy"}`} key={appointment.id}>
                        <div className="slot-time">{appointment.time}</div>
                        <div className="slot-details">
                          <h4>{appointment.service}</h4>
                          <p>{appointment.doctor}</p>
                          <span>{reserved ? "Zarezerwowano" : available ? "Dostępny" : "Zajęty"}</span>
                        </div>
                        <button
                          className="reserve-button"
                          type="button"
                          disabled={!available}
                          onClick={() => reserveAppointment(appointment.id)}
                        >
                          {reserved ? "Zarezerwowano" : available ? "Rezerwuj" : "Niedostępny"}
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <span>—</span>
                  <h4>Brak zaplanowanych terminów</h4>
                  <p>Wybierz zielony dzień w kalendarzu.</p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span>↖</span>
              <h4>Wybierz datę</h4>
              <p>Kliknij dzień w kalendarzu, aby sprawdzić dostępne godziny.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
