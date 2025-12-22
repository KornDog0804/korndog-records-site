(function () {
  const PHONE = "2707843283";

  const btn = document.getElementById("floatingJoey");
  const overlay = document.getElementById("zkOverlay");
  const bubble = document.getElementById("zkBubble");

  if (!btn || !overlay || !bubble) return;

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  function runKitty() {
    overlay.classList.add("active");

    setTimeout(() => {
      overlay.classList.remove("active");

      setTimeout(() => {
        if (isMobile) {
          window.location.href = `sms:${PHONE}?body=${encodeURIComponent("Hey KornDog! I’m trying to grab a record…")}`;
        } else {
          window.location.href = `mailto:korndogrecords@gmail.com?subject=${encodeURIComponent("KornDog Records Order Question")}`;
        }
      }, 450);
    }, 1200);
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    runKitty();
  });

  bubble.addEventListener("click", (e) => {
    e.preventDefault();
    runKitty();
  });
})();
