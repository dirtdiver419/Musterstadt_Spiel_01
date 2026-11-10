/* Behördensimulator: Formulare (Formular B, Vordruck B-1, Vordruck 17/a, Einzahlungsschein) */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var DEF = {
    B: {name: 'B', flag: 'formB', titel: 'Antrag auf Ausstellung eines Negativattestes', vordruck: 'Vordruck 17/b · Stand 03/1998',
      hinweis: 'Bitte in Druckbuchstaben mit blauem Kugelschreiber ausfüllen. Felder, die nicht zutreffen, bitte mit einem Strich versehen.',
      felder: [{id: '1', label: '1 Familienname (bei abweichendem Geburtsnamen auch dieser)'}, {id: '2', label: '2 Vorname(n)'},
        {id: '3', label: '3 Geburtsdatum (TT MM JJJJ)'}, {id: '3o', label: 'Geburtsort'},
        {id: '4s', label: '4 Anschrift: Straße, Hausnummer'}, {id: '4p', label: 'Postleitzahl'}, {id: '4o', label: 'Wohnort'},
        {id: '5', label: '5 Vorgangsnummer'},
        {id: '6m', typ: 'kreuz', label: '6 Anlagen: Meldebescheinigung (nicht älter als drei Monate)'},
        {id: '6z', typ: 'kreuz', label: 'Nachweis über die Zahlung der Verwaltungsgebühr'}, {id: '6k', label: 'Kassenzeichen'},
        {id: '7', label: '7 Nicht ausfüllen', grau: true}, {id: '8', typ: 'unterschrift', label: '8 Datum · Unterschrift der Antragstellerin / des Antragstellers (Original)'}]},
    B1: {name: 'B-1', flag: 'formB1', titel: 'Antrag auf vorläufige Erteilung eines Ordnungsmerkmals', vordruck: 'Vordruck B-1 · Stand 11/2001',
      hinweis: 'Bitte in Druckbuchstaben mit blauem Kugelschreiber ausfüllen. Einfache Ausfertigung. Nicht zutreffende Felder bitte mit einem Strich versehen.',
      felder: [{id: '1', label: '1 Familienname'}, {id: '2', label: '2 Vorname(n)'},
        {id: '4s', label: '3 Anschrift: Straße, Hausnummer'}, {id: '4p', label: 'Postleitzahl'}, {id: '4o', label: 'Wohnort'},
        {id: '4n', typ: 'kreuz', label: '4 Verfahren: Antrag auf Ausstellung eines Negativattestes (Vordruck 17/b)'}, {id: '4x', label: 'sonstiges Verfahren'},
        {id: '5a', typ: 'kreuz', label: '5 Begründung: Ein Ordnungsmerkmal liegt mir noch nicht vor.'},
        {id: '5b', typ: 'kreuz', label: 'Mein Antrag ist bei der Stadt noch nicht eingegangen.'},
        {id: '5c', typ: 'kreuz', label: 'Das Ordnungsmerkmal ist vom Verfahren abhängig, in dem es benötigt wird.'},
        {id: '7', label: '7 Nicht ausfüllen (Vermerke der Behörde)', grau: true}, {id: '8', typ: 'unterschrift', label: '8 Datum · Unterschrift (Original)'}]},
    A17: {name: '17/a', flag: 'form17a', titel: 'Antrag auf Ausstellung eines Negativattestes', vordruck: 'Vordruck 17/a · Stand 04/1991',
      hinweis: 'Nicht mehr verwenden. Ersetzt durch Vordruck 17/b (Formular B).',
      felder: [{id: '1', label: '1. Familienname'}, {id: '2', label: '2. Vorname(n)'}, {id: '3', label: '3. Geburtsdatum'}, {id: '3o', label: 'Geburtsort'},
        {id: '4s', label: '4. Anschrift'}, {id: '4p', label: '(PLZ, Ort)'},
        {id: '5m', typ: 'kreuz', label: '5. Anlagen: Meldebescheinigung'}, {id: '5g', typ: 'kreuz', label: 'Gebührenquittung der Stadtkasse'},
        {id: '8', typ: 'unterschrift', label: '(Unterschrift)'}]},
    E: {name: 'Einzahlungsschein', titel: 'Einzahlungsschein', vordruck: 'Stadtkasse Musterstadt · Vordruck K 3',
      hinweis: 'Bitte vollständig ausfüllen. Ohne Bescheid nur mit Angabe der Haushaltsstelle.',
      felder: [{id: 'ein', label: 'Einzahler/in'}, {id: 'betrag', label: 'Betrag (EUR)'}, {id: 'hst', label: 'Haushaltsstelle'}, {id: 'zweck', label: 'Verwendungszweck'}]}
  };
  var NAMEN = {B: 'B', B1: 'B-1', A17: '17/a', E: 'Einzahlungsschein'};
  var inhalt = {B: {}, B1: {}, A17: {}, E: {}};
  var offen = null;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function unterschriftSvg(farbe) {
    var ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'), p = document.createElementNS(ns, 'path');
    svg.setAttribute('viewBox', '0 0 120 30'); svg.setAttribute('width', '120'); svg.setAttribute('height', '30'); svg.setAttribute('aria-hidden', 'true');
    p.setAttribute('d', 'M4 22 C8 6 16 6 14 16 C12 24 6 24 9 18 C13 12 20 22 24 17 C28 12 30 22 34 18 C38 14 42 22 46 17 Q50 11 54 20 C58 26 64 12 70 17 C78 22 92 18 116 12');
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', farbe === 'blau' ? '#1d2f8f' : '#111111'); p.setAttribute('stroke-width', '1.6'); p.setAttribute('stroke-linecap', 'round');
    svg.appendChild(p);
    return svg;
  }

  /* ---------- Editor ---------- */
  function stift() { var r = document.querySelector('input[name="fo-stift"]:checked'); return r ? r.value : ''; }
  function zeichnen() {
    var d = DEF[offen.typ], werte = inhalt[offen.typ], box = $('fo-felder');
    $('fo-titel').textContent = d.titel; $('fo-vordruck').textContent = d.vordruck; $('fo-hinweis').textContent = d.hinweis;
    box.textContent = '';
    d.felder.forEach(function (f) {
      var w = werte[f.id], wrap, idName = 'fo-f-' + f.id.replace(/\W/g, '');
      if (f.typ === 'kreuz') {
        wrap = el('label', 'fo-feld fo-kreuz');
        var cb = el('input'); cb.type = 'checkbox'; cb.id = idName; cb.dataset.feld = f.id;
        if (w) { cb.checked = true; cb.disabled = true; } else if (!stift()) cb.disabled = true;
        wrap.appendChild(cb); wrap.appendChild(el('span', w ? 'tinte-' + w.f : '', f.label + (w ? ' ✗' : '')));
      } else if (f.typ === 'unterschrift') {
        wrap = el('div', 'fo-feld');
        wrap.appendChild(el('span', '', f.label));
        var z = el('div', 'fo-unterschrift');
        if (w) { z.appendChild(el('span', 'tinte-' + w.f, w.w)); z.appendChild(unterschriftSvg(w.f)); }
        else {
          var b = el('button', 'knopf-hell', 'Unterschreiben'); b.type = 'button'; b.id = idName; b.setAttribute('data-ui', ''); if (window.Sprache) b.lang = Sprache.an() ? 'en' : 'de';
          if (!stift()) b.disabled = true;
          b.addEventListener('click', function () {
            uebernehmen();
            werte[f.id] = {w: Spiel.datumText(Spiel.zustand.tag).slice(4), f: stift()};
            offen.geaendert = true; zeichnen();
            var n = $('fo-zu'); if (n) n.focus();
          });
          z.appendChild(b);
        }
        wrap.appendChild(z);
      } else {
        wrap = el('label', 'fo-feld' + (f.grau ? ' grau' : ''));
        wrap.appendChild(el('span', '', f.label));
        var i = el('input'); i.type = 'text'; i.id = idName; i.dataset.feld = f.id; i.maxLength = 60; i.autocomplete = 'off'; i.spellcheck = false;
        if (w) { i.value = w.w; i.readOnly = true; i.className = 'tinte-' + w.f; }
        else { i.className = 'tinte-' + (stift() || 'schwarz'); if (!stift()) i.disabled = true; }
        wrap.appendChild(i);
      }
      box.appendChild(wrap);
    });
  }
  function uebernehmen() {
    if (!offen) return;
    var werte = inhalt[offen.typ], f = stift();
    if (!f) return;
    Array.prototype.forEach.call($('fo-felder').querySelectorAll('input[data-feld]'), function (i) {
      var id = i.dataset.feld;
      if (werte[id]) return;
      if (i.type === 'checkbox' ? i.checked : i.value.trim()) {
        werte[id] = {w: i.type === 'checkbox' ? 'angekreuzt' : i.value.trim().replace(/\s+/g, ' '), f: f};
        offen.geaendert = true;
      }
    });
  }
  Array.prototype.forEach.call(document.querySelectorAll('input[name="fo-stift"]'), function (r) {
    r.addEventListener('change', function () {
      uebernehmen(); zeichnen();
      $('fo-meldung').textContent = '';
    });
  });

  function oeffnen(typ, opt) {
    offen = {typ: typ, opt: opt || {}, geaendert: false};
    var stifte = offen.opt.stifte || ['schwarz'];
    $('fo-stiftwahl').hidden = stifte.length < 2;
    $('fo-stift-fest').textContent = stifte.length < 2 ? (stifte[0] === 'blau' ? 'Sie schreiben mit dem Kugelschreiber der Kasse (blau).' : 'Sie schreiben mit Ihrem eigenen Kugelschreiber (schwarz).') : '';
    Array.prototype.forEach.call(document.querySelectorAll('input[name="fo-stift"]'), function (r) { r.checked = stifte.length < 2 && r.value === stifte[0]; });
    $('fo-ort').textContent = offen.opt.ort || 'Formular';
    $('fo-daneben').textContent = offen.opt.daneben || '';
    $('fo-meldung').textContent = stifte.length < 2 ? '' : 'Womit schreiben Sie? Bitte wählen Sie zuerst einen Kugelschreiber.';
    zeichnen();
    Spiel.schirmZeigen('panel-formular', stifte.length < 2 ? 'fo-zu' : null);
    if (stifte.length >= 2) document.querySelector('input[name="fo-stift"]').focus();
    offen.ausloeser = offen.opt.ausloeser || null;
  }
  function schliessen() {
    if (!offen) return;
    uebernehmen();
    var o = offen; offen = null;
    Spiel.schirmSchliessen('panel-formular');
    if (o.ausloeser && document.body.contains(o.ausloeser)) o.ausloeser.focus();
    if (o.opt.fertig) o.opt.fertig(o.geaendert);
  }
  $('fo-zu').addEventListener('click', schliessen);
  $('fo-blatt').addEventListener('submit', function (e) { e.preventDefault(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && offen && !document.querySelector('.dialog:not([hidden])')) schliessen(); });

  /* ---------- Schnittstelle ---------- */
  window.Formulare = {
    DEF: DEF,
    oeffnen: oeffnen,
    werte: function (typ) { return inhalt[typ]; },
    wert: function (typ, id) { var w = inhalt[typ][id]; return w ? w.w : ''; },
    farbe: function (typ, id) { var w = inhalt[typ][id]; return w ? w.f : ''; },
    leer: function (typ) { return Object.keys(inhalt[typ]).length === 0; },
    leeren: function (typ) { inhalt[typ] = {}; },
    export: function () {
      var zeilen = [];
      Object.keys(inhalt).forEach(function (typ) {
        DEF[typ].felder.forEach(function (f) {
          var w = inhalt[typ][f.id];
          if (w) zeilen.push('Formular ' + NAMEN[typ] + ', Feld ' + f.id + ': ' + String(w.w).replace(/[\r\n]+/g, ' ') + ' (' + w.f + ')');
        });
      });
      return zeilen;
    },
    importieren: function (zeilen) {
      var rueck = {};
      Object.keys(NAMEN).forEach(function (k) { rueck[NAMEN[k]] = k; });
      inhalt = {B: {}, B1: {}, A17: {}, E: {}};
      zeilen.forEach(function (z) {
        var m = /^Formular (B|B-1|17\/a|Einzahlungsschein), Feld ([0-9a-z]+): (.*) \((blau|schwarz)\)$/.exec(z);
        if (!m) return;
        var typ = rueck[m[1]];
        if (DEF[typ].felder.some(function (f) { return f.id === m[2]; })) inhalt[typ][m[2]] = {w: m[3].slice(0, 60), f: m[4]};
      });
    },
    zuruecksetzen: function () { inhalt = {B: {}, B1: {}, A17: {}, E: {}}; }
  };
  document.addEventListener('spielbeginn', function () {
    if (Spiel.importZeilen) window.Formulare.importieren(Spiel.importZeilen); else window.Formulare.zuruecksetzen();
  });
})();
