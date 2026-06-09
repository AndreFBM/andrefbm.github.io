const header = document.querySelector("[data-header]");
const year = document.querySelector("[data-year]");
const copyButton = document.querySelector("[data-copy]");
const copyLabel = document.querySelector("[data-copy-label]");

if (year) {
  year.textContent = new Date().getFullYear();
}

const syncHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

if (copyButton && copyLabel) {
  copyButton.addEventListener("click", async () => {
    const value = copyButton.getAttribute("data-copy");
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      copyLabel.textContent = "Copied";
      window.setTimeout(() => {
        copyLabel.textContent = "Copy email";
      }, 1600);
    } catch {
      copyLabel.textContent = value;
    }
  });
}
