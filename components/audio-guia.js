/**
 * <audio-guia> - Custom Element
 * Reproductor de audio personalizado para la guía de cada destino.
 *
 * Atributos observados:
 *   - src   : ruta del archivo de audio (ej: "assets/audio/cahuita-guia.mp3")
 *   - label : texto descriptivo del audio (ej: "Audio guía: Cahuita")
 *
 * Uso:
 *   <audio-guia src="assets/audio/cahuita-guia.mp3" label="Audio guía: Cahuita">
 *   </audio-guia>
 */

// ── Template a nivel de módulo ───────────────────────────────────────────────
const template = document.createElement("template");
template.innerHTML = `
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      width: 100%;
    }

    /* ── Contenedor principal ── */
    .reproductor {
      background: #f4f1eb;
      border: 1.5px solid #ddd;
      border-radius: 12px;
      padding: 0.9rem 1.1rem;
      display: flex;
      align-items: center;
      gap: 0.9rem;
    }

    /* ── Botón play/pause ── */
    .btn-play {
      flex-shrink: 0;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      background: #2d5a3d;
      color: #fff;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, transform 0.15s;
      box-shadow: 0 2px 8px rgba(0,0,0,.18);
    }

    .btn-play:hover {
      background: #3d7a54;
      transform: scale(1.07);
    }

    .btn-play:disabled {
      background: #aaa;
      cursor: default;
      transform: none;
    }

    /* Icono SVG dentro del botón */
    .icon-play, .icon-pause {
      display: block;
      width: 14px;
      height: 14px;
      fill: #fff;
    }
    .icon-pause { display: none; }

    :host(.playing) .icon-play  { display: none; }
    :host(.playing) .icon-pause { display: block; }

    /* ── Info y barra ── */
    .info {
      flex: 1;
      min-width: 0;
    }

    .label {
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      color: #2d5a3d;
      letter-spacing: 0.03em;
      margin-bottom: 0.45rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Barra de progreso */
    .barra-wrapper {
      position: relative;
      height: 5px;
      background: #ddd;
      border-radius: 999px;
      cursor: pointer;
    }

    .barra-progreso {
      height: 100%;
      width: 0%;
      background: #2d5a3d;
      border-radius: 999px;
      transition: width 0.1s linear;
      pointer-events: none;
    }

    /* ── Tiempo ── */
    .tiempo {
      flex-shrink: 0;
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      color: #555;
      font-variant-numeric: tabular-nums;
      min-width: 70px;
      text-align: right;
    }

    /* ── Estado: sin audio ── */
    .sin-audio {
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
      color: #999;
      text-align: center;
      padding: 0.5rem;
    }
  </style>

  <div class="reproductor">
    <button class="btn-play" aria-label="Reproducir audio" disabled>
      <!-- Icono play -->
      <svg class="icon-play" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 5v14l11-7z"/>
      </svg>
      <!-- Icono pause -->
      <svg class="icon-pause" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>
    </button>

    <div class="info">
      <div class="label">Cargando audio...</div>
      <div class="barra-wrapper" role="slider" aria-label="Progreso del audio"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
        <div class="barra-progreso"></div>
      </div>
    </div>

    <div class="tiempo">0:00 / 0:00</div>
  </div>

  <!-- Elemento <audio> nativo dentro del Shadow DOM -->
  <audio preload="metadata"></audio>
`;

// ── Clase del componente ─────────────────────────────────────────────────────
class AudioGuia extends HTMLElement {

  static get observedAttributes() {
    return ["src", "label"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._audio  = null;
  }

  connectedCallback() {
    this._shadow.appendChild(template.content.cloneNode(true));
    this._audio = this._shadow.querySelector("audio");
    this._attachEvents();
    this._aplicarAtributos();
  }

  disconnectedCallback() {
    // Detener el audio al remover el componente
    if (this._audio) {
      this._audio.pause();
      this._audio.src = "";
    }
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._aplicarAtributos();
    }
  }

  // ── Aplicar atributos al reproductor ─────────────────────────────────────────

  _aplicarAtributos() {
    if (!this._audio) return;

    const src   = this.getAttribute("src")   || "";
    const label = this.getAttribute("label") || "Audio guía";

    // Actualizar label
    const labelEl = this._shadow.querySelector(".label");
    if (labelEl) labelEl.textContent = label;

    // Cargar nuevo src
    if (src) {
      this._audio.src = src;
      this._audio.load();
      const btn = this._shadow.querySelector(".btn-play");
      if (btn) btn.disabled = false;
    }
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    const btn          = this._shadow.querySelector(".btn-play");
    const barraWrapper = this._shadow.querySelector(".barra-wrapper");
    const barraProgreso = this._shadow.querySelector(".barra-progreso");
    const tiempoEl     = this._shadow.querySelector(".tiempo");

    // ── Play / Pause ──
    btn.addEventListener("click", () => {
      if (this._audio.paused) {
        this._audio.play();
      } else {
        this._audio.pause();
      }
    });

    // ── Actualizar barra de progreso ──
    this._audio.addEventListener("timeupdate", () => {
      if (!this._audio.duration) return;
      const pct = (this._audio.currentTime / this._audio.duration) * 100;
      barraProgreso.style.width = `${pct}%`;
      barraWrapper.setAttribute("aria-valuenow", Math.round(pct));
      tiempoEl.textContent = `${this._formatTiempo(this._audio.currentTime)} / ${this._formatTiempo(this._audio.duration)}`;
    });

    // ── Estado playing / paused ──
    this._audio.addEventListener("play",  () => {
      this.classList.add("playing");
      btn.setAttribute("aria-label", "Pausar audio");
    });
    this._audio.addEventListener("pause", () => {
      this.classList.remove("playing");
      btn.setAttribute("aria-label", "Reproducir audio");
    });
    this._audio.addEventListener("ended", () => {
      this.classList.remove("playing");
      btn.setAttribute("aria-label", "Reproducir audio");
    });

    // ── Metadatos cargados: mostrar duración total ──
    this._audio.addEventListener("loadedmetadata", () => {
      tiempoEl.textContent = `0:00 / ${this._formatTiempo(this._audio.duration)}`;
      btn.disabled = false;
    });

    // ── Error de carga ──
    this._audio.addEventListener("error", () => {
      const label = this._shadow.querySelector(".label");
      if (label) label.textContent = "Audio no disponible";
      btn.disabled = true;
    });

    // ── Clic en la barra para saltar ──
    barraWrapper.addEventListener("click", (e) => {
      if (!this._audio.duration) return;
      const rect = barraWrapper.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      this._audio.currentTime = pct * this._audio.duration;
    });

    // ── Teclado en la barra ──
    barraWrapper.addEventListener("keydown", (e) => {
      if (!this._audio.duration) return;
      const salto = 5; // segundos
      if (e.key === "ArrowRight") this._audio.currentTime = Math.min(this._audio.currentTime + salto, this._audio.duration);
      if (e.key === "ArrowLeft")  this._audio.currentTime = Math.max(this._audio.currentTime - salto, 0);
    });
  }

  // ── Utilidad: formatear segundos a m:ss ─────────────────────────────────────

  _formatTiempo(seg) {
    if (isNaN(seg)) return "0:00";
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}

customElements.define("audio-guia", AudioGuia);