(function() {
  // let headers = document.querySelectorAll("h2");
  // if ("IntersectionObserver" in window && Array.prototype.find) {
  //   let config = {
  //     rootMargin: "-30px",
  //     threshold: 1
  //   };

  //   let observer = new IntersectionObserver(onChange, config);
  //   headers.forEach(i => observer.observe(i.nextElementSibling));

  //   function onChange(changes) {
  //     const selected = changes.find(item => item.isIntersecting);
  //     if (!selected) return;
  //     const href = selected.target.previousElementSibling;
  //     markLinkAsActive(href.id);
  //   }
  // }

  // const activeClassName = "toc__link--active";
  // const root = document.querySelector(".markdownIt-TOC");
  // function markLinkAsActive(id) {
  //   markAllAsInactive();
  //   const el = root.querySelector(`a[href="#${encodeURIComponent(id)}"]`);
  //   if (!el) return;
  //   el.classList.add(activeClassName);
  // }

  // function markAllAsInactive() {
  //   root.querySelectorAll("." + activeClassName).forEach(function(item) {
  //     item.classList.remove(activeClassName);
  //   });
  // }

  const main = document.querySelector(".main");
  main.classList.add("jsActive");

  const tocTop = document.querySelector(".toc");
  tocTop.classList.add("jsActive");

  const toc = document.querySelector(".markdownIt-TOC");
  toc.setAttribute("role", "navigation");
  toc.setAttribute("id", "menu");
  toc.classList.add("jsActive");

  const button = document.querySelector(".toggleMenu");
  button.classList.add("jsActive");

  button.addEventListener("click", function() {
    toc.classList.toggle("markdownIt-TOC--visible");
  });
  toc.addEventListener("click", function() {
    toc.classList.toggle("markdownIt-TOC--visible");
  });

  // Add service worker if supported
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then(function(registration) {
          console.log("Service worker registration succeeded:", registration);
        })
        .catch(function(error) {
          console.log("Service worker registration failed:", error);
        });
    });
  }
})();
