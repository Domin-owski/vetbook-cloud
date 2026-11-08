VetBook Cloud

VetBook Cloud to chmurowy system kalendarza i rezerwacji wizyt weterynaryjnych. Właściciel zwierzęcia może utworzyć konto, dodać profil zwierzęcia, sprawdzić dostępne terminy oraz zarezerwować, przełożyć lub anulować wizytę. Pracownik kliniki zarządza grafikiem, rodzajami usług i statusem wizyt.

## Planowany zakres

- rejestracja i logowanie użytkowników,
- profile zwierząt,
- kalendarz dostępnych terminów,
- rezerwowanie, przekładanie i anulowanie wizyt,
- lista i szczegóły wizyt,
- panel pracownika kliniki,
- walidacja danych po stronie frontendu i backendu,
- role użytkowników: klient i pracownik kliniki.

## Stos technologiczny

- Frontend: React + Vite,
- Backend: Node.js + Express,
- Baza danych: PostgreSQL,
- Chmura: Microsoft Azure,
- Sieć: Azure Virtual Network,
- Kontrola dostępu: Microsoft Entra ID i Azure RBAC,
- Zabezpieczenia: Network Security Groups,
- Komunikacja: REST API.

## Zmiana dostawcy chmury

Pierwotny projekt architektury zakładał wykorzystanie AWS. W Bloku 03 dostawca chmury został zmieniony na Microsoft Azure z wykorzystaniem subskrypcji Azure for Students. Zachowano trójwarstwowy model aplikacji oraz dotychczasową adresację IP.

- AWS VPC zastąpiono Azure Virtual Network,
- AWS IAM zastąpiono Microsoft Entra ID i Azure RBAC,
- Security Groups zastąpiono Network Security Groups,
- prywatne warstwy aplikacji i danych odseparowano za pomocą podsieci, reguł NSG i tabeli tras.

## Architektura

Projekt wykorzystuje architekturę trójwarstwową w sieci `vnet-vetbook` o zakresie `10.0.0.0/16`:

1. `snet-web` (`10.0.1.0/24`) - warstwa prezentacji React/Vite, chroniona przez `nsg-web`,
2. `snet-app` (`10.0.2.0/24`) - prywatna warstwa Node.js/Express, chroniona przez `nsg-app`,
3. `snet-db` (`10.0.3.0/24`) - prywatna warstwa PostgreSQL, chroniona przez `nsg-db`.

![Schemat architektury 3-tier](docs/architecture-3tier.svg)

Szczegółowy opis znajduje się w pliku [`docs/architecture.md`](docs/architecture.md).

## Bezpieczeństwo

- ruch HTTPS do warstwy Web jest dozwolony na porcie 443,
- API przyjmuje ruch na porcie 3000 wyłącznie z podsieci Web,
- PostgreSQL przyjmuje ruch na porcie 5432 wyłącznie z podsieci aplikacji,
- podsieci aplikacji i bazy danych nie mają bezpośredniej trasy do Internetu,
- dostęp administracyjny jest kontrolowany przez Azure RBAC i MFA.

## Infrastructure as Code

Deklaracja infrastruktury Azure w Terraform znajduje się w katalogu [`terraform`](terraform/).

## Status

Skonfigurowano podstawową sieć Azure, trzy podsieci, reguły NSG oraz routing dla warstw prywatnych.
