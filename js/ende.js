/* Behördensimulator: Epilog und Abschluss-Bescheid (?bescheid=…) */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var ZEICHEN = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  var FELDER = [['v', 3], ['tag', 5], ['min', 10], ['marken', 7], ['zurueck', 6], ['brilleAb', 4], ['doppelt', 3], ['aufrufe', 9], ['puetz', 1]];
  var LAENGE = 10;
  var MASKE = 0x2A5F3C9E17B3n & ((1n << 50n) - 1n);

  /* ---------- Bescheid-Code ---------- */
  function pz(s) { var r = 0; for (var i = 0; i < s.length; i++) r = (r * 32 + ZEICHEN.indexOf(s[i])) % 97; return String(98 - (r * 100) % 97).padStart(2, '0'); }
  function kodieren(w) {
    var n = 0n;
    FELDER.forEach(function (f) { n = (n << BigInt(f[1])) | BigInt(Math.max(0, Math.min((1 << f[1]) - 1, w[f[0]] | 0))); });
    n <<= BigInt(LAENGE * 5 - FELDER.reduce(function (a, f) { return a + f[1]; }, 0));
    n ^= MASKE;
    var s = '';
    for (var i = 0; i < LAENGE; i++) { s = ZEICHEN[Number(n & 31n)] + s; n >>= 5n; }
    return s.slice(0, 5) + '-' + s.slice(5) + '-' + pz(s);
  }
  function dekodieren(code) {
    var m = /^([0-9A-Z]{5})-([0-9A-Z]{5})-(\d{2})$/.exec(String(code || '').trim().toUpperCase());
    if (!m) return null;
    var s = m[1] + m[2];
    for (var i = 0; i < s.length; i++) if (ZEICHEN.indexOf(s[i]) < 0) return null;
    if (pz(s) !== m[3]) return null;
    var n = 0n;
    for (var j = 0; j < s.length; j++) n = (n << 5n) | BigInt(ZEICHEN.indexOf(s[j]));
    n ^= MASKE;
    n >>= BigInt(LAENGE * 5 - FELDER.reduce(function (a, f) { return a + f[1]; }, 0));
    var w = {};
    for (var k = FELDER.length - 1; k >= 0; k--) { w[FELDER[k][0]] = Number(n & BigInt((1 << FELDER[k][1]) - 1)); n >>= BigInt(FELDER[k][1]); }
    if (w.v !== 1 || w.tag > 31) return null;
    w.pz = m[3];
    return w;
  }

  /* ---------- Bescheid zeichnen (ohne Namen) ---------- */
  function werktage(tag) { var n = 0; for (var t = 0; t <= tag; t++) { var w = Spiel.wochentag(t); if (w >= 1 && w <= 5) n++; } return n; }
  function el(tag, text, cls) { var e = document.createElement(tag); if (text !== undefined) e.textContent = text; if (cls) e.className = cls; return e; }
  function bescheidZeichnen(ziel, w) {
    ziel.textContent = '';
    if (!w) {
      ziel.appendChild(el('h1', 'Bescheid ungültig'));
      ziel.appendChild(el('p', 'Der vorgelegte Bescheid ist ungültig. Die Prüfziffer stimmt nicht mit den angegebenen Werten überein.'));
      return;
    }
    var nr = String(1000 + (parseInt(w.pz, 10) * 97 + w.aufrufe * 13 + w.marken) % 9000);
    var kopf = el('div', undefined, 'bescheid-kopf');
    kopf.appendChild(el('strong', 'Stadt Musterstadt · Der Bürgermeister'));
    kopf.appendChild(el('span', 'Bescheid Nr. ' + nr + '/09 · Prüfziffer ' + w.pz));
    ziel.appendChild(kopf);
    ziel.appendChild(el('h1', 'Bescheid über die Bearbeitung eines Antrags auf Ausstellung eines Negativattestes', undefined));
    ziel.lastChild.id = ziel.id === 'ab-bescheid' ? 'ab-titel' : 'bs-titel';
    ziel.appendChild(el('p', 'Dem Antrag wurde nach Aktenlage entsprochen. Die Bearbeitung ergab im Einzelnen:'));
    var wt = werktage(w.tag), m = 420 + w.min;
    var zeilen = [
      ['Bearbeitungsdauer', wt + (wt === 1 ? ' Werktag' : ' Werktage')],
      ['Negativattest erteilt', Spiel.datumText(w.tag) + ', ' + Spiel.uhrText(m) + ' Uhr'],
      ['Wartemarken gezogen', String(w.marken)],
      ['Zurückweisungen', String(w.zurueck)],
      ['Brille abgenommen', w.brilleAb + ' ×'],
      ['Doppelt entrichtete Gebühren', w.doppelt ? w.doppelt + ' × (Erstattung nur auf schriftlichen Antrag)' : 'keine'],
      ['Seitenaufrufe', w.aufrufe >= 511 ? 'mehr als 510' : String(w.aufrufe)],
      ['Hausmeister befragt', w.puetz ? 'ja' : 'nein']
    ];
    var t = el('table');
    zeilen.forEach(function (z) {
      var tr = el('tr'), th = el('th', z[0]); th.scope = 'row';
      tr.appendChild(th); tr.appendChild(el('td', z[1])); t.appendChild(tr);
    });
    ziel.appendChild(t);
    var r = el('p');
    r.appendChild(el('strong', 'Rechtsbehelfsbelehrung: '));
    r.appendChild(document.createTextNode('Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Klage beim Verwaltungsgericht erhoben werden. Es wird darauf hingewiesen, dass der Bescheid keine Regelung enthält.'));
    ziel.appendChild(r);
    ziel.appendChild(el('p', 'Der Bescheid enthält keine personenbezogenen Daten. Veränderte Werte ergeben „Bescheid ungültig“.', 'klein'));
  }

  /* ---------- Werte aus dem Spielstand ---------- */
  function werte() {
    var z = Spiel.zustand;
    return {v: 1, tag: z.tag, min: z.lfd, marken: z.marken, zurueck: z.zurueck, brilleAb: z.brilleAb, doppelt: z.doppelt, aufrufe: z.aufrufe, puetz: z.puetz};
  }

  /* ---------- Epilog ---------- */
  function briefTag(tag) { var t = tag + 3; while (Spiel.wochentag(t) !== 5) t++; return t; }
  function epilogZeigen() {
    var z = Spiel.zustand, a = Spiel.ausweis || {};
    var bt = briefTag(z.tag);
    $('ep-kopf').textContent = Spiel.datumLang(bt) + '. Im Briefkasten liegt ein Schreiben des Ordnungsamtes.';
    $('ep-datum').textContent = Spiel.datumText(bt).slice(4);
    $('ep-abgabe').textContent = Spiel.datumText(z.tag).slice(4);
    $('ep-anschrift').textContent = (z.anrede === 1 ? 'Herrn ' : z.anrede === 2 ? 'Frau ' : '') + [a.vorname, a.name].filter(Boolean).join(' ');
    Spiel.schirmZeigen('schirm-epilog', 'ep-weiter');
  }
  function abschlussZeigen() {
    Spiel.schirmSchliessen('schirm-epilog');
    var w = werte(), code = kodieren(w);
    bescheidZeichnen($('ab-bescheid'), dekodieren(code));
    $('ab-link').value = location.origin + location.pathname + '?bescheid=' + code;
    $('ab-kopiert').textContent = '';
    Spiel.schirmZeigen('schirm-abschluss', 'ab-kopieren');
  }
  $('ep-weiter').addEventListener('click', abschlussZeigen);
  $('ab-kopieren').addEventListener('click', function () {
    var link = $('ab-link').value;
    var ok = function () { $('ab-kopiert').textContent = 'Der Link wurde in die Zwischenablage übernommen.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(ok, function () { $('ab-link').select(); });
    else $('ab-link').select();
  });
  $('ab-download').addEventListener('click', function () { Spiel.herunterladen(); });
  $('ab-neu').addEventListener('click', function () { location.href = location.pathname; });

  Unterlagen.eintragen({titel: 'Negativattest', text: 'gestempelt', flag: 'stempel', ansehen: Spiel.ansehenText('Negativattest', function (t, el2, tabelle) {
    var z = Spiel.zustand;
    t.appendChild(el2('h3', 'Stadt Musterstadt · Bürgeramt · Negativattest'));
    t.appendChild(el2('p', 'Es wird bescheinigt, dass für das Auslegen eines Fußabtreters vor dem Hauseingang Ahornweg 7 eine Erlaubnis nach der Satzung über Sondernutzungen an öffentlichen Straßen nach Aktenlage nicht erforderlich ist.'));
    tabelle(t, [['Gebühr', '7,50 € (Tarifstelle 14.3), entrichtet'], ['Vorgangsnummer', Spiel.vom()], ['Ausgestellt', Spiel.datumText(z.tag) + ', Im Auftrag Schuster']]);
    t.appendChild(el2('p', 'Diese Bescheinigung gilt nur in Verbindung mit einer beglaubigten Abschrift.'));
    t.appendChild(el2('p', '[Dienstsiegel: Stadt Musterstadt · Der Bürgermeister · Bürgeramt]'));
  })});
  document.addEventListener('epilog', epilogZeigen);
  document.addEventListener('spielbeginn', function () { if (Spiel.flag('epilog')) epilogZeigen(); });

  /* ---------- Eigenständige Bescheid-Seite ---------- */
  var q = /[?&]bescheid=([^&#]*)/.exec(location.search);
  if (q) {
    document.title = 'Bescheid – Musterstadt Spiel 1';
    $('buehne').hidden = true;
    document.body.classList.add('nur-bescheid');
    document.documentElement.style.overflow = 'auto';
    $('bescheid-seite').hidden = false;
    bescheidZeichnen($('bs-bescheid'), dekodieren(decodeURIComponent(q[1])));
  }
})();
