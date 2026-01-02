(function () {
  const PHONE = "+12707843283";

  const btn = document.getElementById("floatingJoey");
  const overlay = document.getElementById("zkOverlay");
  const bubble = document.getElementById("zkBubble");

  if (!btn || !overlay || !bubble) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  function runKitty() {
    overlay.classList.add("active");

    setTimeout(() => {
      overlay.classList.remove("active");

      setTimeout(() => {
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
      }, 450);
    }, 1200);
  }

  btn.addEventListener("click", (e) => { e.preventDefault(); runKitty(); });
  bubble.addEventListener("click", (e) => { e.preventDefault(); runKitty(); });
})();
