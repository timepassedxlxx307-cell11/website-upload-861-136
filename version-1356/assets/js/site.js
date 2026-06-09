(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var show = function (index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var normalize = function (value) {
    return String(value || '').toLowerCase().replace(/\s+/g, '');
  };

  var applyFilter = function (scope) {
    var input = scope.input;
    var root = scope.root;
    var cards = scope.cards;
    var term = normalize(input ? input.value : '');
    var activeFilter = scope.filter || 'all';

    cards.forEach(function (card) {
      var keywords = normalize(card.getAttribute('data-keywords'));
      var matchesText = !term || keywords.indexOf(term) !== -1;
      var matchesFilter = activeFilter === 'all' || keywords.indexOf(normalize(activeFilter)) !== -1;
      card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
    });
  };

  var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-box]'));

  inputs.forEach(function (input) {
    var selector = input.getAttribute('data-scope');
    var root = selector ? document.querySelector(selector) : document;

    if (!root) {
      return;
    }

    var scope = {
      input: input,
      root: root,
      cards: Array.prototype.slice.call(root.querySelectorAll('[data-card]')),
      filter: 'all'
    };

    input.addEventListener('input', function () {
      applyFilter(scope);
    });

    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
        });

        button.classList.add('is-active');
        scope.filter = button.getAttribute('data-filter-value') || 'all';
        applyFilter(scope);
      });
    });
  });
})();
