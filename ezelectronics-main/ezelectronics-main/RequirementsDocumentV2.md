# Requirements Document - future EZElectronics

Date:

Version: V1 - description of EZElectronics in FUTURE form (as proposed by the team)

| Version number | Change |
| :------------: | :----: |
|                |        |

# Contents

- [Requirements Document - future EZElectronics](#requirements-document---future-ezelectronics)
- [Contents](#contents)
- [Informal description](#informal-description)
- [Stakeholders](#stakeholders)
- [Context Diagram and interfaces](#context-diagram-and-interfaces)
  - [Context Diagram](#context-diagram)
  - [Interfaces](#interfaces)
- [Stories and personas](#stories-and-personas)
- [Functional and non functional requirements](#functional-and-non-functional-requirements)
  - [Functional Requirements](#functional-requirements)
  - [Non Functional Requirements](#non-functional-requirements)
- [Use case diagram and use cases](#use-case-diagram-and-use-cases)
  - [Use case diagram](#use-case-diagram)
    - [Use case 1, Login](#use-case-1-login)
        - [Scenario 1.1](#scenario-11)
        - [Scenario 1.2](#scenario-12)
    - [Use case 2, Creazione di un nuovo prodotto](#use-case-2-creazione-di-un-nuovo-prodotto)
        - [Scenario 2.1, inserimento positivo di un singolo prodotto](#scenario-21-inserimento-positivo-di-un-singolo-prodotto)
        - [Scenario 2.2, inserimento negativo di prodotti](#scenario-22-inserimento-negativo-di-prodotti)
    - [Use case 3, Acquisto prodotto/i](#use-case-3-acquisto-prodottoi)
        - [Scenario 3.1, Acquisto effettuato correttamente](#scenario-31-acquisto-effettuato-correttamente)
        - [Scenario 3.2, Rimozione prodotto](#scenario-32-rimozione-prodotto)
        - [Scenario 3.3, Errore inserimento nel carrello, acquisto annullato](#scenario-33-errore-inserimento-nel-carrello-acquisto-annullato)
        - [Scenario 3.4, Errore inserimento nel carrello, acquisto confermato](#scenario-34-errore-inserimento-nel-carrello-acquisto-confermato)
    - [Use case 4, LogOut](#use-case-4-logout)
        - [Scenario 4.1, Successo Logout](#scenario-41-successo-logout)
        - [Scenario 4.2, Fallimento Logout](#scenario-42-fallimento-logout)
    - [Use case 5, Recupero informazioni utente loggato](#use-case-5-recupero-informazioni-utente-loggato)
        - [Scenario 5.1, Successo recupero informazioni personali](#scenario-51-successo-recupero-informazioni-personali)
        - [Scenario 5.2, Fallimento recupero informazioni personali](#scenario-52-fallimento-recupero-informazioni-personali)
    - [Use case 6, Creazione di un nuovo Customer/Manager](#use-case-6-creazione-di-un-nuovo-customermanager)
        - [Scenario 6.1, Successo creazione nuovo account](#scenario-61-successo-creazione-nuovo-account)
        - [Scenario 6.2, Username già esistente](#scenario-62-username-già-esistente)
    - [Use case 7, Elenco di tutti gli utenti](#use-case-7-elenco-di-tutti-gli-utenti)
        - [Scenario 7.1, Successo recupero lista utenti](#scenario-71-successo-recupero-lista-utenti)
        - [Scenario 7.2, Fallimento recupero lista utenti](#scenario-72-fallimento-recupero-lista-utenti)
    - [Use case 8, Elenco tutti gli utenti con determinato ruolo](#use-case-8-elenco-tutti-gli-utenti-con-determinato-ruolo)
        - [Scenario 8.1, Successo recupero lista customers/managers](#scenario-81-successo-recupero-lista-customersmanagers)
    - [Use case 9, Recupera utente con determinato username](#use-case-9-recupera-utente-con-determinato-username)
        - [Scenario 9.1, Successo recupero Utente con username](#scenario-91-successo-recupero-utente-con-username)
        - [Scenario 9.2, Utente con username dato non presente in database](#scenario-92-utente-con-username-dato-non-presente-in-database)
    - [Use case 10, Eliminazione Utente con dato username](#use-case-10-eliminazione-utente-con-dato-username)
        - [Scenario 10.1, Successo rimozione Utente con username](#scenario-101-successo-rimozione-utente-con-username)
        - [Scenario 10.2, Utente con username dato non presente in database](#scenario-102-utente-con-username-dato-non-presente-in-database)
    - [Use case 11, Registrazione di prodotti con lo stesso modello](#use-case-11-registrazione-di-prodotti-con-lo-stesso-modello)
        - [Scenario 11.1, Inserimento corretto dei prodotti in catagolo](#scenario-111-inserimento-corretto-dei-prodotti-in-catagolo)
        - [Scenario 11.2, Inserimento errato della data di consegna](#scenario-112-inserimento-errato-della-data-di-consegna)
    - [Use case 12, Manager/Admin segna un prodotto come venduto](#use-case-12-manageradmin-segna-un-prodotto-come-venduto)
        - [Scenario 12.1, Prodotto segnato come venduto](#scenario-121-prodotto-segnato-come-venduto)
        - [Scenario 12.2, Codice prodotto inserito errato](#scenario-122-codice-prodotto-inserito-errato)
        - [Scenario 12.3, Data vendita errata](#scenario-123-data-vendita-errata)
    - [Use case 13, Recupera prodotti presenti nel catalogo](#use-case-13-recupera-prodotti-presenti-nel-catalogo)
        - [Scenario 13.1, Lista di prodotti venduti](#scenario-131-lista-di-prodotti-venduti)
        - [Scenario 13.2, Lista di prodotti non venduti](#scenario-132-lista-di-prodotti-non-venduti)
    - [Use case 14, Recupera tutti i prodotti di una specifica categoria](#use-case-14-recupera-tutti-i-prodotti-di-una-specifica-categoria)
        - [Scenario 14.1, Lista di prodotti venduti](#scenario-141-lista-di-prodotti-venduti)
        - [Scenario 14.2, Lista di prodotti non venduti](#scenario-142-lista-di-prodotti-non-venduti)
    - [Use case 15, Recupera tutti i prodotti di uno specifico modello](#use-case-15-recupera-tutti-i-prodotti-di-uno-specifico-modello)
        - [Scenario 15.1, Lista di prodotti venduti](#scenario-151-lista-di-prodotti-venduti)
        - [Scenario 15.2, Lista di prodotti non venduti](#scenario-152-lista-di-prodotti-non-venduti)
    - [Use case 16, Elimina prodotto da catalogo](#use-case-16-elimina-prodotto-da-catalogo)
        - [Scenario 16.1, Prodotto rimosso con successo](#scenario-161-prodotto-rimosso-con-successo)
        - [Scenario 16.2, Codice prodotto fornito non presente in catalogo](#scenario-162-codice-prodotto-fornito-non-presente-in-catalogo)
    - [Use case 17, Recupera carrello di Customer attivo](#use-case-17-recupera-carrello-di-customer-attivo)
        - [Scenario 17.1, Lista di prodotti in carrello](#scenario-171-lista-di-prodotti-in-carrello)
    - [Use case 18, Aggiungi un prodotto al carrello](#use-case-18-aggiungi-un-prodotto-al-carrello)
        - [Scenario 18.1, Prodotto inserito con successo](#scenario-181-prodotto-inserito-con-successo)
        - [Scenario 18.2, Codice Prodotto inserito non in catalogo](#scenario-182-codice-prodotto-inserito-non-in-catalogo)
    - [Use case 19, Checkout carrello](#use-case-19-checkout-carrello)
        - [Scenario 19.1, Checkout avvenuto con successo](#scenario-191-checkout-avvenuto-con-successo)
        - [Scenario 19.2, Carrello vuoto al checkout](#scenario-192-carrello-vuoto-al-checkout)
    - [Use case 20, Recupero storico carrelli](#use-case-20-recupero-storico-carrelli)
        - [Scenario 20.1, Storico ordini](#scenario-201-storico-ordini)
    - [Use case 21, Rimozione prodotto da carrello](#use-case-21-rimozione-prodotto-da-carrello)
        - [Scenario 21.1, Successo rimozione prodotto](#scenario-211-successo-rimozione-prodotto)
        - [Scenario 21.2, Prodotto da rimuovere non presente nel carrello](#scenario-212-prodotto-da-rimuovere-non-presente-nel-carrello)
        - [Scenario 21.3, Carrello non attivo](#scenario-213-carrello-non-attivo)
        - [Scenario 21.4, Prodotto da rimuovere non presente nel catalogo](#scenario-214-prodotto-da-rimuovere-non-presente-nel-catalogo)
    - [Use case 22, Svuota carrello](#use-case-22-svuota-carrello)
        - [Scenario 22.1, Successo rimozione di tutti i Prodotti in carrello](#scenario-221-successo-rimozione-di-tutti-i-prodotti-in-carrello)
        - [Scenario 22.2, Customer non ha un carrello attivo](#scenario-222-customer-non-ha-un-carrello-attivo)
    - [Use case 23, Pagamento online](#use-case-23-pagamento-online)
        - [Scenario 23.1, Successo pagamento](#scenario-231-successo-pagamento)
        - [Scenario 23.2, Il pagamento non va a buon fine](#scenario-232-il-pagamento-non-va-a-buon-fine)
    - [Use case 24, Richiesta recupero password](#use-case-24-richiesta-recupero-password)
        - [Scenario 24.1, Successo richiesta recupero password](#scenario-241-successo-richiesta-recupero-password)
        - [Scenario 24.2, Email non nel database](#scenario-242-email-non-nel-database)
    - [Use case 25, Modifica della password](#use-case-25-modifica-della-password)
        - [Scenario 25.1, Successo modifica password](#scenario-251-successo-modifica-password)
        - [Scenario 25.2, Errore modifica password](#scenario-252-errore-modifica-password)
    - [Use case 26, Recupera prodotti non venduti presenti nel catalogo](#use-case-26-recupera-prodotti-non-venduti-presenti-nel-catalogo)
        - [Scenario 26.1, Lista di prodotti venduti](#scenario-261-lista-di-prodotti-venduti)
    - [Use case 27, Recupera tutti i prodotti non venduti di una specifica categoria](#use-case-27-recupera-tutti-i-prodotti-non-venduti-di-una-specifica-categoria)
        - [Scenario 27.1, Lista di prodotti non venduti](#scenario-271-lista-di-prodotti-non-venduti)
    - [Use case 28, Recupera tutti i prodotti di uno specifico modello](#use-case-28-recupera-tutti-i-prodotti-di-uno-specifico-modello)
        - [Scenario 28.1, Lista di prodotti venduti](#scenario-281-lista-di-prodotti-venduti)
    - [Use case 29, Crea un nuovo admin alla prima installazione](#use-case-29-crea-un-nuovo-admin-alla-prima-installazione)
        - [Scenario 29.1, Successo creazione Admin](#scenario-291-successo-creazione-admin)
    - [Use case 30, Visualizzazione della pagina per confermare i manager](#use-case-30-visualizzazione-della-pagina-per-confermare-i-manager)
        - [Scenario 30.1, Visualizzazione pagina di manager da confermare](#scenario-301-visualizzazione-pagina-di-manager-da-confermare)
    - [Use case 31, Conferma di un account manager](#use-case-31-conferma-di-un-account-manager)
        - [Scenario 31.1, Successo conferma manager](#scenario-311-successo-conferma-manager)
        - [Scenario 31.2, Eliminazione account manager](#scenario-312-eliminazione-account-manager)
    - [Use case 32, Il customer vuole eliminare il proprio account](#use-case-32-il-customer-vuole-eliminare-il-proprio-account)
        - [Scenario 32.1, Successo eliminazione account](#scenario-321-successo-eliminazione-account)
        - [Scenario 32.2, Fallimento eliminazione account](#scenario-322-fallimento-eliminazione-account)
    - [Use case 33, L'admin/manager vuole vedere un riepilogo di statistiche di vendita](#use-case-33-ladminmanager-vuole-vedere-un-riepilogo-di-statistiche-di-vendita)
        - [Scenario 33.1, Successo visualizzazione statistiche](#scenario-331-successo-visualizzazione-statistiche)
- [Glossary](#glossary)
- [System Design](#system-design)
- [Deployment Diagram](#deployment-diagram)

# Informal description

EZElectronics (read EaSy Electronics) is a software application designed to help managers of electronics stores to manage their products and offer them to customers through a dedicated website. Managers can assess the available products, record new ones, and confirm purchases. Customers can see available products, add them to a cart and see the history of their past purchases.

# Stakeholders

| Stakeholder name | Description |
| :--------------: | :---------: |
| Admin | Si occupa della gestione interna del sistema e degli utenti, conferma account per i manager e monitora il negozio|
| Manager di un negozio di elettronica| Gestice l'inventario del negozio, inserisce nuovi ordini e monitora i prodotti |
| Customer | Usufruisce del software acquistando prodotti o prenotando ordini|
| Fornitori hardware | Riforniscono i magazzini del negozio evadendo gli ordini effettuati dai manager |
| Sistema di pagamento | si occupa della gestione delle transazioni online tra customer e negozio | 
| Corriere | Si occupa della consegna della merce nel caso venga scelta la spedizione |
| Analyst | Sulla base delle statistiche fornite dal negozio può effettuare analisi di mercato | 

# Context Diagram and interfaces

## Context Diagram

![alt text](context_v2.png)

## Interfaces

|   Actor   | Logical Interface | Physical Interface |
| :-------: | :---------------: | :----------------: |
| Admin | PC |  GUI + linea di comando ( gestione sistema ed utenti) |
| Manager | PC | GUI (inserire ordini, controllare la disponibilità del magazzino, visualizzare utenti, prodotti e statistiche negozio) |
| Customer | PC | GUI (visualizzare e acquistare prodotti) |
| Servizio di pagamento | Internet | API (per gestione transazione) |
| Servizio di trasporto | Internet | API (per gestione consegna) |

# Stories and personas

- Persona 1: studente, maschio, 19 anni, con un basso reddito
    - Storia: alla ricerca di un notebook economico, ma con buone prestazioni, per prendere appunti durante le lezioni. 

- Persona 2: professionista con un alto reddito, donna, single, età 40, senza figli
    - Storia: trascorrendo tutta la giornata al lavoro necessita di un elettrodomestico per la pulizia autonoma della casa (robo aspirapolvere).  

- Persona 3: professore universitario, uomo, età 35
    - Storia: per il proprio insegnamento ricerca arduino.

- Persona 4: adolescente, donna, 16 anni
    - Storia: è alla ricerca dell'ultimo modello di Iphone senza badare a spese.

- Persona 5: graphic designer, 26 anni, con un reddito medio
    - Storia: necessita di un computer ad alte prestazioni per il suo lavoro.

- Persona 6: admin di un negozio, 50 anni, sposato, con figli
  - Storia: vuole aumentare il business del proprio negozio analizzando le statistiche delle vendite

# Functional and non functional requirements

## Functional Requirements

|  ID   | Description |
| :---: | :---------: |
|  **FR1**  | **Autenticazione e autorizzazione** |
| FR1.1 | login/logout utente |
| FR1.2 | creazione account (con definizione del ruolo) |
| FR1.2.1 | conferma identità manager da parte dell'admin|
| FR1.3 | cancellazione proprio account |
| **FR2** | **Gestione  utenti iscritti** |
| FR2.1 | Recupero utenti iscritti |
| FR2.1.1 | Recupero utenti per ruolo|
| FR2.1.2 | Recupero utente per username|
| FR2.2 | Cancellazione utente dal sistema |
| **FR3**| **Gestione magazzino negozio**|
| FR3.1 | Registrazione arrivo di ordine |
| FR3.1.1 | Creazione di un prodotto con id univoco|
| FR3.2 | Eliminazione di un singolo prodotto|
| FR3.3 | Registrazione vendita di un prodotto|
| **FR4** | **Visualizzazione prodotti disponibili** |
| FR4.1 | Recupero tutti i prodotti|
| FR4.2 | Recupero prodotto per codice|
| FR4.3 | Recupero prodotti per categoria|
| FR4.4 | Recupero prodotti per modello|
| **FR5**| **Gestione carrello** |
| FR5.1 | Creazione automatica di un carrello |
| FR5.2 | Inserimento di un prodotto|
| FR5.3 | Rimozione di un prodotto |
| FR5.4 | Check-out di un carrello |
| FR5.4.1 | Salvataggio carrello evaso |
| FR5.4.2 | Salvataggio prodotti selezionati | 
| FR5.5 | Eliminazione del carrello |
| **FR6**| **Visualizzazione utente** |
| FR6.1 | Informazione sessione |
| FR6.2 | Storico carrelli |
| **FR7**| **Gestione delle transazioni online** |
| FR7.1 | Richiesta pagamento di un carrello |
| FR7.2 | Gestione dati del pagamento |
| **FR8**| **Gestione della consegna** |
| FR8.1 | Richiesta consegna (a casa) di un ordine effettuato |
| FR8.2 | Gestione dati della consegna (città, provincia, CAP, indirizzo, numero civico, numero di telefono) |
| **FR9** | **Statistiche** |
|  FR9.1 | Categoria prodotti più venduti |
|  FR9.2 | Modelli prodotti più venduti |
|  FR9.3 | Prezzo medio carrelli evasi |
|  FR9.4 | Trend vendite (1-mese, 3-mesi, 6-mesi, anno) |
| **FR10** | **Creazione admin** | 
| FR10.1 | Alla prima attivazione del sito viene creato un account admin per il gestore del negozio |  

| | **FR1** |  **FR2** | **FR3** | **FR4** |  **FR5** | **FR6** | **FR7** | **FR8** |**FR9** | **FR10** |
| :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| Admin |X | X |X | X| | | | | X| X|
| Manager | X | | X| X | | | | | X| |
| Customer | X | |  | X |X| X| X|X| | |

## Non Functional Requirements

|   ID    | Type (efficiency, reliability, ..) | Description | Refers to |
| :-----: | :--------------------------------: | :---------: | :-------: |
|  NFR1   | usabilità | I customer non devono aver bisogno di training | FR1, FR1, FR4, FR5, FR6, FR7, FR8 |
|  NFR2   | usabilità | Il tempo di training per un manager deve essere inferiore a 2 ore | FR1, FR3, FR4, FR9  |
|  NFR3   | usabilità | Il tempo di training per un admin deve essere inferiore a 4 ore | FR1, FR2, FR3, FR4, FR9, FR10 |
|  NFR4   | efficienza| Il tempo di risposta ad ogni azione dell'utente deve essere inferiore di < 0.3 secondi (escludendo problemi di rete)| tutti gli FR|
|  NFR5   | affidabilità | Ogni utente non deve segnalare più di un bug all'anno| tutti gli FR |
| NFR6 | affidabilità | I server dove gira il software devono essere raggiungibili per il 95% delle ore annue | tutti gli FR|
| NFR7 | portabilità | L'applicazione web deve essere disponibile per i principali browser (Chromium-based , Firefox, Safari) | tutti gli FR |
| NFR8 | sicurezza | Deve implentare lo stato dell'arte attualmente disponibile | tutti gli FR 
| NFR9 | dominio | Le date devono essere rappresentate mediante il seguente formato: ***YYYY-MM-DD*** |  FR3, FR4, FR5, FR7, FR8, FR9
| NFR10 | dominio | I prodotti possono essere solo dei seguenti tipi: ***["Smartphone", "Laptop", "Appliance"]*** |  FR3, FR4, FR5, FR7, FR8, FR9
| NFR11 | dominio | La valuta è in euro (**€**) | FR7, FR9 |

# Use case diagram and use cases

## Use case diagram

![useCaseDiagram_v2](UseCaseDiagram_v2.png)

### Use case 1, Login

| Actors Involved  |  Customer, Manager, Admin                                                                   |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | L'utente non ha effettuato l'accesso |
|  Post condition  |  L'utente risulta loggato   |
| Nominal Scenario |         Inserimento delle credenziali         |
|    Exceptions    |                        Credenziali errate                        |

##### Scenario 1.1

|  Scenario 1.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è loggato |
| Post condition |  L'utente risulta loggato   |
|     Step#      |                                Description                                 |
|       1        |                          L'utente accede alla pagina di login                                                   |
|       2        |                                                              L'utente inserisce le sue credenziali              |
| 3| L'utente è reindirizzato alla sua pagina personale|

##### Scenario 1.2 

|  Scenario 1.2  | Credenziali errate                                                                           |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente non è loggato |
| Post condition |  L'utente non è loggato|
|     Step#      |                                Description                                 |
|       1        |                          L'utente accede alla pagina di login                                                   |
|       2        |                                                              L'utente inserisce le sue credenziali              |
| 3| Le credenziali risultano errate |
|4 | L'utente rimane sulla pagina di login e riceve un invito a verificare le credenziali|

### Use case 2, Creazione di un nuovo prodotto 

| Actors Involved  |                        Manager,                                              Admin| 
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il prodotto/i non è/sono presente/i in catalogo |
|  Post condition  | Il prodotto/i è/sono presente/i in catalogo  |
| Nominal Scenario |         Un manager/Admin inserisce un nuovo ordine|
|     Variants     |                      Possibile inserire un singolo prodotto o più prodotti dello stesso modello                      |
|    Exceptions    |                        Informazioni sull'ordine non corrette                        |

##### Scenario 2.1, inserimento positivo di un singolo prodotto

|  Scenario 2.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | Il prodotto non è in catalogo |
| Post condition |  Il prodotto è presente in catalogo   |
|     Step#      |                                Description                                 |
|       1        | Accesso alla sezione personale dell'admin/manager|
|       2        | Inserimento dei paramentri del modello |
|      3       | Conferma inserimento del prodotto                                                                            |                                                                     |
##### Scenario 2.2, inserimento negativo di prodotti 

|  Scenario 2.2|                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | I prodotti non sono in catalogo |
| Post condition |  I prodotti non sono inseriti in catalogo   |
|     Step#      |                                Description                                 |
|       1        | Accesso alla sezione personale dell'admin/manager|
|       2        | Inserimento dei paramentri dell'ordine |
|      3       | Messaggio di avviso per parametri errati|

### Use case 3, Acquisto prodotto/i

| Actors Involved  |              Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   | Il/i prodotto/i sono in catagolo |
|  Post condition  |  I prodotti risultano venduti   |
| Nominal Scenario |         Il customer completa l'acquisto dei prodotti nel carrello         |
|    Exceptions    |                        Il prodotto è nel carrello attivo di un altro customer; Il customer non ha inserito prodotti nel carrello; alcuni prodotti nel carrello sono stati già venduti                        |

##### Scenario 3.1, Acquisto effettuato correttamente

|  Scenario 3.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | I prodotti sono in catalogo |
| Post condition |  I prodotti non sono presenti in catalogo   |
|     Step#      |                                Description                                 |
|       1        | Un customer fa login|
|       2        | Il customer inserisce i prodotti desiderati nel carrello|
|      3       | Il customer fa il checkout del carrello|
|      4       | I prodotti nel carrello sono rimossi dal catagolo|
|      5       | Il carrello è aggiunto allo storico dello user|

##### Scenario 3.2, Rimozione prodotto

|  Scenario 3.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | I prodotti sono in catalogo |
| Post condition |  I prodotti rimangono in catalogo |
|     Step#      |                                Description                                 |
|       1        | Un customer fa login|
|       2        | Il customer inserisce prodotti desiderati nel carrello|
|      3       | Il customer cambia idea su un prodotto|
|      4       | Il prodotto è rimosso dal carrello|

##### Scenario 3.3, Errore inserimento nel carrello, acquisto annullato

|  Scenario 3.3  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | I prodotti sono in catalogo |
| Post condition | Il catalogo rimane invariato |
|     Step#      |                                Description                                 |
|       1        | Un customer fa login|
|       2        | Il customer inserisce i prodotti desiderati nel carrello|
|       3        | Il customer cerca di inserire nel carrello un prodotto presente nel carrelo di un altro customer|
|       4        | L'azione viene rifiutata, il customer rimane sulla pagina dei prodotti|

##### Scenario 3.4, Errore inserimento nel carrello, acquisto confermato

|  Scenario 3.4  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | I prodotti sono in catalogo |
| Post condition | Nel catalogo non sono più presenti i prodotti selezionati |
|     Step#      |                                Description                                 |
|       1        | Un customer fa login|
|       2        | Il customer inserisce i prodotti desiderati nel carrello|
|       3        | Il customer cerca di inserire nel carrello un prodotto presente nel carrelo di un altro customer|
|       4        | il customer ignora l'errore e seleziona un altro prodotto acquistabile|
|5|continua come da step 2 dello scenario 3.1|

### Use case 4, LogOut

| Actors Involved  |              Customer, Manager,                        Admin                                |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |L'utente è loggato|
|  Post condition  |  L'utente non è più loggato|
| Nominal Scenario |         L'utente ha cliccato il bottone di LogOut|
|    Exceptions    | Fallimento logOut                        |


##### Scenario 4.1, Successo Logout

|  Scenario 4.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato|
| Post condition | L'utente non è più loggato|
|     Step#      |                                Description                                 |
|       1        | L'utente accede alla sua pagina personale|
|       2        | L'utente clicca il bottone di logout|
|       3        | L'utente fa logout con successo|

##### Scenario 4.2, Fallimento Logout

|  Scenario 4.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|  Precondition  | L'utente è loggato|
| Post condition | L'utente è ancora loggato|
|     Step#      |                                Description                                 |
|       1        | L'utente accede alla sua pagina personale|
|       2        | L'utente clicca il bottone di logout|
|       3        | L'utente riceve un messaggio di errore e rimane logout|

### Use case 5, Recupero informazioni utente loggato

| Actors Involved  |              Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il Customer è loggato|
|  Post condition  |  Il Customer visualizza le proprie informazioni|
| Nominal Scenario |         Il Customer vuole vedere il proprio profilo|
|    Exceptions    | Il Customer non ha fatto il login                        |

##### Scenario 5.1, Successo recupero informazioni personali

|  Scenario 5.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il Customer è loggato|
|  Post condition  |  Il Customer visualizza le proprie informazioni|
|     Step#      |                                Description                                 |
|       1        | Il Customer accede alla sua pagina personale|
|       2        | Il Customer visualizza le proprie informazioni personali|

##### Scenario 5.2, Fallimento recupero informazioni personali

|  Scenario 5.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il Customer è loggato|
|  Post condition  |  Il Customer non riesce a visualizzare le proprie informazioni|
|     Step#      |                                Description                                 |
|       1        | Il Customer accede alla sua pagina personale|
|       2        | Il Customer visualizza un messaggio di errore|

### Use case 6, Creazione di un nuovo Customer/Manager

| Actors Involved  |              Customer, Manager                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |L'utente non è registrato|
|  Post condition  |  L'utente è registrato|
| Nominal Scenario |         L'utente vuole creare un nuovo profilo|
|    Exceptions    | L'utente è già registrato|

##### Scenario 6.1, Successo creazione nuovo account

|  Scenario 6.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'utente non è registrato|
|  Post condition  |  L'utente è registrato|
|     Step#      |                                Description                                 |
|       1        | L'utente accede alla pagina HOME|
|       2        | L'utente clicca sul bottone 'Non sei ancora iscritto? Crea il tuo account'|
|       3        | L'utente inserisce le proprie credenziale e sceglie il ruolo|
|       4        | L'utente clicca 'Invio'|

##### Scenario 6.2, Username già esistente

|  Scenario 6.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'utente non è registrato|
|  Post condition  |  L'utente non è registrato|
|     Step#      |                                Description                                 |
|       1        | L'utente accede alla pagina HOME|
|       2        | L'utente clicca il bottone ''Non sei ancora iscritto? Crea il tuo account'|
|       3        | L'utente inserisce le proprie credenziale e sceglie il ruolo|
|       4        | L'utente clicca 'Invio'|
|       5        | Errore: "username già esistente", ricomincia da 3|

### Use case 7, Elenco di tutti gli utenti

| Actors Involved  |             Admin                                                       |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin riceve la lista di tutti gli user|
| Nominal Scenario |         L'Admin vuole la lista di tutti gli utenti|
|    Exceptions    | |

##### Scenario 7.1, Successo recupero lista utenti

|  Scenario 7.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin riceve la lista di tutti gli user|
|     Step#      |                                Description                                 |
|       1        |L'Admin richiede la lista utente|
|       2        |L'Admin riceve la lista utenti|

##### Scenario 7.2, Fallimento recupero lista utenti

|  Scenario 7.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin non riceve la lista di tutti gli user|
|     Step#      |                                Description                                 |
|       1        |L'Admin richiede la lista utente|
|       2        |L'Admin non riceve la lista utenti|

### Use case 8, Elenco tutti gli utenti con determinato ruolo

| Actors Involved  |             Admin                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin riceve la lista di tutti gli user con ruolo fornito|
| Nominal Scenario |         L'Admin vuole una lista dei clienti o una lista dei manager|
|    Exceptions    | |

##### Scenario 8.1, Successo recupero lista customers/managers

|  Scenario 8.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin riceve la lista di tutti i customer o managers|
|     Step#      |                                Description                                 |
|       1        |L'Admin seleziona il ruolo a cui è interessato|
|       2        |L'Admin riceve la lista di Customers/Managers|

### Use case 9, Recupera utente con determinato username

| Actors Involved  |             Admin                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin riceve informazioni sull'utente che ha username selezionato|
| Nominal Scenario |         L'Admin vuole i dati di un altro utente|
|    Exceptions    | Username fornito non presente nel database|

##### Scenario 9.1, Successo recupero Utente con username

|  Scenario 9.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin riceve informazioni sull'utente con username fornito|
|     Step#      |                                Description                                 |
|       1        |L'Admin fornisce username|
|       2        |L'Admin riceve informazioni su username dato|

##### Scenario 9.2, Utente con username dato non presente in database

|  Scenario 9.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   ||
|  Post condition  |L'Admin non riceve informazioni su user con username fornito|
|     Step#      |                                Description                                 |
|       1       |L'Admin fornisce username|
|       2        |L'Admin non riceve informazioni su username dato, errore 404|

### Use case 10, Eliminazione Utente con dato username

| Actors Involved  |             Admin                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |L'utente con username fornito rimosso dal database|
| Nominal Scenario |         L'Admin vuole rimuovere un utente|
|    Exceptions    | Username fornito non presente nel database|

##### Scenario 10.1, Successo rimozione Utente con username

|  Scenario 10.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Utente con username fornito eliminato dal database|
|     Step#      |                                Description                                 |
|       1        |L'Admin fornisce username|
|       2        |L'utente con username dato viene rimosso dal database|


##### Scenario 10.2, Utente con username dato non presente in database

|  Scenario 10.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Nessuna modifica al database|
|     Step#      |                                Description                                 |
|       1        |L'admin fornisce username|
|       2        |L'admin riceve errore, username non presente in database|


### Use case 11, Registrazione di prodotti con lo stesso modello

| Actors Involved  |             Manager/Admin                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Prodotti con lo stesso modello registrati in catagolo|
| Nominal Scenario |         Manager/Admin vuole registrare i nuovi prodotti arrivati|
|    Exceptions    | Data della consegna inserita successiva a data attuale|

##### Scenario 11.1, Inserimento corretto dei prodotti in catagolo

|  Scenario 11.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Nuovi prodotti in catalogo|
|     Step#      |                                Description                                 |
|       1       | Manager/Admin fa accesso alla propria pagina personale|
|       2        |Manager/Admin inserisce l'ordine|
|       3        |Nuovi prodotti inseriti |

##### Scenario 11.2, Inserimento errato della data di consegna

|  Scenario 11.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Prodotti non inseriti in catalogo|
|     Step#      |                                Description                                 |
|       1        | Manager/Admin fa accesso alla propria pagina personale|
|       2        |Manager/Admin inserisce l'ordine fornendo una data per la consegna dopo la data corrente|
|       3        |Manager/Admin riceve un errore|

### Use case 12, Manager/Admin segna un prodotto come venduto

| Actors Involved  |             Manager/Admin                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Prodotto segnato come venduto, con 'Selling date' esistente|
| Nominal Scenario |         Manager/Admin aggiorna lo stato di un prodotto|
|    Exceptions    | Codice prodotto non esistente in catagolo, 'Selling date' inserita errata (dopo la data attuale o prima della data di consegna), Prodotto segnato come già venduto|

##### Scenario 12.1, Prodotto segnato come venduto 

|  Scenario 12.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |prodotto segnato come venduto |
|     Step#      |                                Description                                 |
|       1        | Manager/Admin fa accesso alla sezione prodotti|
|       2        |Manager/Admin fornisce codice prodotto e data di vendita|
|       3        |Prodotto con codice fornito risulta venduto e data di vendita viene aggiornata|

##### Scenario 12.2, Codice prodotto inserito errato

|  Scenario 12.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Prodotto non segnato come venduto |
|     Step#      |                                Description                                 |
|       1        | Manager/Admin fa accesso alla sezione prodotti|
|       2        |Manager/Admin fornisce codice prodotto e data di vendita|
|       3        |Codice prodotto inserito non esistente in database, riceve errore|
|       4        |Riparti dal punto 2|

##### Scenario 12.3, Data vendita errata

|  Scenario 12.3  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Prodotto non segnato come venduto |
|     Step#      |                                Description                                 |
|       1        | Manager/Admin fa accesso alla sezione prodotti|
|       2        |Manager/Admin fornisce codice prodotto e data di vendita|
|       3        |Data di vendita precedente alla data di arrivo, errore|
|       4        |Riparti dal punto 2|


### Use case 13, Recupera prodotti presenti nel catalogo 

| Actors Involved  |             Manager/Admin                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Il manager/admin riceve una lista di prodotti |
| Nominal Scenario |         Il manager/admin vuole sapere i prodotti attualmente in catalogo (venduti e non venduti)|
|    Exceptions    | |


##### Scenario 13.1, Lista di prodotti venduti

|  Scenario 13.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Lista di prodotti in catagolo venduti|
|     Step#      |                                Description                                 |
|       1        | Il manager/admin richieda la lista di prodotti già venduti|
|       2       |Il manager/admin riceve la lista di prodotti|

##### Scenario 13.2, Lista di prodotti non venduti

|  Scenario 13.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Lista di prodotti in catagolo non venduti|
|     Step#      |                                Description                                 |
|       1        | Il manager/admin richiede la lista di prodotti non venduti|
|       2        |Il manager/admin riceve la lista di prodotti|

### Use case 14, Recupera tutti i prodotti di una specifica categoria 

| Actors Involved  |             Manager/Admin                                                       |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Il manager/admin riceve la lista di prodotti |
| Nominal Scenario |         Il manager/admin vuole sapere i prodotti di una determinata categoria attualmente in catalogo (venduti e non venduti)|
|    Exceptions    | |

##### Scenario 14.1, Lista di prodotti venduti

|  Scenario 14.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Lista di prodotti venduti di una determinata categoria|
|     Step#      |                                Description                                 |
|       1        |Il manager/admin richiede la lista di prodotti già venduti di una determinata categoria|
|       2        |Il manager/admin riceve la lista di prodotti|

##### Scenario 14.2, Lista di prodotti non venduti

|  Scenario 14.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Lista di prodotti non venduti di una determinata categoria|
|     Step#      |                                Description                                 |
|       1        | Il manager/admin richiede la lista di prodotti non venduti di una determinata categoria|
|       2        |Il manager/admin riceve la lista di oggetti|


### Use case 15, Recupera tutti i prodotti di uno specifico modello 

| Actors Involved  |             manager/admin                                                       |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Il manager/admin riceve la lista di prodotti |
| Nominal Scenario |         Il manager/admin vuole conoscere i prodotti di un determinato modello |
|    Exceptions    | |

##### Scenario 15.1, Lista di prodotti venduti

|  Scenario 15.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Lista di prodotti venduti di  un determinato modello|
|     Step#      |                                Description                                 |
|       1        | Il manager/admin richieda la lista di prodotti venduti di un determinato modello|
|       2        |Il manager/admin riceve la lista di oggetti|

##### Scenario 15.2, Lista di prodotti non venduti

|  Scenario 15.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il manager/admin ha fatto login|
|  Post condition  |Lista di prodotti non venduti di un determinato modello|
|     Step#      |                                Description                                 |
|       1        | Il manager/admin richieda la lista di prodotti non venduti di un determinato modello|
|       2        |Il manager/admin riceve la lista di oggetti|

### Use case 16, Elimina prodotto da catalogo

| Actors Involved  |             Manager,Admin                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il Manager/Admin ha fatto login|
|  Post condition  |Prodotto rimosso da catalogo|
| Nominal Scenario |         Il Manager/Admin vuole eliminare un prodotto |
|    Exceptions    | Codice prodotto inserito non presente nel catalogo|

##### Scenario 16.1, Prodotto rimosso con successo

|  Scenario 16.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Manager/Admin ha fatto login|
|  Post condition  |Prodotto con codice dato non più presente in catalogo|
|     Step#      |                                Description                                 |
|       1        | Manager/Admin ricerca il prodotto da eliminare attraverso l'apposita barra|
|       2        | Manager/Admin richiede la rimozione del prodotto|
| 3 | Manager/Admin conferma |
|       4        | Prodotto rimosso dal catalogo |



### Use case 17, Recupera carrello di Customer attivo

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Lista di oggetti nel carrello del Customer|
| Nominal Scenario |         Customer vuole vedere i prodotti nel carrello|
|    Exceptions    ||

##### Scenario 17.1, Lista di prodotti in carrello

|  Scenario 17.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Lista di prodotti nel carrello|
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'Carello'|


### Use case 18, Aggiungi un prodotto al carrello

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello aggiornato con il nuovo prodotto|
| Nominal Scenario |         Customer vuole aggiungere un prodotto nel carrello|
|    Exceptions    |Codice prodotto non esistente in catalogo, prodotto già presente in un altro carrello, prodotto già venduto|

##### Scenario 18.1, Prodotto inserito con successo

|  Scenario 18.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello aggiornato con il nuovo prodotto|
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'CARRELLO'|
|       2        | Customer inserisce il prodotto nel carrello|
|       3        | Prodotto inserito correttamente |

##### Scenario 18.2, Codice Prodotto inserito non in catalogo

|  Scenario 18.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Lista di oggetti in carrello non aggiornato con Prodotto|
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'CARRELLO'|
|       2        | Customer inserisce codice prodotto|
|       3        | Customer riceve un errore|
|       4        | Customer riparte da punto 2|

### Use case 19, Checkout carrello

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello confermato|
| Nominal Scenario |         Customer vuole fare il checkout del carrello|
|    Exceptions    |Il carrello è vuoto o il customer non ha un carrello attivo|

##### Scenario 19.1, Checkout avvenuto con successo

|  Scenario 19.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello confermato |
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'CARRELLO'|
|       2        | Customer preme il pulsante 'CHECKOUT'|
|       3        | Customer seleziona tipo pagamento e luogo di spedizione|
|       4        | Customer procede alla conferma dell'ordine|

##### Scenario 19.2, Carrello vuoto al checkout

|  Scenario 19.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello non confermato |
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'CARRELLO'|
|       2        | Customer preme il pulsante 'CHECKOUT'|
|       3        | Customer riceve un errore perchè il carrello è vuoto|
|       4        | Riparti da 2|

### Use case 20, Recupero storico carrelli

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Lista di carrelli confermati|
| Nominal Scenario |         Il customer vuole vedere la lista di carrelli confermati|
|    Exceptions    ||

##### Scenario 20.1, Storico ordini

|  Scenario 20.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Lista di carrelli confermati|
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso al profilo|
|       2        | Visualizza lo storico dei carrelli|


### Use case 21, Rimozione prodotto da carrello

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Prodotto rimosso dal carello |
| Nominal Scenario |         Il customer non desidera più comprare quel prodotto|
|    Exceptions    |Codice prodotto non nel carrello, carrello non attivo, codice prodotto non presente nel catalogo|

##### Scenario 21.1, Successo rimozione prodotto 

|  Scenario 21.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Prodotto rimosso dal carello |
|     Step#      |                                Description                                 |
|       1        | Il customer fa accesso alla sezione 'CARRELLO'|
|       2        | Il customer clicca sul bottone per rimuovere il prodotto|
|       3        | Prodotto rimosso da carrello |

##### Scenario 21.2, Prodotto da rimuovere non presente nel carrello

|  Scenario 21.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Prodotto non rimosso da carello |
|     Step#      |                                Description                                 |
|       1        | Il customer fa accesso alla sezione 'CARRELLO'|
|       2        | Il customer clicca sul bottone per rimuovere il prodotto|
|       3        | Prodotto non presente nel carrello, il customer riceve un errore|
|       4        | Riparti da 2|

##### Scenario 21.3, Carrello non attivo

|  Scenario 21.3  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Prodotto non rimosso da carello |
|     Step#      |                                Description                                 |
|       1        | Il customer fa accesso alla sezione 'CARRELLO'|
|       2        | Il customer clicca sul bottone per rimuovere il prodotto|
|       3        | Il carrello del customer non è attivo, riceve un errore|
|       4        | Riparti da 2|

##### Scenario 21.4, Prodotto da rimuovere non presente nel catalogo

|  Scenario 21.4  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Prodotto non rimosso da carello |
|     Step#      |                                Description                                 |
|       1        | Il customer fa accesso alla sezione 'CARRELLO'|
|       2        | Il customer clicca sul bottone per rimuovere il prodotto|
|       3        | Prodotto non presente in catalogo, il customer riceve un errore|
|       4        | Riparti da 2|

### Use case 22, Svuota carrello

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello vuoto |
| Nominal Scenario |         Il customer vuole svuotare il carrello |
|    Exceptions    |Il customer non ha un carrello attivo |

##### Scenario 22.1, Successo rimozione di tutti i Prodotti in carrello

|  Scenario 22.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha fatto login|
|  Post condition  |Carrello vuoto |
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'CARRELLO'|
|       2        | Customer preme pulsante 'SVUOTA CARRELLO'|
|       3        | Tutti i prodotti nel carrello vengono rimossi|

##### Scenario 22.2, Customer non ha un carrello attivo

|  Scenario 22.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il customer ha fatto login|
|  Post condition  |Carrello vuoto |
|     Step#      |                                Description                                 |
|       1        | Customer fa accesso alla sezione 'CARRELLO'|
|       2        | Customer preme pulsante 'SVUOTA CARRELLO'|
|       3        | Customer riceve un errore perchè il carrello non è attivo|
|       4        | Riparti dal punto 2|

### Use case 23, Pagamento online

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer ha selezionato pagamento online durante il checkout|
|  Post condition  |Pagamento effettuato |
| Nominal Scenario |         Il customer vuole completare l'acquisto |
|    Exceptions    |Il pagamento non va a buon fine |

##### Scenario 23.1, Successo pagamento

|  Scenario 23.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha selezionato pagamento online durante il checkout|
|  Post condition  |Pagamento effettuato  |
|     Step#      |                                Description                                 |
|       1        | Customer viene automaticamente indirizzato alla pagina pagamento|
|       2        | Compila i campi necessari per il pagamento e clicca conferma|
|       3        | Il pagamento viene accettato e viene mostrata una pagina di riepilogo|

##### Scenario 23.2, Il pagamento non va a buon fine

|  Scenario 23.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Customer ha selezionato pagamento online durante il checkout|
|  Post condition  |Pagamento non effettuato  |
|     Step#      |                                Description                                 |
|       1        | Customer viene automaticamente indirizzato alla pagina pagamento|
|       2        | Compila i campi necessari per il pagamento e clicca conferma|
|       3        | Il pagamento non viene accettato e ricomincia dal punto|

### Use case 24, Richiesta recupero password

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Customer non è loggato|
|  Post condition  |Il customer ha ricevuto l'email di recupero password |
| Nominal Scenario |         Il customer non ricorda la password e richiede il reset |
|    Exceptions    |L'email non corrisponde a nessun account |

##### Scenario 24.1, Successo richiesta recupero password

|  Scenario 24.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
   Precondition   |Customer non è loggato|
|  Post condition  |Il customer ha ricevuto l'email di recupero password |
|     Step#      |                                Description                                 |
|       1        | Il customer clicca su 'LOGIN'|
|       2        | Clicca su 'Recupera Password'|
|       3        | Inserisce l'email associata al suo account|
|       4        | Viene mostrato il messaggio "Se un account esiste, riceverai a breve un'email per il recupero'|

##### Scenario 24.2, Email non nel database

|  Scenario 24.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
   Precondition   |Customer non è loggato|
|  Post condition  |Il customer non ha ricevuto l'email di recupero password |
|     Step#      |                                Description                                 |
|       1        | Il customer clicca su 'LOGIN'|
|       2        | Clicca su 'Recupera Password'|
|       3        | Inserisce l'email associata al suo account|
|       4        | Viene mostrato il messaggio "Se un account esiste, riceverai a breve un'email per il recupero'|

### Use case 25, Modifica della password

| Actors Involved  |             Customer                                                        |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il customer non è loggato; ha richiesto il recupero password|
|  Post condition  |Il customer inserisce la nuova password |
| Nominal Scenario |         Il customer ha dimenticato la propria password e ne inserisce una nuova |
|    Exceptions    | La password inserita non è abbastanza forte (troppo corta, niente maiuscole, ecc...)|

##### Scenario 25.1, Successo modifica password

|  Scenario 25.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il customer non è loggato; ha richiesto il recupero password|
|  Post condition  |Il customer inserisce la nuova password |
|     Step#      |                                Description                                 |
|       1        | Il customer viene portato alla pagina di recupero password (link ricevuto tramite email)|
|       2        | Inserisce la nuova password|
|       3        | Clicca su 'Conferma'|
|       4        | Viene mostrato il messaggio 'Password modificata con successo'|

##### Scenario 25.2, Errore modifica password

|  Scenario 25.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il customer non è loggato; ha richiesto il recupero password|
|  Post condition  |Il customer inserisce una nuova password troppo debole |
|     Step#      |                                Description                                 |
|       1        | Il customer viene portato alla pagina di recupero password (link ricevuto tramite email)|
|       2        | Inserisce la nuova password|
|       3        | Clicca su 'Conferma'|
|       4        | Viene mostrato il messaggio 'Password non accettata. Deve essere lunga almeno x caratteri, contenere almeno una maiuscola, [...]'|

### Use case 26, Recupera prodotti non venduti presenti nel catalogo 

| Actors Involved  |             Customer                                                     |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il Customer ha fatto login|
|  Post condition  |Il Customer riceve una lista di prodotti non venduti|
| Nominal Scenario |         Il Customer vuole sapere i prodotti non venduti in catalogo|
|    Exceptions    | |


##### Scenario 26.1, Lista di prodotti venduti

|  Scenario 26.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il Customer ha fatto login|
|  Post condition  |Lista di prodotti in catagolo non venduti|
|     Step#      |                                Description                                 |
|       1        | Il Customer richieda la lista di prodotti non venduti|
|       2       |Il Customer riceve la lista di prodotti|

### Use case 27, Recupera tutti i prodotti non venduti di una specifica categoria 

| Actors Involved  |             Customer                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il Customer ha fatto login|
|  Post condition  |Il Customer riceve la lista di prodotti |
| Nominal Scenario |         Il Customer vuole sapere i prodotti di una determinata categoria non venduti in catalogo 
|    Exceptions    | |

##### Scenario 27.1, Lista di prodotti non venduti

|  Scenario 27.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il Customer ha fatto login|
|  Post condition  |Lista di prodotti non venduti di una determinata categoria|
|     Step#      |                                Description                                 |
|       1        |Il Customer richiede la lista di prodotti non venduti di una determinata categoria|
|       2        |Il Customer riceve la lista di prodotti|



### Use case 28, Recupera tutti i prodotti di uno specifico modello 

| Actors Involved  |             Customer                                                       |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il Customer ha fatto login|
|  Post condition  |Il Customer riceve la lista di prodotti |
| Nominal Scenario |         Il Customer vuole conoscere i prodotti non venduti di un determinato modello |
|    Exceptions    | |

##### Scenario 28.1, Lista di prodotti venduti

|  Scenario 28.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il Customer ha fatto login|
|  Post condition  |Lista di prodotti non venduti di  un determinato modello|
|     Step#      |                                Description                                 |
|       1        | Il Customer richiede la lista di prodotti non venduti di un determinato modello|
|       2        |Il Customer riceve la lista di prodotti|

### Use case 29, Crea un nuovo admin alla prima installazione

| Actors Involved  |             Admin                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Avviata prima installazione|
|  Post condition  |L'account admin è stato creato |
| Nominal Scenario |         Viene avviata la web app per la prima volta e viene creato un admin per la gestione dei manager |
|    Exceptions    | |

##### Scenario 29.1, Successo creazione Admin 

|  Scenario 29.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Avviata prima installazione|
|  Post condition  |L'account admin è stato creato |
|     Step#      |                                Description                                 |
|       1        | Viene avviata la prima installazione e si apre la pagina "CREA ADMIN"|
|       2        |Vengono inseriti i campi (username, name, surname, email, password) e viene cliccato "CONFERMA"|

### Use case 30, Visualizzazione della pagina per confermare i manager

| Actors Involved  |             Admin                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Viene visualizzata la pagina con i manager da confermare/eliminare |
| Nominal Scenario |         L'admin vuole verificare se ci sono nuovi account manager da confermare |
|    Exceptions    | |

##### Scenario 30.1, Visualizzazione pagina di manager da confermare

|  Scenario 30.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Viene visualizzata la pagina con i manager da confermare/eliminare |
|     Step#      |                                Description                                 |
|       1        | L'admin accede alla sua pagina personale|
|       2        |Viene restituita la lista contenente i manager da confermare/eliminare|  

### Use case 31, Conferma di un account manager

| Actors Involved  |             Admin                                                      |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Il nuovo account manager viene confermato |
| Nominal Scenario |         L'admin vuole confermare il manager |
|    Exceptions    | Un utente ha sbagliato e ha creato un account manager. L'admin lo elimina.|

##### Scenario 31.1, Successo conferma manager

|  Scenario 31.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Il nuovo account manager viene confermato |
|     Step#      |                                Description                                 |
|       1        | L'admin clicca sul bottone di conferma |
|       2        |Viene restituito il messaggio "Conferma effettuata"| 

##### Scenario 31.2, Eliminazione account manager 

|  Scenario 31.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |Il nuovo account manager viene confermato |
|     Step#      |                                Description                                 |
|       1        | L'admin clicca sul bottone per annullare la richiesta|
|       2        |Viene restituito il messaggio "Conferma effettuata"| 

### Use case 32, Il customer vuole eliminare il proprio account

| Actors Involved  |             Customer                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |Il customer ha fatto login|
|  Post condition  |L'utente viene eliminato |
| Nominal Scenario |         Il customer vuole eliminare il proprio account |
|    Exceptions    | |

##### Scenario 32.1, Successo eliminazione account

|  Scenario 32.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |Il customer ha fatto login|
|  Post condition  |L'utente viene eliminato |
|     Step#      |                                Description                                 |
|       1        | Il customer va nella propria pagina profilo|
|       2        |Clicca su "Cancella account"|
| 3 | Viene mostrato un messaggio "Account eliminato" | 

##### Scenario 32.2, Fallimento eliminazione account

|  Scenario 32.2  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin ha fatto login|
|  Post condition  |L'utente viene eliminato |
|     Step#      |                                Description                                 |
|       1        | L'admin inserisce lo username|
|       2        |Clicca conferma|
| 3 | Viene mostrato un messaggio "Impossibile eliminare l'account. Non esiste alcun utente con lo username inserito" | 
| 4 | Ricomincia da 1|

### Use case 33, L'admin/manager vuole vedere un riepilogo di statistiche di vendita

| Actors Involved  |             Admin, Manager                                                    |
| :--------------: | :------------------------------------------------------------------: |
|   Precondition   |L'admin/manager ha fatto login|
|  Post condition  |Vengono visualizzate le statistiche |
| Nominal Scenario |         L'admin/manager vuole migliorare le vendita e controlla le statistiche di vendita |
|    Exceptions    | |

##### Scenario 33.1, Successo visualizzazione statistiche

|  Scenario 33.1  |                                                                            |
| :------------: | :------------------------------------------------------------------------: |
|   Precondition   |L'admin/manager ha fatto login|
|  Post condition  |Vengono visualizzate le statistiche |
|     Step#      |                                Description                                 |
|       1        | L'admin/manager va sul proprio profilo|
|       2        |Clicca su "Informazioni statistiche"|
| 3 | Viene mostrata la pagina con le statistiche | 



# Glossary

- Admin
    - gestisce gli account degli utenti registrati sul portale
    - si occupa della verifica dell'account, nel caso in cui venga selezionato come ruolo manager
    - visiona le statistiche del proprio negozio 
    
- Utente
  - caratterizzato da uno username
  - colui che beneficia dei servizi dell'applicazione
  - non rappresenta una persona reale, ma un fruitore del servizio
  - può avere un ruolo di Custumer o di Manager

  - Manager
    - ha il potere di inserire nuovi prodotti;
    - può verificare la presenza e le caratteristiche di tutti i prodotti
    - visiona le statistiche del negozio
  
  - Customer
    - può vedere i prodotti disponibili
    - può aggiungere prodotti al suo carrello
    - può accedere allo storico dei suoi acquisti

- Acquisto
  - Un acquisto è lo scambio di uno o più prodotti tra un gestore e un cliente, mediato dall'applicazione
  - per effettuare un acquisto, i prodotti vanno aggiunti ad un carrello
  - la transazione si conclude con il pagamento online o in negozio (a discrezione del customer) e con la consegna (nel caso in cui l'utente avesse selezionato l'opzione della spedizione) o con il ritiro in negozio della merce ordinata 

- Prodotto
  - un prodotto è una qualsiasi merce scambiata attraverso l'applicazione
  - un prodotto ha un prezzo, che rappresenta il suo valore
  - un prodotto è definito da un codice univoco
  - i prodotti sono espressioni di uno specifico modello
  - ogni prodotto appartiene ad una categoria (***"Smartphone", "Laptop", "Appliance"***)

- Carrello
  - ogni cliente possiede un proprio carrello nel momento in cui ha prodotti inseriti
  - il carrello memorizza le informazioni dei prodotti richiesti da un cliente: il suo contenuto può essere modificato dal cliente 
  - in ogni momento un cliente può richiedere la conferma del carrello
  - per ogni clente è memorizzata una lista di carrelli passati, ovvero per i quali  ha effetuato il check-out

- Corriere 
  - si occupa della spedizione della merce all'utente, grazie ai dati forniti dal customer durante l'acquisto

- Servizio di pagamento
  - gestisce la transazione online tra il negozio ed il customer per l'acquisto della merce.

![UML diagram](./class_diagram_v2.png)

# System Design

![system_v2](system_v2.png)

# Deployment Diagram

![deployment_diagram_v2](deployment_diagram_v2.png)