/**
 * <galeria-imagenes> - Custom Element
 * Galería con navegación anterior/siguiente entre las fotos de un destino.
 * Si se pasa el atributo "video", este aparece como última diapositiva.
 *
 * Atributos observados:
 *   - imagenes : array JSON serializado con las rutas de las imágenes
 *   - video    : ruta del archivo de video (opcional, aparece al final)
 *   - poster   : ruta de la imagen de miniatura del video (opcional)
 *
 * Uso:
 *   <galeria-imagenes
 *     imagenes='["ruta1.jpg","ruta2.jpg"]'
 *     video="assets/video/cahuita.mp4"
 *     poster="assets/img/cahuita-portada.jpg">
 *   </galeria-imagenes>
 */

// ── Template a nivel de módulo ───────────────────────────────────────────────
const template = document.createElement("template");
template.innerHTML = `
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      width: 100%;
      user-select: none;
    }

    /* ── Área principal ── */
    .galeria-principal {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      border-radius: 14px;
      overflow: hidden;
      background: #000;
    }

    /* ── Imagen ── */
    .galeria-principal img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.3s ease;
      position: absolute;
      inset: 0;
    }

    .galeria-principal img.fade { opacity: 0; }

    /* ── Video ── */
    .galeria-principal video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: none;
      position: absolute;
      inset: 0;
    }

    .galeria-principal video.visible { display: block; }

    /* Overlay play grande sobre el video */
    .video-overlay {
      position: absolute;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.3);
      z-index: 3;
      cursor: pointer;
    }

    .video-overlay.visible { display: flex; }
    .video-overlay.oculto  { display: none; }

    .btn-play-video {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255,255,255,0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,.4);
      transition: transform 0.2s;
    }
    .btn-play-video:hover { transform: scale(1.1); }
    .btn-play-video svg { width: 22px; height: 22px; fill: #2d5a3d; margin-left: 3px; }

    /* Barra de controles del video */
    .video-controles {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 0.5rem 0.75rem;
      background: linear-gradient(transparent, rgba(0,0,0,0.75));
      display: none;
      align-items: center;
      gap: 0.6rem;
      z-index: 4;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .video-controles.visible { display: flex; }
    .galeria-principal:hover .video-controles.visible { opacity: 1; }
    .video-controles.reproduciendo { opacity: 1; }

    .btn-vc {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
    }
    .btn-vc svg { width: 18px; height: 18px; fill: #fff; }

    .vc-progreso {
      flex: 1;
      height: 4px;
      background: rgba(255,255,255,0.35);
      border-radius: 999px;
      cursor: pointer;
    }
    .vc-barra {
      height: 100%;
      width: 0%;
      background: #f5c842;
      border-radius: 999px;
      pointer-events: none;
      transition: width 0.1s linear;
    }
    .vc-tiempo {
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 0.7rem;
      font-variant-numeric: tabular-nums;
      min-width: 65px;
      text-align: right;
    }

    /* ── Contador ── */
    .contador {
      position: absolute;
      bottom: 0.6rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.55);
      color: #fff;
      font-family: system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.2rem 0.65rem;
      border-radius: 999px;
      backdrop-filter: blur(4px);
      letter-spacing: 0.05em;
      z-index: 2;
    }

    /* ── Botones de navegación ── */
    .btn-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.82);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,.25);
      transition: background 0.2s, transform 0.15s;
      z-index: 5;
    }
    .btn-nav:hover { background: #fff; transform: translateY(-50%) scale(1.08); }
    .btn-prev { left: 0.75rem; }
    .btn-next { right: 0.75rem; }

    /* ── Miniaturas ── */
    .thumbnails {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
      scrollbar-width: thin;
      scrollbar-color: #2d5a3d transparent;
    }
    .thumbnails::-webkit-scrollbar { height: 4px; }
    .thumbnails::-webkit-scrollbar-thumb { background: #2d5a3d; border-radius: 4px; }

    .thumb {
      flex-shrink: 0;
      width: 72px;
      height: 52px;
      border-radius: 7px;
      overflow: hidden;
      cursor: pointer;
      border: 2.5px solid transparent;
      transition: border-color 0.2s, opacity 0.2s;
      background: #2d5a3d;
      opacity: 0.6;
      position: relative;
    }
    .thumb img, .thumb video {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .thumb.activa { border-color: #f5c842; opacity: 1; }
    .thumb:hover  { opacity: 0.9; }

    /* Ícono de video en la miniatura */
    .thumb-video-icon {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.35);
    }
    .thumb-video-icon svg { width: 18px; height: 18px; fill: #fff; }
  </style>

  <div class="galeria-principal">
    <img src="" alt="Imagen del destino" />

    <!-- Video (oculto por defecto) -->
    <video preload="metadata"></video>

    <!-- Overlay play del video -->
    <div class="video-overlay">
      <button class="btn-play-video" aria-label="Reproducir video">
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
      </button>
    </div>

    <!-- Controles del video -->
    <div class="video-controles">
      <button class="btn-vc btn-vc-play" aria-label="Play/Pause">
        <svg class="vc-icon-play"  viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg class="vc-icon-pause" viewBox="0 0 24 24" style="display:none">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      </button>
      <div class="vc-progreso">
        <div class="vc-barra"></div>
      </div>
      <div class="vc-tiempo">0:00 / 0:00</div>
    </div>

    <span class="contador">1 / 1</span>
    <button class="btn-nav btn-prev" aria-label="Anterior">&#10094;</button>
    <button class="btn-nav btn-next" aria-label="Siguiente">&#10095;</button>
  </div>

  <div class="thumbnails"></div>
`;

