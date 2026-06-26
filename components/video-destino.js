/**
 *
 * Atributos observados:
 *   - src   : ruta del archivo de video (ej: "assets/video/cahuita.mp4")
 *   - poster : ruta de la imagen de miniatura (ej: "assets/img/cahuita-portada.jpg")
 *   - label : texto descriptivo (ej: "Video: Cahuita")
 *
 * Uso:
 *   <video-destino
 *     src="assets/video/cahuita.mp4"
 *     poster="assets/img/cahuita-portada.jpg"
 *     label="Video: Cahuita">
 *   </video-destino>
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

    /* ── Contenedor del video ── */
    .video-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      border-radius: 14px;
      overflow: hidden;
      background: #000;
      cursor: pointer;
    }

    /* ── Elemento video nativo ── */
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    /* ── Overlay con botón play grande (visible antes de reproducir) ── */
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.3s ease;
    }

    .overlay.oculto { opacity: 0; pointer-events: none; }

    .btn-play-grande {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, background 0.2s;
      box-shadow: 0 4px 20px rgba(0,0,0,.4);
    }

    .btn-play-grande:hover {
      transform: scale(1.1);
      background: #fff;
    }

    .btn-play-grande svg {
      width: 24px;
      height: 24px;
      fill: #2d5a3d;
      margin-left: 3px; /* centra visualmente el triángulo */
    }

    /* ── Barra de controles ── */
    .controles {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem 0.75rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.75));
      display: flex;
      align-items: center;
      gap: 0.6rem;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .video-wrapper:hover .controles,
    :host(.reproduciendo) .controles {
      opacity: 1;
    }

    /* Botón play/pause pequeño */
    .btn-play-small {
      flex-shrink: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-play-small svg {
      width: 20px;
      height: 20px;
      fill: #fff;
    }

    /* Barra de progreso */
    .progreso-wrapper {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.35);
      border-radius: 999px;
      cursor: pointer;
      position: relative;
    }

    .progreso-barra {
      height: 100%;
      width: 0%;
      background: #f5c842;
      border-radius: 999px;
      pointer-events: none;
      transition: width 0.1s linear;
    }

    /* Tiempo */
    .tiempo {
      flex-shrink: 0;
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 0.72rem;
      font-variant-numeric: tabular-nums;
      min-width: 70px;
      text-align: right;
    }

    /* Botón fullscreen */
    .btn-fullscreen {
      flex-shrink: 0;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }

    .btn-fullscreen svg {
      width: 18px;
      height: 18px;
      fill: #fff;
    }

    /* ── Label debajo del video ── */
    .video-label {
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,0.75);
      margin-top: 0.5rem;
      text-align: center;
      letter-spacing: 0.03em;
    }
  </style>

  <div class="video-wrapper">
    <!-- Elemento <video> nativo dentro del Shadow DOM -->
    <video preload="metadata"></video>

    <!-- Overlay con play grande (estado inicial) -->
    <div class="overlay">
      <button class="btn-play-grande" aria-label="Reproducir video">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>

    <!-- Barra de controles -->
    <div class="controles">
      <button class="btn-play-small" aria-label="Play/Pause">
        <svg class="icon-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg class="icon-pause" viewBox="0 0 24 24" style="display:none">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>

      <div class="progreso-wrapper" role="slider" aria-label="Progreso del video"
           aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0">
        <div class="progreso-barra"></div>
      </div>

      <div class="tiempo">0:00 / 0:00</div>

      <button class="btn-fullscreen" aria-label="Pantalla completa">
        <svg viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      </button>
    </div>
  </div>

  <p class="video-label"></p>
