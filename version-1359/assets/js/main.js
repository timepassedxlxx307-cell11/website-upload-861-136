(function () {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  document.querySelectorAll('.site-search-form').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        window.location.href = './search.html';
      }
    });
  });

  function initHero() {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }

    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    let current = 0;
    let timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      if (dotsWrap) {
        dotsWrap.querySelectorAll('.hero-dot').forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === current);
        });
      }
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (dotsWrap) {
      slides.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'hero-dot';
        dot.setAttribute('aria-label', '切换推荐影片');
        dot.addEventListener('click', function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(index);
          play();
        });
        dotsWrap.appendChild(dot);
      });
    }

    show(0);
    if (slides.length > 1) {
      play();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      const input = scope.querySelector('[data-movie-filter]');
      const chips = Array.from(scope.querySelectorAll('[data-filter-chip]'));
      const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
      const empty = scope.querySelector('[data-empty-state]');
      let chipValue = '';

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.textContent
        ].join(' '));
      }

      function update() {
        const query = normalize(input ? input.value : '');
        const chip = normalize(chipValue);
        let visible = 0;

        cards.forEach(function (card) {
          const text = cardText(card);
          const matched = (!query || text.indexOf(query) !== -1) && (!chip || text.indexOf(chip) !== -1);
          card.classList.toggle('hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      if (input) {
        if (input.hasAttribute('data-read-query')) {
          const params = new URLSearchParams(window.location.search);
          const q = params.get('q');
          if (q) {
            input.value = q;
          }
        }
        input.addEventListener('input', update);
      }

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          chipValue = chip.getAttribute('data-filter-chip') || '';
          chips.forEach(function (item) {
            item.classList.toggle('active', item === chip && chipValue !== '');
          });
          update();
        });
      });

      update();
    });
  }

  function initPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (wrapper) {
      const video = wrapper.querySelector('video');
      const cover = wrapper.querySelector('[data-play]');
      const stream = wrapper.getAttribute('data-video');
      let started = false;
      let hls = null;

      if (!video || !cover || !stream) {
        return;
      }

      function start() {
        if (!started) {
          started = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              maxBufferLength: 30,
              enableWorker: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          video.controls = true;
        }
        cover.classList.add('is-hidden');
        video.play().catch(function () {});
      }

      cover.addEventListener('click', start);
      video.addEventListener('click', function () {
        if (!started) {
          start();
        }
      });

      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHero();
    initFilters();
    initPlayers();
  });
}());
