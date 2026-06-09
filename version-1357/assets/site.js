(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".mobile-toggle");
        var menu = document.querySelector(".mobile-menu");

        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector(".hero");

        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
            var prev = document.querySelector(".hero-arrow.prev");
            var next = document.querySelector(".hero-arrow.next");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === current);
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5600);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                    start();
                });
            });

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        }

        var homeSearch = document.querySelector(".js-home-search");

        if (homeSearch) {
            homeSearch.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = homeSearch.querySelector("input");
                var query = input ? input.value.trim() : "";
                var target = "search.html";

                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }

                window.location.href = target;
            });
        }

        var filterInput = document.querySelector(".js-movie-search");
        var categorySelect = document.querySelector(".js-category-filter");
        var yearSelect = document.querySelector(".js-year-filter");
        var cards = Array.prototype.slice.call(document.querySelectorAll(".js-filter-grid .movie-card"));
        var empty = document.querySelector(".js-empty");

        if (filterInput && cards.length) {
            var params = new URLSearchParams(window.location.search);
            var queryParam = params.get("q");

            if (queryParam) {
                filterInput.value = queryParam;
            }

            function applyFilters() {
                var query = filterInput.value.trim().toLowerCase();
                var category = categorySelect ? categorySelect.value : "";
                var year = yearSelect ? yearSelect.value : "";
                var hasVisible = false;

                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || "").toLowerCase();
                    var cardCategory = card.getAttribute("data-category") || "";
                    var cardYear = card.getAttribute("data-year") || "";
                    var matched = true;

                    if (query && haystack.indexOf(query) === -1) {
                        matched = false;
                    }

                    if (category && cardCategory !== category) {
                        matched = false;
                    }

                    if (year && cardYear !== year) {
                        matched = false;
                    }

                    card.style.display = matched ? "" : "none";

                    if (matched) {
                        hasVisible = true;
                    }
                });

                if (empty) {
                    empty.hidden = hasVisible;
                }
            }

            filterInput.addEventListener("input", applyFilters);

            if (categorySelect) {
                categorySelect.addEventListener("change", applyFilters);
            }

            if (yearSelect) {
                yearSelect.addEventListener("change", applyFilters);
            }

            applyFilters();
        }
    });
})();
