## Polski

### O projekcie

Projekt do portfolio przedstawiający koncepcję strony internetowej klubu gamingowego. Łączy prezentację oferty, interaktywny cennik i planer sesji w spójny interfejs dopasowany do komputerów, tabletów i telefonów.

Celem projektu jest pokazanie praktycznej implementacji frontendu: od układu stron i responsywnego stylowania po obsługę formularzy, obliczenia i lokalne zapisywanie ustawień. Interfejs strony jest w języku polskim.

### Funkcje

- **Cztery strony:** strona główna, cennik, wynajem PC i kontakt.
- **Kalkulator cen:** strefy Standard i Pro, pakiety 1/3/5/10 godzin oraz od 1 do 6 stanowisk.
- **Aktualizowane podsumowanie:** łączny koszt, cena za jedno stanowisko i oszczędność względem pojedynczych godzin.
- **Planer sesji:** wybór terminu i konfiguracji, walidacja pól oraz sprawdzanie, czy wybrany termin nie minął.
- **Przenoszenie wyboru:** parametry adresu URL zachowują pakiet wybrany w cenniku podczas przejścia do planera.
- **Zapis lokalny:** przywracanie ustawień sesji przez `localStorage` i pobieranie podsumowania jako pliku tekstowego.
- **Szkic wiadomości:** formularz kontaktowy przygotowuje plik tekstowy do samodzielnego wykorzystania.
- **Obsługa klawiatury:** menu zamykane klawiszem Escape, zarządzanie fokusem, widoczne stany zaznaczenia i etykiety formularzy.

### Technologie i rozwiązania

- **HTML5:** semantyczna struktura, formularze i natywne elementy rozwijane `details`.
- **CSS3:** Flexbox, Grid, zmienne CSS, zapytania medialne i warstwy gradientowe na zdjęciu.
- **JavaScript:** operacje na DOM, obsługa zdarzeń, wspólna funkcja obliczania cen, walidacja danych, `URLSearchParams`, `localStorage` i `Blob`.

Projekt działa bez frameworków, zewnętrznych bibliotek i procesu budowania.

### Jak to działa

Taryfy znajdują się w obiekcie `zones` w `app.js`. Po zmianie strefy, długości sesji lub liczby PC funkcja `calculate()` oblicza cenę, a `renderCalculator()` aktualizuje interfejs i odnośnik do planera.

Planer odczytuje poprawne parametry URL, sprawdza formularz i pozwala zapisać ustawienia na urządzeniu. Pliki z podsumowaniem i szkicem wiadomości powstają bezpośrednio w przeglądarce.

### Uruchomienie

Otwórz `index.html` w przeglądarce. Nie trzeba instalować pakietów ani uruchamiać własnego serwera. Pliki można również umieścić na hostingu statycznym, np. GitHub Pages.

Przy otwieraniu przez `file://` część przeglądarek może ograniczać działanie `localStorage`. Planer obsługuje taką sytuację i informuje, gdy nie może zapisać ustawień.

### Zakres demonstracyjny

To projekt frontendowy do portfolio. Ceny, konfiguracje stanowisk i godziny dostępne w planerze są przykładowe, a dane kontaktowe wymagają uzupełnienia. System nie sprawdza dostępności miejsc, nie tworzy rzeczywistych rezerwacji, nie wysyła wiadomości i nie obsługuje płatności.

W `localStorage` zapisywane są wyłącznie ustawienia sesji: strefa, długość, liczba PC, data i godzina. Dane kontaktowe nie są tam przechowywane; trafiają do pliku tekstowego, jeśli użytkownik zdecyduje się go pobrać.

Zdjęcie klubu jest wizualizacją koncepcyjną wygenerowaną przez AI. Ilustracje stanowisk w kartach Standard i Pro wykonano za pomocą CSS.

## English

### About the project

A portfolio project presenting a website concept for a PC gaming club. It combines a service overview, an interactive pricing calculator and a session planner in a consistent interface that adapts to desktop, tablet and mobile screens.

The project demonstrates practical frontend implementation: page structure, responsive styling, form handling, pricing logic and local storage of session settings. The website interface is in Polish.

### Features

- **Four pages:** home, pricing, PC rental and contact.
- **Pricing calculator:** Standard and Pro zones, 1/3/5/10-hour packages and 1–6 PCs.
- **Live summary:** total cost, price per PC and savings compared with individual hourly rates.
- **Session planner:** date and configuration selection, field validation and checks for past start times.
- **Selection transfer:** URL parameters carry the selected pricing package into the planner.
- **Local saving:** session settings can be restored through `localStorage`, and a summary can be downloaded as a text file.
- **Message draft:** the contact form prepares a downloadable text file for the user to use independently.
- **Keyboard support:** Escape closes the menu, with focus management, visible selection states and labelled form fields.

### Technologies and implementation

- **HTML5:** semantic structure, forms and native `details` elements.
- **CSS3:** Flexbox, Grid, custom properties, media queries and gradient overlays on the hero image.
- **JavaScript:** DOM manipulation, event handling, shared pricing logic, validation, `URLSearchParams`, `localStorage` and `Blob`.

The project runs without frameworks, external libraries or a build step.

### How it works

Rates are defined in the `zones` object in `app.js`. Changing the zone, session duration or number of PCs triggers `calculate()`. The `renderCalculator()` function then updates the interface and the link to the planner.

The planner reads valid URL parameters, validates the form and lets the user save session settings on their device. Session summaries and message drafts are generated directly in the browser.

### Running locally

Open `index.html` in a browser. No package installation or custom server is required. The files can also be deployed to static hosting, such as GitHub Pages.

Some browsers restrict `localStorage` when pages are opened through `file://`. The planner handles this case and reports when settings cannot be saved.

### Demo scope

This is a frontend portfolio project. Prices, workstation configurations and planner time slots are illustrative, and contact details need to be supplied. The system does not check seat availability, create actual bookings, send messages or process payments.

Only session settings are saved in `localStorage`: zone, duration, number of PCs, date and time. Contact details are not stored there; they are included in the text file if the user chooses to download it.

The gaming lounge photo is an AI-generated concept image. The workstation illustrations in the Standard and Pro cards are built with CSS.

## Struktura projektu / Project structure

| Plik / File | Rola / Purpose |
| --- | --- |
| [index.html](index.html) | Strona główna / Home page |
| [cennik.html](cennik.html) | Cennik i kalkulator / Pricing and calculator |
| [wypozyczalnia.html](wypozyczalnia.html) | Planer sesji / Session planner |
| [kontakt.html](kontakt.html) | Kontakt i szkic wiadomości / Contact and message draft |
| [style.css](style.css) | Style bazowe / Base styles |
| [reference.css](reference.css) | Wspólny układ i motyw / Shared layout and theme |
| [home-reference.css](home-reference.css) | Style strony głównej / Home page styles |
| [app.js](app.js) | Logika interfejsu / Interface logic |
| [assets/](assets/) | Obraz i ikona strony / Image and favicon |

**Modyfikacja cen:** edytuj `zones` w `app.js`, a następnie zaktualizuj ceny początkowe i teksty oferty w odpowiednich plikach HTML. Zachowaj kolejność podłączania arkuszy CSS.

**Updating prices:** edit `zones` in `app.js`, then update initial prices and offer text in the relevant HTML files. Preserve the stylesheet loading order.
