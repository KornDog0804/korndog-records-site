(function () {
  const PHONE = "+12707843283";
  const EMAIL = "korndogrecords@gmail.com";

  const btn = document.getElementById("floatingJoey");
  const overlay = document.getElementById("zkOverlay");
  const bubble = document.getElementById("zkBubble");

  if (!btn || !overlay || !bubble) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  let running = false;

  function runKitty() {
    if (running) return;
    running = true;

    overlay.classList.add("active");

    setTimeout(() => {
      overlay.classList.remove("active");

      setTimeout(() => {
        if (isMobile) {
          const msg = encodeURIComponent("Hey KornDog! I need help with a record.");
          const link = isIOS
            ? `sms:${PHONE}&body=${msg}`
            : `sms:${PHONE}?body=${msg}`;
          window.location.href = link;
        } else {
          window.location.href =
            `mailto:${EMAIL}?subject=${encodeURIComponent("KornDog Records Help")}`;
        }
        running = false;
      }, 400);
    }, 1200);
  }

  btn.addEventListener("click", e => {
    e.preventDefault();
    runKitty();
  });

  bubble.addEventListener("click", e => {
    e.preventDefault();
    runKitty();
  });
})();
