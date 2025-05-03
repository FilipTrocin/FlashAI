
# Dokument wymagań produktu (PRD) - FlashAI

## 1. Przegląd produktu

FlashAI to webowa aplikacja, która pozwala użytkownikom tworzyć i uczyć się z fiszek edukacyjnych. Aplikacja upraszcza żmudny proces tworzenia fiszek poprzez AI, które tworzy wysokiej jakości fiszki na może wprowadzonego przez użytkownika tekstu. Użytkownik mogą następnie przeglądać, edytować i organizować swoje fiszki, a także uczyć się z nich za pomocą zintegrowanego algorytmu powtórek. FlashAI ma na celu uproszczenie i przyspieszenie procesu tworzenia efektywnych materiałów do nauki, wspierając użytkowników w przygotowaniach do egzaminów i innych wyzwań edukacyjnych.

## 2. Problem użytkownika

Obecnie tworzenie wysokiej jakości fiszek edukacyjnych jest czasochłonne i wymaga znacznego nakładu pracy manualnej. Użytkownicy, zwłaszcza studenci i profesjonaliści przygotowujący się do egzaminów, poświęcają dużo czasu na ręczne tworzenie fiszek, co zniechęca ich do korzystania z efektywnej metody nauki, jaką jest spaced repetition. Problem ten wynika z braku narzędzi, które w prosty i szybki sposób generowałyby fiszki na podstawie dostępnych materiałów edukacyjnych.

## 3. Wymagania funkcjonalne

*   **Generowanie fiszek przez AI:** Aplikacja musi umożliwiać generowanie fiszek na podstawie wprowadzonego tekstu.
* 
*   **Przeglądanie, edycja i usuwanie fiszek:** Aplikacja musi umożliwiać przeglądanie, edycję i usuwanie istniejących fiszek.
*   **System kont użytkowników:** Aplikacja musi posiadać prosty system kont użytkowników do przechowywania fiszek.
*   **Integracja z algorytmem powtórek:** Aplikacja musi być zintegrowana z gotowym algorytmem powtórek.
*   **Obliczanie metryki sukcesu AI:** System musi obliczać procent zaakceptowanych fiszek na podstawie liczby wygenerowanych fiszek z danego tekstu w porównaniu do liczby fiszek edytowanych.

## 4. Granice projektu

MVP aplikacji FlashAI nie będzie zawierać następujących funkcjonalności:

*   Własny, zaawansowany algorytm powtórek (jak SuperMemo, Anki).
*   Import wielu formatów (PDF, DOCX, itp.).
*   Współdzielenie zestawów fiszek między użytkownikami.
*   Integracje z innymi platformami edukacyjnymi.
*   Aplikacje mobilne (na początek tylko web).

## 5. Historyjki użytkowników

- ID: US-001
  - Tytuł: Rejestracja konta
  - Opis: Jako nowy użytkownik, chcę móc zarejestrować konto w systemie, abym mógł zapisywać i zarządzać swoimi fiszkami.
  - Kryteria akceptacji:
    - Użytkownik może wprowadzić adres e-mail i hasło.
    - System weryfikuje unikalność adresu e-mail.
    - System zapisuje dane użytkownika w bazie danych.
    - Użytkownik zostaje automatycznie zalogowany po rejestracji.
    - System wyświetla komunikat o sukcesie rejestracji.

- ID: US-002
  - Tytuł: Logowanie do konta
  - Opis: Jako zarejestrowany użytkownik, chcę móc zalogować się do swojego konta, abym mógł uzyskać dostęp do swoich fiszek.
  - Kryteria akceptacji:
    - Użytkownik może wprowadzić adres e-mail i hasło.
    - System weryfikuje poprawność adresu e-mail i hasła na podstawie danych w bazie danych.
    - Użytkownik zostaje zalogowany do systemu.
    - System wyświetla komunikat o sukcesie logowania.
    - W przypadku błędnych danych logowania, system wyświetla odpowiedni komunikat o błędzie.

- ID: US-003
  - Tytuł: Wylogowanie z konta
  - Opis: Jako zalogowany użytkownik, chcę móc wylogować się z konta, aby zabezpieczyć swoje dane.
  - Kryteria akceptacji:
    - Użytkownik może wylogować się z systemu.
    - System usuwa sesję użytkownika.
    - Użytkownik zostaje przekierowany na stronę logowania.

- ID: US-004
  - Tytuł: Odzyskiwanie hasła
  - Opis: Jako użytkownik, który zapomniał hasła, chcę móc zresetować hasło, abym mógł ponownie zalogować się do swojego konta.
  - Kryteria akceptacji:
    - Użytkownik może wprowadzić adres e-mail powiązany z kontem.
    - System wysyła wiadomość e-mail z linkiem do resetowania hasła.
    - Po kliknięciu w link, użytkownik może ustawić nowe hasło.
    - System zapisuje nowe hasło w bazie danych.
    - Użytkownik zostaje poinformowany o pomyślnym zresetowaniu hasła.

