(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (menuButton && menu) {
      menuButton.addEventListener('click', function () {
        menu.classList.toggle('is-open');
      });
    }

    var topButton = document.querySelector('[data-scroll-top]');
    if (topButton) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 320) {
          topButton.classList.add('is-visible');
        } else {
          topButton.classList.remove('is-visible');
        }
      });
      topButton.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
    forms.forEach(function (box) {
      var input = box.querySelector('[data-filter-text]');
      var type = box.querySelector('[data-filter-type]');
      var year = box.querySelector('[data-filter-year]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
      var empty = document.querySelector('[data-empty]');
      function apply() {
        var text = input ? input.value.trim().toLowerCase() : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();
          var cardType = card.getAttribute('data-type') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var ok = true;
          if (text && haystack.indexOf(text) === -1) {
            ok = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            ok = false;
          }
          if (yearValue && cardYear !== yearValue) {
            ok = false;
          }
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupSearchPage() {
    var mount = document.querySelector('[data-search-results]');
    var input = document.querySelector('[data-global-search]');
    var button = document.querySelector('[data-global-search-button]');
    if (!mount || !input || !window.SEARCH_MOVIES) {
      return;
    }
    function render(items) {
      mount.innerHTML = items.map(function (movie) {
        return [
          '<article class="movie-card">',
          '<a class="card-cover" href="./' + escapeHtml(movie.file) + '">',
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
          '<span class="play-badge">▶</span>',
          '<span class="year-badge">' + escapeHtml(movie.year || '高清') + '</span>',
          '</a>',
          '<div class="card-body">',
          '<h2><a href="./' + escapeHtml(movie.file) + '">' + escapeHtml(movie.title) + '</a></h2>',
          '<p class="card-meta">' + escapeHtml([movie.year, movie.region, movie.type].filter(Boolean).join(' · ')) + '</p>',
          '<p class="card-desc">' + escapeHtml(movie.oneLine || '') + '</p>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');
    }
    function search() {
      var q = input.value.trim().toLowerCase();
      var results = window.SEARCH_MOVIES.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ').toLowerCase();
        return !q || text.indexOf(q) !== -1;
      }).slice(0, 96);
      render(results);
    }
    input.addEventListener('input', search);
    if (button) {
      button.addEventListener('click', search);
    }
    render(window.SEARCH_MOVIES.slice(0, 48));
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('[data-play-overlay]');
      var source = shell.getAttribute('data-hls');
      if (!video || !source) {
        return;
      }
      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }
      function start() {
        hideOverlay();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
      if (overlay) {
        overlay.addEventListener('click', start);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', hideOverlay);
    });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
})();
