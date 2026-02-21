/* ============================================================
   RETIRE.STLUCIA.STUDIO — Core App Logic
   Accordions, hamburger, sidebar scroll-spy, smooth scroll
   ============================================================ */

(function () {
  'use strict';

  /* === ACCORDION === */
  function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(function (header) {
      header.addEventListener('click', function () {
        var body = this.nextElementSibling;
        var isOpen = this.classList.contains('open');

        // Optionally close others in same parent
        var parent = this.closest('.accordion-group');
        if (parent) {
          parent.querySelectorAll('.accordion-header.open').forEach(function (h) {
            if (h !== header) {
              h.classList.remove('open');
              h.nextElementSibling.classList.remove('open');
              h.setAttribute('aria-expanded', 'false');
            }
          });
        }

        this.classList.toggle('open', !isOpen);
        if (body) body.classList.toggle('open', !isOpen);
        this.setAttribute('aria-expanded', String(!isOpen));
      });

      header.setAttribute('aria-expanded', 'false');
      header.setAttribute('role', 'button');
      header.setAttribute('tabindex', '0');
      header.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /* === HAMBURGER / MOBILE MENU === */
  function initHamburger() {
    var btn = document.getElementById('hamburger');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* === SIDEBAR SCROLL SPY === */
  function initScrollSpy() {
    var sidebarLinks = document.querySelectorAll('.sidebar-links a[href^="#"]');
    if (!sidebarLinks.length) return;

    var headings = [];
    sidebarLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if (el) headings.push({ id: id, el: el, link: link });
    });

    if (!headings.length) return;

    var onScroll = function () {
      var scrollY = window.scrollY + 100;
      var current = headings[0];

      headings.forEach(function (h) {
        if (h.el.offsetTop <= scrollY) current = h;
      });

      sidebarLinks.forEach(function (l) { l.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* === SMOOTH SCROLL for anchor links === */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var target = document.getElementById(this.getAttribute('href').slice(1));
        if (!target) return;
        e.preventDefault();
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* === ACTIVE NAVBAR LINK === */
  function highlightNavLink() {
    var path = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
    document.querySelectorAll('.navbar-links a, .mobile-menu a').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      var hrefFile = href.split('/').pop();
      if (hrefFile === path || (path === '' && hrefFile === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* === TABLES — make responsive === */
  function wrapTables() {
    document.querySelectorAll('.content table').forEach(function (t) {
      if (!t.closest('.table-wrap')) {
        var wrap = document.createElement('div');
        wrap.className = 'table-wrap';
        t.parentNode.insertBefore(wrap, t);
        wrap.appendChild(t);
      }
    });
  }

  /* === BUDGET CALCULATOR (cost-of-living page) === */
  function initBudgetCalc() {
    var form = document.getElementById('budget-form');
    if (!form) return;

    var ranges = {
      rent:      [800, 1800, 3500],
      groceries: [300,  500,  900],
      utilities: [100,  180,  300],
      transport: [100,  250,  500],
      dining:    [ 50,  300,  800],
      health:    [300,  450,  600],
      leisure:   [ 50,  250,  500],
      help:      [  0,  400,  800]
    };

    var tierSelect = document.getElementById('budget-tier-select');
    if (!tierSelect) return;

    tierSelect.addEventListener('change', function () {
      var idx = parseInt(this.value, 10);
      var total = 0;
      Object.keys(ranges).forEach(function (k) {
        var cell = document.getElementById('calc-' + k);
        var val = ranges[k][idx];
        total += val;
        if (cell) cell.textContent = val > 0 ? 'US$' + val : '—';
      });
      var totalCell = document.getElementById('calc-total');
      var ecCell = document.getElementById('calc-total-ec');
      if (totalCell) totalCell.textContent = 'US$' + total;
      if (ecCell) ecCell.textContent = 'EC$' + Math.round(total * 2.7);
    });
  }

  /* === TOOLTIP (for table cells) === */
  function initTooltips() {
    document.querySelectorAll('[data-tip]').forEach(function (el) {
      el.style.cursor = 'help';
      el.style.borderBottom = '1px dotted var(--text-muted)';

      el.addEventListener('mouseenter', function (e) {
        var tip = document.createElement('div');
        tip.className = 'tooltip-popup';
        tip.textContent = el.getAttribute('data-tip');
        tip.style.cssText = 'position:fixed;background:#1a202c;color:#fff;padding:6px 10px;border-radius:6px;font-size:12px;pointer-events:none;z-index:9999;max-width:220px;line-height:1.5;';
        document.body.appendChild(tip);

        var rect = el.getBoundingClientRect();
        tip.style.top = (rect.bottom + 6) + 'px';
        tip.style.left = Math.min(rect.left, window.innerWidth - 230) + 'px';

        el._tooltip = tip;
      });

      el.addEventListener('mouseleave', function () {
        if (el._tooltip) { el._tooltip.remove(); el._tooltip = null; }
      });
    });
  }

  /* === INIT === */
  document.addEventListener('DOMContentLoaded', function () {
    initAccordions();
    initHamburger();
    initScrollSpy();
    initSmoothScroll();
    highlightNavLink();
    wrapTables();
    initBudgetCalc();
    initTooltips();

    // Reveal animations (simple fade-in)
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.card, .stat-box, .tip').forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(16px)';
        el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        io.observe(el);
      });
    }
  });

})();
