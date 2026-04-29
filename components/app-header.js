/**
 * <app-header> - Custom Element
 * Barra de navegación principal de la Guía Turística de Costa Rica.
 *
 * Atributos observados:
 *   - active-region: string con el nombre de la región activa (resalta el botón correspondiente)
 *
 * Eventos emitidos:
 *   - region-selected: CustomEvent con { detail: { region: string } }
 *     Se dispara al hacer clic en cualquier botón de región.
 */
class AppHeader extends HTMLElement {
  // Regiones turísticas del proyecto
  static get REGIONS() {
    return ["Caribe", "Guanacaste", "Central", "Pacífico Sur"];
  }

  // Le decimos al navegador qué atributos queremos observar
  static get observedAttributes() {
    return ["active-region"];
  }

  constructor() {
    super();
    // Creamos el Shadow DOM en modo 'open' para poder accederlo desde fuera si es necesario
    this._shadow = this.attachShadow({ mode: "open" });
  }

  // Se ejecuta cuando el elemento se inserta en el DOM
  connectedCallback() {
    this._render();
    this._attachEvents();
  }

  // Se ejecuta cuando un atributo observado cambia
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "active-region" && oldValue !== newValue) {
      this._updateActiveButton(newValue);
    }
  }

  // ── Renderizado ──────────────────────────────────────────────────────────────

  _render() {
    this._shadow.innerHTML = `
      <style>
        /* ── Reset ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Variables internas del componente ── */
        :host {
          --header-bg:       #1a3d2b;
          --header-accent:   #f5a623;
          --header-text:     #e8f5e9;
          --btn-hover-bg:    #2e6b48;
          --btn-active-bg:   #f5a623;
          --btn-active-text: #1a3d2b;
          --shadow:          0 2px 12px rgba(0,0,0,.35);
          display: block;        /* el host ocupa su línea */
          width: 100%;
        }

        header {
          background: var(--header-bg);
          box-shadow: var(--shadow);
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          min-height: 64px;
        }

        /* ── Logotipo / título ── */
        .brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          cursor: default;
        }

        .brand-icon {
          font-size: 1.6rem;
          line-height: 1;
        }

        .brand-text {
          color: var(--header-text);
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        .brand-text span {
          display: block;
          font-size: 0.65rem;
          font-family: system-ui, sans-serif;
          font-weight: 400;
          color: var(--header-accent);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* ── Navegación ── */
        nav {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        nav button {
          background: transparent;
          border: 1.5px solid rgba(255,255,255,.25);
          border-radius: 999px;
          color: var(--header-text);
          cursor: pointer;
          font-family: system-ui, sans-serif;
          font-size: 0.82rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          padding: 0.35rem 0.9rem;
          transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.1s;
          white-space: nowrap;
        }

        nav button:hover {
          background: var(--btn-hover-bg);
          border-color: transparent;
        }

        nav button:active {
          transform: scale(0.96);
        }

        /* Estado activo */
        nav button[aria-current="true"] {
          background: var(--btn-active-bg);
          border-color: var(--btn-active-bg);
          color: var(--btn-active-text);
          font-weight: 700;
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          header {
            flex-direction: column;
            align-items: flex-start;
            padding: 0.75rem 1rem;
          }
          nav { width: 100%; }
        }
      </style>

      <header role="banner">
        <div class="brand" aria-label="Guía Turística de Costa Rica">
          <span class="brand-icon" aria-hidden="true">🌿</span>
          <div class="brand-text">
            Guía Turística
            <span>Costa Rica</span>
          </div>
        </div>

        <nav role="navigation" aria-label="Regiones turísticas">
          ${AppHeader.REGIONS.map(region => `
            <button
              data-region="${region}"
              aria-current="false"
              aria-label="Ver destinos de ${region}"
            >${region}</button>
          `).join("")}
        </nav>
      </header>
    `;
  }

  // ── Eventos ──────────────────────────────────────────────────────────────────

  _attachEvents() {
    // Delegación de eventos: un solo listener en el <nav>
    const nav = this._shadow.querySelector("nav");
    nav.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-region]");
      if (!btn) return;

      const region = btn.dataset.region;

      // Actualizamos el atributo (lo que también dispara attributeChangedCallback)
      this.setAttribute("active-region", region);

      // Emitimos el CustomEvent que los demás componentes escucharán
      this.dispatchEvent(
        new CustomEvent("region-selected", {
          bubbles: true,        // sube por el DOM real (no el shadow)
          composed: true,       // cruza la barrera del Shadow DOM
          detail: { region },
        })
      );
    });
  }

  // ── Utilidades privadas ───────────────────────────────────────────────────────

  /**
   * Resalta el botón de la región activa y quita el estado del resto.
   * @param {string} activeRegion - nombre de la región a activar
   */
  _updateActiveButton(activeRegion) {
    const buttons = this._shadow.querySelectorAll("nav button");
    buttons.forEach((btn) => {
      const isActive = btn.dataset.region === activeRegion;
      btn.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }
}

// Registramos el Custom Element
customElements.define("app-header", AppHeader);