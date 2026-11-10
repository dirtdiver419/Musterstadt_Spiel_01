/* Behördensimulator: Spielrahmen (Rechner von 2009, SurfStar Gold 4.7) */
(function () {
  'use strict';

  var BREITE = 1024, HOEHE = 768;
  var BASIS = new URL('../musterstadt/', location.href).href;
  var ZIELE = {
    stadt: BASIS + 'index.html?id=1&L=0',
    kreis: BASIS + 'kreis/index.html?id=1&L=0',
    kts: BASIS + 'termin/index.html'
  };
  var FEHLERSEITE = new URL('fehler.html', location.href).href;

  var $ = function (id) { return document.getElementById(id); };
  var rechner = $('rechner'), seite = $('seite'), adresse = $('adresse');
  var fenster = $('fenster'), status = $('status');
  var telefon = window.matchMedia('(pointer: coarse) and (max-width: 820px)').matches;
  var letzteEingabe = '';

  /* ---------- Größe: der Rechner wird an das Browserfenster angepasst ---------- */
  /* Browser-Zoom (Strg +) vergrößert den Rechner wirklich; dann wird gescrollt statt eingepasst */
  function zoom() {
    var z = window.outerWidth && window.innerWidth ? window.outerWidth / window.innerWidth : 1;
    return z > 1.1 ? Math.min(z, 4) : 1;
  }
  function skalieren() {
    var passend = Math.min(window.innerWidth / BREITE, window.innerHeight / HOEHE), s = passend * zoom();
    document.documentElement.classList.toggle('vergroessert', s > passend + 0.01);
    var x = Math.max(0, (window.innerWidth - BREITE * s) / 2);
    var y = Math.max(0, (window.innerHeight - HOEHE * s) / 2);
    rechner.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
  }
  window.addEventListener('resize', skalieren);
  skalieren();

  /* ---------- Adressen: echte Pfade werden als Adressen von 2009 angezeigt ---------- */
  function anzeigeAdresse(href) {
    if (href.indexOf(FEHLERSEITE) === 0) return letzteEingabe || href;
    if (href.indexOf(BASIS) !== 0) return href;
    var rest = href.slice(BASIS.length);
    if (rest.indexOf('termin/') === 0) return 'https://termine.stadt-musterstadt.de/kts/' + rest.slice(7).replace(/^index\.html/, '');
    if (rest.indexOf('kreis/') === 0) return 'http://www.kreis-muster.de/' + rest.slice(6).replace(/^index\.html/, 'index.php');
    return 'http://www.stadt-musterstadt.de/' + rest.replace(/^index\.html/, 'index.php');
  }

  function echteAdresse(eingabe) {
    var s = eingabe.trim();
    if (!s) return null;
    if (!/^[a-z]+:\/\//i.test(s)) s = 'http://' + s;
    var u;
    try { u = new URL(s); } catch (e) { return FEHLERSEITE; }
    var host = u.hostname.toLowerCase().replace(/^www\./, '');
    var pfad = u.pathname.replace(/^\/+/, '');
    var ziel = null;
    if (host === 'stadt-musterstadt.de') {
      ziel = BASIS + (pfad.replace(/^index\.php/, 'index.html') || 'index.html');
    } else if (host === 'kreis-muster.de') {
      ziel = BASIS + 'kreis/' + (pfad.replace(/^index\.php/, 'index.html') || 'index.html');
    } else if (host === 'termine.stadt-musterstadt.de' && /^kts(\/|$)/.test(pfad)) {
      ziel = BASIS + 'termin/' + (pfad.replace(/^kts\/?/, '') || 'index.html');
    }
    if (!ziel) return FEHLERSEITE;
    var fertig = new URL(ziel + u.search + u.hash);
    return fertig.href.indexOf(BASIS) === 0 ? fertig.href : FEHLERSEITE;
  }

  /* Sprache: Stadt und Kreis über L=1, KTS und Fehlerseite über L=en */
  function englisch() { return !!(window.Sprache && Sprache.an()); }
  function mitSprache(href) {
    var u, en = englisch();
    try { u = new URL(href); } catch (e) { return href; }
    if (href.indexOf(FEHLERSEITE) === 0 || u.pathname.indexOf('/termin/') >= 0) {
      if (en) u.searchParams.set('L', 'en'); else u.searchParams.delete('L');
    } else if (href.indexOf(BASIS) === 0 && /(\.html|\/)$/.test(u.pathname)) {
      u.searchParams.set('L', en ? '1' : '0');
    } else return href;
    return u.href;
  }
  function laden(href) {
    status.textContent = 'Seite wird geladen …';
    seite.src = mitSprache(href);
  }
  function sprachwechsel() {
    var h = '';
    try { h = seite.contentWindow.location.href; } catch (e) { h = seite.src; }
    if (!h || h === 'about:blank' || mitSprache(h) === h) return;
    if (h.indexOf('/termin/') >= 0) { try { seite.contentWindow.postMessage({befehl: 'sprache', L: englisch() ? 'en' : 'de'}, location.origin); } catch (e) { /* keine Seite */ } }
    else laden(h);
  }

  function oeffneZiel(name) { if (ZIELE[name]) { letzteEingabe = ''; laden(ZIELE[name]); } }

  $('adressform').addEventListener('submit', function (e) {
    e.preventDefault();
    var ziel = echteAdresse(adresse.value);
    if (!ziel) return;
    letzteEingabe = ziel === FEHLERSEITE ? adresse.value.trim() : '';
    laden(ziel === FEHLERSEITE ? FEHLERSEITE + '?adresse=' + encodeURIComponent(letzteEingabe) : ziel);
  });

  /* ---------- Seite geladen ---------- */
  seite.addEventListener('load', function () {
    var w = seite.contentWindow, href = '', titel = '';
    try { href = w.location.href; titel = w.document.title; } catch (e) { href = seite.src; }
    if (href.indexOf(FEHLERSEITE) === 0) {
      var a = new URL(href).searchParams.get('adresse');
      if (a) letzteEingabe = a;
    }
    adresse.value = anzeigeAdresse(href);
    $('fenster-titel').textContent = (titel ? titel + ' – ' : '') + 'SurfStar Gold 4.7';
    status.textContent = 'Fertig';
    try { w.print = function () { document.dispatchEvent(new CustomEvent('drucken')); }; } catch (e) { /* fremde Seite */ }
    if (telefon) pdfInNeuemFenster(w);
    document.dispatchEvent(new CustomEvent('seitegeladen', {detail: {href: href, fehlerseite: href.indexOf(FEHLERSEITE) === 0}}));
  });

  function pdfInNeuemFenster(w) {
    try {
      w.document.addEventListener('click', function (e) {
        var a = e.target.closest ? e.target.closest('a[href$=".pdf"]') : null;
        if (!a) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        window.open(a.href, '_blank', 'noopener');
      }, true);
    } catch (e) { /* fremde Seite */ }
  }

  /* ---------- Knöpfe und Menüeinträge ---------- */
  var AKTIONEN = {
    zurueck: function () { try { seite.contentWindow.history.back(); } catch (e) {} },
    vor: function () { try { seite.contentWindow.history.forward(); } catch (e) {} },
    stopp: function () { try { seite.contentWindow.stop(); } catch (e) {} status.textContent = 'Fertig'; },
    neuladen: function () { status.textContent = 'Seite wird geladen …'; try { seite.contentWindow.location.reload(); } catch (e) { laden(seite.src); } },
    schliessen: fensterSchliessen,
    oeffnen: fensterOeffnen,
    info: function () { dialogOeffnen('dialog-info'); },
    optionen: function () { dialogOeffnen('dialog-optionen'); },
    drucken: function () { document.dispatchEvent(new CustomEvent('drucken')); }
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b || b.getAttribute('aria-disabled') === 'true') return;
    if (b.dataset.ziel) { menuesSchliessen(); oeffneZiel(b.dataset.ziel); }
    else if (b.dataset.aktion && AKTIONEN[b.dataset.aktion]) { menuesSchliessen(); AKTIONEN[b.dataset.aktion](); }
  });

  /* ---------- Menüs ---------- */
  var offenesMenue = null;
  function menuesSchliessen(fokusZurueck) {
    if (!offenesMenue) return;
    var kopf = offenesMenue;
    kopf.setAttribute('aria-expanded', 'false');
    $(kopf.getAttribute('aria-controls')).hidden = true;
    offenesMenue = null;
    if (fokusZurueck) kopf.focus();
  }
  function menueOeffnen(kopf, fokusErster) {
    menuesSchliessen();
    kopf.setAttribute('aria-expanded', 'true');
    var liste = $(kopf.getAttribute('aria-controls'));
    liste.hidden = false;
    offenesMenue = kopf;
    if (fokusErster) { var b = liste.querySelector('button'); if (b) b.focus(); }
  }
  Array.prototype.forEach.call(document.querySelectorAll('.menuekopf'), function (kopf) {
    kopf.addEventListener('click', function (e) {
      e.stopPropagation();
      if (offenesMenue === kopf) menuesSchliessen(); else menueOeffnen(kopf, e.detail === 0);
    });
  });
  document.addEventListener('click', function (e) { if (offenesMenue && !e.target.closest('.menue')) menuesSchliessen(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var offen = document.querySelector('.dialog:not([hidden])');
      if (offen) { dialogSchliessen(offen); return; }
      menuesSchliessen(true);
      return;
    }
    if (!offenesMenue || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    var knoepfe = Array.prototype.slice.call($(offenesMenue.getAttribute('aria-controls')).querySelectorAll('button'));
    var i = knoepfe.indexOf(document.activeElement);
    i = e.key === 'ArrowDown' ? (i + 1) % knoepfe.length : (i - 1 + knoepfe.length) % knoepfe.length;
    knoepfe[i].focus();
    e.preventDefault();
  });

  /* ---------- Fenster ---------- */
  var taskknopf = $('task-surfstar');
  var geschlossen = false;
  function fensterOeffnen() {
    fenster.hidden = false;
    taskknopf.hidden = false;
    taskknopf.classList.add('aktiv');
    if (geschlossen) { geschlossen = false; laden(ZIELE.stadt); }
    adresse.focus();
  }
  function fensterSchliessen() {
    fenster.hidden = true;
    taskknopf.hidden = true;
    geschlossen = true;
    seite.src = 'about:blank';
    $('symbol-surfstar').focus();
  }
  $('k-min').addEventListener('click', function () {
    fenster.hidden = true;
    taskknopf.classList.remove('aktiv');
    taskknopf.focus();
  });
  $('k-max').addEventListener('click', function () {
    var max = fenster.classList.toggle('maximiert');
    this.setAttribute('aria-label', max ? 'Wiederherstellen' : 'Maximieren');
  });
  $('k-zu').addEventListener('click', fensterSchliessen);
  taskknopf.addEventListener('click', function () {
    if (fenster.hidden) { fenster.hidden = false; taskknopf.classList.add('aktiv'); }
    else { fenster.hidden = true; taskknopf.classList.remove('aktiv'); }
  });
  $('symbol-surfstar').addEventListener('click', fensterOeffnen);

  /* ---------- Dialoge ---------- */
  var fokusVorDialog = null;
  function dialogOeffnen(id) {
    fokusVorDialog = document.activeElement;
    var d = $(id);
    d.hidden = false;
    d.querySelector('.dialog-ok').focus();
  }
  function dialogSchliessen(d) {
    d.hidden = true;
    if (fokusVorDialog && fokusVorDialog.focus) fokusVorDialog.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.dialog-ok'), function (b) {
    b.addEventListener('click', function () { dialogSchliessen(b.closest('.dialog')); });
    b.addEventListener('keydown', function (e) { if (e.key === 'Tab') e.preventDefault(); });
  });

  /* ---------- Telefone ---------- */
  if (telefon && !/[?&]bescheid=/.test(location.search)) {
    var hinweis = $('telefonhinweis');
    hinweis.hidden = false;
    $('telefon-weiter').focus();
    $('telefon-weiter').addEventListener('click', function () {
      hinweis.hidden = true;
      var ziel = document.querySelector('.schirm:not([hidden]) input, .schirm:not([hidden]) button') || adresse;
      ziel.focus();
    });
  }

  /* ---------- Nachrichten der Website an das Spiel ---------- */
  window.addEventListener('message', function (e) {
    if (e.origin !== location.origin || e.source !== seite.contentWindow) return;
    var d = e.data;
    if (!d || typeof d !== 'object' || typeof d.typ !== 'string') return;
    document.dispatchEvent(new CustomEvent('website', {detail: d}));
  });

  /* Schnittstelle für die weiteren Teile des Spiels */
  window.Rahmen = {
    oeffne: oeffneZiel,
    sprachwechsel: sprachwechsel,
    laden: function (href) { var z = echteAdresse(href); if (z) laden(z); },
    seite: function () { return seite; },
    adresse: function () { try { return seite.contentWindow.location.href; } catch (e) { return ''; } },
    titel: function () { try { return seite.contentWindow.document.title; } catch (e) { return ''; } },
    sende: function (nachricht) { try { seite.contentWindow.postMessage(nachricht, location.origin); } catch (e) { /* keine Seite */ } },
    dialogOeffnen: dialogOeffnen, dialogSchliessen: dialogSchliessen,
    telefon: telefon
  };
})();
