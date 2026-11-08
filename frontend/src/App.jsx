import AppointmentList from "./components/AppointmentList.jsx";
import "./App.css";

function App() {
  return (
    <main>
      <header className="hero">
        <div>
          <span className="brand">VetBook Cloud</span>
          <h1>Dostępne wizyty weterynaryjne</h1>
          <p>Wybierz dogodny termin i zarezerwuj wizytę dla swojego zwierzęcia.</p>
        </div>
      </header>

      <AppointmentList />
    </main>
  );
}

export default App;