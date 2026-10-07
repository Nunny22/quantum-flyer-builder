/* Quantum Live Productions — Venue Flyer Builder (V1) */
(function () {
  'use strict';

  // Editable text: id, page, label, max characters, max lines, default copy.
  var FIELDS = [
    { id: 'venue', page: 1, label: 'Venue name (optional, shows "Quantum at …")', max: 32, lines: 1, value: '' },
    { id: 'p1_head', page: 1, label: 'Headline (white)', max: 48, lines: 3, value: 'Events\nhit different\nwith the right' },
    { id: 'p1_accent', page: 1, label: 'Headline (orange)', max: 20, lines: 1, value: 'Production.' },
    { id: 'p1_caps', page: 1, label: 'Capability line', max: 80, lines: 1, value: 'Lighting   |   Sound   |   Video   |   Staging   |   Power   |   Production' },
    { id: 'p1_tag', page: 1, label: 'Small line', max: 90, lines: 2, value: 'Technical production\nfor events that need to get it right.' },

    { id: 'p2_eyebrow', page: 2, label: 'Eyebrow', max: 30, lines: 1, value: 'What we do' },
    { id: 'p2_head', page: 2, label: 'Heading', max: 40, lines: 2, value: 'Every element.\nOne team.' },
    { id: 'p2_intro', page: 2, label: 'Intro', max: 160, lines: 3, value: 'From a dinner for 80 to a full-scale stage show, we supply the complete technical production or just the parts you need.' },
    { id: 's_lighting', page: 2, label: 'Lighting copy', max: 70, lines: 2, value: 'Architectural, stage and atmospheric lighting.' },
    { id: 's_sound', page: 2, label: 'Sound copy', max: 60, lines: 2, value: 'Speeches, live bands and full PA systems.' },
    { id: 's_video', page: 2, label: 'Video copy', max: 70, lines: 2, value: 'LED screens, projection, cameras and playback.' },
    { id: 's_staging', page: 2, label: 'Staging copy', max: 60, lines: 2, value: 'Stages, set, drape and rigging.' },
    { id: 's_power', page: 2, label: 'Power copy', max: 70, lines: 2, value: 'Distribution and temporary power, planned properly.' },
    { id: 's_production', page: 2, label: 'People / Production copy', max: 60, lines: 2, value: 'Experienced crew and production management.' },

    { id: 'p3_eyebrow', page: 3, label: 'Eyebrow', max: 30, lines: 1, value: 'Real events' },
    { id: 'p3_head', page: 3, label: 'Heading', max: 40, lines: 2, value: 'Spaces\ntransformed.' },
    { id: 'p3_intro', page: 3, label: 'Intro', max: 130, lines: 2, value: 'The same room can be an awards dinner, a conference or a party. Here is some of what we have done with it.' },

    { id: 'p4_eyebrow', page: 4, label: 'Eyebrow', max: 30, lines: 1, value: 'Trusted by' },
    { id: 'client1', page: 4, label: 'Client 1', max: 22, lines: 1, value: 'Client name' },
    { id: 'client2', page: 4, label: 'Client 2', max: 22, lines: 1, value: 'Client name' },
    { id: 'client3', page: 4, label: 'Client 3', max: 22, lines: 1, value: 'Client name' },
    { id: 'client4', page: 4, label: 'Client 4', max: 22, lines: 1, value: 'Client name' },
    { id: 'client5', page: 4, label: 'Client 5', max: 22, lines: 1, value: 'Client name' },
    { id: 'client6', page: 4, label: 'Client 6', max: 22, lines: 1, value: 'Client name' },
    { id: 'p4_events', page: 4, label: 'Event types (one per line)', max: 200, lines: 7, value: 'Awards & dinners\nBrand activations\nCorporate events\nCharity galas\nProduct launches\nSporting events\nPrivate parties' },
    { id: 'p4_close', page: 4, label: 'Closing heading', max: 40, lines: 2, value: "Let's create\nsomething special." },
    { id: 'p4_copy', page: 4, label: 'Contact copy', max: 140, lines: 2, value: "Tell us what you're planning. We'll sort the technical side, plan the production and make sure it runs properly on the day." },
    { id: 'web', page: 4, label: 'Website', max: 40, lines: 1, value: 'www.quantumlp.co.uk' },
    { id: 'email', page: 4, label: 'Email', max: 40, lines: 1, value: 'enquiries@quantumlp.co.uk' },
    { id: 'phone', page: 4, label: 'Phone', max: 24, lines: 1, value: '01925 239171' }
  ];

  var MAX_EDGE = 2500;     // long-edge limit for imported photos
  var JPEG_QUALITY = 0.9;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var state = { page: 1, text: {}, images: {}, logo: null };  // logo: data URL, or null for the default
  var DEFAULT_LOGO = 'assets/logos/quantum-logo.svg';
  var PROJECT_VERSION = 1;
  var selectedImg = null;

  /* ---------- Text ---------- */

  function clampText(f, v) {
    return v.split('\n').slice(0, f.lines).join('\n').slice(0, f.max);
  }

  function renderText(id) {
    var v = state.text[id];
    var list = $('[data-list="' + id + '"]');
    if (list) {
      list.innerHTML = '';
      v.split('\n').filter(function (s) { return s.trim(); }).forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        li.setAttribute('data-field', id);
        list.appendChild(li);
      });
      return;
    }
    $$('[data-field="' + id + '"]').forEach(function (el) { el.textContent = v; });
    if (id === 'venue') $('#venueTag').classList.toggle('empty', !v.trim());
  }

  function buildTextFields() {
    var box = $('#textFields');
    box.innerHTML = '';
    FIELDS.filter(function (f) { return f.page === state.page; }).forEach(function (f) {
      var label = document.createElement('label');
      label.className = 'field';
      label.dataset.for = f.id;
      label.textContent = f.label;
      var count = document.createElement('small');
      label.appendChild(count);
      var input = document.createElement(f.lines > 1 ? 'textarea' : 'input');
      if (f.lines > 1) input.rows = Math.min(f.lines, 4);
      input.maxLength = f.max;
      input.value = state.text[f.id];
      var update = function () { count.textContent = input.value.length + '/' + f.max; };
      input.addEventListener('input', function () {
        var v = clampText(f, input.value);
        if (v !== input.value) input.value = v;
        state.text[f.id] = v;
        renderText(f.id);
        update();
      });
      update();
      label.appendChild(input);
      box.appendChild(label);
    });
  }

  function selectField(id) {
    var label = $('.field[data-for="' + id + '"]');
    if (!label) return;
    $$('.field.selected').forEach(function (l) { l.classList.remove('selected'); });
    label.classList.add('selected');
    label.scrollIntoView({ block: 'nearest' });
    var input = $('input, textarea', label);
    input.focus({ preventScroll: true });
  }

  /* ---------- Images: cover + crop ---------- */

  // Image size as a fraction of the frame (cover at zoom 1).
  function coverSize(frame, img, zoom) {
    // Frame geometry is fixed in mm (inline style), so this works for hidden pages too.
    var fa = parseFloat(frame.style.width) / parseFloat(frame.style.height);
    var ia = img.naturalWidth / img.naturalHeight;
    var w = ia >= fa ? ia / fa : 1;
    var h = ia >= fa ? 1 : fa / ia;
    return { w: w * zoom, h: h * zoom };
  }

  // Keep offsets (fractions of frame, from centre) inside the image so no empty area shows.
  function clamp(crop, size) {
    var mx = (size.w - 1) / 2, my = (size.h - 1) / 2;
    crop.offsetX = Math.max(-mx, Math.min(mx, crop.offsetX));
    crop.offsetY = Math.max(-my, Math.min(my, crop.offsetY));
  }

  function applyCrop(id) {
    var frame = $('.frame[data-img="' + id + '"]');
    var img = $('img', frame);
    var crop = state.images[id];
    if (!img.naturalWidth) return;
    var size = coverSize(frame, img, crop.zoom);
    clamp(crop, size);
    img.style.width = (size.w * 100) + '%';
    img.style.height = (size.h * 100) + '%';
    // translate % is relative to the image itself, so convert frame fractions.
    var tx = -50 + (crop.offsetX / size.w) * 100;
    var ty = -50 + (crop.offsetY / size.h) * 100;
    img.style.transform = 'translate(' + tx + '%,' + ty + '%)';
  }

  function setImageSrc(id, src) {
    var frame = $('.frame[data-img="' + id + '"]');
    var img = $('img', frame);
    img.onload = function () { applyCrop(id); };
    img.src = src;
    if (img.complete && img.naturalWidth) applyCrop(id);
  }

  function initFrames() {
    $$('.frame').forEach(function (frame) {
      var id = frame.dataset.img;
      var img = document.createElement('img');
      img.alt = '';
      img.draggable = false;
      frame.appendChild(img);
      state.images[id] = { src: frame.dataset.default, zoom: 1, offsetX: 0, offsetY: 0 };
      setImageSrc(id, frame.dataset.default);

      var drag = null;
      frame.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;
        selectImage(id);
        var c = state.images[id];
        drag = { x: e.clientX, y: e.clientY, ox: c.offsetX, oy: c.offsetY };
        frame.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      frame.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var r = frame.getBoundingClientRect(); // includes preview scale
        var c = state.images[id];
        c.offsetX = drag.ox + (e.clientX - drag.x) / r.width;
        c.offsetY = drag.oy + (e.clientY - drag.y) / r.height;
        applyCrop(id);
      });
      var end = function () { drag = null; };
      frame.addEventListener('pointerup', end);
      frame.addEventListener('pointercancel', end);
    });
  }

  function buildImageList() {
    var list = $('#imgList');
    list.innerHTML = '';
    $$('.page[data-page="' + state.page + '"] .frame').forEach(function (frame) {
      var b = document.createElement('button');
      b.textContent = frame.dataset.label;
      b.dataset.img = frame.dataset.img;
      b.addEventListener('click', function () { selectImage(frame.dataset.img); });
      list.appendChild(b);
    });
  }

  function selectImage(id) {
    selectedImg = id;
    $$('.frame.selected').forEach(function (f) { f.classList.remove('selected'); });
    var frame = id && $('.frame[data-img="' + id + '"]');
    $$('#imgList button').forEach(function (b) { b.classList.toggle('active', b.dataset.img === id); });
    $('#imgControls').hidden = !frame;
    if (!frame) return;
    frame.classList.add('selected');
    $('#imgName').textContent = 'Page ' + frame.closest('.page').dataset.page + ' · ' + frame.dataset.label;
    $('#zoom').value = state.images[id].zoom;
    $('#imgControls').scrollIntoView({ block: 'nearest' });
  }

  // Load a local file, downscaling to MAX_EDGE on the long edge if needed. Nothing is uploaded.
  function importImage(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, long = Math.max(w, h);
        if (long <= MAX_EDGE) return resolve(url);
        var k = MAX_EDGE / long;
        var canvas = document.createElement('canvas');
        canvas.width = Math.round(w * k);
        canvas.height = Math.round(h * k);
        var ctx = canvas.getContext('2d');
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(function (blob) {
          canvas.width = canvas.height = 0;
          blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('Could not process image'));
        }, 'image/jpeg', JPEG_QUALITY);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Not a readable image')); };
      img.src = url;
    });
  }

  /* ---------- Pages ---------- */

  function showPage(n) {
    state.page = n;
    $$('.page').forEach(function (p) { p.classList.toggle('active', +p.dataset.page === n); });
    $$('#pageNav button').forEach(function (b) { b.classList.toggle('active', +b.dataset.goto === n); });
    buildTextFields();
    buildImageList();
    var sel = selectedImg && $('.frame[data-img="' + selectedImg + '"]');
    selectImage(sel && sel.closest('.page').dataset.page == n ? selectedImg : null);
  }

  function fitPreview() {
    var pv = $('#preview');
    var page = $('.page.active');
    if (!page) return;
    var pad = 48;
    var s = Math.min((pv.clientWidth - pad) / page.offsetWidth, (pv.clientHeight - pad) / page.offsetHeight);
    pv.style.setProperty('--s', Math.max(0.1, s));
  }

  /* ---------- Wire up ---------- */

  FIELDS.forEach(function (f) { state.text[f.id] = f.value; renderText(f.id); });
  initFrames();

  $$('#pageNav button').forEach(function (b) {
    b.addEventListener('click', function () { showPage(+b.dataset.goto); fitPreview(); });
  });

  // Click text in the preview -> its editor field.
  $('#preview').addEventListener('click', function (e) {
    var el = e.target.closest('[data-field]');
    if (!el) return;
    $$('.text-selected').forEach(function (t) { t.classList.remove('text-selected'); });
    el.classList.add('text-selected');
    selectField(el.dataset.field);
  });

  $('#btnReplace').addEventListener('click', function () { $('#fileInput').click(); });
  $('#fileInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    var id = selectedImg;
    e.target.value = '';
    if (!file || !id) return;
    importImage(file).then(function (src) {
      var c = state.images[id];
      if (c.src && c.src.indexOf('blob:') === 0) URL.revokeObjectURL(c.src);
      state.images[id] = { src: src, zoom: 1, offsetX: 0, offsetY: 0 };
      $('#zoom').value = 1;
      setImageSrc(id, src);
    }).catch(function (err) { alert(err.message); });
  });

  $('#zoom').addEventListener('input', function (e) {
    if (!selectedImg) return;
    state.images[selectedImg].zoom = +e.target.value;
    applyCrop(selectedImg);
  });

  $('#btnReset').addEventListener('click', function () {
    if (!selectedImg) return;
    var c = state.images[selectedImg];
    c.zoom = 1; c.offsetX = 0; c.offsetY = 0;
    $('#zoom').value = 1;
    applyCrop(selectedImg);
  });

  // Hidden pages don't trigger font loads, so make sure every face is ready before printing.
  ['400 1em Barlow', '600 1em Barlow', '600 1em "Barlow Condensed"', '700 1em "Barlow Condensed"'].forEach(function (f) { document.fonts.load(f); });

  /* ---------- Branding: replaceable logo ---------- */

  function setLogo(dataUrl) {
    state.logo = dataUrl || null;
    $$('.q-logo').forEach(function (img) { img.src = state.logo || DEFAULT_LOGO; });
  }

  function readAsDataURL(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(new Error('Could not read file')); };
      r.readAsDataURL(blob);
    });
  }

  $('#btnLogo').addEventListener('click', function () { $('#logoInput').click(); });
  $('#logoInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) return alert('Please choose a PNG, JPG, SVG or WebP logo.');
    readAsDataURL(file).then(setLogo).catch(function (err) { alert(err.message); });
  });
  $('#btnLogoReset').addEventListener('click', function () { setLogo(null); });

  /* ---------- Save / Load project (.quantum = JSON with embedded images) ---------- */

  function srcToSaved(src) {
    if (src.indexOf('blob:') !== 0) return Promise.resolve(src); // default asset path
    return fetch(src).then(function (r) { return r.blob(); }).then(readAsDataURL);
  }

  function saveProject() {
    var ids = Object.keys(state.images);
    return Promise.all(ids.map(function (id) { return srcToSaved(state.images[id].src); })).then(function (srcs) {
      var images = {};
      ids.forEach(function (id, i) {
        var c = state.images[id];
        images[id] = { src: srcs[i], zoom: c.zoom, offsetX: c.offsetX, offsetY: c.offsetY };
      });
      var project = { version: PROJECT_VERSION, app: 'quantum-flyer-builder', savedAt: new Date().toISOString(), text: state.text, images: images, logo: state.logo };
      var name = (state.text.venue || '').trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'Quantum-Flyer';
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(project)], { type: 'application/json' }));
      a.download = name + '.quantum';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    }).catch(function (err) { alert('Could not save project: ' + err.message); });
  }

  var isNum = function (n) { return typeof n === 'number' && isFinite(n); };
  var isImgSrc = function (s) { return typeof s === 'string' && (/^data:image\//.test(s) || /^assets\/images\/[\w.-]+$/.test(s)); };

  // Returns an error message, or '' if the project can be applied.
  function validateProject(p) {
    if (!p || typeof p !== 'object' || p.app !== 'quantum-flyer-builder') return 'This is not a Quantum Flyer Builder project file.';
    if (p.version !== PROJECT_VERSION) return 'This project was saved in an unsupported format (version ' + p.version + ').';
    if (!p.text || typeof p.text !== 'object' || !p.images || typeof p.images !== 'object') return 'The project file is incomplete.';
    for (var k in p.text) if (typeof p.text[k] !== 'string') return 'The project file has invalid text.';
    for (var id in p.images) {
      var c = p.images[id];
      if (!c || !isImgSrc(c.src) || !isNum(c.zoom) || c.zoom < 1 || !isNum(c.offsetX) || !isNum(c.offsetY)) return 'The project file has an invalid image (' + id + ').';
    }
    if (p.logo !== null && p.logo !== undefined && !(typeof p.logo === 'string' && /^data:image\//.test(p.logo))) return 'The project file has an invalid logo.';
    return '';
  }

  function savedToSrc(src) {
    if (src.indexOf('data:') !== 0) return Promise.resolve(src);
    return fetch(src).then(function (r) { return r.blob(); }).then(function (b) { return URL.createObjectURL(b); });
  }

  function applyProject(p) {
    var ids = Object.keys(state.images).filter(function (id) { return p.images[id]; });
    return Promise.all(ids.map(function (id) { return savedToSrc(p.images[id].src); })).then(function (srcs) {
      FIELDS.forEach(function (f) {
        var v = typeof p.text[f.id] === 'string' ? p.text[f.id] : f.value;
        state.text[f.id] = clampText(f, v);
        renderText(f.id);
      });
      Object.keys(state.images).forEach(function (id) {
        var old = state.images[id].src;
        if (old.indexOf('blob:') === 0) URL.revokeObjectURL(old);
        var frame = $('.frame[data-img="' + id + '"]');
        var i = ids.indexOf(id), c = i < 0 ? null : p.images[id];
        state.images[id] = c ? { src: srcs[i], zoom: Math.min(3, c.zoom), offsetX: c.offsetX, offsetY: c.offsetY }
                             : { src: frame.dataset.default, zoom: 1, offsetX: 0, offsetY: 0 };
        setImageSrc(id, state.images[id].src);
      });
      setLogo(p.logo || null);
      showPage(state.page);
    });
  }

  $('#btnSave').addEventListener('click', saveProject);
  $('#btnLoad').addEventListener('click', function () { $('#projectInput').click(); });
  $('#projectInput').addEventListener('change', function (e) {
    var file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    file.text().then(function (txt) {
      var p;
      try { p = JSON.parse(txt); } catch (err) { throw new Error('The file is not a valid project file.'); }
      var problem = validateProject(p);
      if (problem) throw new Error(problem);
      return applyProject(p);
    }).catch(function (err) { alert('Could not load project. ' + err.message); });
  });

  $('#btnPrint').addEventListener('click', function () {
    document.fonts.ready.then(function () { window.print(); });
  });

  window.addEventListener('resize', fitPreview);
  showPage(1);
  fitPreview();

  // Exposed for debugging/testing only.
  window.QFB = { state: state, importImage: importImage };
})();
