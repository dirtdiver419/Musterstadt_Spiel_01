/* Behördensimulator: Zuhause (Schreiben, Drucker, Terminserver, Ausdrucke) */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var BASIS = new URL('../musterstadt/', location.href).href;
  var PATRONE_SEITEN = 140;
  var sonstige = [];
  var letzteBestaetigung = null;
  var termin = null;

  /* ---------- Hilfen für Panels ---------- */
  var zurueckFokus = {};
  function panelAuf(id, fokus, ausloeser) { zurueckFokus[id] = ausloeser || document.activeElement; Spiel.schirmZeigen(id, fokus); }
  function panelZu(id) {
    Spiel.schirmSchliessen(id);
    var f = zurueckFokus[id];
    if (f && f.focus && document.body.contains(f) && !f.closest('[hidden]')) f.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('panel-ansicht').hidden) panelZu('panel-ansicht');
    else if (!$('panel-schreiben').hidden) panelZu('panel-schreiben');
  });

  /* ---------- Schreiben des Ordnungsamtes ---------- */
  function schreibenOeffnen(ausloeser) {
    var a = Spiel.ausweis || {}, z = Spiel.zustand;
    $('sb-anrede').textContent = z.anrede === 1 ? 'Herrn ' : z.anrede === 2 ? 'Frau ' : '';
    $('sb-name').textContent = [a.vorname, a.name].filter(Boolean).join(' ');
    if (!Spiel.flag('schreiben')) Spiel.setzeFlag('schreiben');
    panelAuf('panel-schreiben', 'sb-zu', ausloeser);
  }
  $('sl-schreiben').addEventListener('click', function () { if (Spiel.laeuft) schreibenOeffnen(this); });
  $('sb-zu').addEventListener('click', function () { panelZu('panel-schreiben'); });
  document.addEventListener('spielbeginn', function (e) {
    termin = terminAusZustand();
    if (e.detail && e.detail.neu) schreibenOeffnen($('adresse'));
  });

  /* ---------- Ansicht von Unterlagen ---------- */
  function ansehenPdf(titel, datei, seite) {
    return function (ausloeser) {
      var url = BASIS + 'pdf/' + datei + (seite ? '#page=' + seite : '');
      if (Rahmen.telefon) { window.open(url, '_blank', 'noopener'); return; }
      $('an-titel').textContent = titel;
      $('an-text').hidden = true;
      var r = $('an-rahmen'); r.hidden = false; r.title = titel; r.src = url;
      panelAuf('panel-ansicht', 'an-zu', ausloeser);
    };
  }
  function ansehenText(titel, bauen) {
    return function (ausloeser) {
      $('an-titel').textContent = titel;
      $('an-rahmen').hidden = true; $('an-rahmen').removeAttribute('src');
      var t = $('an-text'); t.textContent = ''; bauen(t, el, tabelle); t.hidden = false;
      panelAuf('panel-ansicht', 'an-zu', ausloeser);
    };
  }
  $('an-zu').addEventListener('click', function () { panelZu('panel-ansicht'); $('an-rahmen').removeAttribute('src'); });

  function el(tag, text) { var e = document.createElement(tag); if (text !== undefined) e.textContent = text; return e; }
  function tabelle(ziel, zeilen) {
    var t = el('table');
    zeilen.forEach(function (z) { var tr = el('tr'); tr.appendChild(el('td', z[0])); var td = el('td'); td.appendChild(el('strong', z[1])); tr.appendChild(td); t.appendChild(tr); });
    ziel.appendChild(t);
  }

  Unterlagen.eintragen({titel: 'Personalausweis', text: 'gültig bis 17.03.2015', ansehen: ansehenText('Personalausweis', function (t) {
    var a = Spiel.ausweis || {};
    t.appendChild(el('h3', 'Personalausweis'));
    tabelle(t, [['Name', (a.name || '').toUpperCase()], ['Vornamen', a.vorname || ''], ['Geburtstag', a.geb || ''], ['Geburtsort', a.ort || ''],
      ['Staatsangehörigkeit', 'DEUTSCH'], ['Anschrift', 'AHORNWEG 7, 43999 MUSTERSTADT'], ['Gültig bis', '17.03.2015']]);
  })});
  Unterlagen.eintragen({titel: 'Schreiben Ordnungsamt', text: 'vom 09.10.2009', flag: 'schreiben', ansehen: schreibenOeffnen});
  function formular(typ, titel, flag) {
    Unterlagen.eintragen({titel: titel, flag: flag, text: function () { return Formulare.leer(typ) ? 'leer' : 'ausgefüllt'; }, ansehen: function (ausloeser) {
      Formulare.oeffnen(typ, {stifte: ['schwarz'], ort: Spiel.zustand.ort === 0 ? 'Küchentisch' : 'Meine Unterlagen', ausloeser: ausloeser, fertig: function (geaendert) {
        if (geaendert) Spiel.vergehen(5);
        Unterlagen.neu();
      }});
    }});
  }
  formular('B', 'Formular B (Vordruck 17/b)', 'formB');
  formular('B1', 'Vordruck B-1', 'formB1');
  formular('A17', 'Vordruck 17/a', 'form17a');
  Unterlagen.eintragen({titel: 'Ausfüllhinweise B-H', text: 'gedruckt', flag: 'hinweise', ansehen: ansehenPdf('Ausfüllhinweise (Vordruck B-H)', 'ausfuellhinweise-b.pdf')});
  Unterlagen.eintragen({titel: 'Haushaltsplan 2009', text: 'Seite 214, gedruckt', flag: 'hhplan214', ansehen: ansehenPdf('Haushaltsplan 2009, Seite 214', 'haushaltsplan-2009.pdf', 214)});
  Unterlagen.eintragen({titel: 'Terminbestätigung (KTS)', flag: 'terminBestaetigung',
    text: function () { return termin ? Spiel.datumText(termin.tag) + ', ' + termin.zeit + ' Uhr' : 'gedruckt'; },
    ansehen: ansehenText('Terminbestätigung', function (t) {
      t.appendChild(el('h3', 'Kommunaler Terminserver · Terminbestätigung'));
      if (!termin) { t.appendChild(el('p', 'Der Ausdruck ist nicht mehr lesbar.')); return; }
      tabelle(t, [['Buchungsnummer', termin.nummer], ['Behörde', 'Stadt Musterstadt – Bürgeramt'], ['Dienstleistung', termin.negativ ? 'Negativattest (allgemein)' : 'andere Dienstleistung'],
        ['Datum', Spiel.datumLang(termin.tag)], ['Uhrzeit', termin.zeit + ' Uhr'], ['Ort', 'Neues Rathaus, Erdgeschoss, Schalter 1–6']]);
    })});
  Unterlagen.eintragen({titel: 'Weitere Ausdrucke', text: function () { return sonstige.join(' · '); },
    flag: null, nurWenn: function () { return sonstige.length > 0; }});

  /* ---------- Termin (Kommunaler Terminserver) ---------- */
  function tagIndex(iso) { return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.UTC(2009, 9, 12)) / 86400000); }
  function ktsPruefziffer(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 97; return ('0' + h).slice(-2); }
  function nummerBauen(tag, zeit, lfd) {
    var iso = Spiel.datumIso(tag);
    var kern = 'BA-' + iso.slice(2).replace(/-/g, '') + '-' + zeit.replace(':', '') + '-' + lfd;
    return kern + '-' + ktsPruefziffer(kern);
  }
  function terminAusZustand() {
    var z = Spiel.zustand;
    if (!z || !z.termin) return null;
    var tag = z.termin >> 6, slot = (z.termin & 63) - 1, m = 480 + slot * 15;
    var zeit = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
    return {tag: tag, zeit: zeit, nummer: nummerBauen(tag, zeit, z.lfd), negativ: !!z.terminNeg};
  }
  Spiel.termin = function () { return termin; };
  Spiel.ansehenText = ansehenText;

  document.addEventListener('website', function (e) {
    var d = e.detail;
    if (d.quelle !== 'termin' || !Spiel.laeuft) return;
    var z = Spiel.zustand;
    if (d.typ === 'portal_geladen') {
      Rahmen.sende({befehl: 'datum', datum: Spiel.datumIso(z.tag)});
      if (z.barrierearm) Rahmen.sende({befehl: 'zeitfenster', ms: 0});
      if (z.sprache) Rahmen.sende({befehl: 'sprache', L: 'en'});
    } else if (d.typ === 'dienst_gewaehlt' && d.behoerde === 'ms-ba' && d.dienst === 'negativ') {
      heutigenTerminAnbieten();
    } else if (d.typ === 'gebucht' && d.behoerde === 'ms-ba') {
      var m = /^BA-\d{6}-(\d{2})(\d{2})-(\d{3})-\d{2}$/.exec(d.buchungsnummer || '');
      var tag = tagIndex(d.datum), min = m ? (+m[1]) * 60 + (+m[2]) : 0;
      if (m && tag >= 0 && tag <= 31 && min >= 480) {
        z.termin = (tag << 6) | ((min - 480) / 15 + 1);
        z.lfd = +m[3]; z.terminNeg = d.dienst === 'negativ' ? 1 : 0;
        Spiel.setzeFlag('terminBestaetigung', false);
        termin = terminAusZustand();
      }
    } else if (d.typ === 'bestaetigung_angezeigt') {
      letzteBestaetigung = d;
    } else if (d.typ === 'storniert') {
      z.termin = 0; z.lfd = 0; z.terminNeg = 0; termin = null;
      Spiel.setzeFlag('terminBestaetigung', false);
    }
  });

  /* Am selben Tag erscheint einmal ein freier Termin am Vormittag, abhängig vom Startwert */
  function heutigenTerminAnbieten() {
    var z = Spiel.zustand;
    if (!Spiel.buergeramtOffen(z.tag) || Spiel.wochentag(z.tag) === 4) return;
    var auswahl = ['11:00', '11:15', '11:15', '11:00'], start = z.seed % 4, jetzt = Spiel.uhr();
    for (var i = 0; i < 4; i++) {
      var zeit = auswahl[(start + i) % 4], p = zeit.split(':'), m = (+p[0]) * 60 + (+p[1]);
      if (m >= jetzt + 45) {
        Rahmen.sende({befehl: 'slot', datum: Spiel.datumIso(z.tag), zeit: zeit, nachMs: 3000 + (z.seed % 5) * 1000, dauerMs: z.barrierearm ? 0 : 4000});
        return;
      }
    }
  }

  /* ---------- Drucken ---------- */
  var auftrag = null;
  function seitenZaehlen(url) {
    if (/haushaltsplan-2009\.pdf/.test(url)) return Promise.resolve(214);
    return fetch(url.split('#')[0]).then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
      var text = new TextDecoder('latin1').decode(new Uint8Array(buf));
      var n = (text.match(/\/Type\s*\/Page(?![s\w])/g) || []).length;
      return n || 1;
    }).catch(function () { return 1; });
  }
  function dauer(n) { return 3 + Math.round((n - 1) * 0.41); }
  function seitenLesen(text, max) {
    var seiten = [];
    String(text).split(/[,;]/).forEach(function (teil) {
      var m = /^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/.exec(teil);
      if (!m) return;
      var a = +m[1], b = m[2] ? +m[2] : a;
      for (var i = Math.min(a, b); i <= Math.max(a, b) && i <= max; i++) if (i >= 1 && seiten.indexOf(i) < 0) seiten.push(i);
    });
    return seiten.sort(function (x, y) { return x - y; });
  }
  function gewaehlteSeiten() {
    if (!auftrag) return [];
    if (document.querySelector('input[name="dr-bereich"]:checked').value === 'alle') {
      var alle = []; for (var i = 1; i <= auftrag.seiten; i++) alle.push(i); return alle;
    }
    return seitenLesen($('dr-seiten').value, auftrag.seiten);
  }
  function anzeigeErneuern() {
    if (!auftrag) return;
    var s = gewaehlteSeiten();
    $('dr-seitenzahl').textContent = auftrag.seiten + (auftrag.seiten === 1 ? ' Seite' : ' Seiten');
    $('dr-dauer').textContent = s.length ? 'ca. ' + dauer(s.length) + ' Minuten' : '–';
    $('dr-patrone').textContent = Spiel.flag('patroneLeer') ? 'leer' : 'Schwarz, reicht für ca. ' + PATRONE_SEITEN + ' Seiten';
  }
  ['dr-seiten'].forEach(function (id) { $(id).addEventListener('input', function () { document.querySelector('input[name="dr-bereich"][value="seiten"]').checked = true; anzeigeErneuern(); }); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="dr-bereich"]'), function (r) { r.addEventListener('change', anzeigeErneuern); });

  document.addEventListener('drucken', function () {
    if (!Spiel.laeuft || Spiel.zustand.ort !== 0 || $('fenster').hidden) return;
    var href = Rahmen.adresse();
    if (!href || href.indexOf(BASIS) !== 0) return;
    var pdf = /\.pdf($|[?#])/i.test(href);
    var datei = pdf ? decodeURIComponent(href.split(/[?#]/)[0].split('/').pop()) : '';
    var kts = !pdf && /\/termin\//.test(href) && /[?&]b=/.test(href) && letzteBestaetigung;
    auftrag = {href: href, pdf: pdf, datei: datei, kts: !!kts, titel: pdf ? datei : (Rahmen.titel() || 'Internetseite'), seiten: 1};
    $('dr-dokument').textContent = auftrag.titel;
    $('dr-meldung').textContent = '';
    $('dr-seiten').value = '';
    document.querySelector('input[name="dr-bereich"][value="alle"]').checked = true;
    $('dr-los').disabled = false;
    anzeigeErneuern();
    Rahmen.dialogOeffnen('dialog-drucken');
    if (pdf) {
      $('dr-seitenzahl').textContent = 'Seiten werden gezählt …';
      var dieser = auftrag;
      seitenZaehlen(href).then(function (n) { if (auftrag === dieser) { auftrag.seiten = n; anzeigeErneuern(); } });
    }
  });
  $('dr-abbrechen').addEventListener('click', function () { Rahmen.dialogSchliessen($('dialog-drucken')); });

  var PDF_FLAGS = {'formular-b.pdf': 'formB', 'formular-b-1.pdf': 'formB1', 'ausfuellhinweise-b.pdf': 'hinweise', 'formular-17a.pdf': 'form17a'};
  $('dr-form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!auftrag) return;
    if (Spiel.flag('patroneLeer')) { $('dr-meldung').textContent = 'Die Druckerpatrone ist leer.'; return; }
    var seiten = gewaehlteSeiten();
    if (!seiten.length) { $('dr-meldung').textContent = 'Bitte geben Sie einen gültigen Seitenbereich an.'; return; }
    var gedruckt = seiten.slice(0, PATRONE_SEITEN), leer = seiten.length > PATRONE_SEITEN;
    Spiel.vergehen(dauer(gedruckt.length));
    if (auftrag.pdf && PDF_FLAGS[auftrag.datei]) Spiel.setzeFlag(PDF_FLAGS[auftrag.datei]);
    else if (auftrag.pdf && auftrag.datei === 'haushaltsplan-2009.pdf') { if (gedruckt.indexOf(214) >= 0) Spiel.setzeFlag('hhplan214'); }
    else if (auftrag.kts && termin) Spiel.setzeFlag('terminBestaetigung');
    else if (sonstige.indexOf(auftrag.titel) < 0) sonstige.push(auftrag.titel);
    if (leer) {
      Spiel.setzeFlag('patroneLeer');
      $('dr-meldung').textContent = 'Druck abgebrochen: Die Druckerpatrone ist leer. Gedruckt wurden ' + PATRONE_SEITEN + ' Seiten.';
      $('dr-los').disabled = true;
      auftrag = null;
      return;
    }
    $('status').textContent = 'Druckauftrag abgeschlossen';
    auftrag = null;
    Rahmen.dialogSchliessen($('dialog-drucken'));
    Unterlagen.neu();
  });
})();
