/**
 * <destino-card> - Custom Element
 * Tarjeta resumen de un destino turístico.
 *
 * Atributos observados:
 *   - destino-id : identificador único del destino (ej: "caribe-001")
 *   - nombre     : nombre del destino (ej: "Cahuita")
 *   - imagen     : ruta de la imagen de portada
 *   - region     : nombre de la región a la que pertenece
 *
 * Eventos emitidos:
 *   - destino-selected: CustomEvent con { detail: { id: string } }
 *     Se dispara al hacer clic en la card.
 */

// ── Template a nivel de módulo ──────────────────────────────────────────────
const template = document.createElement("template");
template.innerHTML = `
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      cursor: pointer;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 18px rgba(0,0,0,.13);
      background: #ffffff;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }

    :host(:hover) {
      transform: translateY(-6px);
      box-shadow: 0 10px 32px rgba(0,0,0,.2);
    }

    :host(:focus-visible) {
      outline: 3px solid #f5c842;
      outline-offset: 2px;
    }

    /* ── Imagen de portada ── */
    .card-img-wrapper {
      width: 100%;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      background: #2d5a3d;
      position: relative;
    }

    .card-img-wrapper img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.4s ease;
    }

    :host(:hover) .card-img-wrapper img {
      transform: scale(1.06);
    }

    /* Badge de región sobre la imagen */
    .region-badge {
      position: absolute;
      top: 0.6rem;
      right: 0.6rem;
      background: rgba(0,0,0,0.55);
      color: #f5c842;
      font-family: system-ui, sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      backdrop-filter: blur(4px);
    }

    /* ── Contenido de texto ── */
    .card-body {
      padding: 1rem 1.1rem 1.2rem;
    }

    .card-nombre {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 1.15rem;
      font-weight: 700;
      color: #1c1c1c;
      margin-bottom: 0.35rem;
      line-height: 1.25;
    }

    .card-region {
      font-family: system-ui, sans-serif;
      font-size: 0.78rem;
      color: #2d5a3d;
      font-weight: 600;
      letter-spacing: 0.03em;
    }

    /* Flecha indicadora de acción */
    .card-action {
      margin-top: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-family: system-ui, sans-serif;
      font-size: 0.78rem;
      font-weight: 600;
      color: #2d5a3d;
      transition: gap 0.2s ease;
    }

    :host(:hover) .card-action { gap: 0.55rem; }

    .card-action::after {
      content: "→";
      font-size: 0.9rem;
    }
  </style>

  <div class="card-img-wrapper">
    <img src="" alt="" />
    <span class="region-badge"></span>
  </div>

  <div class="card-body">
    <p class="card-nombre"></p>
    <p class="card-region"></p>
    <div class="card-action">Ver destino</div>
  </div>
`;

// ── Clase del componente ─────────────────────────────────────────────────────
class DestinoCard extends HTMLElement {

  static get observedAttributes() {
    return ["destino-id", "nombre", "imagen", "region"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this._shadow.appendChild(template.content.cloneNode(true));
    this._actualizarVista();
    this._attachEvents();

    // Accesibilidad: la card es focusable como un botón
    if (!this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
      this.setAttribute("role", "button");
    }
  }

  disconnectedCallback() {
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._actualizarVista();
    }
  }

  // ── Renderizado ──────────────────────────────────────────────────────────────

  _actualizarVista() {
    // Salir si el Shadow DOM aún no está listo
    const img    = this._shadow.querySelector("img");
    if (!img) return;

    const nombre  = this.getAttribute("nombre")  || "Sin nombre";
    const imagen  = this.getAttribute("imagen")  || "";
    const region  = this.getAttribute("region")  || "";

    img.src = imagen;
    img.alt = `Foto de portada de ${nombre}`;

    this._shadow.querySelector(".region-badge").textContent = region;
    this._shadow.querySelector(".card-nombre").textContent  = nombre;
    this._shadow.querySelector(".card-region").textContent  = region;
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    // Clic con mouse
    this.addEventListener("click", () => this._emitirSeleccion());

    // Teclado: Enter o Espacio activan la card (accesibilidad)
    this.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._emitirSeleccion();
      }
    });
  }

  _emitirSeleccion() {
    const id = this.getAttribute("destino-id");
    if (!id) return;

    this.dispatchEvent(new CustomEvent("destino-selected", {
      bubbles: true,
      composed: true,
      detail: { id },
    }));
  }
}

customElements.define("destino-card", DestinoCard);