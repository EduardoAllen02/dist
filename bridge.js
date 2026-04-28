(function () {

  /* ════════════════════════════════════════════════════════════════════════
   *  SECCIÓN DE CONFIG — lo único que se edita al entregar a un cliente
   * ════════════════════════════════════════════════════════════════════════
   *
   *  DEFAULT_TOUR_ID → tourId que carga cuando no hay ?tour= en la URL
   *  TOURS           → un objeto por tour: { tourId, parentFolder }
   *    tourId       → ID del tour (nombre de la subcarpeta dentro de parentFolder)
   *    parentFolder → nombre de la carpeta hermana de dist/ que contiene ese tour
   *
   *  Ejemplo de estructura de carpetas:
   *    raiz/
   *      dist/          ← el player
   *      ParentFolder/          ← parentFolder
   *        Ia9teGNuMXei6WqP1rKIgw/   ← tourId (subcarpeta)
   *          tourData.json
   *          ...
   * ════════════════════════════════════════════════════════════════════════ */

  var DEFAULT_TOUR_ID = 'vkDhnv90NXq7P15ebi316g';

  var TOURS = [
    { tourId: 'Ia9teGNuMXei6WqP1rKIgw', parentFolder: 'dist/TsAuIJ2_1EgOAQYPENXpB' },
    { tourId: 'vkDhnv90NXq7P15ebi316g', parentFolder: 'dist' }
  ];

  /* ════════════════════════════════════════════════════════════════════════
   *  LÓGICA AUTOMÁTICA — no editar
   * ════════════════════════════════════════════════════════════════════════ */

  /**
   * Sube un nivel desde /dist/ para obtener la raíz del proyecto.
   * Funciona sin importar en qué subcarpeta del servidor esté montado.
   *
   * Ejemplos:
   *   https://cdn.com/dist/index.html        → https://cdn.com/
   *   https://cdn.com/vtours/dist/index.html → https://cdn.com/vtours/
   */
  function computeBase() {
    var loc   = window.location;
    var parts = loc.pathname.split('/').filter(function (s) { return s !== ''; });
    var idx   = parts.indexOf('dist');
    if (idx !== -1) parts = parts.slice(0, idx);
    return loc.origin + (parts.length ? '/' + parts.join('/') + '/' : '/');
  }

  var BASE      = computeBase();
  var DIST_BASE = BASE + 'dist/';

  /* Enriquece cada tour con su contentPath absoluto (calculado en runtime) */
  var tours = TOURS.map(function (t) {
    return {
      tourId:       t.tourId,
      parentFolder: t.parentFolder,
      contentPath:  BASE + t.parentFolder + '/'
    };
  });

  function findTour(tourId) {
    for (var i = 0; i < tours.length; i++) {
      if (tours[i].tourId === tourId) return tours[i];
    }
    return null;
  }

  /**
   * Construye la URL completa para abrir un tour en el player.
   * Las extensiones (floor-navigator, etc.) deben usar esto para navegar.
   */
  function buildTourUrl(tourId) {
    var t = findTour(tourId);
    if (!t) return null;
    return DIST_BASE + '?tour=' + t.tourId +
           '&content-path=' + encodeURIComponent(t.contentPath);
  }

  /* ── Inyección de parámetros en la URL ───────────────────────────────── */
  var params        = new URLSearchParams(window.location.search);
  var currentTourId = params.get('tour');

  if (!currentTourId) {
    /* No hay ?tour= → inyectar el tour por defecto */
    var def = findTour(DEFAULT_TOUR_ID) || tours[0];
    if (def) {
      params.set('tour', def.tourId);
      params.set('content-path', def.contentPath);
      history.replaceState(null, '', window.location.pathname + '?' + params.toString());
      currentTourId = def.tourId;
    }
  } else if (!params.get('content-path')) {
    /* Hay ?tour= pero falta ?content-path= → completarlo */
    var t = findTour(currentTourId);
    if (t) {
      params.set('content-path', t.contentPath);
      history.replaceState(null, '', window.location.pathname + '?' + params.toString());
    }
  }

  /* ── Interceptor de fetch (seguro adicional) ─────────────────────────
   *
   * Aunque app.js ya reescribe las URLs de rowi cuando recibe content-path,
   * este interceptor actúa como segunda capa: captura la respuesta de
   * tourData.json antes de que app.js la procese y sustituye cualquier URL
   * de rowi-models por la ruta local correspondiente.
   *
   * Es idempotente: si app.js ya lo hizo primero, su regex no encuentra
   * nada que reemplazar. Sin conflicto.
   * ─────────────────────────────────────────────────────────────────── */
  var tourMap = {};
  tours.forEach(function (t) { tourMap[t.tourId] = t.contentPath; });

  /* Regex para URLs de rowi: captura el tourId tras /orders/ */
  var ROWI_RE = /https?:\/\/rowi(?:lab)?-models\.s3[^\/]*\.amazonaws\.com\/orders\/([^\/]+)\//g;

  function patchRowiUrls(text) {
    return text.replace(ROWI_RE, function (match, tourId) {
      var cp = tourMap[tourId];
      return cp ? cp + tourId + '/' : match;
    });
  }

  var _origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    return _origFetch.call(this, input, init).then(function (response) {
      if (url.indexOf('tourData.json') === -1) return response;
      return response.text().then(function (text) {
        return new Response(patchRowiUrls(text), {
          status:     response.status,
          statusText: response.statusText,
          headers:    response.headers
        });
      });
    });
  };

  /* ── API pública para extensiones ────────────────────────────────────── */
  window.__BRIDGE = {
    base:          BASE,
    distBase:      DIST_BASE,
    tours:         tours,
    currentTourId: currentTourId,
    findTour:      findTour,
    buildTourUrl:  buildTourUrl
  };

}());
