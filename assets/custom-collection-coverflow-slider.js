/* ============================================================
   Category Coverflow Slider  (assets/category-coverflow.js)
   Initialises a Swiper "coverflow" instance per section.
   Works with multiple sections on one page and with the
   Shopify theme editor (load / unload events).
   ============================================================ */
   (function () {
    "use strict";
  
    // Keep one Swiper instance per slider element so we can destroy/rebuild.
    var registry = new WeakMap();
  
    function num(value, fallback) {
      var n = parseFloat(value);
      return isNaN(n) ? fallback : n;
    }
  
    function initSlider(el) {
      if (!el || typeof window.Swiper === "undefined") return;
  
      // Destroy any previous instance bound to this element (re-render safe).
      var existing = registry.get(el);
      if (existing) {
        existing.destroy(true, true);
        registry.delete(el);
      }
  
      var container = el.closest(".coverflow") || el.parentElement;
      var prevEl = container.querySelector(".coverflow__nav--prev");
      var nextEl = container.querySelector(".coverflow__nav--next");
  
      var loop = el.dataset.loop === "true";
      var autoplay = el.dataset.autoplay === "true";
  
      var config = {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: "auto",
        loop: loop,
        // loopAdditionalSlides: 'auto',
        speed: 600,
        spaceBetween: num(getComputedStyle(el).getPropertyValue("--cc-gap"), 24),
        watchSlidesProgress: true,
        coverflowEffect: {
          rotate: num(el.dataset.rotate, 38),
          stretch: num(el.dataset.stretch, 0),
          depth: num(el.dataset.depth, 120),
          modifier: num(el.dataset.modifier, 1),
          scale: 0.92,
          slideShadows: false // we use our own .coverflow__overlay instead
        },
        keyboard: { enabled: true },
        a11y: {
          prevSlideMessage: "Previous category",
          nextSlideMessage: "Next category"
        }
      };
  
      if (prevEl && nextEl) {
        config.navigation = {
          prevEl: prevEl,
          nextEl: nextEl,
          disabledClass: "swiper-button-disabled"
        };
      }
  
      if (autoplay) {
        config.autoplay = {
          delay: num(el.dataset.autoplayDelay, 3500),
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        };
      }
  
      var swiper = new window.Swiper(el, config);
      registry.set(el, swiper);
      return swiper;
    }
  
    function initAll(scope) {
      var root = scope && scope.querySelectorAll ? scope : document;
      root.querySelectorAll("[data-coverflow]").forEach(initSlider);
    }
  
    // Swiper is loaded with `defer`, same as this file, so the DOM is parsed
    // and (because of source order) Swiper has run by the time we get here.
    // Guard anyway in case Swiper is slow / cached oddly.
    function boot() {
      if (typeof window.Swiper === "undefined") {
        // Retry briefly until the CDN bundle is available.
        var tries = 0;
        var timer = setInterval(function () {
          if (typeof window.Swiper !== "undefined" || tries++ > 40) {
            clearInterval(timer);
            if (typeof window.Swiper !== "undefined") initAll(document);
          }
        }, 50);
        return;
      }
      initAll(document);
    }
  
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot);
    } else {
      boot();
    }
  
    // ---- Shopify theme editor support ----------------------------------
    document.addEventListener("shopify:section:load", function (e) {
      initAll(e.target);
    });
  
    document.addEventListener("shopify:section:unload", function (e) {
      e.target.querySelectorAll("[data-coverflow]").forEach(function (el) {
        var inst = registry.get(el);
        if (inst) {
          inst.destroy(true, true);
          registry.delete(el);
        }
      });
    });
  })();