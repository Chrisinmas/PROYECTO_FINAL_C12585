# 🌿 Guía Turística Multimedia de Costa Rica

Aplicación web interactiva desarrollada con **Web Components nativos** (HTML5, CSS3, JavaScript ES6+) como proyecto final del curso IF7102 – Multimedios, I Ciclo 2026, Universidad de Costa Rica.

---

## 📋 Descripción

La Guía Turística de Costa Rica permite explorar destinos turísticos del país organizados por región, integrando imágenes, audio ambiental y datos cargados dinámicamente desde un archivo JSON. La aplicación está construida íntegramente con tecnologías nativas del navegador, sin el uso de frameworks externos.

---

## 🗂️ Estructura del proyecto

```
PROYECTO_FINAL_C12585/
├── index.html                  ← Punto de entrada
├── README.md
├── CREDITOS.md
├── data/
│   └── destinos.json           ← Datos de los 8 destinos
├── components/
│   ├── app-header.js           ← Navegación principal
│   ├── destino-card.js         ← Tarjeta resumen de destino
│   ├── destino-detalle.js      ← Vista completa de destino
│   ├── galeria-imagenes.js     ← Galería con navegación
│   └── audio-guia.js          ← Reproductor de audio
├── assets/
│   ├── img/                    ← Imágenes de destinos
│   ├── audio/                  ← Audios ambientales (.mp3)
│   └── video/                  ← Videos de destinos
└── css/
    └── global.css              ← Estilos globales
```

---

## 🚀 Cómo ejecutar el proyecto

> ⚠️ Este proyecto usa **ES Modules** (`type="module"`), por lo que **no funciona** abriéndolo directamente como archivo en el navegador. Es obligatorio usar un servidor local.

### Opción 1 — Live Server (recomendado)

1. Abrí el proyecto en **Visual Studio Code**
2. Instalá la extensión **Live Server** si no la tenés
3. Clic derecho sobre `index.html` → **"Open with Live Server"**
4. El navegador abrirá automáticamente en `http://127.0.0.1:5500`

### Opción 2 — Node.js (http-server)

```bash
# Instalar http-server globalmente
npm install -g http-server

# Desde la carpeta del proyecto
http-server .

# Abrir en el navegador
http://localhost:8080
```

### Opción 3 — Python

```bash
# Desde la carpeta del proyecto
python -m http.server 8000

# Abrir en el navegador
http://localhost:8000
```

---

## 🌍 Regiones y destinos

| Región | Destinos |
|---|---|
| Caribe | Cahuita, Puerto Viejo de Talamanca |
| Guanacaste | Tamarindo, Rincón de la Vieja |
| Región Central | Volcán Poás, Valle de Orosi |
| Pacífico Sur | Manuel Antonio, Uvita y Marino Ballena |

---

## 🧩 Custom Elements

| Componente | Archivo | Descripción |
|---|---|---|
| `<app-header>` | `components/app-header.js` | Barra de navegación con menú de regiones |
| `<destino-card>` | `components/destino-card.js` | Tarjeta resumen de un destino |
| `<destino-detalle>` | `components/destino-detalle.js` | Vista completa con galería y audio |
| `<galeria-imagenes>` | `components/galeria-imagenes.js` | Galería con navegación y miniaturas |
| `<audio-guia>` | `components/audio-guia.js` | Reproductor de audio personalizado |

---

## 👥 Integrantes

| Nombre | Carné | Rol |
|---|---|---|
| _(completar)_ | _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ | _(completar)_ |
| _(completar)_ | _(completar)_ | _(completar)_ |

---

## 📚 Tecnologías utilizadas

- HTML5 / CSS3 / JavaScript ES6+
- Web Components API (Custom Elements v1, Shadow DOM v1, HTML Templates)
- ES Modules
- HTMLMediaElement (`<audio>` nativo)
- Fetch API para carga dinámica de JSON

---

Curso IF7102 – Multimedios | I Ciclo 2026
Sede Regional de Guanacaste, Recinto de Liberia
Universidad de Costa Rica