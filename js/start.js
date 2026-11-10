/* Behördensimulator: Personalausweis, Wiederaufnahme, Akte einreichen */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var HAUT = ['#f4d3b5', '#e2b48c', '#c99068', '#a8714c', '#7d4f33', '#553422'];
  var HAAR = ['#6b4628', '#1f1a17', '#d9b25a', '#a8461f', '#8f8f8f', '#e8e6e0'];
  var modus = 'neu', wartend = null, stempelZusatz = '';

  /* ---------- Passbild ---------- */
  var bild = {haut: 1, frisur: 0, haar: 0, brille: 0, bart: 0};
  function bildCode() { return bild.haut | (bild.frisur << 3) | (bild.haar << 6) | (bild.brille << 9) | (bild.bart << 10); }
  function bildAusCode(c) {
    bild = {haut: Math.min(5, c & 7), frisur: (c >> 3) & 7, haar: Math.min(5, (c >> 6) & 7), brille: (c >> 9) & 1, bart: (c >> 10) & 1};
  }
  function bildZeichnen() {
    var svg = document.querySelector('.passbild');
    Array.prototype.forEach.call(svg.querySelectorAll('.haut'), function (e) { e.setAttribute('fill', HAUT[bild.haut]); });
    Array.prototype.forEach.call(svg.querySelectorAll('.haar'), function (e) { e.setAttribute('fill', HAAR[bild.haar]); });
    Array.prototype.forEach.call(svg.querySelectorAll('.frisur'), function (g) { g.style.display = +g.dataset.f === bild.frisur ? '' : 'none'; });
    $('pb-brille').style.display = bild.brille ? '' : 'none';
    $('pb-bart').style.display = bild.bart ? '' : 'none';
    Array.prototype.forEach.call($('aw-haut').children, function (b, i) { b.setAttribute('aria-checked', i === bild.haut ? 'true' : 'false'); b.tabIndex = i === bild.haut ? 0 : -1; });
    $('aw-frisur').value = bild.frisur; $('aw-haarfarbe').value = bild.haar;
    $('aw-brille').checked = !!bild.brille; $('aw-bart').checked = !!bild.bart;
  }
  HAUT.forEach(function (farbe, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('aria-label', 'Hautton ' + (i + 1));
    b.style.background = farbe;
    b.addEventListener('click', function () { bild.haut = i; bildZeichnen(); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      bild.haut = (bild.haut + d + HAUT.length) % HAUT.length; bildZeichnen();
      $('aw-haut').children[bild.haut].focus();
    });
    $('aw-haut').appendChild(b);
  });
  $('aw-frisur').addEventListener('change', function () { bild.frisur = +this.value; bildZeichnen(); });
  $('aw-haarfarbe').addEventListener('change', function () { bild.haar = +this.value; bildZeichnen(); });
  $('aw-brille').addEventListener('change', function () { bild.brille = this.checked ? 1 : 0; bildZeichnen(); });
  $('aw-bart').addEventListener('change', function () { bild.bart = this.checked ? 1 : 0; bildZeichnen(); });
  $('aw-zufall').addEventListener('click', function () {
    var r = function (n) { return Math.floor(Math.random() * n); };
    bild = {haut: r(6), frisur: r(8), haar: r(6), brille: r(2), bart: r(4) === 0 ? 1 : 0};
    bildZeichnen();
  });

  /* ---------- Ausweisangaben ---------- */
  function angaben(p) {
    return {name: $(p + '-name').value.trim().replace(/\s+/g, ' '), vorname: $(p + '-vorname').value.trim().replace(/\s+/g, ' '),
      geb: $(p + '-geb').value.trim(), ort: $(p + '-ort').value.trim().replace(/\s+/g, ' ')};
  }
  function vorschau() {
    var a = angaben('aw');
    $('aw-a-name').textContent = a.name ? a.name.toUpperCase() : '–';
    $('aw-a-vorname').textContent = a.vorname || '–';
    $('aw-a-geb').textContent = a.geb || '–';
    $('aw-a-ort').textContent = a.ort || '–';
    var g = Spiel.pruefeGeburtsdatum(a.geb);
    $('aw-alter').textContent = 'Alter am 12.10.2009: ' + (g.alter !== undefined && g.grund !== 'format' && g.grund !== 'zukunft' ? g.alter + ' Jahre' : '–');
  }
  ['aw-name', 'aw-vorname', 'aw-geb', 'aw-ort'].forEach(function (id) { $(id).addEventListener('input', vorschau); });

  /* Prüft die Angaben; liefert eine Meldung oder '' */
  function pruefen(p) {
    var a = angaben(p), felder = [[p + '-name', a.name], [p + '-vorname', a.vorname], [p + '-ort', a.ort]];
    var meldung = '';
    ['-name', '-vorname', '-geb', '-ort'].forEach(function (s) { $(p + s).removeAttribute('aria-invalid'); });
    felder.forEach(function (f) {
      if (!meldung && !Spiel.pruefeName(f[1])) { meldung = 'Bitte prüfen Sie die Angabe „' + $(f[0]).parentNode.firstChild.textContent.trim() + '“.'; $(f[0]).setAttribute('aria-invalid', 'true'); }
    });
    if (meldung) return meldung;
    var g = Spiel.pruefeGeburtsdatum(a.geb);
    if (!g.ok) {
      $(p + '-geb').setAttribute('aria-invalid', 'true');
      return {format: 'Bitte geben Sie das Geburtsdatum im Format TT.MM.JJJJ an.', zukunft: 'Das Geburtsdatum liegt in der Zukunft.',
        jung: 'Die antragstellende Person muss handlungsfähig sein (§ 12 VwVfG).', alt: 'Bitte überprüfen Sie das Geburtsdatum.'}[g.grund];
    }
    return '';
  }

  /* ---------- Ausweisschirm: neuer Vorgang oder Ausweisen beim Fortsetzen ---------- */
  function modusSetzen(m, zustand, meldung) {
    modus = m; wartend = zustand || null;
    var ausweisen = m === 'ausweisen';
    $('aw-titel').textContent = ausweisen ? 'Bitte weisen Sie sich aus.' : 'Behördensimulator';
    $('aw-untertitel').textContent = ausweisen ? 'Das ruhende Verfahren kann nach Prüfung Ihrer Angaben fortgesetzt werden.' : 'Spiel 1: Antrag auf Ausstellung eines Negativattestes';
    $('aw-gestaltung').hidden = ausweisen;
    $('aw-los').textContent = ausweisen ? 'Ausweisen' : 'Vorgang eröffnen';
    $('aw-zu-w').hidden = ausweisen;
    $('aw-neu').hidden = !ausweisen;
    if (ausweisen) bildAusCode(zustand.bild);
    if (ausweisen && window.Sprache) Sprache.setzen(!!zustand.sprache);
    bildZeichnen();
    $('aw-meldung').textContent = meldung || '';
    Spiel.schirmSchliessen('schirm-w');
    Spiel.schirmZeigen('schirm-ausweis', 'aw-name');
  }

  $('aw-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var m = pruefen('aw');
    if (m) { $('aw-meldung').textContent = m; return; }
    var a = angaben('aw');
    if (modus === 'ausweisen') {
      if (Spiel.pruefsumme(a) !== wartend.pruef) { $('aw-meldung').textContent = Spiel.MELDUNGEN.anderer_vorgang; return; }
      stempeln(wartend, a, '');
      return;
    }
    var anrede = +document.querySelector('input[name="aw-anrede"]:checked').value;
    Spiel.schirmSchliessen('schirm-ausweis');
    Spiel.neu(a, {anrede: anrede, bild: bildCode(), sprache: $('aw-englisch').checked, barrierearm: $('aw-barrierearm').checked});
    var adr = $('adresse'); if (adr) adr.focus();
  });
  $('aw-zu-w').addEventListener('click', function () {
    $('w-meldung').textContent = '';
    Spiel.schirmSchliessen('schirm-ausweis');
    Spiel.schirmZeigen('schirm-w', 'w-az');
  });
  $('aw-neu').addEventListener('click', function () { history.replaceState(null, '', location.pathname + location.search); modusSetzen('neu'); });
  $('w-zurueck').addEventListener('click', function () { modusSetzen('neu'); });

  /* ---------- Vordruck W ---------- */
  $('w-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var az = Spiel.leseAktenzeichen($('w-az').value);
    if (!az.ok) { $('w-meldung').textContent = Spiel.MELDUNGEN[az.grund]; return; }
    var m = pruefen('w');
    if (m) { $('w-meldung').textContent = m; return; }
    var a = angaben('w');
    if (Spiel.pruefsumme(a) !== az.zustand.pruef) { $('w-meldung').textContent = Spiel.MELDUNGEN.anderer_vorgang; return; }
    stempeln(az.zustand, a, $('w-nicht').value.trim() ? '' : 'Feld nicht ausgefüllt, ausnahmsweise bearbeitet');
  });

  /* ---------- Akte einreichen ---------- */
  var datei = $('akte-datei'), meldungsZiel = 'aw-meldung';
  Array.prototype.forEach.call(document.querySelectorAll('.akte-einreichen'), function (b) {
    b.addEventListener('click', function () { meldungsZiel = b.closest('#schirm-w') ? 'w-meldung' : 'aw-meldung'; datei.value = ''; datei.click(); });
  });
  datei.addEventListener('change', function () {
    var f = datei.files && datei.files[0];
    if (!f) return;
    if (f.size > 16384) { $(meldungsZiel).textContent = Spiel.MELDUNGEN.zu_gross; return; }
    var leser = new FileReader();
    leser.onload = function () {
      var r = Spiel.leseAktenauszug(leser.result);
      if (!r.ok) { $(meldungsZiel).textContent = Spiel.MELDUNGEN[r.grund].replace('%s', r.spiel || ''); return; }
      $('u-notiz').value = r.notiz;
      stempeln(r.zustand, r.ausweis, '', r.zeilen);
    };
    leser.readAsText(f, 'utf-8');
  });

  /* ---------- Stempel „Das ruhende Verfahren wird wieder aufgenommen“ ---------- */
  function stempeln(zustand, ausweis, zusatz, zeilen) {
    wartend = zustand;
    stempelZusatz = zusatz;
    $('st-text').firstChild.textContent = 'Das ruhende Verfahren wird wieder aufgenommen' + (zusatz ? ' · ' + zusatz : '');
    Spiel.schirmSchliessen('schirm-ausweis');
    Spiel.schirmSchliessen('schirm-w');
    Spiel.schirmZeigen('schirm-stempel', 'st-weiter');
    $('st-weiter').onclick = function () {
      Spiel.schirmSchliessen('schirm-stempel');
      Spiel.importZeilen = zeilen || null;
      Spiel.fortsetzen(zustand, ausweis);
      Spiel.importZeilen = null;
      var adr = $('adresse'); if (adr) adr.focus();
    };
  }

  /* ---------- Beim Laden ---------- */
  var h = /[#&]az=([^&]+)/.exec(location.hash);
  if (/[?&]bescheid=/.test(location.search)) {
    /* Bescheid-Seite: kein Spielbeginn */
  } else if (h) {
    var r = Spiel.leseAktenzeichen(decodeURIComponent(h[1]));
    if (r.ok) modusSetzen('ausweisen', r.zustand);
    else { history.replaceState(null, '', location.pathname + location.search); modusSetzen('neu', null, Spiel.MELDUNGEN[r.grund]); }
  } else {
    modusSetzen('neu');
  }
  vorschau();
  if (!$('telefonhinweis').hidden) $('telefon-weiter').focus();
})();
