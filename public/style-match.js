/* ---- "Start with your own piece" — guest style match (.gm) ------------
   Hand-written, NOT generated (unlike app.js), and loaded by index.html only.

   1. The visitor picks a photo. It is downscaled in a canvas (≤1600px JPEG,
      so phone photos clear the backend's 3 MB cap) and posted to
      POST {api}/api/public/style-match/tag, which tags it synchronously.
   2. The tags come back as chips; the Women/Men toggle is preselected from
      the model's gender_tags.
   3. "Find the best match" sends the tags back to /find and renders the
      Discovery looks built around the piece. The visitor's own slot comes
      back as source "guest" with no item — we draw their photo there.

   Without JS (or fetch / FormData) .gm-body stays hidden and the section is
   just its head and the App Store link. Every string from the API goes in
   through textContent / src, never innerHTML. --------------------------- */
(function styleMatch() {
  var root = document.querySelector('.gm');
  if (!root || !window.fetch || !window.FormData) return;

  var LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  var API = (LOCAL ? 'http://localhost:5001' : root.getAttribute('data-api')) + '/api/public/style-match';
  var MAX_EDGE = 1600;

  var $ = function (sel) { return root.querySelector(sel); };
  var body = $('.gm-body');
  var drop = $('.gm-drop');
  var fileInput = $('[data-gm-file]');
  var statusEl = $('[data-gm-status]');
  var tagged = $('[data-gm-tagged]');
  var nameEl = $('[data-gm-name]');
  var tagsEl = $('[data-gm-tags]');
  var findBtn = $('[data-gm-find]');
  var resetBtn = $('[data-gm-reset]');
  var results = $('[data-gm-results]');
  var emptyHTML = results.innerHTML;

  var item = null, photoURL = null, busy = false;

  body.hidden = false;

  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }

  function setStatus(text, kind) {
    statusEl.textContent = text || '';
    statusEl.className = 'gm-status' + (kind ? ' is-' + kind : '');
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  var ERRORS = {
    image_too_large: 'That photo is too large. Try one under 3 MB.',
    unsupported_image: 'Please upload a JPEG, PNG or WebP photo.',
    unclassified_item: 'We couldn’t tell what garment this is. Try a clearer photo of a single item.',
    tagging_failed: 'We couldn’t read that photo. Try another one.',
    rate_limited: 'Too many tries at once. Wait a moment and try again.',
    daily_limit: 'You’ve used today’s free tries. Get the app to match every piece you own.'
  };

  function errorMessage(res, data) {
    var code = data && data.detail && data.detail.code;
    return ERRORS[code] || (res && res.status >= 500
      ? 'Something went wrong on our side. Please try again.'
      : 'Something went wrong. Please try again.');
  }

  function request(path, init) {
    return fetch(API + path, init).then(function (res) {
      return res.json().catch(function () { return null; }).then(function (data) {
        if (!res.ok) { var err = new Error(errorMessage(res, data)); err.code = data && data.detail && data.detail.code; throw err; }
        return data;
      });
    }, function () {
      throw new Error('Can’t reach Macgie right now. Check your connection and try again.');
    });
  }

  /* Re-encode through a canvas: caps the size and drops EXIF. A decode
     failure falls back to the original file and lets the server judge it. */
  function downscale(file) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(function (blob) { resolve(blob || file); }, 'image/jpeg', 0.9);
      };
      img.onerror = function () { resolve(file); };
      img.src = photoURL;
    });
  }

  function reset() {
    item = null;
    if (photoURL) URL.revokeObjectURL(photoURL);
    photoURL = null;
    fileInput.value = '';
    var old = drop.querySelector('img');
    if (old) old.remove();
    drop.classList.remove('has-photo');
    tagged.hidden = true;
    resetBtn.hidden = true;
    results.innerHTML = emptyHTML;
    setStatus('');
  }

  function pretty(value) {
    value = String(value || '').replace(/_/g, ' ').toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function renderTags(tags) {
    nameEl.textContent = tags.name || pretty(tags.category) || 'Your item';
    tagsEl.textContent = '';
    var phys = tags.physical_attributes || {};
    [tags.category, tags.dominant_color, phys.normalized_fit !== 'NA' && phys.normalized_fit,
      tags.pattern, tags.fabric_type, tags.formality_level]
      .filter(Boolean)
      .forEach(function (t) { tagsEl.appendChild(el('li', null, pretty(t))); });

    var genders = tags.gender_tags || [];
    var pick = genders.indexOf('W') >= 0 && genders.indexOf('M') < 0 ? 'W'
      : genders.indexOf('M') >= 0 && genders.indexOf('W') < 0 ? 'M' : null;
    Array.prototype.forEach.call(root.querySelectorAll('input[name="gm-gender"]'), function (r) {
      r.checked = r.value === pick;
    });
    tagged.hidden = false;
  }

  function handleFile(file) {
    if (busy || !file) return;
    if (!/^image\//.test(file.type)) { setStatus(ERRORS.unsupported_image, 'error'); return; }
    reset();
    photoURL = URL.createObjectURL(file);
    var preview = el('img');
    preview.alt = 'Your uploaded item';
    preview.src = photoURL;
    drop.appendChild(preview);
    drop.classList.add('has-photo');
    resetBtn.hidden = false;

    busy = true;
    setStatus('Reading your piece… this takes about 10 seconds.', 'busy');
    track('guest_item_uploaded');
    downscale(file).then(function (blob) {
      var form = new FormData();
      form.append('image', blob, 'item.jpg');
      return request('/tag', { method: 'POST', body: form });
    }).then(function (data) {
      item = data.item;
      renderTags(item);
      setStatus(data.remaining_today != null
        ? 'Tagged. ' + data.remaining_today + ' free ' + (data.remaining_today === 1 ? 'try' : 'tries') + ' left today.'
        : 'Tagged.');
      track('guest_item_tagged', { category_code: item.category_code || 'unknown' });
      findBtn.focus();
    }).catch(function (err) {
      setStatus(err.message, 'error');
      track('guest_item_tag_failed', { error_code: err.code || 'network_error' });
    }).then(function () { busy = false; });
  }

  // Cut-out first, then studio shot, then the original; a broken one
  // (some catalog cut-outs 404) falls through to the next.
  function sourcesOf(it) {
    return it ? [it.image_png, it.image_studio, it.image_url].filter(Boolean) : [];
  }
  function setSrc(img, sources) {
    var i = 0;
    img.onerror = function () { if (++i < sources.length) img.src = sources[i]; else img.onerror = null; };
    img.src = sources[0];
  }

  function pieceImage(slot) {
    var img = el('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    if (slot.source === 'guest') {
      img.src = photoURL;
      img.alt = 'Your item';
    } else {
      setSrc(img, sourcesOf(slot.item));
      img.alt = slot.item.name || pretty(slot.item.category);
    }
    return img;
  }

  function renderLooks(data) {
    results.textContent = '';
    if (data.state !== 'success' || !data.outfits.length) {
      var empty = el('div', 'gm-empty');
      var p = el('p', null, 'No looks with this piece yet. Our stylists add new ones every week — or ');
      var a = el('a', null, 'get the app');
      a.href = 'https://apps.apple.com/app/id6766749757';
      p.appendChild(a);
      p.appendChild(document.createTextNode(' to build looks from your whole wardrobe.'));
      empty.appendChild(p);
      results.appendChild(empty);
      return;
    }
    var n = data.outfits.length;
    results.appendChild(el('p', 'gm-count', n + (n === 1 ? ' look' : ' looks') + ' built around your piece'));
    var grid = el('ul', 'gm-grid');
    data.outfits.forEach(function (look) {
      var li = el('li', 'gm-look');
      var cover = el('div', 'gm-cover');
      var slots = look.slots.filter(function (s) { return s.source === 'guest' || sourcesOf(s.item).length; });
      if (look.inspiration.composite_image_url) {
        var c = el('img');
        c.src = look.inspiration.composite_image_url;
        c.alt = look.inspiration.title || 'Outfit';
        c.loading = 'lazy';
        cover.appendChild(c);
      } else {
        var collage = el('div', 'gm-collage');
        slots.slice(0, 4).forEach(function (s) { collage.appendChild(pieceImage(s)); });
        cover.appendChild(collage);
      }
      var exact = look.anchor_match === 'exact';
      cover.appendChild(el('span', 'gm-badge' + (exact ? ' gm-badge--exact' : ''), exact ? 'Exact match' : 'Similar piece'));
      li.appendChild(cover);
      li.appendChild(el('h3', null, look.inspiration.title || 'Outfit'));
      var pieces = el('ul', 'gm-pieces');
      slots.forEach(function (s) {
        var piece = el('li', s.source === 'guest' ? 'is-yours' : null);
        piece.appendChild(pieceImage(s));
        pieces.appendChild(piece);
      });
      li.appendChild(pieces);
      grid.appendChild(li);
    });
    results.appendChild(grid);
  }

  function find() {
    if (busy || !item) return;
    var checked = root.querySelector('input[name="gm-gender"]:checked');
    var payload = { item: item };
    if (checked) payload.gender = checked.value;

    busy = true;
    findBtn.disabled = true;
    findBtn.classList.add('is-pressed');
    setTimeout(function () { findBtn.classList.remove('is-pressed'); }, 220);
    setStatus('Finding looks…', 'busy');
    track('guest_match_requested', { gender: payload.gender || 'all' });
    request('/find', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (data) {
      renderLooks(data);
      setStatus('');
      track('guest_match_viewed', { outfit_count: data.outfits.length, state: data.state });
      if (window.matchMedia('(max-width: 860px)').matches) results.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }).catch(function (err) {
      setStatus(err.message, 'error');
    }).then(function () { busy = false; findBtn.disabled = false; });
  }

  fileInput.addEventListener('change', function () { handleFile(fileInput.files[0]); });
  findBtn.addEventListener('click', find);
  resetBtn.addEventListener('click', function () { if (!busy) { reset(); fileInput.focus(); } });

  ['dragenter', 'dragover'].forEach(function (type) {
    drop.addEventListener(type, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (type) {
    drop.addEventListener(type, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
  });
  drop.addEventListener('drop', function (e) {
    var f = e.dataTransfer && e.dataTransfer.files[0];
    if (f) handleFile(f);
  });
})();
