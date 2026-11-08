# VetBook Cloud

VetBook Cloud to aplikacja do przeglądania i rezerwowania wizyt weterynaryjnych. Użytkownik może wybrać dzień w kalendarzu, sprawdzić wolne terminy oraz zarezerwować wizytę. Aplikacja umożliwia również dodawanie, edytowanie i usuwanie terminów.

Repozytorium projektu: [github.com/Domin-owski/vetbook-cloud](https://github.com/Domin-owski/vetbook-cloud)

## Funkcje aplikacji

- kalendarz wizyt z oznaczeniem wolnych i zajętych dni,
- pobieranie terminów z REST API,
- dodawanie nowych wizyt,
- edytowanie istniejących terminów,
- rezerwowanie wizyt,
- usuwanie wizyt,
- wybór lekarza z listy,
- walidacja formularza,
- komunikaty ładowania, błędów i powodzenia operacji.

## Stos technologiczny

- Frontend: React + Vite,
- Backend: Node.js + Express,
- Baza danych: PostgreSQL,
- Chmura: Microsoft Azure,
- Sieć: Azure Virtual Network,
- Zabezpieczenia sieciowe: Network Security Groups,
- Infrastructure as Code: Terraform,
- Komunikacja: REST API i JSON.

## Architektura

Projekt wykorzystuje architekturę trójwarstwową:

1. warstwa prezentacji – aplikacja React/Vite,
2. warstwa aplikacji – REST API Node.js/Express,
3. warstwa danych – PostgreSQL.

W środowisku Azure przygotowano sieć `vnet-vetbook` o zakresie `10.0.0.0/16`:

- `snet-web` – `10.0.1.0/24`,
- `snet-app` – `10.0.2.0/24`,
- `snet-db` – `10.0.3.0/24`.

![Architektura VetBook Cloud w Azure](docs/architecture-3tier.svg)

Szczegółowy opis znajduje się w pliku [docs/architecture.md](docs/architecture.md).

## Zmiana dostawcy chmury

Pierwotnie projekt zakładał wykorzystanie AWS. Dostawca został zmieniony na Microsoft Azure ze względu na dostępność subskrypcji Azure for Students.

Zachowano architekturę trójwarstwową, a usługi AWS zastąpiono ich odpowiednikami w Azure:

- AWS VPC zastąpiono Azure Virtual Network,
- AWS IAM zastąpiono Microsoft Entra ID i Azure RBAC,
- Security Groups zastąpiono Network Security Groups,
- Amazon RDS zastąpiono Azure Database for PostgreSQL.

Serwer `psql-vetbook-61698` został utworzony jako Azure Database for PostgreSQL Flexible Server z prywatnym dostępem przez podsieć `snet-db`.

Ze względu na ograniczoną dostępność maszyn wirtualnych w subskrypcji Azure for Students testy integracyjne aplikacji wykonano również z lokalnym PostgreSQL. Kod aplikacji korzysta ze zmiennej `DATABASE_URL`, dlatego sposób połączenia można zmieniać bez modyfikowania kodu źródłowego.

## Endpointy REST API

| Metoda | Endpoint | Opis |
|---|---|---|
| GET | `/health` | Sprawdzenie działania API |
| GET | `/api/appointments` | Pobranie wszystkich wizyt |
| GET | `/api/appointments/:id` | Pobranie jednej wizyty |
| POST | `/api/appointments` | Dodanie nowej wizyty |
| PATCH | `/api/appointments/:id` | Aktualizacja lub rezerwacja wizyty |
| DELETE | `/api/appointments/:id` | Usunięcie wizyty |

Przykładowe dane wizyty:

```json
{
  "date": "2026-11-19",
  "time": "10:00",
  "doctor": "lek. wet. Anna Kowalska",
  "service": "Badanie kontrolne",
  "available": true
}
```

## Uruchomienie lokalne

### Wymagania

- Node.js 20 lub nowszy,
- npm,
- PostgreSQL,
- Git.

### Baza danych

Utwórz bazę danych o nazwie `vetbook`, a następnie wykonaj skrypt:

```powershell
psql -U postgres -d vetbook -f backend/sql/init.sql
```

Skrypt tworzy tabelę `appointments` i dodaje przykładowe terminy.

### Backend

Przejdź do katalogu backendu:

```powershell
cd backend
npm install
```

Utwórz plik `.env` na podstawie `.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/vetbook
```

Uruchom API:

```powershell
npm run dev
```

Backend będzie dostępny pod adresem:

`http://localhost:3000`

Test działania:

`http://localhost:3000/health`

### Frontend

W drugim terminalu przejdź do katalogu frontendu:

```powershell
cd frontend
npm install
```

Utwórz plik `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Uruchom aplikację:

```powershell
npm run dev
```

Frontend będzie dostępny pod adresem:

`http://localhost:5173`

## Walidacja i obsługa błędów

Formularz sprawdza:

- obecność daty,
- obecność godziny,
- wybór lekarza,
- nazwę usługi o długości co najmniej trzech znaków.

API dodatkowo waliduje otrzymane dane i zwraca odpowiednie kody błędów, między innymi `400` oraz `404`. Frontend pokazuje komunikaty o ładowaniu, błędach połączenia i prawidłowym wykonaniu operacji.

## Bezpieczeństwo konfiguracji

Dane dostępowe są przekazywane przez zmienne środowiskowe. Pliki `.env` nie są zapisywane w repozytorium. Repozytorium zawiera wyłącznie pliki `.env.example` bez prawdziwych haseł.

## Autor

Dominik Janowski  
Numer albumu: 61698  
GitHub: [Domin-owski](https://github.com/Domin-owski)