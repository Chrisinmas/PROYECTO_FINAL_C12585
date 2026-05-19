/**
 * <app-header> - Custom Element
 * Barra de navegación principal de la Guía Turística de Costa Rica.
 *
 * Comportamiento:
 *   - En inicio: muestra solo el título/logo centrado, header transparente.
 *   - En región: muestra las 4 regiones + "Inicio", header verde sólido.
 *
 * Atributos observados:
 *   - active-region: vacío = inicio | nombre de región = vista de región
 *
 * Eventos emitidos:
 *   - region-selected: CustomEvent con { detail: { region: string } }
 */

const REGIONS = ["Caribe", "Guanacaste", "Pacífico Sur", "Región Central"];

// ── Template definido a nivel de módulo (buena práctica en Web Components) ──
const template = document.createElement("template");
template.innerHTML = `
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      width: 100%;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
    }

    header {
      padding: 0 2rem;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.4s ease, box-shadow 0.4s ease;
    }

    header.transparent {
      background: transparent;
      box-shadow: none;
    }

    header.solid {
      background: #2d5a3d;
      box-shadow: 0 2px 12px rgba(0,0,0,.3);
    }

    /* ── Brand: visible solo en inicio ── */
    .brand {
      color: #ffffff;
      font-family: system-ui, sans-serif;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.2s;
      display: none;
    }
    .brand:hover { opacity: 0.8; }

    /* ── Nav: visible solo en región ── */
    nav {
      display: none;
      align-items: center;
      gap: 2.5rem;
    }

    nav button {
      background: transparent;
      border: none;
      border-bottom: 2.5px solid transparent;
      color: #ffffff;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      font-size: 0.9rem;
      font-weight: 500;
      letter-spacing: 0.04em;
      padding: 0.25rem 0;
      transition: color 0.2s, border-color 0.2s;
      white-space: nowrap;
    }

    nav button:hover { color: #f5c842; }

    nav button[aria-current="true"] {
      color: #f5c842;
      border-bottom-color: #f5c842;
      font-weight: 700;
    }

    /* ── Alternancia de modos ── */
    :host(.mode-inicio) .brand { display: block; }
    :host(.mode-inicio) nav    { display: none;  }
    :host(.mode-region) .brand { display: none;  }
    :host(.mode-region) nav    { display: flex;  }

    @media (max-width: 600px) {
      nav { gap: 1.25rem; }
      nav button { font-size: 0.78rem; }
    }
  </style>

  <header class="transparent" role="banner">

    <div class="brand" role="button" tabindex="0" aria-label="Volver al inicio">
      🌿 Guía Turística · Costa Rica
    </div>

    <nav role="navigation" aria-label="Menú de regiones">
      <button data-region="inicio" aria-current="false">Inicio</button>
      ${REGIONS.map(r => `
        <button data-region="${r}" aria-current="false">${r}</button>
      `).join("")}
    </nav>

  </header>
`;

class AppHeader extends HTMLElement {

  static get observedAttributes() {
    return ["active-region"];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    // Clonamos el template y lo insertamos en el Shadow DOM
    this._shadow.appendChild(template.content.cloneNode(true));
    this._attachEvents();
    // Aplicar estado inicial según el atributo presente en el HTML
    this._update(this.getAttribute("active-region") || "");
  }

  disconnectedCallback() {
    // Limpieza: el Shadow DOM se destruye con el elemento,
    // pero eliminamos referencias explícitas para evitar memory leaks
    this._shadow.innerHTML = "";
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "active-region" && oldValue !== newValue) {
      this._update(newValue);
    }
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    const brand = this._shadow.querySelector(".brand");
    brand.addEventListener("click",   () => this._emitRegion("inicio"));
    brand.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") this._emitRegion("inicio");
    });

    const nav = this._shadow.querySelector("nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-region]");
      if (!btn) return;
      this._emitRegion(btn.dataset.region);
    });
  }

  _emitRegion(region) {
    this.setAttribute("active-region", region === "inicio" ? "" : region);
    this.dispatchEvent(new CustomEvent("region-selected", {
      bubbles: true,
      composed: true,
      detail: { region },
    }));
  }

  // ── Actualizar UI ─────────────────────────────────────────────────────────────

  _update(activeRegion) {
    const header   = this._shadow.querySelector("header");
    const buttons  = this._shadow.querySelectorAll("nav button");
    if (!header) return; // aún no renderizado

    const isInicio = !activeRegion || activeRegion === "" || activeRegion === "inicio";

    this.classList.toggle("mode-inicio", isInicio);
    this.classList.toggle("mode-region", !isInicio);
    header.className = isInicio ? "transparent" : "solid";

    buttons.forEach((btn) => {
      const active =
        (isInicio  && btn.dataset.region === "inicio") ||
        (!isInicio && btn.dataset.region === activeRegion);
      btn.setAttribute("aria-current", active ? "true" : "false");
    });
  }
}

customElements.define("app-header", AppHeader);