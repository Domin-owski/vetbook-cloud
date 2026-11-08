# Terraform - infrastruktura VetBook Cloud

Folder zawiera deklarację infrastruktury Microsoft Azure dla systemu VetBook Cloud.

## Zdefiniowane zasoby

- grupa zasobów `rg-vetbook-cloud`,
- sieć wirtualna `vnet-vetbook` o zakresie `10.0.0.0/16`,
- podsieć web `10.0.1.0/24`,
- podsieć aplikacji `10.0.2.0/24`,
- podsieć bazy danych `10.0.3.0/24`,
- trzy sieciowe grupy zabezpieczeń,
- reguły komunikacji HTTPS, REST API i PostgreSQL,
- tabela tras blokująca dostęp do Internetu z warstw prywatnych.

Kod stanowi dokumentację Infrastructure as Code przygotowaną w ramach Bloku 03.

Zasoby zostały wcześniej utworzone ręcznie w Azure Portal. Kod nie był wykonywany poleceniem `terraform apply`, ponieważ próba ponownego utworzenia istniejących zasobów spowodowałaby konflikt. Przed przejęciem istniejącej infrastruktury przez Terraform należałoby wykonać import zasobów do stanu Terraform.

Repozytorium nie zawiera danych logowania, identyfikatora subskrypcji ani innych danych poufnych.