`;

// ── Clase del componente ─────────────────────────────────────────────────────
class VideoDestino extends HTMLElement {

  static get observedAttributes() {
    return ["src", "poster", "label"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._video  = null;
  }

  connectedCallback() {
    this._shadow.appendChild(template.content.cloneNode(true));
    this._video = this._shadow.querySelector("video");
    this._attachEvents();
    this._aplicarAtributos();
  }

  disconnectedCallback() {
    if (this._video) {
      this._video.pause();
      this._video.src = "";
    }
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._aplicarAtributos();
    }
  }

  // ── Aplicar atributos ────────────────────────────────────────────────────────

  _aplicarAtributos() {
    if (!this._video) return;

    const src    = this.getAttribute("src")    || "";
    const poster = this.getAttribute("poster") || "";
    const label  = this.getAttribute("label")  || "Video del destino";

    if (src)    this._video.src    = src;
    if (poster) this._video.poster = poster;
    this._video.load();

    const labelEl = this._shadow.querySelector(".video-label");
    if (labelEl) labelEl.textContent = label;
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    const video          = this._video;
    const overlay        = this._shadow.querySelector(".overlay");
    const btnPlayGrande  = this._shadow.querySelector(".btn-play-grande");
    const btnPlaySmall   = this._shadow.querySelector(".btn-play-small");
    const iconPlay       = btnPlaySmall.querySelector(".icon-play");
    const iconPause      = btnPlaySmall.querySelector(".icon-pause");
    const progresoWrapper = this._shadow.querySelector(".progreso-wrapper");
    const progresoBarra  = this._shadow.querySelector(".progreso-barra");
    const tiempoEl       = this._shadow.querySelector(".tiempo");
    const btnFullscreen  = this._shadow.querySelector(".btn-fullscreen");

    // ── Play desde overlay ──
    btnPlayGrande.addEventListener("click", () => {
      video.play();
    });

    // ── Play/Pause desde controles ──
    btnPlaySmall.addEventListener("click", () => {
      video.paused ? video.play() : video.pause();
    });

    // ── Clic en el video alterna play/pause ──
    video.addEventListener("click", () => {
      video.paused ? video.play() : video.pause();
    });

    // ── Estados play/pause ──
    video.addEventListener("play", () => {
      overlay.classList.add("oculto");
      this.classList.add("reproduciendo");
      iconPlay.style.display  = "none";
      iconPause.style.display = "block";
    });

    video.addEventListener("pause", () => {
      this.classList.remove("reproduciendo");
      iconPlay.style.display  = "block";
      iconPause.style.display = "none";
    });

    video.addEventListener("ended", () => {
      overlay.classList.remove("oculto");
      this.classList.remove("reproduciendo");
      iconPlay.style.display  = "block";
      iconPause.style.display = "none";
    });

    // ── Progreso ──
    video.addEventListener("timeupdate", () => {
      if (!video.duration) return;
      const pct = (video.currentTime / video.duration) * 100;
      progresoBarra.style.width = `${pct}%`;
      progresoWrapper.setAttribute("aria-valuenow", Math.round(pct));
      tiempoEl.textContent = `${this._fmt(video.currentTime)} / ${this._fmt(video.duration)}`;
    });

    video.addEventListener("loadedmetadata", () => {
      tiempoEl.textContent = `0:00 / ${this._fmt(video.duration)}`;
    });

    // ── Clic en barra de progreso ──
    progresoWrapper.addEventListener("click", (e) => {
      if (!video.duration) return;
      const rect = progresoWrapper.getBoundingClientRect();
      video.currentTime = ((e.clientX - rect.left) / rect.width) * video.duration;
    });

    // ── Teclado en barra ──
    progresoWrapper.addEventListener("keydown", (e) => {
      if (!video.duration) return;
      if (e.key === "ArrowRight") video.currentTime = Math.min(video.currentTime + 5, video.duration);
      if (e.key === "ArrowLeft")  video.currentTime = Math.max(video.currentTime - 5, 0);
    });

    // ── Fullscreen ──
    btnFullscreen.addEventListener("click", () => {
      const wrapper = this._shadow.querySelector(".video-wrapper");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        wrapper.requestFullscreen?.();
      }
    });
  }

  // ── Utilidad: formato m:ss ───────────────────────────────────────────────────
  _fmt(seg) {
    if (isNaN(seg)) return "0:00";
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}

customElements.define("video-destino", VideoDestino);