- ID: US-005
  - Tytuł: Generowanie fiszek przez AI
  - Opis: Jako użytkownik, chcę móc wygenerować fiszki na podstawie wprowadzonego tekstu, abym zaoszczędził czas na manualnym tworzeniu fiszek.
  - Kryteria akceptacji:
    - Użytkownik może wkleić tekst do pola tekstowego.
    - System generuje serię fiszek na podstawie tekstu.
    - Fiszki zawierają pytanie i odpowiedź.
    - System wyświetla wygenerowane fiszki użytkownikowi.

- ID: US-007
  - Tytuł: Przeglądanie fiszek
  - Opis: Jako użytkownik, chcę móc przeglądać swoje fiszki, abym mógł się z nich uczyć.
  - Kryteria akceptacji:
    - Użytkownik może przeglądać fiszki w formie listy i kart
    - System wyświetla pytanie na przodzie fiszki i odpowiedź po odwróceniu.

- ID: US-008
  - Tytuł: Edycja fiszek
  - Opis: Jako użytkownik, chcę móc edytować istniejące fiszki, abym mógł poprawić błędy lub dostosować treść.
  - Kryteria akceptacji:
    - Użytkownik może edytować pytanie i odpowiedź dla fiszki.
    - Użytkownik może zapisać zmiany w systemie.
    - System wyświetla zaktualizowaną fiszkę użytkownikowi.

- ID: US-009
  - Tytuł: Usuwanie fiszek
  - Opis: Jako użytkownik, chcę móc usuwać niepotrzebne fiszki, abym mógł utrzymać porządek w swoich materiałach.
  - Kryteria akceptacji:
    - Użytkownik może usunąć fiszkę z systemu.
    - System wyświetla potwierdzenie usunięcia fiszki.

- ID: US-010
  - Tytuł: Korzystanie z algorytmu powtórek
  - Opis: Jako użytkownik, chcę móc uczyć się z fiszek za pomocą algorytmu powtórek, abym mógł efektywnie zapamiętywać informacje.
  - Kryteria akceptacji:
    - System prezentuje fiszki zgodnie z algorytmem powtórek.
    - Użytkownik może ocenić swoją odpowiedź (np. "trudne", "średnie", "łatwe").
    - Algorytm dostosowuje harmonogram powtórek na podstawie ocen użytkownika.

- ID: US-011
  - Tytuł: Bezpieczny dostęp do konta
  - Opis: Jako użytkownik, chcę mieć pewność, że dostęp do mojego konta jest bezpieczny i chroniony przed nieautoryzowanym dostępem.
  - Kryteria akceptacji:
    - System wymaga silnego hasła (np. minimum 8 znaków, zawiera litery i cyfry).
    - System przechowuje hasła w zaszyfrowanej formie.
    - System chroni przed atakami brute-force (np. ograniczenie liczby prób logowania).

- ID: US-012
  - Tytuł: Akceptacja wygenerowanej fiszki
  - Opis: Jako użytkownik, chcę móc zaakceptować fiszkę wygenerowaną przez AI bez edycji, aby system mógł mierzyć skuteczność AI.
  - Kryteria akceptacji:
    - Użytkownik ma możliwość oznaczenia fiszki jako zaakceptowanej.
    - System zapisuje informację o akceptacji fiszki.
    - System uwzględnia zaakceptowane fiszki w metryce sukcesu AI.

- ID: US-013
  - Tytuł: Odrzucenie wygenerowanej fiszki
  - Opis: Jako użytkownik, chcę móc odrzucić fiszkę wygenerowaną przez AI, jeśli uznam ją za niepoprawną lub nieprzydatną.
  - Kryteria akceptacji:
    - Użytkownik ma możliwość oznaczenia fiszki jako odrzuconej.
    - System zapisuje informację o odrzuceniu fiszki.
    - System uwzględnia odrzucone fiszki w metryce sukcesu AI.

## 6. Metryki sukcesu

*   **75% fiszek wygenerowanych przez AI jest akceptowanych przez użytkownika (bez edycji).**
    *   Sposób pomiaru: System śledzi ilość fiszek wygenerowanych z danego tekstu oraz ilość fiszek, które zostały edytowane lub odrzucone. Na tej podstawie obliczany jest procent zaakceptowanych fiszek. Formuła: (Liczba fiszek zaakceptowanych / Liczba fiszek wygenerowanych) * 100%.
*   **Użytkownicy tworzą 75% fiszek z wykorzystaniem AI.**
    * Sposób pomiaru: System śledzi ilość fiszek wygenerowanych przez AI w porównaniu do ilości fiszek stworzonych manualnie. Formuła: (Liczba fiszek wygenerowanych przez AI / Całkowita liczba fiszek) * 100%.