const menuButton = document.querySelector("[data-menu-toggle]");
const mobilePanel = document.querySelector("[data-mobile-panel]");

if (menuButton && mobilePanel) {
  menuButton.addEventListener("click", function() {
    mobilePanel.classList.toggle("is-open");
  });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  let current = 0;

  function showHero(index) {
    current = index;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }

  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      showHero(Number(dot.dataset.heroDot));
    });
  });

  if (slides.length > 1) {
    window.setInterval(function() {
      showHero((current + 1) % slides.length);
    }, 5600);
  }
}

const filterPanel = document.querySelector("[data-filter-panel]");

if (filterPanel) {
  const input = filterPanel.querySelector("[data-filter-input]");
  const grid = document.querySelector("[data-filter-grid]");
  const cards = grid ? Array.from(grid.querySelectorAll("[data-card]")) : [];
  const chips = Array.from(filterPanel.querySelectorAll("[data-filter-value]"));
  let chipValue = "";

  function applyFilter() {
    const query = input ? input.value.trim().toLowerCase() : "";

    cards.forEach(function(card) {
      const text = card.dataset.search || "";
      const matchedText = !query || text.includes(query);
      const matchedChip = !chipValue || text.includes(chipValue);
      card.style.display = matchedText && matchedChip ? "" : "none";
    });
  }

  if (input) {
    input.addEventListener("input", applyFilter);
  }

  chips.forEach(function(chip) {
    chip.addEventListener("click", function() {
      chipValue = chip.dataset.filterValue || "";
      chips.forEach(function(item) {
        item.classList.toggle("active", item === chip);
      });
      applyFilter();
    });
  });
}

const results = document.querySelector("[data-search-results]");

if (results && Array.isArray(window.SEARCH_MOVIES)) {
  const input = document.querySelector("[data-search-page-input]");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (input) {
    input.value = initialQuery;
    input.addEventListener("input", function() {
      renderSearch(input.value);
    });
  }

  function movieTemplate(movie) {
    const tags = movie.tags.slice(0, 3).map(function(tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"movie-card__poster\" href=\"" + movie.url + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
      "<img src=\"" + movie.image + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"movie-card__play\">▶</span>" +
      "<span class=\"movie-card__type\">" + escapeHtml(movie.type || "影视") + "</span>" +
      "</a>" +
      "<div class=\"movie-card__body\">" +
      "<a class=\"movie-card__title\" href=\"" + movie.url + "\">" + escapeHtml(movie.title) + "</a>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"movie-card__meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
      "<div class=\"movie-card__tags\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function renderSearch(rawQuery) {
    const query = String(rawQuery || "").trim().toLowerCase();
    const matched = query ? window.SEARCH_MOVIES.filter(function(movie) {
      return movie.search.includes(query);
    }).slice(0, 96) : window.SEARCH_MOVIES.slice(0, 48);

    results.innerHTML = matched.map(movieTemplate).join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  renderSearch(initialQuery);
}
