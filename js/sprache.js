/* Behördensimulator: englischer Umschalter.
   Übersetzt die Spieloberfläche, das Erzählte und die Gespräche zur Laufzeit.
   Amtliches Papier (Schreiben, Vordrucke, Ausweis, Bescheid) bleibt deutsch, § 23 VwVfG:
   alles unter [data-amtlich]; [data-ui] darin wird wieder übersetzt. */
(function () {
  'use strict';

  var D = {
    /* Rahmen, Spielleiste, Browser */
    'Behördensimulator – Musterstadt Spiel 1': 'Behördensimulator – Musterstadt Game 1',
    'Zuhause, Ahornweg 7': 'Home, Ahornweg 7',
    'Schreiben lesen': 'Read the letter',
    'Meine Unterlagen': 'My documents',
    'Warten …': 'Wait …',
    'Zum Rathaus (15 Min.)': 'To the town hall (15 min)',
    'Nach Hause (15 Min.)': 'Go home (15 min)',
    'Minimieren': 'Minimise', 'Maximieren': 'Maximise', 'Wiederherstellen': 'Restore', 'Schließen': 'Close', 'Menü': 'Menu',
    'Datei': 'File', 'Neues Fenster': 'New window', 'Drucken …': 'Print …', 'Bearbeiten': 'Edit', 'Ausschneiden': 'Cut',
    'Kopieren': 'Copy', 'Einfügen': 'Paste', 'Ansicht': 'View', 'Neu laden': 'Reload', 'Stopp': 'Stop', 'Favoriten': 'Favourites',
    'Extras': 'Tools', 'Internetoptionen …': 'Internet options …', 'Internetoptionen': 'Internet options', 'Über SurfStar Gold': 'About SurfStar Gold',
    '◀ Zurück': '◀ Back', 'Vor ▶': 'Forward ▶', 'Startseite': 'Home', 'Drucken': 'Print', 'Adresse': 'Address', 'Los': 'Go',
    'Angezeigte Internetseite': 'Displayed web page', 'Fertig': 'Done', 'Seite wird geladen …': 'Loading page …',
    'Druckauftrag abgeschlossen': 'Print job complete',
    'Verschlüsselung: 128 Bit': 'Encryption: 128-bit', 'Lizenziert für: Privat': 'Licensed to: Private',
    'Diese Einstellungen wurden von Ihrem Systemadministrator gesperrt.': 'These settings have been locked by your system administrator.',

    /* Start */
    'Spiel 1: Antrag auf Ausstellung eines Negativattestes': 'Game 1: Application for the issue of a Negativattest',
    'Satire. Alle Personen, Orte und Behörden sind erfunden. Ihre Angaben bleiben auf Ihrem Gerät; im Aktenzeichen steht nur eine Prüfsumme. Fantasiedaten sind ausdrücklich zulässig.':
      'Satire. All persons, places and authorities are fictitious. Your details stay on your device; the file number only contains a checksum. Made-up details are expressly permitted.',
    'Familienname': 'Surname', 'Vorname(n)': 'First name(s)', 'Geburtsdatum': 'Date of birth', 'TT.MM.JJJJ': 'DD.MM.YYYY',
    'Geburtsort': 'Place of birth', 'Anrede': 'Form of address', 'Herr': 'Mr', 'Frau': 'Ms', 'ohne Anrede': 'none',
    'Passbild': 'Passport photo', 'Hautton': 'Skin tone', 'Frisur': 'Hairstyle', 'kurz': 'short', 'Seitenscheitel': 'side parting',
    'lang, offen': 'long, loose', 'Pferdeschwanz': 'ponytail', 'Locken': 'curls', 'Dauerwelle': 'perm', 'Glatze': 'bald', 'Halbglatze': 'balding',
    'Haarfarbe': 'Hair colour', 'braun': 'brown', 'schwarz': 'black', 'blond': 'blond', 'rot': 'red', 'grau': 'grey', 'weiß': 'white',
    'Brille': 'Glasses', 'Bart': 'Beard', 'Zufall': 'Random', 'Barrierearmer Modus': 'Low-barrier mode',
    'Vorgang eröffnen': 'Open a case', 'Ruhendes Verfahren wieder aufnehmen': 'Resume dormant proceedings',
    'Akte einreichen …': 'Submit file …', 'Neuen Vorgang eröffnen': 'Open a new case', 'Antrag stellen': 'Submit application',
    'Bitte weisen Sie sich aus.': 'Please identify yourself.',
    'Das ruhende Verfahren kann nach Prüfung Ihrer Angaben fortgesetzt werden.': 'The dormant proceedings can be continued once your details have been checked.',
    'Ausweisen': 'Identify',
    'Bitte geben Sie das Geburtsdatum im Format TT.MM.JJJJ an.': 'Please give the date of birth in the format DD.MM.YYYY.',
    'Das Geburtsdatum liegt in der Zukunft.': 'The date of birth lies in the future.',
    'Die antragstellende Person muss handlungsfähig sein (§ 12 VwVfG).': 'The applicant must have capacity to act (§ 12 VwVfG).',
    'Bitte überprüfen Sie das Geburtsdatum.': 'Please check the date of birth.',
    'Das angegebene Aktenzeichen ist nicht vergeben.': 'The file number given has not been assigned.',
    'Das angegebene Aktenzeichen ist einem anderen Vorgang zugeordnet.': 'The file number given is assigned to a different case.',
    'Das Verfahren wurde nach altem Recht begonnen und wird nach altem Recht fortgeführt.': 'The proceedings were begun under the old rules and will be continued under the old rules.',
    'Bei der eingereichten Datei handelt es sich nicht um einen Aktenauszug.': 'The file submitted is not a file extract.',
    'Die eingereichte Akte überschreitet den zulässigen Umfang.': 'The file submitted exceeds the permitted size.',
    'Weiter': 'Continue',
    'Dieses Verfahren ist am Rechner durchzuführen.': 'This procedure is to be carried out at a computer.',

    /* Unterlagen */
    'Ablagefach': 'Filing tray', 'Notizzettel': 'Notepad', 'Laufzettel': 'Routing slip',
    'Gilt nur bis zum Neuladen, es sei denn, die Akte wird heruntergeladen.': 'Only lasts until the page is reloaded, unless the file is downloaded.',
    'Anliegen: Negativattest': 'Matter: Negativattest', 'Aktenzeichen': 'File number', 'Aktenzeichen kopieren': 'Copy file number',
    'Akte herunterladen (.txt)': 'Download file (.txt)',
    'Das Aktenzeichen steht auch in der Adresszeile. Ein Lesezeichen genügt, um das Verfahren später fortzusetzen.':
      'The file number is also in the address bar. A bookmark is enough to continue the proceedings later.',
    'Das Ablagefach ist leer.': 'The filing tray is empty.',
    'Das Aktenzeichen wurde in die Zwischenablage übernommen.': 'The file number has been copied to the clipboard.',
    'Personalausweis': 'Personalausweis (ID card)', 'Schreiben Ordnungsamt': 'Letter from the Ordnungsamt',
    'Ausfüllhinweise B-H': 'Ausfüllhinweise B-H (completion notes)', 'gedruckt': 'printed', 'Haushaltsplan 2009': 'Haushaltsplan 2009 (budget)',
    'Seite 214, gedruckt': 'page 214, printed', 'Terminbestätigung (KTS)': 'Appointment confirmation (KTS)', 'Weitere Ausdrucke': 'Other printouts',
    'Meldebescheinigung': 'Meldebescheinigung (registration certificate)', 'Quittung der Stadtkasse': 'Receipt from the Stadtkasse',
    'Durchschrift Vordruck B-1': 'Carbon copy of Vordruck B-1', 'vorläufiges Ordnungsmerkmal': 'provisional Ordnungsmerkmal',
    'gestempelt': 'stamped', 'ausgefüllt': 'filled in', 'Quittung': 'Receipt', 'Durchschrift B-1': 'Carbon copy B-1', 'Terminbestätigung': 'Appointment confirmation',
    'Ausdruck': 'Printout', 'Zurück': 'Back', 'Küchentisch': 'Kitchen table', 'Zurück an den Rechner': 'Back to the computer',
    'Ausfüllhinweise (Vordruck B-H)': 'Ausfüllhinweise (Vordruck B-H)',

    /* Tagesende, Warten, Drucken */
    'Aktenzeichen, Stand Tagesende': 'File number, as of close of day', 'Nächster Öffnungstag': 'Next opening day',
    'Feierabend.': 'Home time.', 'Warten': 'Wait', 'Bis wann?': 'Until when?', 'bis zum nächsten Öffnungstag': 'until the next opening day',
    'Abbrechen': 'Cancel', 'Drucker': 'Printer', 'Tintenstrahldrucker TS 640 (USB)': 'Inkjet printer TS 640 (USB)', 'Dokument': 'Document',
    'Seitenbereich': 'Page range', 'Alle': 'All', 'Seiten': 'Pages', 'Seiten, zum Beispiel 1-3 oder 5': 'Pages, for example 1-3 or 5',
    'Druckdauer': 'Printing time', 'Patrone': 'Cartridge', 'leer': 'empty', 'Seiten werden gezählt …': 'Counting pages …',
    'Die Druckerpatrone ist leer.': 'The printer cartridge is empty.',
    'Bitte geben Sie einen gültigen Seitenbereich an.': 'Please enter a valid page range.',

    /* Formulare */
    'Formular': 'Form', 'Formular einstecken': 'Put the form away', 'Womit schreiben Sie?': 'What do you write with?',
    'Kugelschreiber an der Kette (blau)': 'Pen on the chain (blue)', 'eigener Kugelschreiber (schwarz)': 'your own pen (black)',
    'Was einmal eingetragen ist, lässt sich nicht mehr ändern.': 'Once written, it can’t be changed.',
    'Sie schreiben mit dem Kugelschreiber der Kasse (blau).': 'You are writing with the Kasse’s pen (blue).',
    'Sie schreiben mit Ihrem eigenen Kugelschreiber (schwarz).': 'You are writing with your own pen (black).',
    'Womit schreiben Sie? Bitte wählen Sie zuerst einen Kugelschreiber.': 'What do you write with? Please choose a pen first.',
    'Unterschreiben': 'Sign', 'Daneben liegt: Meldebescheinigung': 'Next to it: Meldebescheinigung',

    /* Rathaus: Orte */
    'Neues Rathaus, Foyer': 'New Town Hall, foyer', 'Foyer, Info-Theke': 'Foyer, info desk', 'Kassenhalle, Raum 115': 'Cash hall, room 115',
    'Bürgeramt, Schalter 4': 'Bürgeramt, counter 4', 'Erdgeschoss, Loge': 'Ground floor, lodge', 'Ordnungsamt, Raum 121': 'Ordnungsamt, room 121',
    'unterwegs': 'on the way', 'Info-Theke': 'Info desk', 'Loge des Hausmeisters': 'Caretaker’s lodge', 'Vor dem Neuen Rathaus': 'Outside the New Town Hall',
    'Was tun Sie?': 'What do you do?', 'Ansagen': 'Announcements',
    'Wartemarke mit Termin': 'Ticket with appointment', 'Bitte geben Sie Ihre Buchungsnummer ein.': 'Please enter your booking number.',
    'Buchungsnummer': 'Booking number', 'Die Buchungsnummer ist nicht gültig.': 'The booking number is not valid.',

    /* Rathaus: Beschreibungen */
    'Der Haupteingang des Neuen Rathauses, die Türen sind verschlossen.': 'The main entrance of the New Town Hall; the doors are locked.',
    'Foyer: Betonwände, rechts die Aufrufanzeige über dem Wartemarkenautomaten mit den Tasten „Bürgeramt“ und „Termin“, links die unbesetzte Info-Theke, hinten die Türen zum Bürgeramt und zur Kassenhalle.':
      'Foyer: concrete walls. On the right, the call display above the ticket machine with the buttons “Bürgeramt” and “Termin”; on the left, the unstaffed info desk; at the back, the doors to the Bürgeramt and the cash hall.',
    'Info-Theke: Schild „Zurzeit nicht besetzt“, ein Ständer mit Vordrucken 17/b, ein blauer Kugelschreiber an einer Kette.':
      'Info desk: a sign saying “Zurzeit nicht besetzt”, a rack of Vordrucke 17/b, a blue ballpoint pen on a chain.',
    'Kassenschalter hinter Glas, dahinter Frau Esser.': 'Cash desk behind glass, Ms Esser behind it.',
    'Schalter 4. Dahinter Frau Schuster.': 'Counter 4. Ms Schuster behind it.',
    'Glasloge mit Radio und Kaffeebecher, dahinter Willi Pütz im grauen Kittel.': 'Glass lodge with a radio and a coffee mug. Behind it, Willi Pütz in a grey overall.',
    'Ein Büro mit Aktenregalen. Am Schreibtisch Herr Schwamborn, vor ihm ein Stapel Vorgänge.': 'An office with filing shelves. At the desk sits Mr Schwamborn, a pile of cases in front of him.',

    /* Rathaus: Handlungen */
    'Nach Hause gehen': 'Go home', 'Wartemarke ziehen: Taste „Bürgeramt“': 'Take a ticket: button “Bürgeramt”',
    'Wartemarke ziehen: Taste „Termin“': 'Take a ticket: button “Termin”', 'Zur Info-Theke': 'To the info desk',
    'Zur Kassenhalle, Raum 115': 'To the cash hall, room 115', 'Zur Loge des Hausmeisters': 'To the caretaker’s lodge',
    'Zum Ordnungsamt, Raum 121': 'To the Ordnungsamt, room 121', 'Hände desinfizieren': 'Disinfect your hands',
    'Formular B aus dem Ständer nehmen': 'Take Formular B from the rack', 'Formular B ausfüllen': 'Fill in Formular B',
    'Vordruck B-1 ausfüllen': 'Fill in Vordruck B-1', 'Vordruck 17/a ausfüllen': 'Fill in Vordruck 17/a', 'Zurück ins Foyer': 'Back to the foyer',
    'Einzahlungsschein nehmen': 'Take an Einzahlungsschein', 'Einzahlungsschein ausfüllen': 'Fill in the Einzahlungsschein',
    'Anstellen und einzahlen': 'Queue and pay', '„Welche Haushaltsstelle ist das denn?“': '“Which Haushaltsstelle is it, then?”',
    '„Ich habe ein Kassenzeichen.“': '“I have a Kassenzeichen.”', '„Was für ein Strich-Eins?“': '“What Strich-Eins?”',
    '„Haben Sie einen Kugelschreiber für mich?“': '“Have you got a pen for me?”', '„Wann ist die Kasse auf?“': '“When is the Kasse open?”',
    'Negativattest abgeben': 'Hand in the Negativattest',
    'Meldebescheinigung beantragen': 'Apply for a Meldebescheinigung', 'Vordruck B-1 abgeben': 'Hand in Vordruck B-1',
    'Formular B abgeben (Negativattest)': 'Hand in Formular B (Negativattest)', 'Vordruck 17/a abgeben (Negativattest)': 'Hand in Vordruck 17/a (Negativattest)',
    '„Wie war noch mal mein Ordnungsmerkmal?“': '“What was my Ordnungsmerkmal again?”',
    '„Bekomme ich davon eine Durchschrift?“': '“Could I have a carbon copy of that?”',
    '„Was ist eine Vorgangsnummer?“': '“What is a Vorgangsnummer?”', '„Wo bezahle ich die Gebühr?“': '“Where do I pay the fee?”',
    '„Was soll ich bei ‚Nicht ausfüllen‘ eintragen?“': '“What do I write under ‘Nicht ausfüllen’?”', 'Schalter verlassen': 'Leave the counter',

    /* Rathaus: Erzähltes */
    'Die Türen werden aufgeschlossen.': 'The doors are unlocked.', 'Die Türen sind verschlossen.': 'The doors are locked.',
    'Sie stehen im Foyer.': 'You are standing in the foyer.', 'Das Rathaus schließt. Sie verlassen das Gebäude.': 'The town hall is closing. You leave the building.',
    'Es riecht nach Krankenhaus.': 'It smells like a hospital.', 'Sie nehmen einen Vordruck 17/b aus dem Ständer.': 'You take a Vordruck 17/b from the rack.',
    'Der Kassenschalter ist geschlossen.': 'The cash desk is closed.', 'Sie nehmen einen Einzahlungsschein.': 'You take an Einzahlungsschein.',
    'Herr Schwamborn nimmt das Negativattest, sieht kurz darauf und legt es auf einen Stapel.': 'Mr Schwamborn takes the Negativattest, glances at it and puts it on a pile.',
    '„Danke. Sie hören von uns.“': '“Thank you. You will hear from us.”',
    'Der Automat gibt keine Wartemarken aus.': 'The machine is not issuing tickets.',
    'Das Bürgeramt schließt.': 'The Bürgeramt is closing.', 'Ihre Nummer wurde nicht mehr aufgerufen.': 'Your number was never called.',
    'Frau Schuster schiebt die Brille hoch.': 'Ms Schuster pushes her glasses up.', 'Die Brille ist etwas gerutscht.': 'Her glasses have slipped a little.',
    'Die Brille sitzt halb unten.': 'Her glasses are halfway down her nose.', 'Frau Schuster sieht Sie über den Brillenrand an.': 'Ms Schuster looks at you over the rim of her glasses.',
    'Frau Schuster reißt die Durchschrift ab und schiebt sie über den Tresen.': 'Ms Schuster tears off the carbon copy and slides it across the counter.',
    'Frau Schuster nimmt die Brille ab.': 'Ms Schuster takes off her glasses.',
    '„Kommen Sie bitte an einem anderen Tag wieder. Dann mit allen Unterlagen.“': '“Please come back another day. With all your documents.”',
    'Sie sieht auf die Uhr. „Mahlzeit.“ Der Schalter ist geschlossen.': 'She looks at the clock. “Mahlzeit.” The counter is closed.',
    'Frau Schuster druckt. „Das macht fünf Euro.“ Sie zahlen bar.': 'Ms Schuster prints. “That’ll be five euros.” You pay cash.',
    'Frau Schuster trägt etwas in Feld 7 ein und legt den Vordruck ab.': 'Ms Schuster writes something in field 7 and files the form away.',
    'Frau Schuster prüft. Sie stempelt. Sie unterschreibt.': 'Ms Schuster checks. She stamps. She signs.',
    '„Das Negativattest gilt nur in Verbindung mit einer beglaubigten Abschrift.“': '“The Negativattest is only valid together with a certified copy.”',
    'Frau Esser zieht die Jalousie herunter.': 'Ms Esser pulls down the blind.',

    /* Rathaus: Gesprochenes (ohne Sprecher) */
    'Ja, bitte?': 'Yes?',
    'Vorgangsnummer … Dat jibbet doch nur mit dem Strich-Eins.': 'Vorgangsnummer … you only get dat with the Strich-Eins.',
    'Darüber darf ich keine Auskunft geben.': 'I am not permitted to give information on that.',
    'Das Kassenzeichen steht auf Ihrem Bescheid. Liegt Ihnen noch kein Bescheid vor, zahlen Sie bitte mit Einzahlungsschein unter Angabe der Haushaltsstelle.':
      'The Kassenzeichen is on your Bescheid. If you have not yet received a Bescheid, please pay with an Einzahlungsschein stating the Haushaltsstelle.',
    'Na, dat Formular mit dem Strich-Eins. Dat liegt bei den anderen Formularen. Hinter dem B.': 'Well, dat form with the Strich-Eins. It’s with the other forms. Behind the B.',
    'Hm?': 'Hm?',
    'An der Theke hängt einer. Blau. Der muss da hängen bleiben.': 'There’s one hanging at the desk. Blue. It stays hanging there.',
    'Montags und donnerstags. Steht aber auch im Internet.': 'Mondays and Thursdays. It’s on the Internet, too.',
    'Die Vorgangsnummer wird nach Eingang des Antrags vergeben.': 'The Vorgangsnummer is assigned once the application has been received.',
    'Gebühren für einzelne Leistungen sind an der Stadtkasse zu entrichten.': 'Fees for individual services are payable at the Stadtkasse.',
    'Da steht doch: nicht ausfüllen.': 'It says right there: nicht ausfüllen.',
    '… und dann bräuchte ich noch …': '… and then I would also need …',
    'Das vorläufige Ordnungsmerkmal wurde Ihnen mitgeteilt.': 'You have been informed of the provisional Ordnungsmerkmal.',
    'Der Vordruck ist mit blauem Kugelschreiber auszufüllen. Den kann ich so nicht annehmen.': 'The form is to be completed in blue ballpoint. I cannot accept it like this.',
    'Die Angaben stimmen nicht mit Ihrem Personalausweis überein.': 'The details do not match your Personalausweis.',
    'Für welches Verfahren benötigen Sie das Ordnungsmerkmal? Feld 4 ist nicht ausgefüllt.': 'For which procedure do you need the Ordnungsmerkmal? Field 4 has not been filled in.',
    'Feld 5 ist nicht ausgefüllt.': 'Field 5 has not been filled in.',
    'Feld 7 ist für Vermerke der Behörde. Den Antrag kann ich so nicht annehmen.': 'Field 7 is for official notes. I cannot accept the application like this.',
    'Der Antrag ist nicht unterschrieben.': 'The application has not been signed.',
    'Nicht mehr verwenden.': 'No longer to be used.',
    'Ohne Termin kann ich das nicht annehmen.': 'Without Termin, nix.',
    'Ihr Termin ist für eine andere Dienstleistung gebucht.': 'Your appointment is booked for a different service.',
    'Die Meldebescheinigung fehlt.': 'The Meldebescheinigung is missing.',
    'Die Angaben in Feld 1 bis 4 stimmen nicht mit der Meldebescheinigung überein.': 'The details in fields 1 to 4 do not match the Meldebescheinigung.',
    'Ohne Vorgangsnummer kann der Antrag nicht angenommen werden.': 'Without a Vorgangsnummer the application cannot be accepted.',
    'Diese Vorgangsnummer ist hier nicht bekannt.': 'This Vorgangsnummer is not known here.',
    'In Feld 6 sind die Anlagen nicht angekreuzt.': 'The enclosures in field 6 have not been ticked.',
    'Das Kassenzeichen fehlt.': 'The Kassenzeichen is missing.',
    'Dieses Kassenzeichen ist hier nicht bekannt.': 'This Kassenzeichen is not known here.',
    'Der Zahlungsnachweis fehlt.': 'The proof of payment is missing.',
    'Der Betrag stimmt nicht.': 'The amount is wrong.',
    'Das ist bei Meldewesen gebucht.': 'That has been booked to residents’ registration.',
    'Das ist beim Hauptamt gebucht.': 'That has been booked to the Hauptamt.',
    'Das ist beim Kopierer gebucht.': 'That has been booked to the photocopier.',
    'Das ist bei den Sondernutzungsgebühren gebucht.': 'That has been booked to special-use fees.',
    'Das ist bei einer anderen Haushaltsstelle gebucht.': 'That has been booked to a different Haushaltsstelle.',
    'Feld 7 ist nicht ausgefüllt. Das steht in den Ausfüllhinweisen unter Nummer 1.': 'Field 7 has not been filled in. That is in the Ausfüllhinweise under number 1.',
    'Ein Strich genügt in Feld 7 nicht. Siehe Ausfüllhinweise Nummer 5.': 'A dash is not sufficient in field 7. See Ausfüllhinweise number 5.',
    'Feld 7 ist nicht ordnungsgemäß ausgefüllt.': 'Field 7 has not been filled in properly.',
    'Mit schwarzem Schreibmittel unterzeichnete Anträge gelten nicht als ordnungsgemäß unterzeichnet. Ausfüllhinweise Nummer 6.':
      'Applications signed with a black writing implement are not deemed to be properly signed. Ausfüllhinweise number 6.',
    'Der Vordruck ist mit blauem Kugelschreiber auszufüllen. Ausfüllhinweise Nummer 1.': 'The form is to be completed in blue ballpoint. Ausfüllhinweise number 1.',
    'Ohne vollständige Haushaltsstelle kann ich das nicht annehmen.': 'I cannot accept that without a complete Haushaltsstelle.',
    'Welcher Betrag?': 'What amount?', 'Bitte schön, Ihre Quittung.': 'Here you are, your receipt.',

    /* Schluss */
    'Zum Abschluss-Bescheid': 'To the final Bescheid', 'Link zum Bescheid': 'Link to the Bescheid',
    'Der Link wurde in die Zwischenablage übernommen.': 'The link has been copied to the clipboard.',
    'Selbst einen Antrag stellen': 'File an application yourself', 'Sprache': 'Language'
  };

  var SPRECHER = {'Frau Schuster': 'Ms Schuster', 'Frau Esser': 'Ms Esser', 'Willi Pütz': 'Willi Pütz', 'Herr Schwamborn': 'Mr Schwamborn'};
  var ZUSATZ = {'murmelt, ohne vom Radio aufzusehen': 'mumbles, without looking up from the radio'};
  var TAG_K = {So: 'Sun', Mo: 'Mon', Di: 'Tue', Mi: 'Wed', Do: 'Thu', Fr: 'Fri', Sa: 'Sat'};
  var TAG_L = {Sonntag: 'Sunday', Montag: 'Monday', Dienstag: 'Tuesday', Mittwoch: 'Wednesday', Donnerstag: 'Thursday', Freitag: 'Friday', Samstag: 'Saturday'};

  function datum(s) {
    return s.replace(/\b(So|Mo|Di|Mi|Do|Fr|Sa), (?=\d\d\.\d\d\.\d{4})/g, function (m, t) { return TAG_K[t] + ', '; })
      .replace(/\b(Sonntag|Montag|Dienstag|Mittwoch|Donnerstag|Freitag|Samstag)(?=, \d\d\.)/g, function (m, t) { return TAG_L[t]; })
      .replace(/(\d{1,2}:\d\d) Uhr\b/g, '$1');
  }
  function anrede(s) { return s.replace(/^Herrn? /, 'Mr ').replace(/^Frau /, 'Ms '); }

  var MUSTER = [
    [/^(Frau Schuster|Frau Esser|Willi Pütz|Herr Schwamborn)(?: \((.+)\))?: (.+)$/, function (m) {
      return SPRECHER[m[1]] + (m[2] ? ' (' + (ZUSATZ[m[2]] || m[2]) + ')' : '') + ': ' + zeile(m[3]);
    }],
    [/^Guten Tag, (.+)\. Was kann ich für Sie tun\?$/, function (m) { return 'Good day, ' + anrede(m[1]) + '. What can I do for you?'; }],
    [/^(\d{1,2}:\d\d) · (.+)$/, function (m) { return m[1] + ' · ' + zeile(m[2]); }],
    [/^Piep\. Nummer (.+?), Schalter (\d)\.$/, function (m) { return 'Beep. Number ' + m[1] + ', counter ' + m[2] + '.'; }],
    [/^Nummer (.+?) ist verfallen\.$/, function (m) { return 'Number ' + m[1] + ' has expired.'; }],
    [/^Nummer (.+?) wurde aufgerufen, während Sie am Schalter waren\. Sie ist verfallen\.$/, function (m) { return 'Number ' + m[1] + ' was called while you were at the counter. It has expired.'; }],
    [/^Sie ziehen die Wartemarke (.+)\.$/, function (m) { return 'You take ticket ' + m[1] + '.'; }],
    [/^Warten, bis Nummer (.+) aufgerufen wird$/, function (m) { return 'Wait until number ' + m[1] + ' is called'; }],
    [/^Warten, bis geöffnet wird \((.+)\)$/, function (m) { return 'Wait until it opens (' + datum(m[1]) + ')'; }],
    [/^(\d+|\?) Min\.$/, function (m) { return m[1] + ' min'; }],
    [/^Pause\. „(.+)“$/, function (m) { return 'Pause. “' + m[1] + '”'; }],
    [/^„Ihr vorläufiges Ordnungsmerkmal lautet (.+)\.“$/, function (m) { return '“Your provisional Ordnungsmerkmal is ' + m[1] + '.”'; }],
    [/^Meldebescheinigung für (.+)\.$/, function (m) { return 'Meldebescheinigung for ' + m[1] + '.'; }],
    [/^([\d,]+) EUR · HSt\. (\S+) · Kassenzeichen: entfällt \(Einzahlung nach Haushaltsstelle\)$/, function (m) { return m[1] + ' EUR · HSt. ' + m[2] + ' · Kassenzeichen: entfällt (paid by Haushaltsstelle)'; }],
    [/^geb\. (.+) in (.+)$/, function (m) { return 'born ' + m[1] + ' in ' + m[2]; }],
    [/^Alter am (\S+): (\d+) Jahre$/, function (m) { return 'Age on ' + m[1] + ': ' + m[2] + ' years'; }],
    [/^Alter am (\S+): –$/, function (m) { return 'Age on ' + m[1] + ': –'; }],
    [/^Bitte prüfen Sie die Angabe „(.+)“\.$/, function (m) { return 'Please check the entry “' + (D[m[1]] || m[1]) + '”.'; }],
    [/^Diese Akte gehört zu einem anderen Verfahren \(Spiel (.*)\)\.$/, function (m) { return 'This file belongs to different proceedings (Game ' + m[1] + ').'; }],
    [/^Hautton (\d+)$/, function (m) { return 'Skin tone ' + m[1]; }],
    [/^(Stand|Eröffnet): (.+)$/, function (m) { return (m[1] === 'Stand' ? 'As of: ' : 'Opened: ') + datum(m[2]); }],
    [/^Weiter am (.+)\.$/, function (m) { return 'Continuing on ' + datum(m[1]) + '.'; }],
    [/^gültig bis (.+)$/, function (m) { return 'valid until ' + m[1]; }],
    [/^vom (\d\d\.\d\d\.\d{4})$/, function (m) { return 'dated ' + m[1]; }],
    [/^(\d+) Seiten?$/, function (m) { return m[1] + (m[1] === '1' ? ' page' : ' pages'); }],
    [/^ca\. (\d+) Minuten$/, function (m) { return 'approx. ' + m[1] + ' minutes'; }],
    [/^Schwarz, reicht für ca\. (\d+) Seiten$/, function (m) { return 'Black, good for approx. ' + m[1] + ' pages'; }],
    [/^Druck abgebrochen: Die Druckerpatrone ist leer\. Gedruckt wurden (\d+) Seiten\.$/, function (m) { return 'Printing stopped: the printer cartridge is empty. ' + m[1] + ' pages were printed.'; }],
    [/^Haushaltsplan 2009, Seite (\d+)$/, function (m) { return 'Haushaltsplan 2009, page ' + m[1]; }],
    [/^(.+)\. Im Briefkasten liegt ein Schreiben des Ordnungsamtes\.$/, function (m) { return datum(m[1]) + '. There is a letter from the Ordnungsamt in the letterbox.'; }],
    [/^(.*) – SurfStar Gold 4\.7$/, function (m) { return m[0]; }]
  ];

  var fehlend = new Set();
  function zeile(s) {
    var kern = s.trim();
    if (!kern) return s;
    var vorn = s.slice(0, s.indexOf(kern)), hinten = s.slice(s.indexOf(kern) + kern.length);
    if (Object.prototype.hasOwnProperty.call(D, kern)) return vorn + D[kern] + hinten;
    for (var i = 0; i < MUSTER.length; i++) {
      var m = MUSTER[i][0].exec(kern);
      if (m) return vorn + MUSTER[i][1](m) + hinten;
    }
    var d = datum(kern);
    if (/[a-zäöüß]{3}/.test(kern) && d === kern) fehlend.add(kern);
    return vorn + d + hinten;
  }
  function text(s) { return s.indexOf('\n') < 0 ? zeile(s) : s.split('\n').map(zeile).join('\n'); }

  /* ---------- DOM ---------- */
  var an = false, TEXT = new WeakMap(), ATTR = new WeakMap(), ATTRIBUTE = ['aria-label', 'title', 'placeholder'];
  function amtlich(el) {
    var e = el && el.closest ? el.closest('[data-amtlich], [data-ui], svg, script, style, textarea') : null;
    return !!e && !e.hasAttribute('data-ui');
  }
  function knotenText(n) {
    if (!/\S/.test(n.nodeValue)) return;
    var alt = TEXT.get(n);
    if (alt && n.nodeValue === (an ? alt.en : alt.de)) return;
    if (alt && !an && n.nodeValue === alt.en) { n.nodeValue = alt.de; return; }
    if (!an) return;
    if (amtlich(n.parentElement)) return;
    var de = n.nodeValue, en = text(de);
    TEXT.set(n, {de: de, en: en});
    if (en !== de) n.nodeValue = en;
  }
  function knotenAttr(el) {
    var a = ATTR.get(el) || {};
    ATTRIBUTE.forEach(function (k) {
      if (!el.hasAttribute(k)) return;
      var v = el.getAttribute(k), alt = a[k];
      if (alt && v === (an ? alt.en : alt.de)) return;
      if (alt && !an && v === alt.en) { el.setAttribute(k, alt.de); return; }
      if (!an || amtlich(el)) return;
      var en = text(v);
      a[k] = {de: v, en: en};
      if (en !== v) el.setAttribute(k, en);
    });
    ATTR.set(el, a);
  }
  function baum(wurzel) {
    if (wurzel.nodeType === 3) { knotenText(wurzel); return; }
    if (wurzel.nodeType !== 1) return;
    knotenAttr(wurzel);
    var w = document.createTreeWalker(wurzel, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) knotenText(n); else knotenAttr(n); }
  }
  var beobachter = new MutationObserver(function (liste) {
    liste.forEach(function (m) {
      if (m.type === 'characterData') knotenText(m.target);
      else if (m.type === 'attributes') knotenAttr(m.target);
      else Array.prototype.forEach.call(m.addedNodes, baum);
    });
  });
  beobachter.observe(document.documentElement, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRIBUTE});

  function setzen(wert) {
    wert = !!wert;
    if (wert === an) return;
    an = wert;
    document.documentElement.lang = an ? 'en' : 'de';
    Array.prototype.forEach.call(document.querySelectorAll('[data-ui]'), function (e) { e.lang = an ? 'en' : 'de'; });
    baum(document.documentElement);
    ['aw-englisch', 'u-englisch'].forEach(function (id) { var c = document.getElementById(id); if (c) c.checked = an; });
    if (window.Spiel && Spiel.zustand && Spiel.laeuft && Spiel.zustand.sprache !== (an ? 1 : 0)) { Spiel.zustand.sprache = an ? 1 : 0; Spiel.aktualisieren(); }
    if (window.Rahmen && Rahmen.sprachwechsel) Rahmen.sprachwechsel();
  }

  window.Sprache = {setzen: setzen, an: function () { return an; }, text: text, fehlend: fehlend};

  document.addEventListener('spielbeginn', function () { setzen(Spiel.zustand && Spiel.zustand.sprache); });
  document.addEventListener('change', function (e) {
    if (e.target && (e.target.id === 'aw-englisch' || e.target.id === 'u-englisch')) setzen(e.target.checked);
  });
})();
