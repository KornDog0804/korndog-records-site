(function () {
  const PHONE = "+12707843283";

  const btn = document.getElementById("floatingJoey");
  const overlay = document.getElementById("zkOverlay");
  const bubble = document.getElementById("zkBubble");

  if (!btn || !overlay || !bubble) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // ✅ TIMING CONTROLS (tweak these if you want)
  const SHOW_MS = 900;     // how long she slides in before sliding out
  const READ_MS = 3800;    // how long the message stays on screen (make this bigger)
  const EXIT_MS = 450;     // slide-out animation time
  const COOLDOWN_MS = 1200; // prevent double-taps spamming

  let locked = false;

  function goContact() {
    if (isMobile) {
      const body = encodeURIComponent("Hey KornDog! I’m trying to grab a record…");
      const link = isIOS
        ? `sms:${PHONE}&body=${body}`
        : `sms:${PHONE}?body=${body}`;
      window.location.href = link;
    } else {
      window.location.href =
        `mailto:korndogrecords@gmail.com?subject=${encodeURIComponent("KornDog Records Order Question")}`;
    }
  }

  function runKitty() {
    if (locked) return;
    locked = true;

    overlay.classList.add("active");

    // Give the slide-in a beat so it's actually visible
    setTimeout(() => {
      // Keep the message up long enough to read
      setTimeout(() => {
        overlay.classList.remove("active");

        // After she slides away, then trigger contact
        setTimeout(() => {
          goContact();
          setTimeout(() => { locked = false; }, COOLDOWN_MS);
        }, EXIT_MS);

      }, READ_MS);
    }, SHOW_MS);
  }

  btn.addEventListener("click", (e) => { e.preventDefault(); runKitty(); });
  bubble.addEventListener("click", (e) => { e.preventDefault(); runKitty(); });
})();
