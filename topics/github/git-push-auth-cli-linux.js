// OS タブ切替 — body のクラスを書き換えて全 .os-variant の可視性を制御
(function () {
  const STORAGE_KEY = "git-push-auth-selected-os";
  const VALID = ["linux", "windows", "mac"];
  const body = document.body;
  const buttons = document.querySelectorAll(".os-btn");

  function applyOS(os) {
    if (!VALID.includes(os)) os = "linux";
    VALID.forEach((v) => body.classList.remove("os-" + v));
    body.classList.add("os-" + os);
    buttons.forEach((b) => {
      const active = b.dataset.os === os;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    try { localStorage.setItem(STORAGE_KEY, os); } catch (e) {}
  }

  // 復元: localStorage → デフォルト linux
  let initial = "linux";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (VALID.includes(saved)) initial = saved;
  } catch (e) {}
  applyOS(initial);

  buttons.forEach((b) => b.addEventListener("click", () => applyOS(b.dataset.os)));
})();
