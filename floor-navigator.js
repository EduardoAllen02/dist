!function () {

  /* ─── CONFIG GLOBAL ────────────────────────────────────────────────────────
   * DIST_BASE  → URL del index.html del dist (uno solo para todos los pisos)
   * TOURS_BASE → Base de assets si todos los pisos comparten la misma raíz.
   *              Si cada piso tiene su propio contentPath, déjalo vacío y
   *              ponlo por piso en el array FLOORS.
   * ──────────────────────────────────────────────────────────────────────── */
  var DIST_BASE  = 'https://eduardoallen02.github.io/dist/';
  var TOURS_BASE = '';   // ej: 'https://mi-servidor.com/tours/'

  var HOME_URL         = 'https://TU-LANDING.com/';
  var IMG_BASE         = 'https://virtualtours3d.s3.eu-west-1.amazonaws.com/SAP/Java+SAP/buttons/';
  var BRIGHTNESS_HOVER = 1.3;

  var NAV_TOP_DESKTOP  = 2;
  var NAV_TOP_MOBILE   = 12;
  var NAV_BOTTOM_VH    = 65;

  var LEFT_PX           = 8;
  var MOBILE_BREAKPOINT = 768;

  var FLOOR_NAMES = {
    'GF': 'SAP Milan - Ground Floor',
    '1F': 'SAP Milan - First Floor',
    '2F': 'SAP Milan - Second Floor',
    '3F': 'SAP Milan - Third Floor',
    '4F': 'SAP Milan - Fourth Floor',
    '5F': 'SAP Milan - Fifth Floor',
    '6F': 'SAP Milan - Sixth Floor'
  };

  /* ─── FLOOR LINKS ──────────────────────────────────────────────────────────
   * tourId     → ID del tour (nombre de la subcarpeta dentro de contentPath)
   * contentPath→ URL base de los assets de ese piso (sobreescribe TOURS_BASE)
   * img        → imagen del botón
   * ──────────────────────────────────────────────────────────────────────── */
  var FLOORS = [
    { l: '6F', tourId: 'SsZAVZjTPJqFki4tohl1rQ', contentPath: 'https://virtualtours3d.s3.eu-west-1.amazonaws.com/SAP/Virtual+tours/SAP6/wLtzKTQ-vUfiL4eQpXgMY/', img: '6F_Q.png' },
    { l: '5F', tourId: 'Kfg81D95N_uwbMZDm4P_aQ', contentPath: 'https://virtualtours3d.s3.eu-west-1.amazonaws.com/SAP/Virtual+tours/SAP5/wLtzKTQ-vUfiL4eQpXgMY/', img: '5F_Q.png' },
    { l: '4F', tourId: 'NZDBUCHUNDCWB45khkfk7w', contentPath: 'https://virtualtours3d.s3.eu-west-1.amazonaws.com/SAP/Virtual+tours/SAP4/wLtzKTQ-vUfiL4eQpXgMY/', img: '4F_Q.png' },
    { l: '3F', tourId: 'psbalPABO22nlaPk2iL7wQ',  contentPath: 'https://virtualtours3d.s3.eu-west-1.amazonaws.com/SAP/Virtual+tours/SAP3/wLtzKTQ-vUfiL4eQpXgMY/', img: '3F_Q.png' },
    { l: '2F', tourId: 'vkDhnv90NXq7P15ebi316g',  contentPath: 'https://virtualtours3d.s3.eu-west-1.amazonaws.com/SAP/Virtual+tours/SAP2/wLtzKTQ-vUfiL4eQpXgMY/', img: '2F_Q.png' },
    { l: '1F', tourId: 'u16wb_b4P-S3qKWzk0agug',  contentPath: 'https://eduardoallen02.github.io/dist/TsAuIJ2_1EgOAQYPENXpB/', img: '1F_Q.png' },
    { l: 'GF', tourId: 'Ia9teGNuMXei6WqP1rKIgw',  contentPath: 'https://eduardoallen02.github.io/dist/TsAuIJ2_1EgOAQYPENXpB/', img: 'GF_Q.png' }
  ];

  /* ─── CONSTRUCCIÓN DE URL ─────────────────────────────────────────────── */
  function buildTourUrl(floor) {
    var content = floor.contentPath || TOURS_BASE;
    return DIST_BASE + '?tour=' + floor.tourId + '&content-path=' + encodeURIComponent(content);
  }

  /* ─── DETECCIÓN DEL PISO ACTUAL desde ?tour= en el URL ───────────────── */
  function getCurrentFloor() {
    var params  = new URLSearchParams(window.location.search);
    var tourId  = params.get('tour');
    var current = FLOORS.filter(function (f) { return f.tourId === tourId; })[0];
    return current ? current.l : null;
  }

  /* ──────────────────────────────────────────────────────────────────────── */

  var LABEL_RATIO = 0.55;
  var SEP_RATIO   = 0.05;
  var GAP_RATIO   = 0.1;
  var ITEM_COUNT  = FLOORS.length + 1;

  function isMobile(winW) {
    return winW <= MOBILE_BREAKPOINT ||
           ('ontouchstart' in window && winW < 1024);
  }

  function getWin() {
    try { return { w: window.top.innerWidth, h: window.top.innerHeight }; }
    catch(e) { return { w: window.innerWidth, h: window.innerHeight }; }
  }

  function calcSizes(winH, topVH) {
    var availPx = winH * (NAV_BOTTOM_VH - topVH) / 100;
    var divisor = LABEL_RATIO + GAP_RATIO + ITEM_COUNT + (ITEM_COUNT - 1) * GAP_RATIO + SEP_RATIO;
    var size    = Math.floor(availPx / divisor);
    var gap     = Math.round(size * GAP_RATIO);
    var sepH    = Math.round(size * SEP_RATIO);
    var labelH  = Math.round(size * LABEL_RATIO);
    size   = Math.max(22, Math.min(64, size));
    gap    = Math.max(2,  Math.min(10, gap));
    labelH = Math.max(14, Math.min(36, labelH));
    return { size: size, gap: gap, sepH: sepH, labelH: labelH };
  }

  function go(u) {
    try { window.top.location.href = u; } catch (e) { window.location.href = u; }
  }

  function injectStyles(doc, b) {
    var ex = doc.getElementById('fn-styles');
    if (ex) ex.remove();
    var s = doc.createElement('style');
    s.id  = 'fn-styles';
    s.textContent =
      '#fn-root img {' +
        'display:block!important;' +
        'border-radius:10px!important;' +
        'cursor:pointer!important;' +
        'transition:transform 0.18s ease, filter 0.18s ease!important;' +
        'transform:scale(1)!important;' +
        'filter:brightness(1)!important;' +
        'opacity:1!important;' +
        'user-select:none!important;' +
        '-webkit-user-drag:none!important;' +
        'box-sizing:border-box!important;' +
        'flex-shrink:0!important;' +
        'pointer-events:auto!important;' +
      '}' +
      '#fn-root img:hover {' +
        'transform:scale(1.05)!important;' +
        'filter:brightness('+b+')!important;' +
      '}' +
      '#fn-root img.fn-active {' +
        'cursor:default!important;' +
        'transform:scale(1)!important;' +
        'filter:brightness('+b+') drop-shadow(0 0 6px rgba(0,185,230,0.9)) drop-shadow(0 0 14px rgba(0,185,230,0.5))!important;' +
      '}';
    doc.head.appendChild(s);
  }

  function applySize(el, size) {
    el.style.setProperty('width',  size + 'px', 'important');
    el.style.setProperty('height', size + 'px', 'important');
  }

  function setup(cur) {
    var floorName = FLOOR_NAMES[cur] || cur;

    var targetDoc, targetBody;
    try { targetDoc = window.top.document; targetBody = window.top.document.body; }
    catch (e) { targetDoc = document; targetBody = document.body; }

    var old = targetBody.querySelector('#fn-root');
    if (old) old.remove();

    var win    = getWin();
    var mobile = isMobile(win.w);
    var topVH  = mobile ? NAV_TOP_MOBILE : NAV_TOP_DESKTOP;
    var sz     = calcSizes(win.h, topVH);

    injectStyles(targetDoc, BRIGHTNESS_HOVER);

    /* ── root ── */
    var root = document.createElement('div');
    root.id  = 'fn-root';
    var rs   = root.style;
    rs.setProperty('position',       'fixed',        'important');
    rs.setProperty('top',            topVH + 'vh',   'important');
    rs.setProperty('left',           LEFT_PX + 'px', 'important');
    rs.setProperty('display',        'flex',         'important');
    rs.setProperty('flex-direction', 'column',       'important');
    rs.setProperty('align-items',    'flex-start',   'important');
    rs.setProperty('gap',            sz.gap + 'px',  'important');
    rs.setProperty('z-index',        '2147483647',   'important');
    rs.setProperty('pointer-events', 'auto',         'important');

    /* ── Label nombre del piso ── */
    var label = document.createElement('div');
    label.textContent = floorName;
    var ls = label.style;
    ls.setProperty('color',           '#ffffff',                    'important');
    ls.setProperty('font-weight',     '700',                        'important');
    ls.setProperty('font-family',     'sans-serif',                 'important');
    ls.setProperty('font-size',       sz.labelH * 0.7 + 'px',      'important');
    ls.setProperty('line-height',     '1',                          'important');
    ls.setProperty('white-space',     'nowrap',                     'important');
    ls.setProperty('text-shadow',     '0 1px 4px rgba(0,0,0,0.7)', 'important');
    ls.setProperty('pointer-events',  'none',                       'important');
    ls.setProperty('padding-left',    '4px',                        'important');
    root.appendChild(label);

    /* ── Home ── */
    var homeImg = document.createElement('img');
    homeImg.src = IMG_BASE + 'Home.png';
    homeImg.alt = 'Home';
    applySize(homeImg, sz.size);
    homeImg.addEventListener('click', function (e) {
      e.stopPropagation();
      go(HOME_URL);
    });
    root.appendChild(homeImg);

    /* ── Separator ── */
    var sep = document.createElement('div');
    sep.style.setProperty('height',      sz.sepH + 'px', 'important');
    sep.style.setProperty('width',       '1px',          'important');
    sep.style.setProperty('flex-shrink', '0',            'important');
    root.appendChild(sep);

    /* ── Floors ── */
    var allImgs = [homeImg];
    FLOORS.forEach(function (f) {
      var isActive = f.l === cur;
      var img = document.createElement('img');
      img.src = IMG_BASE + f.img;
      img.alt = f.l;
      applySize(img, sz.size);
      if (isActive) img.classList.add('fn-active');
      if (!isActive) {
        img.addEventListener('click', function (e) {
          e.stopPropagation();
          go(buildTourUrl(f));
        });
      }
      root.appendChild(img);
      allImgs.push(img);
    });

    targetBody.appendChild(root);
    console.log('[FloorNav] OK | piso:', cur, '| mobile:', mobile, '| size:', sz.size + 'px');

    /* ── Resize ── */
    var resizeTimer;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        var nw   = getWin();
        var nm   = isMobile(nw.w);
        var ntop = nm ? NAV_TOP_MOBILE : NAV_TOP_DESKTOP;
        var ns   = calcSizes(nw.h, ntop);
        root.style.setProperty('top', ntop + 'vh', 'important');
        root.style.setProperty('gap', ns.gap + 'px', 'important');
        label.style.setProperty('font-size', ns.labelH * 0.7 + 'px', 'important');
        sep.style.setProperty('height', ns.sepH + 'px', 'important');
        allImgs.forEach(function (img) { applySize(img, ns.size); });
      }, 100);
    }
    try { window.top.addEventListener('resize', onResize); }
    catch (e) { window.addEventListener('resize', onResize); }
  }

  function init(n) {
    n = n || 0;
    var cur = getCurrentFloor();
    if (cur) { setup(cur); return; }
    if (n < 30) setTimeout(function () { init(n + 1); }, 200);
    else console.warn('[FloorNav] tour ID no reconocido en el URL');
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', function () { init(); })
    : init();
}();
