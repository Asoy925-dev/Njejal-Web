(function () {
  "use strict";

  // ====== Pengaturan ======
  var WEDDING_DATE = new Date("2026-12-20T08:00:00+07:00"); // WIB
  var STORAGE_KEY = "wishes-raka-ayu";

  var $ = function (id) { return document.getElementById(id); };

  // ====== Nama tamu dari URL: index.html?to=Budi+Santoso ======
  var params = new URLSearchParams(window.location.search);
  var guest = params.get("to");
  if (guest) {
    $("guestName").textContent = guest;
    $("fName").value = guest;
  }

  // ====== Buka undangan ======
  var cover = $("cover");
  var bgm = $("bgm");
  var musicBtn = $("musicBtn");

  $("openBtn").addEventListener("click", function () {
    cover.classList.add("open");
    document.body.classList.remove("locked");
    window.scrollTo(0, 0);
    musicBtn.hidden = false;
    playMusic();
    setTimeout(function () { cover.classList.add("gone"); }, 1400);
  });

  // ====== Musik ======
  function playMusic() {
    var p = bgm.play();
    if (p && p.then) {
      p.then(function () { musicBtn.classList.add("playing"); })
       .catch(function () { musicBtn.classList.remove("playing"); });
    }
  }
  musicBtn.addEventListener("click", function () {
    if (bgm.paused) { playMusic(); } else { bgm.pause(); musicBtn.classList.remove("playing"); }
  });

  // ====== Hitung mundur ======
  function tick() {
    var diff = Math.max(0, WEDDING_DATE - new Date());
    var s = Math.floor(diff / 1000);
    $("cdDays").textContent = Math.floor(s / 86400);
    $("cdHours").textContent = Math.floor((s % 86400) / 3600);
    $("cdMins").textContent = Math.floor((s % 3600) / 60);
    $("cdSecs").textContent = s % 60;
  }
  tick();
  setInterval(tick, 1000);

  // ====== Simpan ke kalender (.ics) ======
  $("calBtn").addEventListener("click", function (e) {
    e.preventDefault();
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
      "SUMMARY:Pernikahan Raka & Ayu",
      "DTSTART:20261220T010000Z", "DTEND:20261220T070000Z",
      "LOCATION:Gedung Graha Kencana\\, Jl. Pemuda No. 12\\, Semarang",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "pernikahan-raka-ayu.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ====== Salin nomor rekening ======
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = $(btn.dataset.copy).textContent.trim();
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "Tersalin";
        setTimeout(function () { btn.textContent = old; }, 1800);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var t = document.createElement("textarea");
        t.value = text; document.body.appendChild(t); t.select();
        document.execCommand("copy"); t.remove(); done();
      }
    });
  });

  // ====== Ucapan & RSVP ======
  var wishesEl = $("wishes");

  function loadWishes() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveWishes(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function renderWishes() {
    var list = loadWishes();
    wishesEl.textContent = "";
    if (!list.length) {
      var p = document.createElement("p");
      p.className = "empty";
      p.textContent = "Belum ada ucapan. Jadilah yang pertama.";
      wishesEl.appendChild(p);
      return;
    }
    list.slice().reverse().forEach(function (w) {
      var box = document.createElement("div");
      box.className = "wish";
      var name = document.createElement("strong");
      name.textContent = w.nama;
      var status = document.createElement("em");
      status.textContent = w.hadir;
      var msg = document.createElement("p");
      msg.textContent = w.ucapan;
      box.append(name, status, msg);
      wishesEl.appendChild(box);
    });
  }
  renderWishes();

  $("rsvpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var nama = $("fName").value.trim();
    var ucapan = $("fMsg").value.trim();
    var err = $("formError");
    if (!nama || !ucapan) {
      err.textContent = "Isi nama dan ucapan terlebih dahulu.";
      return;
    }
    err.textContent = "";
    var list = loadWishes();
    list.push({ nama: nama, hadir: $("fAttend").value, ucapan: ucapan });
    saveWishes(list);
    renderWishes();
    $("fMsg").value = "";
    err.style.color = "#2f6b45";
    err.textContent = "Terima kasih, ucapan Anda terkirim.";
    setTimeout(function () { err.textContent = ""; err.style.color = ""; }, 3000);
  });
})();
