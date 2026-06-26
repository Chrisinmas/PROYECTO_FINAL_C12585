/**
 * <destino-detalle> - Custom Element
 * Vista completa de un destino turístico.
 * Integra internamente <galeria-imagenes> y <audio-guia>.
 *
 * Atributos observados:
 *   - destino: objeto JSON serializado con todos los datos del destino
 *
 * Uso:
 *   <destino-detalle destino='{"id":"caribe-001","nombre":"Cahuita",...}'>
 *   </destino-detalle>
 *
 * Eventos emitidos:
 *   - detalle-cerrado: CustomEvent (sin detail) al hacer clic en "Volver"
 */

// ── Template a nivel de módulo ───────────────────────────────────────────────
const template = document.createElement("template");
template.innerHTML = `
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      width: 100%;
      font-family: 'Lato', system-ui, sans-serif;
      position: relative;
    }

    /* ── Fondo difuminado con imagen de portada ── */
    .fondo-bg {
      position: fixed;
      inset: 0;
      background-size: cover;
      background-position: center;
      background-color: #1a3d2b;
      filter: blur(8px) brightness(0.55);
      transform: scale(1.05);
      z-index: -1;
      transition: background-image 0.5s ease;
    }

    /* ── Botón volver ── */
    .btn-volver {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.15);
      border: 1.5px solid rgba(255,255,255,0.5);
      border-radius: 999px;
      color: #ffffff;
      cursor: pointer;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.4rem 1rem;
      margin-bottom: 1.75rem;
      transition: background 0.2s, color 0.2s;
      backdrop-filter: blur(4px);
    }

    .btn-volver:hover {
      background: rgba(255,255,255,0.28);
    }

    /* ── Layout principal: dos columnas ── */
    .detalle-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }

    /* ── Columna izquierda: info ── */
    .col-info {}

    .region-label {
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #f5c842;
      margin-bottom: 0.4rem;
    }

    .destino-nombre {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
      margin-bottom: 1.1rem;
    }

    .destino-descripcion {
      font-size: 0.93rem;
      color: rgba(255,255,255,0.85);
      line-height: 1.8;
      margin-bottom: 1.5rem;
    }

    /* ── Actividades ── */
    .actividades-titulo {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: #f5c842;
      margin-bottom: 0.75rem;
    }

    .actividades-lista {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      margin-bottom: 1.75rem;
    }

    .actividades-lista li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: rgba(255,255,255,0.88);
    }

    .actividades-lista li::before {
      content: "✦";
      color: #f5c842;
      font-size: 0.65rem;
      flex-shrink: 0;
    }

    /* ── Columna derecha: media ── */
    .col-media {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* Slots para los sub-componentes */
    galeria-imagenes,
    audio-guia,
    video-destino {
      display: block;
      width: 100%;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .detalle-grid {
        grid-template-columns: 1fr;
      }

      .col-media {
        order: -1; /* Imagen primero en móvil */
      }
    }
  </style>

  <!-- Fondo difuminado -->
  <div class="fondo-bg"></div>

  <!-- Botón volver -->
  <button class="btn-volver" aria-label="Volver a la lista de destinos">
    ← Volver
  </button>

  <!-- Grid de dos columnas -->
  <div class="detalle-grid">

    <!-- Columna izquierda: info textual -->
    <div class="col-info">
      <p class="region-label"></p>
      <h2 class="destino-nombre"></h2>
      <p class="destino-descripcion"></p>

      <h3 class="actividades-titulo">Actividades</h3>
      <ul class="actividades-lista"></ul>
    </div>

    <!-- Columna derecha: galería + audio -->
    <div class="col-media">
      <galeria-imagenes></galeria-imagenes>
      <audio-guia></audio-guia>
    </div>

  </div>
`;

// ── Clase del componente ─────────────────────────────────────────────────────
class DestinoDetalle extends HTMLElement {

  static get observedAttributes() {
    return ["destino"];
  }

  constructor() {
    super();
    this._shadow  = this.attachShadow({ mode: "open" });
    this._destino = null;
  }

  connectedCallback() {
    this._shadow.appendChild(template.content.cloneNode(true));

    // Importar sub-componentes dinámicamente
    // (ya deben estar registrados desde index.html)
    this._attachEvents();
    this._renderDestino();
  }

  disconnectedCallback() {
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "destino" && oldValue !== newValue) {
      this._renderDestino();
    }
  }

  // ── Propiedad para pasar el objeto directamente sin serializar ───────────────
  set destinoData(obj) {
    this._destino = obj;
    this._renderDestino();
  }

  // ── Renderizado ──────────────────────────────────────────────────────────────

  _renderDestino() {
    // Intentar obtener el destino del atributo si no viene por propiedad
    if (!this._destino) {
      const attr = this.getAttribute("destino");
      if (!attr) return;
      try {
        this._destino = JSON.parse(attr);
      } catch (e) {
        console.error("<destino-detalle>: atributo 'destino' inválido", e);
        return;
      }
    }

    const d = this._destino;
    const shadow = this._shadow;
    if (!shadow.querySelector(".destino-nombre")) return;

    // ── Fondo difuminado con imagen de portada ──
    const fondoBg = shadow.querySelector(".fondo-bg");
    if (fondoBg && d.imagen_portada) {
      fondoBg.style.backgroundImage = `url('${d.imagen_portada}')`;
    }

    // ── Textos ──
    shadow.querySelector(".region-label").textContent      = d.region     || "";
    shadow.querySelector(".destino-nombre").textContent    = d.nombre     || "";
    shadow.querySelector(".destino-descripcion").textContent = d.descripcion || "";

    // ── Actividades ──
    const lista = shadow.querySelector(".actividades-lista");
    lista.innerHTML = "";
    (d.actividades || []).forEach(act => {
      const li = document.createElement("li");
      li.textContent = act;
      lista.appendChild(li);
    });

    // ── Galería ──
    const galeria = shadow.querySelector("galeria-imagenes");
    if (galeria && d.galeria) {
      galeria.setAttribute("imagenes", JSON.stringify(d.galeria));
      if (d.video)          galeria.setAttribute("video",  d.video);
      if (d.imagen_portada) galeria.setAttribute("poster", d.imagen_portada);
    }

    // ── Audio ──
    const audio = shadow.querySelector("audio-guia");
    if (audio) {
      audio.setAttribute("src",   d.audio  || "");
      audio.setAttribute("label", `Audio guía: ${d.nombre}`);
    }
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    this._shadow.querySelector(".btn-volver").addEventListener("click", () => {
      // Detener audio al volver
      const audioEl = this._shadow.querySelector("audio-guia");
      if (audioEl) {
        const audio = audioEl.shadowRoot?.querySelector("audio");
        if (audio) audio.pause();
      }

      this.dispatchEvent(new CustomEvent("detalle-cerrado", {
        bubbles: true,
        composed: true,
      }));
    });
  }
}

customElements.define("destino-detalle", DestinoDetalle);