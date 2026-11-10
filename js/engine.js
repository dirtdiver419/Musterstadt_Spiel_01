/* Behördensimulator: Spielzustand, Zeit, Kalender, Aktenzeichen, Aktenauszug */
(function () {
  'use strict';

  var VERSION = 1;
  var SPIEL = '01';
  var ZEICHEN = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  var NUTZ_ZEICHEN = 28;
  /* Reihenfolge: Startwert zuerst (unverschlüsselt), danach alles mit einem daraus abgeleiteten Schlüsselstrom überlagert */
  var FELDER = [
    ['seed', 8], ['pruef', 16], ['v', 3], ['tag', 5], ['min', 10], ['ort', 3], ['flags', 24], ['termin', 11],
    ['marken', 7], ['zurueck', 6], ['brille', 2], ['brilleAb', 4], ['aufrufe', 9],
    ['puetz', 1], ['sprache', 1], ['barrierearm', 1], ['anrede', 2], ['bild', 11], ['doppelt', 3], ['lfd', 10], ['terminNeg', 1]
  ];
  var GESAMT = NUTZ_ZEICHEN * 5;
  function schluessel(seed) {
    var x = (seed * 2654435761 + 0x9e3779b9) >>> 0 || 1, k = 0n;
    for (var i = 0; i < 5; i++) {
      x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0;
      k = (k << 32n) | BigInt(x);
    }
    return k & ((1n << BigInt(GESAMT - 8)) - 1n);
  }
  var FLAGS = ['schreiben', 'meldebescheinigung', 'vom', 'durchschrift', 'quittung', 'quittungFalsch',
    'formB', 'formB1', 'hinweise', 'hhplan214', 'patroneLeer', 'terminBestaetigung', 'stempel', 'epilog', 'form17a'];
  var ORTE = ['Zuhause, Ahornweg 7', 'Neues Rathaus, Foyer', 'Foyer, Info-Theke', 'Kassenhalle, Raum 115',
    'Bürgeramt, Schalter 4', 'Erdgeschoss, Loge', 'Ordnungsamt, Raum 121', 'unterwegs'];
  var TAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var TAGE_LANG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var ANREDEN = ['ohne', 'Herr', 'Frau'];

  var $ = function (id) { return document.getElementById(id); };
  var Spiel = window.Spiel = {
    zustand: null,
    ausweis: null,
    laeuft: false,
    ORTE: ORTE,
    FLAGS: FLAGS
  };

  /* ---------- Aktenzeichen ---------- */
  function packen(z) {
    var n = 0n;
    FELDER.forEach(function (f) {
      var max = (1 << f[1]) - 1;
      var w = Math.max(0, Math.min(max, z[f[0]] | 0));
      n = (n << BigInt(f[1])) | BigInt(w);
    });
    var rest = GESAMT - FELDER.reduce(function (s, f) { return s + f[1]; }, 0);
    n = n << BigInt(rest);
    n = n ^ schluessel(z.seed & 255);
    var s = '';
    for (var i = 0; i < NUTZ_ZEICHEN; i++) { s = ZEICHEN[Number(n & 31n)] + s; n >>= 5n; }
    return s;
  }
  function entpacken(s) {
    var n = 0n;
    for (var i = 0; i < s.length; i++) n = (n << 5n) | BigInt(ZEICHEN.indexOf(s[i]));
    n = n ^ schluessel(Number(n >> BigInt(GESAMT - 8)));
    var rest = GESAMT - FELDER.reduce(function (a, f) { return a + f[1]; }, 0);
    n >>= BigInt(rest);
    var z = {};
    for (var j = FELDER.length - 1; j >= 0; j--) {
      var f = FELDER[j];
      z[f[0]] = Number(n & BigInt((1 << f[1]) - 1));
      n >>= BigInt(f[1]);
    }
    return z;
  }
  function pruefziffer(s) {
    var r = 0;
    for (var i = 0; i < s.length; i++) r = (r * 32 + ZEICHEN.indexOf(s[i])) % 97;
    return String(98 - (r * 100) % 97).padStart(2, '0');
  }
  function bloecke(s) { return s.match(/.{1,4}/g).join('-'); }

  Spiel.aktenzeichen = function (z) {
    var nutz = packen(z || Spiel.zustand), pz = pruefziffer(nutz);
    return {
      voll: 'Az. 32.1-17/b-2009 · ' + bloecke(nutz) + ' · ' + pz,
      kurz: bloecke(nutz) + '-' + pz,
      erster: nutz.slice(0, 4)
    };
  };

  /* Liest ein Aktenzeichen in jeder üblichen Schreibweise. Ergebnis: {ok, grund, zustand} */
  Spiel.leseAktenzeichen = function (eingabe) {
    var s = String(eingabe || '').toUpperCase().replace(/AZ\.?/g, ' ').replace(/32\s*\.\s*1[\s-]*17\s*\/?\s*B[\s-]*2009/g, ' ');
    var teile = s.split(/[^0-9A-Z]+/).filter(Boolean);
    if (teile.length < 2) return {ok: false, grund: 'nicht_vergeben'};
    var pz = teile.pop();
    var nutz = teile.join('').replace(/O/g, '0').replace(/[IL]/g, '1');
    if (nutz.length > NUTZ_ZEICHEN) nutz = nutz.slice(-NUTZ_ZEICHEN);
    if (!/^\d{2}$/.test(pz) || nutz.length !== NUTZ_ZEICHEN) return {ok: false, grund: 'nicht_vergeben'};
    for (var i = 0; i < nutz.length; i++) if (ZEICHEN.indexOf(nutz[i]) < 0) return {ok: false, grund: 'nicht_vergeben'};
    if (pruefziffer(nutz) !== pz) return {ok: false, grund: 'nicht_vergeben'};
    var z = entpacken(nutz);
    if (z.v !== VERSION) return {ok: false, grund: z.v < VERSION && z.v > 0 ? 'altes_recht' : 'nicht_vergeben'};
    return {ok: true, zustand: z};
  };

  /* ---------- Ausweis und Prüfsumme ---------- */
  function normal(s) { return String(s || '').trim().replace(/\s+/g, ' ').toLowerCase(); }
  Spiel.pruefsumme = function (a) {
    var s = [a.name, a.vorname, a.geb, a.ort].map(normal).join('|');
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ((h >>> 16) ^ (h & 0xffff)) & 0xffff;
  };

  var NAME_MUSTER = /^[A-Za-zÀ-ÖØ-öø-ÿĀ-žẞß][A-Za-zÀ-ÖØ-öø-ÿĀ-žẞß' -]{1,29}$/;
  Spiel.pruefeName = function (s) { return NAME_MUSTER.test(String(s).trim()) && !/^[ '-]|[ '-]{2}|[ '-]$/.test(String(s).trim()); };
  /* Datum TT.MM.JJJJ; Ergebnis {ok, alter, grund} bezogen auf den 12.10.2009 */
  Spiel.pruefeGeburtsdatum = function (s) {
    var m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(String(s).trim());
    if (!m) return {ok: false, grund: 'format'};
    var t = +m[1], mo = +m[2], j = +m[3];
    var d = new Date(Date.UTC(j, mo - 1, t));
    if (d.getUTCFullYear() !== j || d.getUTCMonth() !== mo - 1 || d.getUTCDate() !== t) return {ok: false, grund: 'format'};
    var stichtag = new Date(Date.UTC(2009, 9, 12));
    if (d > stichtag) return {ok: false, grund: 'zukunft'};
    var alter = 2009 - j - ((mo > 10 || (mo === 10 && t > 12)) ? 1 : 0);
    if (alter < 18) return {ok: false, grund: 'jung', alter: alter};
    if (alter > 105) return {ok: false, grund: 'alt', alter: alter};
    return {ok: true, alter: alter};
  };

  /* ---------- Kalender und Zeit ---------- */
  function datum(tag) { return new Date(Date.UTC(2009, 9, 12 + tag)); }
  Spiel.datumText = function (tag) {
    var d = datum(tag);
    return TAGE[d.getUTCDay()] + ', ' + String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear();
  };
  Spiel.datumLang = function (tag) {
    var d = datum(tag);
    return TAGE_LANG[d.getUTCDay()] + ', ' + String(d.getUTCDate()).padStart(2, '0') + '.' + String(d.getUTCMonth() + 1).padStart(2, '0') + '.' + d.getUTCFullYear();
  };
  Spiel.datumIso = function (tag) { return datum(tag).toISOString().slice(0, 10); };
  Spiel.wochentag = function (tag) { return datum(tag).getUTCDay(); };
  Spiel.uhr = function () { return 7 * 60 + Spiel.zustand.min; };
  Spiel.uhrText = function (minuten) {
    var m = minuten === undefined ? Spiel.uhr() : minuten;
    return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0');
  };
  Spiel.buergeramtOffen = function (tag) {
    var w = Spiel.wochentag(tag);
    return (w === 1 || w === 2 || w === 4 || w === 5) && Spiel.datumIso(tag) !== '2009-10-21';
  };
  Spiel.kasseOffen = function (tag) { var w = Spiel.wochentag(tag); return w === 1 || w === 4; };
  Spiel.naechsterOeffnungstag = function (tag) {
    var t = tag + 1;
    while (!Spiel.buergeramtOffen(t) && t < 31) t++;
    return Math.min(t, 31);
  };

  Spiel.vergehen = function (minuten) {
    if (!Spiel.zustand || !minuten) return;
    Spiel.zustand.min = Math.min(1023, Spiel.zustand.min + minuten);
    Spiel.aktualisieren();
    document.dispatchEvent(new CustomEvent('spielzeit', {detail: {uhr: Spiel.uhr()}}));
  };

  Spiel.flag = function (name) { var i = FLAGS.indexOf(name); return i >= 0 && !!(Spiel.zustand.flags & (1 << i)); };
  Spiel.setzeFlag = function (name, an) {
    var i = FLAGS.indexOf(name);
    if (i < 0) return;
    if (an === false) Spiel.zustand.flags &= ~(1 << i); else Spiel.zustand.flags |= (1 << i);
    Spiel.aktualisieren();
  };
  Spiel.ort = function (nr) { if (nr !== undefined) { Spiel.zustand.ort = nr; Spiel.aktualisieren(); } return Spiel.zustand.ort; };

  /* ---------- Anzeige und Adresse ---------- */
  Spiel.aktualisieren = function () {
    var z = Spiel.zustand;
    if (!z) return;
    $('sl-zeit').textContent = Spiel.datumText(z.tag) + ' · ' + Spiel.uhrText() + ' Uhr';
    $('sl-ort').textContent = ORTE[z.ort] || '';
    var u = Spiel.uhr();
    $('uhr').textContent = String(Math.floor(u / 60)).padStart(2, '0') + ':' + String(u % 60).padStart(2, '0');
    if (Spiel.laeuft) history.replaceState(null, '', location.pathname + location.search + '#az=' + Spiel.aktenzeichen().kurz);
    document.dispatchEvent(new CustomEvent('spielstand'));
  };

  /* ---------- Neuer Vorgang, Fortsetzen ---------- */
  Spiel.neu = function (ausweis, gestaltung) {
    Spiel.ausweis = ausweis;
    Spiel.zustand = {
      v: VERSION, tag: 0, min: 30, ort: 0, flags: 0, termin: 0, marken: 0, zurueck: 0,
      brille: 0, brilleAb: 0, aufrufe: 0, puetz: 0,
      sprache: gestaltung.sprache ? 1 : 0, barrierearm: gestaltung.barrierearm ? 1 : 0,
      seed: Math.floor(Math.random() * 256), pruef: Spiel.pruefsumme(ausweis),
      anrede: gestaltung.anrede | 0, bild: gestaltung.bild | 0, doppelt: 0, lfd: 0, terminNeg: 0
    };
    Spiel.starten(true);
  };
  Spiel.fortsetzen = function (zustand, ausweis) {
    Spiel.zustand = zustand;
    Spiel.ausweis = ausweis;
    Spiel.starten();
  };
  Spiel.starten = function (neu) {
    Spiel.laeuft = true;
    Spiel.aktualisieren();
    document.dispatchEvent(new CustomEvent('spielbeginn', {detail: {neu: !!neu}}));
  };

  /* ---------- Tagesende ---------- */
  Spiel.tagBeenden = function (titel, text) {
    var z = Spiel.zustand;
    var kopf = Spiel.datumLang(z.tag) + ' · ' + Spiel.uhrText() + ' Uhr';
    var naechster = Spiel.naechsterOeffnungstag(z.tag);
    z.tag = naechster; z.min = 30; z.ort = 0; z.brille = 0;
    z.flags &= ~(1 << FLAGS.indexOf('patroneLeer'));
    Spiel.aktualisieren();
    $('te-kopf').textContent = kopf;
    $('te-titel').textContent = titel;
    $('te-text').textContent = text || '';
    $('te-az').textContent = Spiel.aktenzeichen().voll;
    $('te-weiter-text').textContent = 'Weiter am ' + Spiel.datumLang(naechster) + ', 7:30 Uhr.';
    Spiel.schirmZeigen('schirm-tagesende', 'te-weiter');
  };

  /* ---------- Schirme: der Rest des Rechners ist währenddessen gesperrt ---------- */
  var HINTERGRUND = ['spielleiste', 'schreibtisch', 'taskleiste', 'rathaus'];
  Spiel.schirmZeigen = function (id, fokusId) {
    HINTERGRUND.forEach(function (h) { $(h).inert = true; });
    $(id).hidden = false;
    var f = fokusId ? $(fokusId) : $(id).querySelector('input, button, textarea, select');
    if (f) f.focus();
  };
  Spiel.schirmSchliessen = function (id) {
    $(id).hidden = true;
    if (!document.querySelector('.schirm:not([hidden]), .panel:not([hidden])')) HINTERGRUND.forEach(function (h) { $(h).inert = false; });
  };
  $('te-weiter').addEventListener('click', function () { Spiel.schirmSchliessen('schirm-tagesende'); });

  /* ---------- Aktenauszug (Speicherdatei) ---------- */
  var KOPF = 'MUSTERSTADT-AKTENAUSZUG · Spiel ' + SPIEL + ' · Format 1';
  Spiel.aktenauszug = function () {
    var z = Spiel.zustand, a = Spiel.ausweis || {}, az = Spiel.aktenzeichen();
    var notiz = ($('u-notiz').value || '').replace(/\r/g, '').split('\n');
    var zeilen = [
      KOPF,
      'Stadt Musterstadt · Der Bürgermeister · Bürgeramt',
      '',
      'Aktenzeichen: ' + az.voll,
      'Stand: ' + Spiel.datumText(z.tag) + ', ' + Spiel.uhrText() + ' Uhr',
      'Ort: ' + ORTES(z.ort),
      '',
      'Familienname: ' + (a.name || ''),
      'Vorname: ' + (a.vorname || ''),
      'Geburtsdatum: ' + (a.geb || ''),
      'Geburtsort: ' + (a.ort || ''),
      'Anrede: ' + ANREDEN[z.anrede],
      ''
    ];
    var zusatz = (window.Formulare ? Formulare.export() : []).concat(window.Rathaus ? Rathaus.exportZeilen() : []);
    if (zusatz.length) zeilen = zeilen.concat(zusatz, ['']);
    zeilen.push('Notizzettel:');
    notiz.forEach(function (n) { zeilen.push('  | ' + n); });
    zeilen.push('', 'Ende des Aktenauszugs.', '');
    return zeilen.join('\r\n');
  };
  function ORTES(n) { return ORTE[n] || ''; }

  Spiel.dateiname = function () {
    var z = Spiel.zustand, u = Spiel.uhr();
    return 'Musterstadt_Spiel-' + SPIEL + '_Aktenauszug_' + Spiel.aktenzeichen().erster + '_' + Spiel.datumIso(z.tag) + '_' +
      String(Math.floor(u / 60)).padStart(2, '0') + String(u % 60).padStart(2, '0') + '.txt';
  };

  Spiel.herunterladen = function () {
    var blob = new Blob([Spiel.aktenauszug()], {type: 'text/plain;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = Spiel.dateiname();
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  /* Ergebnis: {ok, grund, zustand, ausweis, notiz, spiel} */
  Spiel.leseAktenauszug = function (text) {
    var zeilen = String(text).replace(/^﻿/, '').split(/\r?\n/);
    var kopf = /^MUSTERSTADT-AKTENAUSZUG · Spiel (\d{2}) · Format (\d+)$/.exec(zeilen[0] || '');
    if (!kopf) return {ok: false, grund: 'keine_akte'};
    if (kopf[1] !== SPIEL) return {ok: false, grund: 'anderes_spiel', spiel: kopf[1]};
    var werte = {}, notiz = [], inNotiz = false;
    zeilen.slice(1).forEach(function (z) {
      if (inNotiz) { if (z.indexOf('  | ') === 0) { notiz.push(z.slice(4)); return; } inNotiz = false; }
      var m = /^([A-Za-zäöüÄÖÜß]+): ?(.*)$/.exec(z);
      if (!m) return;
      if (m[1] === 'Notizzettel') { inNotiz = true; return; }
      if (['Aktenzeichen', 'Familienname', 'Vorname', 'Geburtsdatum', 'Geburtsort'].indexOf(m[1]) >= 0) werte[m[1]] = m[2].slice(0, 200);
    });
    var az = Spiel.leseAktenzeichen(werte.Aktenzeichen);
    if (!az.ok) return {ok: false, grund: az.grund};
    var ausweis = {name: werte.Familienname || '', vorname: werte.Vorname || '', geb: werte.Geburtsdatum || '', ort: werte.Geburtsort || ''};
    if (Spiel.pruefsumme(ausweis) !== az.zustand.pruef) return {ok: false, grund: 'anderer_vorgang'};
    return {ok: true, zustand: az.zustand, ausweis: ausweis, notiz: notiz.join('\n').slice(0, 4000), zeilen: zeilen.slice(0, 200)};
  };

  Spiel.MELDUNGEN = {
    nicht_vergeben: 'Das angegebene Aktenzeichen ist nicht vergeben.',
    anderer_vorgang: 'Das angegebene Aktenzeichen ist einem anderen Vorgang zugeordnet.',
    altes_recht: 'Das Verfahren wurde nach altem Recht begonnen und wird nach altem Recht fortgeführt.',
    keine_akte: 'Bei der eingereichten Datei handelt es sich nicht um einen Aktenauszug.',
    anderes_spiel: 'Diese Akte gehört zu einem anderen Verfahren (Spiel %s).',
    zu_gross: 'Die eingereichte Akte überschreitet den zulässigen Umfang.'
  };

  /* ---------- Zeit für Tätigkeiten am heimischen Rechner ---------- */
  var KTS_KOSTEN = {portal_geladen: 1, behoerde_gewaehlt: 1, dienst_gewaehlt: 1, zurueck: 1, slot_gewaehlt: 1, gebucht: 1, bestaetigung_angezeigt: 1};
  function amRechner() { return Spiel.laeuft && Spiel.zustand && Spiel.zustand.ort === 0; }
  document.addEventListener('website', function (e) {
    if (!amRechner()) return;
    var d = e.detail;
    if (d.typ === 'seitenaufruf' || d.typ === 'fehler404') {
      Spiel.zustand.aufrufe = Math.min(511, Spiel.zustand.aufrufe + 1);
      Spiel.vergehen(1);
    } else if (d.typ === 'pdf' && window.Rahmen && Rahmen.telefon) {
      Spiel.vergehen(/haushaltsplan-2009\.pdf/.test(d.ziel || '') ? 12 : 5);
    } else if (d.quelle === 'termin' && KTS_KOSTEN[d.typ]) {
      Spiel.vergehen(KTS_KOSTEN[d.typ]);
    }
  });
  document.addEventListener('seitegeladen', function (e) {
    if (!amRechner()) return;
    var href = e.detail.href || '';
    if (/\.pdf($|[?#])/i.test(href)) Spiel.vergehen(/haushaltsplan-2009\.pdf/.test(href) ? 12 : 5);
    else if (e.detail.fehlerseite) Spiel.vergehen(1);
  });
})();
