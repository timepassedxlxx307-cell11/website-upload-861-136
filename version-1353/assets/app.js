(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    var menuToggle = qs('[data-menu-toggle]');
    var mobileMenu = qs('[data-mobile-menu]');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var hero = qs('[data-hero]');

    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restartHero();
            });
        });

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        restartHero();
    }

    qsa('[data-filter-scope]').forEach(function (scope) {
        var input = qs('[data-card-filter]', scope);
        var select = qs('[data-type-filter]', scope);
        var list = scope.parentElement ? qs('.filter-list', scope.parentElement) : null;
        var cards = list ? qsa('.movie-card', list) : [];

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var type = select ? select.value : '';

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-genre')
                ].join(' ').toLowerCase();
                var typeMatch = !type || card.getAttribute('data-type') === type;
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;

                card.style.display = typeMatch && keywordMatch ? '' : 'none';
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });

    var searchForm = qs('[data-search-form]');
    var searchInput = qs('[data-search-input]');
    var searchResults = qs('[data-search-results]');
    var searchCount = qs('[data-search-count]');
    var searchCategory = qs('[data-search-category]');
    var searchType = qs('[data-search-type]');

    if (searchResults && window.MOVIES) {
        var urlParams = new URLSearchParams(window.location.search);
        var initialQuery = urlParams.get('q') || '';

        if (searchInput) {
            searchInput.value = initialQuery;
        }

        var types = Array.from(new Set(window.MOVIES.map(function (movie) {
            return movie.type;
        }).filter(Boolean))).sort();

        if (searchType) {
            types.forEach(function (type) {
                var option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                searchType.appendChild(option);
            });
        }

        function movieCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '<a class="movie-card-cover" href="' + escapeHtml(movie.url) + '">',
                '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
                '<span class="movie-badge">' + escapeHtml(movie.site_category) + '</span>',
                '<span class="movie-play">▶</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
                '<p>' + escapeHtml(movie.one_line) + '</p>',
                '<div class="movie-tags">' + tags + '</div>',
                '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '</div>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value == null ? '' : value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function runSearch(event) {
            if (event) {
                event.preventDefault();
            }

            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var category = searchCategory ? searchCategory.value : '';
            var type = searchType ? searchType.value : '';

            var filtered = window.MOVIES.filter(function (movie) {
                var text = [
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.site_category,
                    movie.year,
                    movie.one_line,
                    movie.summary,
                    (movie.tags || []).join(' ')
                ].join(' ').toLowerCase();

                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var categoryMatch = !category || movie.site_category === category;
                var typeMatch = !type || movie.type === type;

                return keywordMatch && categoryMatch && typeMatch;
            }).slice(0, 240);

            searchResults.innerHTML = filtered.map(movieCard).join('');

            if (searchCount) {
                searchCount.textContent = '共找到 ' + filtered.length + ' 条结果' + (filtered.length === 240 ? '，已显示前 240 条' : '');
            }
        }

        if (searchForm) {
            searchForm.addEventListener('submit', runSearch);
        }

        if (searchInput) {
            searchInput.addEventListener('input', runSearch);
        }

        if (searchCategory) {
            searchCategory.addEventListener('change', runSearch);
        }

        if (searchType) {
            searchType.addEventListener('change', runSearch);
        }

        runSearch();
    }
})();