// ── Clase ────────────────────────────────────────────────────────────────────
class GaleriaImagenes extends HTMLElement {

  static get observedAttributes() {
    return ["imagenes", "video", "poster"];
  }

  constructor() {
    super();
    this._shadow   = this.attachShadow({ mode: "open" });
    this._items    = []; // { tipo: 'img'|'video', src, poster? }
    this._indice   = 0;
  }

  connectedCallback() {
    this._shadow.appendChild(template.content.cloneNode(true));
    this._attachEvents();
    this._cargarItems();
  }

  disconnectedCallback() {
    const vid = this._shadow.querySelector("video");
    if (vid) { vid.pause(); vid.src = ""; }
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) this._cargarItems();
  }

  // ── Construir lista de items (imágenes + video opcional) ─────────────────────

  _cargarItems() {
    const attr   = this.getAttribute("imagenes");
    const video  = this.getAttribute("video")  || "";
    const poster = this.getAttribute("poster") || "";
    if (!attr) return;

    try {
      const imgs = JSON.parse(attr);
      this._items = imgs.map(src => ({ tipo: "img", src }));
      if (video) this._items.push({ tipo: "video", src: video, poster });
      this._indice = 0;
      this._renderThumbnails();
      this._mostrarItem(0);
    } catch (e) {
      console.error("<galeria-imagenes>: atributo 'imagenes' inválido", e);
    }
  }

  // ── Miniaturas ───────────────────────────────────────────────────────────────

  _renderThumbnails() {
    const contenedor = this._shadow.querySelector(".thumbnails");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    this._items.forEach((item, i) => {
      const thumb = document.createElement("div");
      thumb.className = "thumb" + (i === 0 ? " activa" : "");

      if (item.tipo === "video") {
        // Miniatura del video: poster o fondo oscuro con ícono play
        thumb.innerHTML = `
          ${item.poster ? `<img src="${item.poster}" alt="Video del destino" />` : ""}
          <div class="thumb-video-icon">
            <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          </div>`;
      } else {
        thumb.innerHTML = `<img src="${item.src}" alt="Miniatura ${i + 1}" />`;
      }

      thumb.addEventListener("click", () => this._mostrarItem(i));
      contenedor.appendChild(thumb);
    });
  }

  // ── Mostrar item por índice ──────────────────────────────────────────────────

  _mostrarItem(indice) {
    if (this._items.length === 0) return;
    const total = this._items.length;
    this._indice = this._mod(indice, total);
    const item = this._items[this._indice];

    const img            = this._shadow.querySelector(".galeria-principal img");
    const vid            = this._shadow.querySelector(".galeria-principal video");
    const overlay        = this._shadow.querySelector(".video-overlay");
    const controles      = this._shadow.querySelector(".video-controles");
    const contador       = this._shadow.querySelector(".contador");
    if (!img) return;

    // Pausar video si estaba reproduciéndose
    if (!vid.paused) vid.pause();

    if (item.tipo === "video") {
      // Mostrar video, ocultar imagen
      img.style.display     = "none";
      vid.classList.add("visible");
      overlay.classList.add("visible");
      controles.classList.add("visible");
      controles.classList.remove("reproduciendo");

      if (vid.src !== item.src) {
        vid.src    = item.src;
        vid.poster = item.poster || "";
        vid.load();
      }

      // Resetear controles
      this._shadow.querySelector(".vc-barra").style.width = "0%";
      this._shadow.querySelector(".vc-tiempo").textContent = "0:00 / 0:00";
      this._shadow.querySelector(".vc-icon-play").style.display  = "block";
      this._shadow.querySelector(".vc-icon-pause").style.display = "none";

    } else {
      // Mostrar imagen, ocultar video
      vid.classList.remove("visible");
      overlay.classList.remove("visible");
      overlay.classList.remove("oculto");
      controles.classList.remove("visible");
      img.style.display = "block";

      img.classList.add("fade");
      setTimeout(() => {
        img.src = item.src;
        img.alt = `Imagen ${this._indice + 1} del destino`;
        img.classList.remove("fade");
      }, 150);
    }

    contador.textContent = `${this._indice + 1} / ${total}`;

    this._shadow.querySelectorAll(".thumb").forEach((t, i) => {
      t.classList.toggle("activa", i === this._indice);
    });
  }

  // ── Mod positivo ─────────────────────────────────────────────────────────────
  _mod(n, m) { return ((n % m) + m) % m; }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    this._shadow.querySelector(".btn-prev").addEventListener("click", () => {
      this._mostrarItem(this._indice - 1);
    });
    this._shadow.querySelector(".btn-next").addEventListener("click", () => {
      this._mostrarItem(this._indice + 1);
    });

    this.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  this._mostrarItem(this._indice - 1);
      if (e.key === "ArrowRight") this._mostrarItem(this._indice + 1);
    });

    // ── Controles del video ──
    const vid        = this._shadow.querySelector(".galeria-principal video");
    const overlay    = this._shadow.querySelector(".video-overlay");
    const controles  = this._shadow.querySelector(".video-controles");
    const btnPlay    = this._shadow.querySelector(".btn-play-video");
    const btnVcPlay  = this._shadow.querySelector(".btn-vc-play");
    const iconPlay   = this._shadow.querySelector(".vc-icon-play");
    const iconPause  = this._shadow.querySelector(".vc-icon-pause");
    const progreso   = this._shadow.querySelector(".vc-progreso");
    const barra      = this._shadow.querySelector(".vc-barra");
    const tiempo     = this._shadow.querySelector(".vc-tiempo");

    btnPlay.addEventListener("click", () => vid.play());
    btnVcPlay.addEventListener("click", () => vid.paused ? vid.play() : vid.pause());
    vid.addEventListener("click", () => vid.paused ? vid.play() : vid.pause());

    vid.addEventListener("play", () => {
      overlay.classList.add("oculto");
      controles.classList.add("reproduciendo");
      iconPlay.style.display  = "none";
      iconPause.style.display = "block";
    });

    vid.addEventListener("pause", () => {
      controles.classList.remove("reproduciendo");
      iconPlay.style.display  = "block";
      iconPause.style.display = "none";
    });

    vid.addEventListener("ended", () => {
      overlay.classList.remove("oculto");
      controles.classList.remove("reproduciendo");
      iconPlay.style.display  = "block";
      iconPause.style.display = "none";
    });

    vid.addEventListener("timeupdate", () => {
      if (!vid.duration) return;
      const pct = (vid.currentTime / vid.duration) * 100;
      barra.style.width = `${pct}%`;
      tiempo.textContent = `${this._fmt(vid.currentTime)} / ${this._fmt(vid.duration)}`;
    });

    vid.addEventListener("loadedmetadata", () => {
      tiempo.textContent = `0:00 / ${this._fmt(vid.duration)}`;
    });

    progreso.addEventListener("click", (e) => {
      if (!vid.duration) return;
      const rect = progreso.getBoundingClientRect();
      vid.currentTime = ((e.clientX - rect.left) / rect.width) * vid.duration;
    });
  }

  _fmt(seg) {
    if (isNaN(seg)) return "0:00";
    const m = Math.floor(seg / 60);
    const s = Math.floor(seg % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }
}

customElements.define("galeria-imagenes", GaleriaImagenes);