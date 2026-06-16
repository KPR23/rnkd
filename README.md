# RNKD

RNKD to aplikacja dla graczy, którzy chcą mieć w jednym miejscu profil, ranking, historię meczów i grupy znajomych. Projekt składa się z aplikacji mobilnej Expo, prostego panelu webowego w Next.js oraz współdzielonego API opartego o tRPC.

Najważniejsza część aplikacji to `global RS`, czyli wspólny wynik gracza liczony na podstawie podłączonych kont League of Legends i FACEIT CS2. Dzięki temu użytkownik nie musi porównywać osobno rang, poziomów i ELO z różnych gier.

| Onboarding | | |
| :---: | :---: | :---: |
| ![Konfiguracja profilu](docs/screenshots/onboarding-profile.png) | ![Avatar i bio](docs/screenshots/onboarding-details.png) | ![Podłączone konta](docs/screenshots/onboarding-games.png) |
| **Profil** | **Szczegóły** | **Gry** |

| Aplikacja | | |
| :---: | :---: | :---: |
| ![Feed](docs/screenshots/feed.png) | ![Wyszukiwarka](docs/screenshots/search.png) | ![Profil gracza](docs/screenshots/profile.png) |
| **Feed** | **Wyszukiwarka** | **Profil** |

| Konta i grupy | | |
| :---: | :---: | :---: |
| ![Podłączanie konta](docs/screenshots/link-account.png) | ![Nowa grupa](docs/screenshots/group-created.png) | ![Ranking grupy](docs/screenshots/group-leaderboard.png) |
| **Podłączanie konta** | **Nowa grupa** | **Ranking grupy** |

| Profil gry |
| :---: |
| ![Profil CS2 FACEIT](docs/screenshots/game-profile.png) |
| **Profil gry** |

## Funkcje

- logowanie i sesje użytkownika przez Better Auth,
- podłączanie kont Riot/League of Legends oraz FACEIT CS2,
- synchronizacja najnowszych meczów i statystyk z zewnętrznych API,
- obliczanie `global RS` na podstawie LoL Solo/Flex i FACEIT ELO,
- profil gracza z kartami kont, aktywnością i historią meczów,
- wyszukiwarka graczy, drużyn i gier z lokalną historią wyszukiwań,
- znajomi, zaproszenia i prosty feed społecznościowy,
- tworzenie grup, dołączanie kodem oraz zapraszanie graczy,

## Technologie

- TypeScript
- pnpm workspaces + Turborepo
- Expo, React Native, Expo Router
- Next.js 16 i React 19
- tRPC + TanStack Query
- Drizzle ORM + PostgreSQL/Neon
- Better Auth
- Zod
- NativeWind/Tailwind CSS
- UploadThing
- Riot API i FACEIT API

## Struktura projektu

```txt
apps/
  mobile/        aplikacja Expo / React Native
  web/           aplikacja Next.js i endpointy API
packages/
  api/           routery tRPC, synchronizacja, scoring, serwisy domenowe
  db/            schemat Drizzle i migracje bazy danych
  env/           walidacja zmiennych środowiskowych
  forms/         współdzielona logika formularzy
  types/         typy współdzielone między aplikacjami
  ui/            komponenty i style UI
```

## Uruchomienie

Wymagania lokalne:

- Node.js 18 lub nowszy,
- pnpm 10,
- dostęp do PostgreSQL albo baza Neon,
- klucze API: Riot oraz opcjonalnie FACEIT,
- konto OAuth GitHub skonfigurowane dla Better Auth.

1. Zainstaluj zależności:

```bash
pnpm install
```

2. Skopiuj przykładowe zmienne środowiskowe:

```bash
cp .env.example .env
```

3. Uzupełnij `.env`. Minimalnie potrzebne są:

```env
DATABASE_URL=postgresql://user:password@host:5432/rnkd
BETTER_AUTH_SECRET=change-me
BETTER_AUTH_URL=http://localhost:3000
OAUTH_GITHUB_CLIENT_ID=...
OAUTH_GITHUB_CLIENT_SECRET=...
RIOT_API_KEY=...
EXPO_PUBLIC_SERVER_URL=http://localhost:3000
```

4. Przygotuj bazę danych:

```bash
pnpm --filter @repo/db db:push
```

5. Uruchom projekt:

```bash
pnpm dev
```

Po starcie:

- web/API działa pod `http://localhost:3000`,
- Expo pokaże adres QR do aplikacji mobilnej,
- jeśli testujesz na telefonie, `EXPO_PUBLIC_SERVER_URL` powinien wskazywać adres komputera w sieci lokalnej, np. `http://192.168.1.20:3000`, a nie `localhost`.

## Przydatne komendy

```bash
pnpm dev                         # uruchomienie całego monorepo
pnpm build                       # build aplikacji przez Turbo
pnpm lint                        # lint we wszystkich paczkach
pnpm check-types                 # sprawdzenie TypeScript
pnpm --filter @repo/api test     # testy API
pnpm --filter mobile web         # Expo w przeglądarce
pnpm --filter @repo/db db:studio # podgląd bazy w Drizzle Studio
```

## Zmienne środowiskowe

| Zmienna                      | Wymagana       | Opis                                                                     |
| ---------------------------- | -------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`               | tak            | URL do PostgreSQL/Neon.                                                  |
| `BETTER_AUTH_SECRET`         | tak            | Sekret używany przez Better Auth.                                        |
| `BETTER_AUTH_URL`            | tak            | Bazowy adres aplikacji web/API. Lokalnie zwykle `http://localhost:3000`. |
| `OAUTH_GITHUB_CLIENT_ID`     | tak            | ID aplikacji OAuth GitHub.                                               |
| `OAUTH_GITHUB_CLIENT_SECRET` | tak            | Sekret aplikacji OAuth GitHub.                                           |
| `RIOT_API_KEY`               | tak            | Klucz do Riot API.                                                       |
| `FACEIT_API_KEY`             | nie            | Klucz do FACEIT API, potrzebny do pełnej synchronizacji CS2.             |
| `OAUTH_GOOGLE_CLIENT_ID`     | nie            | OAuth Google, jeśli jest używany.                                        |
| `OAUTH_GOOGLE_CLIENT_SECRET` | nie            | OAuth Google, jeśli jest używany.                                        |
| `OAUTH_FACEIT_CLIENT_ID`     | nie            | OAuth FACEIT, jeśli jest używany.                                        |
| `OAUTH_FACEIT_CLIENT_SECRET` | nie            | OAuth FACEIT, jeśli jest używany.                                        |
| `EXPO_PUBLIC_SERVER_URL`     | tak dla mobile | Adres backendu używany przez aplikację Expo.                             |

## Jak działa aplikacja

Aplikacja mobilna korzysta z tRPC i TanStack Query, więc większość danych jest pobierana przez typowane procedury z `packages/api`. Web w Next.js wystawia endpoint `/api/trpc`, obsługuje auth i służy jako backend dla Expo.

Najważniejszy przepływ wygląda tak:

1. Użytkownik loguje się i podłącza konto gry.
2. Backend pobiera dane z Riot/FACEIT i zapisuje je w bazie przez Drizzle.
3. Serwis scoringu przelicza `global RS`.
4. Profil, feed, wyszukiwarka i grupy korzystają z tych samych danych przez tRPC.

## Testy i jakość

W repozytorium są testy dla logiki punktacji i danych FACEIT:

```bash
pnpm --filter @repo/api test
```

Przed oddaniem projektu warto uruchomić:

```bash
pnpm lint
pnpm check-types
```
