/* Behördensimulator: Neues Rathaus (Foyer, Info-Theke, Kassenhalle, Schalter 4, Loge) */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var FOYER = 1, THEKE = 2, KASSE = 3, SCHALTER = 4, LOGE = 5, ORDNUNGSAMT = 6;
  var ORTNAMEN = {1: 'Foyer', 2: 'Info-Theke', 3: 'Kassenhalle, Raum 115', 4: 'Bürgeramt, Schalter 4', 5: 'Loge des Hausmeisters', 6: 'Ordnungsamt, Raum 121'};
  var HST = {'0200.1110': null, '0210.1110': 'Das ist bei Meldewesen gebucht.', '0300.1110': 'Das ist beim Hauptamt gebucht.',
    '0200.1120': 'Das ist beim Kopierer gebucht.', '6300.1110': 'Das ist bei den Sondernutzungsgebühren gebucht.'};
  var BRILLE = ['Frau Schuster schiebt die Brille hoch.', 'Die Brille ist etwas gerutscht.', 'Die Brille sitzt halb unten.', 'Frau Schuster sieht Sie über den Brillenrand an.'];

  var R = neuerZustand();
  function neuerZustand() {
    return {marken: [], log: [], quittung: null, eVorhanden: false, vgnAbgelehnt: false, durchschriftMoeglich: false,
      amSchalter: null, anliegenErledigt: false, terminVerbraucht: false, wartIndex: 0, draussen: false, letzteNummer: 300};
  }

  /* ---------- Zeiten ---------- */
  function z() { return Spiel.zustand; }
  function uhr() { return Spiel.uhr(); }
  function uhrText(m) { return Spiel.uhrText(m); }
  function zeiten(tag) {
    if (!Spiel.buergeramtOffen(tag)) return [];
    return Spiel.wochentag(tag) === 4 ? [[480, 720], [840, 1080]] : [[480, 720]];
  }
  function fenster(tag, m) { var f = zeiten(tag); for (var i = 0; i < f.length; i++) if (m >= f[i][0] && m < f[i][1]) return f[i]; return null; }
  function naechsteOeffnung(tag, m) { var f = zeiten(tag); for (var i = 0; i < f.length; i++) if (f[i][0] > m) return f[i][0]; return null; }
  function markenBis(f) { return f[1] - 30; }
  function kasseFenster(tag, m) {
    if (!Spiel.kasseOffen(tag)) return null;
    var f = Spiel.wochentag(tag) === 4 ? [[510, 720], [840, 960]] : [[510, 720]];
    for (var i = 0; i < f.length; i++) if (m >= f[i][0] && m < f[i][1]) return f[i];
    return null;
  }
  function wartezeit() {
    var w = Spiel.wochentag(z().tag), m = uhr(), mo = w === 1, basis;
    if (w === 4 && m >= 840) basis = 15;
    else if (m < 540) basis = 20;
    else if (m < 600) basis = mo ? 30 : 20;
    else if (m < 660) basis = mo ? 30 : 25;
    else basis = mo ? 35 : 25;
    var j = (z().seed * 7 + R.wartIndex * 13 + z().tag * 5) % 6;
    R.wartIndex++;
    return basis + j;
  }

  /* ---------- Hilfen ---------- */
  function normal(s) { return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase(); }
  function ziffern(s) { return String(s || '').replace(/\D/g, ''); }
  function anrede() {
    var a = Spiel.ausweis || {}, an = z().anrede;
    return an === 1 ? 'Herr ' + a.name : an === 2 ? 'Frau ' + a.name : [a.vorname, a.name].join(' ');
  }
  function vom() { return 'vOM 2009-' + String(400 + z().seed).padStart(4, '0') + '/B'; }
  Spiel.vom = vom;
  function protokoll(text, minute) {
    R.log.push(uhrText(minute === undefined ? uhr() : minute) + ' · ' + text);
    var ol = $('rh-log'), li = document.createElement('li');
    li.textContent = R.log[R.log.length - 1];
    ol.appendChild(li);
    while (ol.children.length > 12) ol.removeChild(ol.firstChild);
  }
  var gespraech = '';
  function sage(text) { gespraech = text; }

  /* ---------- Bilder (Zierde; Inhalte stehen im Gesprächstext und in der Beschreibung) ---------- */
  var BILD = {
    1: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#9a9890"/><rect y="270" width="600" height="150" fill="#6f6a60"/><rect x="40" y="90" width="150" height="190" fill="#5b4636" stroke="#3d2f24" stroke-width="4"/><rect x="58" y="104" width="114" height="20" fill="#f2f2f2"/><text x="115" y="118" font-size="11" text-anchor="middle" font-family="Verdana">Bürgeramt · Schalter 1–6</text><rect x="230" y="110" width="110" height="170" fill="#5b4636" stroke="#3d2f24" stroke-width="4"/><rect x="243" y="124" width="84" height="20" fill="#f2f2f2"/><text x="285" y="138" font-size="11" text-anchor="middle" font-family="Verdana">115 Kasse</text><rect x="380" y="40" width="190" height="80" fill="#151515" stroke="#3a3a3a" stroke-width="4"/><text x="475" y="62" font-size="11" fill="#c9c9c9" text-anchor="middle" font-family="Verdana">Nummer · Schalter</text><text id="anz-nr" x="475" y="100" font-size="28" fill="#ff5a3c" text-anchor="middle" font-family="Courier New" font-weight="bold">– · –</text><rect x="440" y="200" width="96" height="170" fill="#c9c3b0" stroke="#5a5446" stroke-width="2"/><text x="488" y="222" font-size="10" text-anchor="middle" font-family="Verdana" font-weight="bold">Wartemarken</text><rect x="452" y="234" width="72" height="24" fill="#2b5aa0"/><text x="488" y="250" font-size="10" fill="#fff" text-anchor="middle" font-family="Verdana">Bürgeramt</text><rect x="452" y="266" width="72" height="24" fill="#e8b32a"/><text x="488" y="282" font-size="10" text-anchor="middle" font-family="Verdana">Termin</text><rect x="20" y="320" width="260" height="80" fill="#a37a4c" stroke="#5b4636" stroke-width="2"/><rect x="40" y="334" width="220" height="20" fill="#fdfdfa"/><text x="150" y="348" font-size="10" text-anchor="middle" font-family="Verdana">Information · Zurzeit nicht besetzt</text><rect x="340" y="300" width="30" height="100" fill="#d9d9d9" stroke="#777"/></svg>',
    2: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#8c8a82"/><rect y="230" width="600" height="190" fill="#a37a4c"/><rect y="226" width="600" height="10" fill="#5b4636"/><rect x="40" y="70" width="240" height="40" fill="#fdfdfa" stroke="#5b4636"/><text x="160" y="96" font-size="15" text-anchor="middle" font-family="Verdana">Information · Zurzeit nicht besetzt</text><rect x="380" y="90" width="140" height="140" fill="#c9c3b0" stroke="#5a5446"/><text x="450" y="112" font-size="11" text-anchor="middle" font-family="Verdana" font-weight="bold">Vordrucke</text><rect x="400" y="124" width="100" height="30" fill="#fdfdfa"/><text x="450" y="144" font-size="11" text-anchor="middle" font-family="Verdana">17/b</text><rect x="400" y="164" width="100" height="30" fill="#e6e6e6"/><text x="450" y="184" font-size="11" text-anchor="middle" font-family="Verdana" fill="#555">leer</text><path d="M150 236 Q170 300 200 310" stroke="#888" stroke-width="2" fill="none" stroke-dasharray="3 3"/><rect x="196" y="304" width="70" height="8" fill="#2b5aa0" transform="rotate(-12 196 304)"/></svg>',
    3: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#b7b39f"/><rect x="70" y="50" width="460" height="300" fill="#d8e3e6" stroke="#6b675a" stroke-width="10"/><path d="M230 350 Q230 190 300 186 Q370 190 370 350 Z" fill="#6d5a4b"/><ellipse cx="300" cy="150" rx="40" ry="48" fill="#e0b896"/><path d="M258 140 Q258 92 300 92 Q342 92 342 140 Q332 112 300 112 Q268 112 258 140 Z" fill="#7a5230"/><rect y="350" width="600" height="70" fill="#6b675a"/><rect x="240" y="350" width="120" height="16" fill="#4a473e"/><rect x="70" y="20" width="220" height="22" fill="#fdfdfa"/><text x="180" y="36" font-size="12" text-anchor="middle" font-family="Verdana">Kasse · Bitte Abstand halten</text></svg>',
    4: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#c4c0ae"/><rect width="600" height="250" fill="#d9d4c0"/><rect x="30" y="24" width="50" height="50" fill="#2b5aa0"/><text x="55" y="60" font-size="30" fill="#fff" text-anchor="middle" font-family="Verdana" font-weight="bold">4</text><path d="M200 380 Q200 200 300 196 Q400 200 400 380 Z" fill="#8c3b4a"/><rect x="286" y="170" width="28" height="34" fill="#e7c3a3"/><ellipse cx="300" cy="130" rx="54" ry="64" fill="#e7c3a3"/><path d="M244 120 Q240 56 300 54 Q360 56 356 120 Q346 84 300 84 Q254 84 244 120 Z" fill="#9a9a9a"/><g id="brille-g"><rect x="262" y="118" width="32" height="20" rx="6" fill="none" stroke="#2a2a2a" stroke-width="4"/><rect x="306" y="118" width="32" height="20" rx="6" fill="none" stroke="#2a2a2a" stroke-width="4"/><path d="M294 126 H306" stroke="#2a2a2a" stroke-width="4"/></g><circle cx="280" cy="130" r="3" fill="#2a2a2a"/><circle cx="320" cy="130" r="3" fill="#2a2a2a"/><path d="M286 162 Q300 166 314 162" stroke="#8a5a44" stroke-width="3" fill="none"/><rect y="370" width="600" height="50" fill="#7a7461"/><rect x="420" y="340" width="90" height="30" fill="#e8e2cc" stroke="#5a5446"/></svg>',
    5: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#8a887f"/><rect x="60" y="50" width="480" height="300" fill="#c8d6d9" stroke="#5b4636" stroke-width="12"/><path d="M220 350 Q220 200 300 196 Q380 200 380 350 Z" fill="#7d7f78"/><ellipse cx="300" cy="150" rx="42" ry="48" fill="#dcae8c"/><path d="M256 136 Q258 96 300 96 Q342 96 344 136 Q330 114 300 114 Q270 114 256 136 Z" fill="#3d3d3d"/><rect x="100" y="290" width="80" height="44" rx="4" fill="#3a3a3a"/><rect x="440" y="300" width="28" height="34" fill="#f2f2f2" stroke="#9a9a9a" stroke-width="2"/><rect y="350" width="600" height="70" fill="#5b4636"/><rect x="60" y="20" width="200" height="22" fill="#fdfdfa"/><text x="160" y="36" font-size="12" text-anchor="middle" font-family="Verdana">Hausmeister · Bitte klopfen</text></svg>',
    6: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#d6d1bf"/><rect x="20" y="40" width="140" height="300" fill="#8c7a5a"/><rect x="30" y="60" width="120" height="40" fill="#c9b98f"/><rect x="30" y="120" width="120" height="40" fill="#b5a47c"/><rect x="30" y="180" width="120" height="40" fill="#c9b98f"/><rect x="30" y="240" width="120" height="40" fill="#b5a47c"/><path d="M250 360 Q250 210 340 206 Q430 210 430 360 Z" fill="#4f5d6e"/><ellipse cx="340" cy="160" rx="44" ry="52" fill="#e2b48c"/><path d="M298 148 Q300 104 340 104 Q380 104 382 148 Q370 124 340 124 Q310 124 298 148 Z" fill="#5a4632"/><rect y="330" width="600" height="90" fill="#7a5a3a"/><rect x="440" y="290" width="110" height="40" fill="#fdfdfa" stroke="#999"/><rect x="446" y="280" width="110" height="14" fill="#f2f2f2" stroke="#999"/><rect x="20" y="10" width="220" height="22" fill="#fdfdfa"/><text x="130" y="26" font-size="12" text-anchor="middle" font-family="Verdana">121 · Sondernutzungen</text></svg>',
    0: '<svg viewBox="0 0 600 420" aria-hidden="true"><rect width="600" height="420" fill="#7d7a70"/><rect x="170" y="80" width="260" height="300" fill="#4a3a2c" stroke="#2c221a" stroke-width="8"/><rect x="295" y="80" width="10" height="300" fill="#2c221a"/><rect x="200" y="120" width="200" height="70" fill="#fdfdfa"/><text x="300" y="146" font-size="13" text-anchor="middle" font-family="Verdana" font-weight="bold">Neues Rathaus</text><text x="300" y="168" font-size="11" text-anchor="middle" font-family="Verdana">Rathausplatz 1</text><rect y="380" width="600" height="40" fill="#5e5b52"/></svg>'
  };
  var BESCHREIBUNG = {
    0: 'Der Haupteingang des Neuen Rathauses, die Türen sind verschlossen.',
    1: 'Foyer: Betonwände, rechts die Aufrufanzeige über dem Wartemarkenautomaten mit den Tasten „Bürgeramt“ und „Termin“, links die unbesetzte Info-Theke, hinten die Türen zum Bürgeramt und zur Kassenhalle.',
    2: 'Info-Theke: Schild „Zurzeit nicht besetzt“, ein Ständer mit Vordrucken 17/b, ein blauer Kugelschreiber an einer Kette.',
    3: 'Kassenschalter hinter Glas, dahinter Frau Esser.',
    4: 'Schalter 4. Dahinter Frau Schuster.',
    5: 'Glasloge mit Radio und Kaffeebecher, dahinter Willi Pütz im grauen Kittel.',
    6: 'Ein Büro mit Aktenregalen. Am Schreibtisch Herr Schwamborn, vor ihm ein Stapel Vorgänge.'
  };

  /* ---------- Anzeige ---------- */
  function aktion(text, kosten, fn, aus) { return {text: text, kosten: kosten, fn: fn, aus: !!aus}; }
  function zeigen() {
    var o = z().ort, sicht = R.draussen ? 0 : o;
    $('rathaus').hidden = false;
    $('fenster').inert = true; $('symbol-surfstar').inert = true;
    $('rh-ort').textContent = R.draussen ? 'Vor dem Neuen Rathaus' : ORTNAMEN[o];
    $('rh-bild').innerHTML = BILD[sicht];
    $('rh-bild').setAttribute('aria-label', BESCHREIBUNG[sicht]);
    if (sicht === FOYER) { var a = $('anz-nr'); if (a) a.textContent = R.anzeige || '– · –'; }
    if (sicht === SCHALTER) { var g = $('brille-g'); if (g) g.setAttribute('transform', 'translate(0,' + (z().brille * 7) + ')'); }
    $('rh-gespraech').textContent = gespraech;
    var box = $('rh-aktionen');
    box.textContent = '';
    aktionen().forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      var t = document.createElement('span'); t.textContent = a.text; b.appendChild(t);
      if (a.kosten) { var k = document.createElement('span'); k.className = 'kosten'; k.textContent = a.kosten; b.appendChild(k); }
      if (a.aus) b.setAttribute('aria-disabled', 'true');
      else b.addEventListener('click', function () { gespraech = ''; a.fn(); nachHandlung(); });
      box.appendChild(b);
    });
    leiste();
  }
  function fokusErste() { var b = $('rh-aktionen').querySelector('button:not([aria-disabled="true"])'); if (b) b.focus(); }
  function leiste() {
    var zuhause = !Spiel.zustand || z().ort === 0;
    $('sl-weg').textContent = zuhause ? 'Zum Rathaus (15 Min.)' : 'Nach Hause (15 Min.)';
    $('sl-warten').hidden = !zuhause;
  }
  function verlassen() { $('rathaus').hidden = true; $('fenster').inert = false; $('symbol-surfstar').inert = false; }

  /* Nach jeder Handlung: Schließzeit, verfallene Wartemarken, Anzeige */
  function nachHandlung() {
    if (!Spiel.laeuft) return;
    var o = z().ort;
    if (o === 0) { verlassen(); leiste(); return; }
    var m = uhr();
    R.marken = R.marken.filter(function (k) {
      if (m > k.aufruf + 10 && !(R.amSchalter === k)) { protokoll('Nummer ' + k.nr + ' ist verfallen.'); return false; }
      return true;
    });
    if (!R.draussen && !fenster(z().tag, m)) {
      R.draussen = true; R.marken = []; R.amSchalter = null;
      z().ort = FOYER; Spiel.aktualisieren();
      sage('Das Rathaus schließt. Sie verlassen das Gebäude.');
    }
    zeigen();
    if (!document.querySelector('.schirm:not([hidden]), .panel:not([hidden]), .dialog:not([hidden])')) fokusErste();
  }

  /* ---------- Aktionen je Ort ---------- */
  function aktionen() {
    var o = z().ort, l = [];
    if (R.draussen) {
      var n = naechsteOeffnung(z().tag, uhr());
      if (n !== null) l.push(aktion('Warten, bis geöffnet wird (' + uhrText(n) + ' Uhr)', (n - uhr()) + ' Min.', function () { Spiel.vergehen(n - uhr()); R.draussen = false; sage('Die Türen werden aufgeschlossen.'); }));
      l.push(aktion('Nach Hause gehen', '15 Min.', heimgehen));
      return l;
    }
    if (o === FOYER) {
      l.push(aktion('Wartemarke ziehen: Taste „Bürgeramt“', '1 Min.', function () { marke(false); }));
      l.push(aktion('Wartemarke ziehen: Taste „Termin“', '1 Min.', function () { terminDialog(); }));
      R.marken.slice().sort(function (a, b) { return a.aufruf - b.aufruf; }).slice(0, 1).forEach(function (k) {
        l.push(aktion('Warten, bis Nummer ' + k.nr + ' aufgerufen wird', '?', function () { warten(k); }));
      });
      l.push(aktion('Zur Info-Theke', '', function () { gehe(THEKE); }));
      l.push(aktion('Zur Kassenhalle, Raum 115', '1 Min.', function () { Spiel.vergehen(1); gehe(KASSE); }));
      l.push(aktion('Zur Loge des Hausmeisters', '1 Min.', function () { Spiel.vergehen(1); gehe(LOGE); if (R.vgnAbgelehnt) sage('Willi Pütz (murmelt, ohne vom Radio aufzusehen): Vorgangsnummer … Dat jibbet doch nur mit dem Strich-Eins.'); }));
      if (Spiel.flag('stempel') && !Spiel.flag('epilog')) l.push(aktion('Zum Ordnungsamt, Raum 121', '2 Min.', function () { Spiel.vergehen(2); gehe(ORDNUNGSAMT); sage('Herr Schwamborn: Ja, bitte?'); }));
      l.push(aktion('Hände desinfizieren', '1 Min.', function () { Spiel.vergehen(1); sage('Es riecht nach Krankenhaus.'); }));
      l.push(aktion('Nach Hause gehen', '15 Min.', heimgehen));
    } else if (o === THEKE) {
      l.push(aktion('Formular B aus dem Ständer nehmen', '', function () {
        Formulare.leeren('B'); Spiel.setzeFlag('formB');
        sage('Sie nehmen einen Vordruck 17/b aus dem Ständer.');
      }));
      [['B', 'formB', 'Formular B ausfüllen'], ['B1', 'formB1', 'Vordruck B-1 ausfüllen'], ['A17', 'form17a', 'Vordruck 17/a ausfüllen']].forEach(function (f) {
        if (Spiel.flag(f[1])) l.push(aktion(f[2], '5 Min.', function () { ausfuellen(f[0], ['blau', 'schwarz'], 'Info-Theke'); }));
      });
      l.push(aktion('Zurück ins Foyer', '', function () { gehe(FOYER); }));
    } else if (o === KASSE) {
      var kf = kasseFenster(z().tag, uhr());
      if (!kf) {
        sage(gespraech || 'Der Kassenschalter ist geschlossen.');
      } else {
        if (!R.eVorhanden) l.push(aktion('Einzahlungsschein nehmen', '', function () { R.eVorhanden = true; Formulare.leeren('E'); sage('Sie nehmen einen Einzahlungsschein.'); }));
        else l.push(aktion('Einzahlungsschein ausfüllen', '', function () { ausfuellen('E', ['blau'], 'Kassenhalle, Raum 115'); }));
        l.push(aktion('Anstellen und einzahlen', '10 Min.', einzahlen, !R.eVorhanden));
        l.push(aktion('„Welche Haushaltsstelle ist das denn?“', '', function () { Spiel.vergehen(1); sage('Frau Esser: Darüber darf ich keine Auskunft geben.'); }));
        l.push(aktion('„Ich habe ein Kassenzeichen.“', '', function () { Spiel.vergehen(1); sage('Frau Esser: Das Kassenzeichen steht auf Ihrem Bescheid. Liegt Ihnen noch kein Bescheid vor, zahlen Sie bitte mit Einzahlungsschein unter Angabe der Haushaltsstelle.'); }));
      }
      l.push(aktion('Zurück ins Foyer', '1 Min.', function () { Spiel.vergehen(1); gehe(FOYER); }));
    } else if (o === LOGE) {
      l.push(aktion('„Was für ein Strich-Eins?“', '1 Min.', function () { Spiel.vergehen(1); z().puetz = 1; sage(R.vgnAbgelehnt ? 'Willi Pütz: Na, dat Formular mit dem Strich-Eins. Dat liegt bei den anderen Formularen. Hinter dem B.' : 'Willi Pütz: Hm?'); }));
      l.push(aktion('„Haben Sie einen Kugelschreiber für mich?“', '1 Min.', function () { Spiel.vergehen(1); z().puetz = 1; sage('Willi Pütz: An der Theke hängt einer. Blau. Der muss da hängen bleiben.'); }));
      l.push(aktion('„Wann ist die Kasse auf?“', '1 Min.', function () { Spiel.vergehen(1); z().puetz = 1; sage('Willi Pütz: Montags und donnerstags. Steht aber auch im Internet.'); }));
      l.push(aktion('Zurück ins Foyer', '1 Min.', function () { Spiel.vergehen(1); gehe(FOYER); }));
    } else if (o === SCHALTER) {
      l = schalterAktionen();
    } else if (o === ORDNUNGSAMT) {
      if (!Spiel.flag('epilog')) l.push(aktion('Negativattest abgeben', '2 Min.', function () {
        Spiel.vergehen(2);
        Spiel.setzeFlag('epilog');
        sage('Herr Schwamborn nimmt das Negativattest, sieht kurz darauf und legt es auf einen Stapel.\n„Danke. Sie hören von uns.“');
      }));
      l.push(aktion(Spiel.flag('epilog') ? 'Nach Hause gehen' : 'Zurück ins Foyer', Spiel.flag('epilog') ? '15 Min.' : '2 Min.', function () {
        if (Spiel.flag('epilog')) heimgehen(); else { Spiel.vergehen(2); gehe(FOYER); }
      }));
    }
    return l;
  }

  function gehe(ort) { z().ort = ort; Spiel.aktualisieren(); }
  function heimgehen() {
    Spiel.vergehen(15);
    R = Object.assign(neuerZustand(), {quittung: R.quittung, vgnAbgelehnt: R.vgnAbgelehnt, terminVerbraucht: R.terminVerbraucht, wartIndex: R.wartIndex});
    z().ort = 0; Spiel.aktualisieren();
    verlassen(); leiste();
    var adr = $('adresse'); if (adr && !$('fenster').hidden) adr.focus();
    if (Spiel.flag('epilog')) document.dispatchEvent(new CustomEvent('epilog'));
  }
  function ausfuellen(typ, stifte, ort) {
    var vorher = document.activeElement;
    Formulare.oeffnen(typ, {stifte: stifte, ort: ort, ausloeser: vorher, daneben: daneben(typ), fertig: function (geaendert) {
      if (geaendert && typ !== 'E') Spiel.vergehen(5);
      nachHandlung();
    }});
  }
  function daneben(typ) {
    if (typ === 'E' || !Spiel.flag('meldebescheinigung')) return '';
    var a = Spiel.ausweis || {};
    return 'Daneben liegt: Meldebescheinigung\n' + a.name + ', ' + a.vorname + '\ngeb. ' + a.geb + ' in ' + a.ort + '\nAhornweg 7, 43999 Musterstadt';
  }

  /* ---------- Wartemarken ---------- */
  function marke(termin) {
    Spiel.vergehen(1);
    var f = fenster(z().tag, uhr());
    if (!f || uhr() > markenBis(f)) { sage('Der Automat gibt keine Wartemarken aus.'); return null; }
    var k;
    if (termin) {
      var t = Spiel.termin(), beginn = 480 + ((z().termin & 63) - 1) * 15;
      R.terminVerbraucht = true;
      k = {nr: 'T ' + String(1 + (z().seed % 9) + Math.floor((beginn - 480) / 15)).padStart(2, '0'), termin: true, negativ: t.negativ, aufruf: Math.max(uhr() + 5, beginn)};
    } else {
      R.letzteNummer = Math.max(R.letzteNummer + 1, 300 + Math.floor((uhr() - 480) / 2) + (z().seed % 7));
      k = {nr: String(R.letzteNummer), termin: false, aufruf: uhr() + wartezeit()};
    }
    R.marken.push(k);
    z().marken = Math.min(127, z().marken + 1);
    Spiel.aktualisieren();
    sage('Sie ziehen die Wartemarke ' + k.nr + '.');
    return k;
  }
  function terminDialog() {
    $('dt-nummer').value = ''; $('dt-meldung').textContent = '';
    Rahmen.dialogOeffnen('dialog-termin');
    $('dt-nummer').focus();
  }
  $('dt-abbrechen').addEventListener('click', function () { Rahmen.dialogSchliessen($('dialog-termin')); fokusErste(); });
  $('dt-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var t = Spiel.termin(), eingabe = $('dt-nummer').value.trim().toUpperCase().replace(/\s+/g, '');
    var gueltig = t && !R.terminVerbraucht && eingabe === t.nummer && t.tag === z().tag;
    if (gueltig) {
      var beginn = 480 + ((z().termin & 63) - 1) * 15;
      if (uhr() > beginn + 15) gueltig = false;
    }
    if (!gueltig) { $('dt-meldung').textContent = 'Die Buchungsnummer ist nicht gültig.'; return; }
    Rahmen.dialogSchliessen($('dialog-termin'));
    marke(true);
    nachHandlung();
  });

  function warten(k) {
    var f = fenster(z().tag, uhr());
    var ende = f ? f[1] : uhr();
    if (k.aufruf >= ende) {
      Spiel.vergehen(Math.max(0, ende - uhr()));
      protokoll('Das Bürgeramt schließt.');
      sage('Ihre Nummer wurde nicht mehr aufgerufen.');
      R.marken = [];
      return;
    }
    var bis = Math.max(uhr(), k.aufruf), start = uhr();
    var vorher = (k.termin ? 2 : 3);
    for (var i = vorher; i >= 1; i--) {
      var andere = k.termin ? String(R.letzteNummer + vorher - i + 1) : String(+k.nr - i);
      protokoll('Piep. Nummer ' + andere + ', Schalter ' + ((i % 3) + 1) + '.', start + Math.round((bis - start) * (vorher - i + 1) / (vorher + 1)));
    }
    Spiel.vergehen(bis - uhr());
    R.anzeige = k.nr + ' · 4';
    protokoll('Piep. Nummer ' + k.nr + ', Schalter 4.');
    R.amSchalter = k; R.anliegenErledigt = false; R.durchschriftMoeglich = false;
    R.marken = R.marken.filter(function (x) { return x !== k; });
    gehe(SCHALTER);
    sage('Frau Schuster: Guten Tag, ' + anrede() + '. Was kann ich für Sie tun?\n' + BRILLE[z().brille]);
  }

  /* ---------- Schalter 4 ---------- */
  function schalterAktionen() {
    var l = [];
    if (!R.anliegenErledigt) {
      l.push(aktion('Meldebescheinigung beantragen', '', function () { vorsprache(meldebescheinigung); }));
      if (Spiel.flag('formB1')) l.push(aktion('Vordruck B-1 abgeben', '', function () { vorsprache(b1Pruefen); }));
      if (Spiel.flag('formB')) l.push(aktion('Formular B abgeben (Negativattest)', '', function () { vorsprache(function () { return bPruefen('B'); }); }));
      if (Spiel.flag('form17a')) l.push(aktion('Vordruck 17/a abgeben (Negativattest)', '', function () { vorsprache(function () { return bPruefen('A17'); }); }));
      if (Spiel.flag('vom')) l.push(aktion('„Wie war noch mal mein Ordnungsmerkmal?“', '', function () { vorsprache(nachfragenVom); }));
    }
    if (R.durchschriftMoeglich) l.push(aktion('„Bekomme ich davon eine Durchschrift?“', '', function () {
      R.durchschriftMoeglich = false; Spiel.setzeFlag('durchschrift');
      antwort('Frau Schuster reißt die Durchschrift ab und schiebt sie über den Tresen.', true);
    }));
    l.push(aktion('„Was ist eine Vorgangsnummer?“', '', function () { antwort('Frau Schuster: Die Vorgangsnummer wird nach Eingang des Antrags vergeben.', true); }));
    l.push(aktion('„Wo bezahle ich die Gebühr?“', '', function () { antwort('Frau Schuster: Gebühren für einzelne Leistungen sind an der Stadtkasse zu entrichten.', true); }));
    l.push(aktion('„Was soll ich bei ‚Nicht ausfüllen‘ eintragen?“', '', function () { antwort('Frau Schuster: Da steht doch: nicht ausfüllen.', true); }));
    l.push(aktion('Schalter verlassen', '', function () { R.amSchalter = null; R.durchschriftMoeglich = false; gehe(FOYER); sage(''); }));
    return l;
  }
  /* Eine Antwort; zaehlt sie als Rückfrage oder Zurückweisung, rutscht die Brille */
  function antwort(text, brille, zurueckweisung) {
    if (zurueckweisung) z().zurueck = Math.min(63, z().zurueck + 1);
    if (brille) {
      if (z().brille >= 3) {
        z().brilleAb = Math.min(15, z().brilleAb + 1);
        R = Object.assign(neuerZustand(), {quittung: R.quittung, vgnAbgelehnt: R.vgnAbgelehnt, wartIndex: R.wartIndex});
        verlassen();
        Spiel.tagBeenden('Frau Schuster nimmt die Brille ab.', text + '\n„Kommen Sie bitte an einem anderen Tag wieder. Dann mit allen Unterlagen.“');
        return;
      }
      z().brille++;
    }
    Spiel.aktualisieren();
    sage(text + '\n' + BRILLE[z().brille]);
  }
  function vorsprache(fn) {
    var dauer = z().brille >= 2 ? 25 : 10, f = fenster(z().tag, uhr());
    if (!f || uhr() + dauer > f[1]) {
      Spiel.vergehen(f ? Math.max(0, f[1] - uhr()) : 0);
      R.amSchalter = null; R.anliegenErledigt = true;
      sage('Frau Schuster: … und dann bräuchte ich noch …\nSie sieht auf die Uhr. „Mahlzeit.“ Der Schalter ist geschlossen.');
      gehe(FOYER);
      return;
    }
    Spiel.vergehen(dauer);
    R.anliegenErledigt = true;
    R.marken = R.marken.filter(function (k) {
      if (k.aufruf > uhr()) return true;
      protokoll('Piep. Nummer ' + k.nr + ', Schalter 2.');
      protokoll('Nummer ' + k.nr + ' wurde aufgerufen, während Sie am Schalter waren. Sie ist verfallen.');
      return false;
    });
    fn();
  }
  function meldebescheinigung() {
    Spiel.setzeFlag('meldebescheinigung');
    var a = Spiel.ausweis || {};
    sage('Frau Schuster druckt. „Das macht fünf Euro.“ Sie zahlen bar.\nMeldebescheinigung für ' + a.vorname + ' ' + a.name + ', Ahornweg 7, 43999 Musterstadt.\n' + BRILLE[z().brille]);
  }
  function nachfragenVom() {
    antwort('Frau Schuster: Das vorläufige Ordnungsmerkmal wurde Ihnen mitgeteilt.\nPause. „' + vom() + '.“', true);
  }
  function feld(typ, id) { return Formulare.wert(typ, id); }
  function schwarz(typ, ausser) {
    var w = Formulare.werte(typ);
    return Object.keys(w).some(function (k) { return k !== ausser && w[k].f === 'schwarz'; });
  }
  function anschriftStimmt(typ) { return normal(feld(typ, '4s')) === 'ahornweg 7' && ziffern(feld(typ, '4p')) === '43999' && normal(feld(typ, '4o')) === 'musterstadt'; }
  function unbrauchbar(typ, flag) { Formulare.leeren(typ); if (flag) Spiel.setzeFlag(flag, false); }

  function b1Pruefen() {
    var a = Spiel.ausweis || {}, t = 'B1';
    if (schwarz(t)) { unbrauchbar(t, 'formB1'); return antwort('Frau Schuster: Der Vordruck ist mit blauem Kugelschreiber auszufüllen. Den kann ich so nicht annehmen.', true, true); }
    if (normal(feld(t, '1')) !== normal(a.name) || normal(feld(t, '2')) !== normal(a.vorname) || !anschriftStimmt(t)) return antwort('Frau Schuster: Die Angaben stimmen nicht mit Ihrem Personalausweis überein.', true, true);
    if (!feld(t, '4n')) return antwort('Frau Schuster: Für welches Verfahren benötigen Sie das Ordnungsmerkmal? Feld 4 ist nicht ausgefüllt.', true, true);
    if (!feld(t, '5a') && !feld(t, '5b') && !feld(t, '5c')) return antwort('Frau Schuster: Feld 5 ist nicht ausgefüllt.', true, true);
    if (feld(t, '7')) { unbrauchbar(t, 'formB1'); return antwort('Frau Schuster: Feld 7 ist für Vermerke der Behörde. Den Antrag kann ich so nicht annehmen.', true, true); }
    if (!feld(t, '8')) return antwort('Frau Schuster: Der Antrag ist nicht unterschrieben.', true, true);
    unbrauchbar(t, 'formB1');
    Spiel.setzeFlag('vom');
    R.durchschriftMoeglich = true;
    sage('Frau Schuster trägt etwas in Feld 7 ein und legt den Vordruck ab.\n„Ihr vorläufiges Ordnungsmerkmal lautet ' + vom() + '.“\n' + BRILLE[z().brille]);
  }

  function bPruefen(typ) {
    var a = Spiel.ausweis || {}, k = R.amSchalter || {};
    if (typ === 'A17') return antwort('Frau Schuster: Nicht mehr verwenden.', true, true);
    if (!k.termin) return antwort('Frau Schuster: Ohne Termin kann ich das nicht annehmen.', true, true);
    if (!k.negativ) return antwort('Frau Schuster: Ihr Termin ist für eine andere Dienstleistung gebucht.', true, true);
    if (!Spiel.flag('meldebescheinigung')) return antwort('Frau Schuster: Die Meldebescheinigung fehlt.', true, true);
    if (normal(feld(typ, '1')) !== normal(a.name) || normal(feld(typ, '2')) !== normal(a.vorname) || ziffern(feld(typ, '3')) !== ziffern(a.geb) ||
      normal(feld(typ, '3o')) !== normal(a.ort) || !anschriftStimmt(typ)) return antwort('Frau Schuster: Die Angaben in Feld 1 bis 4 stimmen nicht mit der Meldebescheinigung überein.', true, true);
    var v = feld(typ, '5');
    if (!v) { R.vgnAbgelehnt = true; return antwort('Frau Schuster: Ohne Vorgangsnummer kann der Antrag nicht angenommen werden.', true, true); }
    if (normal(v).replace(/\s/g, '') !== normal(vom()).replace(/\s/g, '') || !Spiel.flag('vom')) return antwort('Frau Schuster: Diese Vorgangsnummer ist hier nicht bekannt.', true, true);
    if (!feld(typ, '6m') || !feld(typ, '6z')) return antwort('Frau Schuster: In Feld 6 sind die Anlagen nicht angekreuzt.', true, true);
    var kz = normal(feld(typ, '6k'));
    if (!kz) return antwort('Frau Schuster: Das Kassenzeichen fehlt.', true, true);
    if (kz !== 'entfällt' && !/^[-–—]+$/.test(kz)) return antwort('Frau Schuster: Dieses Kassenzeichen ist hier nicht bekannt.', true, true);
    if (!Spiel.flag('quittung') && !Spiel.flag('quittungFalsch')) return antwort('Frau Schuster: Der Zahlungsnachweis fehlt.', true, true);
    if (!Spiel.flag('quittung')) {
      var q = R.quittung, text = q && q.betragFalsch ? 'Der Betrag stimmt nicht.' : (q && HST[q.hst]) || 'Das ist bei einer anderen Haushaltsstelle gebucht.';
      return antwort('Frau Schuster: ' + text, true, true);
    }
    var f7 = normal(feld(typ, '7'));
    if (!f7) return antwort('Frau Schuster: Feld 7 ist nicht ausgefüllt. Das steht in den Ausfüllhinweisen unter Nummer 1.', true, true);
    if (/^[-–—\/.]+$/.test(f7)) return antwort('Frau Schuster: Ein Strich genügt in Feld 7 nicht. Siehe Ausfüllhinweise Nummer 5.', true, true);
    if (f7 !== 'entfällt') return antwort('Frau Schuster: Feld 7 ist nicht ordnungsgemäß ausgefüllt.', true, true);
    if (!feld(typ, '8')) return antwort('Frau Schuster: Der Antrag ist nicht unterschrieben.', true, true);
    if (Formulare.farbe(typ, '8') === 'schwarz') { unbrauchbar(typ); return antwort('Frau Schuster: Mit schwarzem Schreibmittel unterzeichnete Anträge gelten nicht als ordnungsgemäß unterzeichnet. Ausfüllhinweise Nummer 6.', true, true); }
    if (schwarz(typ)) { unbrauchbar(typ); return antwort('Frau Schuster: Der Vordruck ist mit blauem Kugelschreiber auszufüllen. Ausfüllhinweise Nummer 1.', true, true); }
    z().lfd = Math.max(0, uhr() - 420); z().termin = 0; z().terminNeg = 0;
    Spiel.setzeFlag('stempel');
    sage('Frau Schuster prüft. Sie stempelt. Sie unterschreibt.\n„Das Negativattest gilt nur in Verbindung mit einer beglaubigten Abschrift.“');
    document.dispatchEvent(new CustomEvent('negativattest'));
  }

  /* ---------- Kasse ---------- */
  function einzahlen() {
    var hst = Formulare.wert('E', 'hst').replace(/\s/g, ''), betrag = Formulare.wert('E', 'betrag');
    Spiel.vergehen(10);
    if (!kasseFenster(z().tag, uhr())) { sage('Frau Esser zieht die Jalousie herunter.'); return; }
    if (!/^\d{4}\.\d{4}$/.test(hst)) { sage('Frau Esser: Ohne vollständige Haushaltsstelle kann ich das nicht annehmen.'); return; }
    var b = parseFloat(String(betrag).replace(/[^\d,.]/g, '').replace(',', '.'));
    if (!(b > 0)) { sage('Frau Esser: Welcher Betrag?'); return; }
    var richtig = hst === '0200.1110' && Math.abs(b - 7.5) < 0.001;
    if (Spiel.flag('quittung') || Spiel.flag('quittungFalsch')) z().doppelt = Math.min(7, z().doppelt + 1);
    R.quittung = {hst: hst, betrag: b.toFixed(2).replace('.', ','), betragFalsch: hst === '0200.1110' && !richtig};
    Spiel.setzeFlag('quittung', richtig);
    Spiel.setzeFlag('quittungFalsch', !richtig);
    R.eVorhanden = false; Formulare.leeren('E');
    sage('Frau Esser: Bitte schön, Ihre Quittung.\n' + R.quittung.betrag + ' EUR · HSt. ' + hst + ' · Kassenzeichen: entfällt (Einzahlung nach Haushaltsstelle)');
  }

  /* ---------- Weg zwischen Zuhause und Rathaus ---------- */
  $('sl-weg').addEventListener('click', function () {
    if (!Spiel.laeuft) return;
    if (z().ort === 0) {
      Spiel.vergehen(15);
      z().ort = FOYER; R.draussen = !fenster(z().tag, uhr());
      Spiel.aktualisieren();
      sage(R.draussen ? 'Die Türen sind verschlossen.' : '');
      zeigen(); fokusErste();
    } else {
      heimgehen();
    }
  });

  /* ---------- Warten zu Hause ---------- */
  $('sl-warten').addEventListener('click', function () {
    if (!Spiel.laeuft || z().ort !== 0) return;
    var sel = $('dw-bis'); sel.textContent = '';
    var start = Math.ceil((uhr() + 1) / 15) * 15;
    for (var m = start; m <= 1080; m += 15) { var o = document.createElement('option'); o.value = m; o.textContent = uhrText(m) + ' Uhr'; sel.appendChild(o); }
    var morgen = document.createElement('option'); morgen.value = 'morgen'; morgen.textContent = 'bis zum nächsten Öffnungstag'; sel.appendChild(morgen);
    Rahmen.dialogOeffnen('dialog-warten');
    sel.focus();
  });
  $('dw-abbrechen').addEventListener('click', function () { Rahmen.dialogSchliessen($('dialog-warten')); });
  $('dw-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('dw-bis').value;
    Rahmen.dialogSchliessen($('dialog-warten'));
    if (v === 'morgen') Spiel.tagBeenden('Feierabend.', '');
    else Spiel.vergehen(Math.max(0, +v - uhr()));
  });

  /* ---------- Unterlagen ---------- */
  Spiel.quittung = function () { return R.quittung; };
  Unterlagen.eintragen({titel: 'Meldebescheinigung', text: 'Stadt Musterstadt, Bürgeramt', flag: 'meldebescheinigung', ansehen: Spiel.ansehenText('Meldebescheinigung', function (t, el, tabelle) {
    var a = Spiel.ausweis || {};
    t.appendChild(el('h3', 'Stadt Musterstadt · Meldebescheinigung (einfach)'));
    tabelle(t, [['Familienname', a.name || ''], ['Vornamen', a.vorname || ''], ['Geburtsdatum', a.geb || ''], ['Geburtsort', a.ort || ''], ['Anschrift', 'Ahornweg 7, 43999 Musterstadt'], ['Gebühr', '5,00 EUR']]);
  })});
  Unterlagen.eintragen({titel: 'Quittung der Stadtkasse', nurWenn: function () { return Spiel.flag('quittung') || Spiel.flag('quittungFalsch'); },
    text: function () { return R.quittung ? R.quittung.betrag + ' EUR · HSt. ' + R.quittung.hst : 'Stadtkasse Musterstadt'; },
    ansehen: Spiel.ansehenText('Quittung', function (t, el, tabelle) {
      t.appendChild(el('h3', 'Stadtkasse Musterstadt · Quittung'));
      if (!R.quittung) { t.appendChild(el('p', 'Die Quittung ist zerknittert und schwer zu lesen.')); return; }
      tabelle(t, [['Betrag', R.quittung.betrag + ' EUR, bar'], ['Haushaltsstelle', R.quittung.hst], ['Kassenzeichen', 'entfällt (Einzahlung nach Haushaltsstelle)']]);
    })});
  Unterlagen.eintragen({titel: 'Durchschrift Vordruck B-1', text: 'vorläufiges Ordnungsmerkmal', flag: 'durchschrift', ansehen: Spiel.ansehenText('Durchschrift B-1', function (t, el, tabelle) {
    t.appendChild(el('h3', 'Antrag auf vorläufige Erteilung eines Ordnungsmerkmals (Durchschrift)'));
    tabelle(t, [['Feld 7, Vermerke der Behörde', 'Vorläufiges Ordnungsmerkmal: ' + vom()]]);
  })});

  /* ---------- Spielbeginn, Fortsetzen, Tagesende ---------- */
  document.addEventListener('spielbeginn', function () {
    R = neuerZustand();
    if (Spiel.flag('epilog')) { z().ort = 0; Spiel.aktualisieren(); verlassen(); leiste(); return; }
    if (Spiel.importZeilen) window.Rathaus.importieren(Spiel.importZeilen);
    $('rh-log').textContent = '';
    if (z().ort !== 0) {
      z().ort = FOYER; R.draussen = !fenster(z().tag, uhr());
      Spiel.aktualisieren();
      sage(R.draussen ? 'Die Türen sind verschlossen.' : 'Sie stehen im Foyer.');
      zeigen();
    } else { verlassen(); leiste(); }
  });
  document.addEventListener('spielstand', function () { if (Spiel.zustand && z().ort === 0 && !$('rathaus').hidden) verlassen(); leiste(); });

  window.Rathaus = {
    exportZeilen: function () { return R.quittung ? ['Quittung: ' + R.quittung.hst + ' · ' + R.quittung.betrag + ' EUR'] : []; },
    importieren: function (zeilen) {
      zeilen.forEach(function (zl) {
        var m = /^Quittung: (\d{4}\.\d{4}) · ([\d,]+) EUR$/.exec(zl);
        if (m) R.quittung = {hst: m[1], betrag: m[2], betragFalsch: m[1] === '0200.1110' && m[2] !== '7,50'};
      });
    },
    zustand: function () { return R; }
  };
  leiste();
})();
