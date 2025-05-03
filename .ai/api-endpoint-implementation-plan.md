# API Endpoint Implementation Plan: POST /flashcards/generate/ai

## 1. Przegląd punktu końcowego
Endpoint służy do generowania fiszek przy użyciu sztucznej inteligencji. Użytkownik wysyła żądanie zawierające tekst źródłowy, a serwer komunikuje się z usługą Openrouter.ai, aby wygenerować pary pytanie-odpowiedź. Wygenerowane fiszki są zapisywane w bazie danych w tabeli `flashcards` z flagami `ai_generated` ustawionymi na true i `ai_status` na null. Jednocześnie aktualizowany jest licznik wygenerowanych fiszek w tabeli `ai_metrics`.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /flashcards/generate/ai
- Parametry:
  - Wymagane:
    - `source_text` (string): Tekst źródłowy do przetworzenia przez AI.
  - Opcjonalne:
    - `desired_count` (number): Liczba fiszek do wygenerowania.
- Request Body: JSON zgodny ze schematem **GenerateAiCardsCommand**.

## 3. Wykorzystywane typy
- `GenerateAiCardsCommand` – definiowany w `src/types.ts`.
- `GenerateAiCardsResponse` – definiowany w `src/types.ts`.

## 4. Szczegóły odpowiedzi
- Sukces:
  - Status: 201 Created
  - Body: JSON zawierający listę wygenerowanych fiszek, przykładowo:
    ```json
    {
      "generated": [
        { "id": "uuid", "question": "...", "answer": "..." },
        ...
      ]
    }
    ```
- Błędy:
  - 422 Unprocessable Entity: Jeśli `source_text` jest zbyt krótki.
  - 429 Too Many Requests: W przypadku przekroczenia limitu wywołań API AI.
  - 500 Internal Server Error: W przypadku błędów w komunikacji z usługą AI lub innych błędów serwera.

## 5. Przepływ danych
1. Odbiór zadania POST z ciałem zawierającym `source_text`
1. Walidacja danych wejściowych przy użyciu biblioteki Zod, na podstawie schematu `GenerateAiCardsCommand`.
2. Weryfikacja autentyczności żądania poprzez sprawdzenie tokenu JWT (dostępnego w `context.locals` korzystającym z Supabase).
3. Wywołanie zewnętrznej usługi Openrouter.ai z parametrami: `source_text`, oraz `desired_count`.
4. Otrzymanie odpowiedzi zawierającej pary pytanie-odpowiedź od AI.
5. Walidacja wygenerowanych par (np. sprawdzenie, czy pytanie zawiera 4–50 słów, a odpowiedź 4–200 słów).
6. Wstawienie fiszek do bazy danych, ustawiając flagi: `ai_generated = true` oraz `ai_status = null`.
7. Aktualizacja licznika `generated_cnt` w tabeli `ai_metrics` (może być zarządzana przez wyzwalacze w bazie danych).
8. Zwrócenie odpowiedzi 201 z wygenerowanymi danymi.

## 6. Względy bezpieczeństwa
- **Autoryzacja i uwierzytelnianie:** Wymagany token JWT wysyłany w nagłówku `Authorization`. Weryfikacja użytkownika poprzez Supabase.
- **RLS:** Korzystanie z polityk Row-Level Security w bazie danych (np. polityka `own_cards`) w celu zapewnienia, że użytkownik operuje tylko na swoich danych.
- **Walidacja wejścia:** Dokładna walidacja danych wejściowych, aby zapobiec wysyłaniu niepoprawnych lub potencjalnie szkodliwych danych do usługi AI.

## 7. Obsługa błędów
- **Błędy walidacji:** Zwracanie kodu 422 przy niepoprawnych danych wejściowych (np. zbyt krótki `source_text`).
- **Błędy zewnętrzne:** Zwracanie 429, jeśli usługa AI zgłosi przekroczenie limitu, oraz 500 dla ogólnych błędów komunikacji.
- **Błędy bazy danych:** Obsługa wyjątków podczas operacji wstawiania danych czy aktualizacji wskaźników, z odpowiednim logowaniem i zwracaniem 500.
- **Logowanie:** Szczegółowe logi błędów dla diagnostyki, zawierające identyfikator żądania oraz kontekst użytkownika.

## 8. Rozważania dotyczące wydajności
- **Operacje wsadowe:** Użycie wsadowych wstawek do bazy danych do wprowadzania wielu fiszek jednocześnie.
- **Wyzwalacze bazy danych:** Wykorzystanie wyzwalaczy do automatycznej aktualizacji wskaźnika `generated_cnt` w tabeli `ai_metrics`.
- **Ograniczenia wywołań:** Monitorowanie i ograniczanie liczby wywołań do usługi AI, aby zapobiec nadużyciom.


## 9. Etapy wdrożenia
1. Utworzenie nowego pliku endpointu: `src/pages/api/flashcards/generate/ai.ts`.
2. Implementacja walidacji danych wejściowych (schema validation) przy użyciu Zod.
3. Integracja z usługą Openrouter.ai oraz implementacja logiki wywołania API z obsługą odpowiedzi i błędów. Na etapie developmentu skorzystamy z Mockow zamiast wywoływania serwisu AI.
4. Implementacja logiki wstawiania fiszek do bazy danych oraz aktualizacji metryk (przy użyciu operacji wsadowych lub wyzwalaczy).
5. Wdrożenie mechanizmu autoryzacji i weryfikacji użytkownika poprzez token JWT i Supabase.
6. Implementacja obsługi błędów i logowania (zarówno dla błędów walidacji, jak i zewnętrznych).
