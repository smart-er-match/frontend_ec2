self.addEventListener("install", () => {
  console.log("Service Worker installing…");
});

self.addEventListener("activate", () => {
  console.log("Service Worker active!");
});
