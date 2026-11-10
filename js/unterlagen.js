/* Behördensimulator: Meine Unterlagen (Ablagefach, Notizzettel, Laufzettel) */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var ausloeser = null;

  /* Weitere Teile des Spiels tragen hier Unterlagen ein: {titel, text, flag} */
  var UNTERLAGEN = [];
  window.Unterlagen = {
    eintragen: function (eintrag) { UNTERLAGEN.push(eintrag); },
    neu: function () { if (!$('panel-unterlagen').hidden) zeichnen(); }
  };

  function zeichnen() {
    $('u-az').textContent = Spiel.aktenzeichen().voll;
    $('u-kopiert').textContent = '';
    var liste = $('u-ablage');
    liste.textContent = '';
    var vorhanden = UNTERLAGEN.filter(function (u) { return (!u.flag || Spiel.flag(u.flag)) && (!u.nurWenn || u.nurWenn()); });
    if (!vorhanden.length) {
      var leer = document.createElement('li');
      leer.className = 'leer';
      leer.textContent = 'Das Ablagefach ist leer.';
      liste.appendChild(leer);
    }
    vorhanden.forEach(function (u) {
      var li = document.createElement('li');
      var ziel = li;
      if (u.ansehen) {
        li.className = 'mit-knopf';
        ziel = document.createElement('button');
        ziel.type = 'button'; ziel.className = 'eintrag';
        ziel.addEventListener('click', function () { u.ansehen(ziel); });
        li.appendChild(ziel);
      }
      var t = document.createElement('strong'); t.textContent = u.titel;
      var s = document.createElement('span'); s.textContent = typeof u.text === 'function' ? u.text() : (u.text || '');
      ziel.appendChild(t); ziel.appendChild(s);
      liste.appendChild(li);
    });
  }

  $('sl-unterlagen').addEventListener('click', function () {
    if (!Spiel.laeuft) return;
    ausloeser = this;
    zeichnen();
    Spiel.schirmZeigen('panel-unterlagen', 'u-zu');
  });
  $('u-zu').addEventListener('click', function () {
    Spiel.schirmSchliessen('panel-unterlagen');
    if (ausloeser) ausloeser.focus();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('panel-unterlagen').hidden && $('panel-ansicht').hidden && !document.querySelector('.dialog:not([hidden])')) $('u-zu').click();
  });

  $('u-kopieren').addEventListener('click', function () {
    var text = Spiel.aktenzeichen().voll;
    var fertig = function () { $('u-kopiert').textContent = 'Das Aktenzeichen wurde in die Zwischenablage übernommen.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(fertig, function () { $('u-kopiert').textContent = text; });
    } else {
      $('u-kopiert').textContent = text;
    }
  });
  $('u-download').addEventListener('click', function () { Spiel.herunterladen(); });
  $('te-download').addEventListener('click', function () { Spiel.herunterladen(); });

  document.addEventListener('spielbeginn', function () {
    $('u-eroeffnet').textContent = 'Stand: ' + Spiel.datumText(Spiel.zustand.tag) + ', ' + Spiel.uhrText() + ' Uhr';
  });
  document.addEventListener('spielstand', function () {
    if (!$('panel-unterlagen').hidden) $('u-az').textContent = Spiel.aktenzeichen().voll;
  });
})();
