(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input || !input.value.trim()) {
                event.preventDefault();
                window.location.href = './search.html';
            }
        });
    });

    var carousel = document.querySelector('[data-hero-carousel]');

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        var showSlide = function (index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var next = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(next);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var liveSearch = document.querySelector('[data-live-search]');

    if (liveSearch && query) {
        liveSearch.value = query;
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var selectors = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
        var empty = document.querySelector('[data-no-result]');

        var normalize = function (value) {
            return String(value || '').toLowerCase().trim();
        };

        var applyFilters = function () {
            var q = normalize(liveSearch ? liveSearch.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var matched = !q || text.indexOf(q) !== -1;

                selectors.forEach(function (select) {
                    var key = select.getAttribute('data-filter-select');
                    var value = normalize(select.value);
                    var cardValue = normalize(card.getAttribute('data-' + key));

                    if (value && cardValue !== value) {
                        matched = false;
                    }
                });

                card.hidden = !matched;

                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        };

        if (liveSearch) {
            liveSearch.addEventListener('input', applyFilters);
        }

        selectors.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        applyFilters();
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.player-cover');

        if (!video) {
            return;
        }

        var url = video.getAttribute('data-hls');
        var loaded = false;
        var hls = null;

        var loadVideo = function () {
            if (loaded || !url) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }

            loaded = true;
        };

        var playVideo = function () {
            loadVideo();
            player.classList.add('is-playing');
            video.controls = true;
            var playback = video.play();

            if (playback && typeof playback.catch === 'function') {
                playback.catch(function () {});
            }
        };

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });

    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('[data-player]');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                var button = player.querySelector('.player-cover');
                if (button) {
                    button.click();
                }
            }
        });
    });
}());
