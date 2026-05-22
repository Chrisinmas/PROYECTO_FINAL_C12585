/**
 * <galeria-imagenes> - Custom Element
 * Galería con navegación anterior/siguiente entre las fotos de un destino.
 *
 * Atributos observados:
 *   - imagenes: array JSON serializado con las rutas de las imágenes
 *               Ej: '["assets/img/cahuita-1.jpg","assets/img/cahuita-2.jpg"]'
 *
 * Uso:
 *   <galeria-imagenes imagenes='["ruta1.jpg","ruta2.jpg"]'></galeria-imagenes>
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

    /* ── Imagen principal ── */
    .galeria-principal {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 10;
      border-radius: 14px;
      overflow: hidden;
      background: #2d5a3d;
    }

    .galeria-principal img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: opacity 0.3s ease;
    }

    .galeria-principal img.fade {
      opacity: 0;
    }

    /* Contador de imágenes */
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
    }

    /* ── Botones de navegación sobre la imagen ── */
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
      z-index: 2;
    }

    .btn-nav:hover {
      background: #fff;
      transform: translateY(-50%) scale(1.08);
    }

    .btn-nav:disabled {
      opacity: 0.3;
      cursor: default;
    }

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
    }

    .thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .thumb.activa {
      border-color: #f5c842;
      opacity: 1;
    }

    .thumb:hover { opacity: 0.9; }
  </style>

  <!-- Imagen principal -->
  <div class="galeria-principal">
    <img src="" alt="Imagen del destino" />
    <span class="contador">1 / 1</span>
    <button class="btn-nav btn-prev" aria-label="Imagen anterior">&#10094;</button>
    <button class="btn-nav btn-next" aria-label="Imagen siguiente">&#10095;</button>
  </div>

  <!-- Miniaturas -->
  <div class="thumbnails"></div>
`;

// ── Clase del componente ─────────────────────────────────────────────────────
class GaleriaImagenes extends HTMLElement {

  static get observedAttributes() {
    return ["imagenes"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
    this._imagenes = [];
    this._indice   = 0;
  }

  connectedCallback() {
    this._shadow.appendChild(template.content.cloneNode(true));
    this._attachEvents();
    this._cargarImagenes();
  }

  disconnectedCallback() {
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "imagenes" && oldValue !== newValue) {
      this._cargarImagenes();
    }
  }

  // ── Cargar imágenes desde el atributo ────────────────────────────────────────

  _cargarImagenes() {
    const attr = this.getAttribute("imagenes");
    if (!attr) return;

    try {
      this._imagenes = JSON.parse(attr);
      this._indice   = 0;
      this._renderThumbnails();
      this._mostrarImagen(0);
    } catch (e) {
      console.error("<galeria-imagenes>: atributo 'imagenes' inválido", e);
    }
  }

  // ── Renderizar miniaturas ────────────────────────────────────────────────────

  _renderThumbnails() {
    const contenedor = this._shadow.querySelector(".thumbnails");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    this._imagenes.forEach((src, i) => {
      const thumb = document.createElement("div");
      thumb.className = "thumb" + (i === 0 ? " activa" : "");
      thumb.innerHTML = `<img src="${src}" alt="Miniatura ${i + 1}" />`;
      thumb.addEventListener("click", () => this._mostrarImagen(i));
      contenedor.appendChild(thumb);
    });
  }

  // ── Mostrar imagen por índice ────────────────────────────────────────────────

  _mostrarImagen(indice) {
    if (this._imagenes.length === 0) return;
    const total = this._imagenes.length;
    this._indice = Math.max(0, Math.min(indice, total - 1));

    const img      = this._shadow.querySelector(".galeria-principal img");
    const contador = this._shadow.querySelector(".contador");
    const btnPrev  = this._shadow.querySelector(".btn-prev");
    const btnNext  = this._shadow.querySelector(".btn-next");
    if (!img) return;

    // Fade out → cambiar src → fade in
    img.classList.add("fade");
    setTimeout(() => {
      img.src = this._imagenes[this._indice];
      img.alt = `Imagen ${this._indice + 1} del destino`;
      img.classList.remove("fade");
    }, 150);

    // Actualizar contador
    contador.textContent = `${this._indice + 1} / ${total}`;

    // Botones: deshabilitados en los extremos — NO aplica porque el carrusel
    // del proyecto no es infinito en la galería, solo navega entre fotos reales
    btnPrev.disabled = this._indice === 0;
    btnNext.disabled = this._indice === total - 1;

    // Actualizar miniatura activa
    this._shadow.querySelectorAll(".thumb").forEach((t, i) => {
      t.classList.toggle("activa", i === this._indice);
    });
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    this._shadow.querySelector(".btn-prev").addEventListener("click", () => {
      this._mostrarImagen(this._indice - 1);
    });

    this._shadow.querySelector(".btn-next").addEventListener("click", () => {
      this._mostrarImagen(this._indice + 1);
    });

    // Navegación con teclado (cuando el componente tiene foco)
    this.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft")  this._mostrarImagen(this._indice - 1);
      if (e.key === "ArrowRight") this._mostrarImagen(this._indice + 1);
    });
  }
}

customElements.define("galeria-imagenes", GaleriaImagenes);