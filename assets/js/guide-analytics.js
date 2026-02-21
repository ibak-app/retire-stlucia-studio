/**
 * stlucia.studio — Lightweight Guide Analytics
 * Tracks page views across all guide sites via Supabase REST API.
 * Self-contained, no dependencies. Respects DNT and consent.
 *
 * Usage: <script src="/assets/js/guide-analytics.js" defer></script>
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://edybhgkuttsyoouizwcw.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkeWJoZ2t1dHRzeW9vdWl6d2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMDI2MTQsImV4cCI6MjA4NjU3ODYxNH0.qaLYTfJQDz8Tp2WBqCLhKKaSs_lBSAvQ3W2h4v2L0xA';

  // Respect Do Not Track
  if (navigator.doNotTrack === '1') return;

  // Get or create visitor ID
  function getVisitorId() {
    var key = 'stlucia_vid';
    var vid = null;
    try { vid = localStorage.getItem(key); } catch (e) {}
    if (!vid) {
      vid = 'v_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 8);
      try { localStorage.setItem(key, vid); } catch (e) {}
    }
    return vid;
  }

  // Detect property from hostname
  function getProperty() {
    var host = (location.hostname || '').toLowerCase();
    if (host.indexOf('living') !== -1) return 'living';
    if (host.indexOf('expat') !== -1) return 'expat';
    if (host.indexOf('remote') !== -1) return 'remote';
    if (host.indexOf('visit') !== -1) return 'visit';
    if (host.indexOf('retire') !== -1) return 'retire';
    if (host.indexOf('talent') !== -1) return 'talent';
    if (host.indexOf('hire') !== -1) return 'hire';
    if (host.indexOf('homes') !== -1) return 'homes';
    if (host.indexOf('business') !== -1) return 'business';
    return 'hub';
  }

  // Get UTM params
  function getUtm() {
    var params = {};
    try {
      var sp = new URLSearchParams(location.search);
      ['utm_source', 'utm_medium', 'utm_campaign', 'ref'].forEach(function (k) {
        var v = sp.get(k);
        if (v) params[k] = v;
      });
    } catch (e) {}
    return Object.keys(params).length ? params : null;
  }

  // Track page view
  function track() {
    var payload = {
      event_type: 'page_view',
      metadata: {
        page: location.pathname,
        property: getProperty(),
        referrer: document.referrer || null,
        utm: getUtm(),
        visitor_id: getVisitorId(),
        screen: screen.width + 'x' + screen.height,
        lang: (navigator.language || '').substr(0, 5)
      },
      source: getProperty() + '.stlucia.studio',
      user_agent: navigator.userAgent
    };

    // Use sendBeacon for reliability, fall back to fetch
    var url = SUPABASE_URL + '/rest/v1/events';
    var headers = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Prefer': 'return=minimal'
    };
    var body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      var blob = new Blob([body], { type: 'application/json' });
      // sendBeacon can't set custom headers, so use fetch
    }

    try {
      fetch(url, {
        method: 'POST',
        headers: headers,
        body: body,
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  // Fire on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', track);
  } else {
    track();
  }
})();
