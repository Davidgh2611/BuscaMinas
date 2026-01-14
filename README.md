# 🧨 Buscaminas PRO - Edición Definitiva

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.2.0-orange.svg)
![JS](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)

Una reinvención moderna y elegante del clásico juego de lógica de Windows. **Buscaminas PRO** combina la jugabilidad nostálgica con una interfaz de usuario minimalista, sistemas de personalización avanzada y mecánicas de juego competitivas.

---

## ✨ Características Principales

### 🎮 Experiencia de Juego
* **4 Niveles de Dificultad:** Desde Principiante (8x8) hasta Experto (16x16 con 99 minas).
* **Modo Personalizado:** Configura dimensiones y densidad de minas a tu gusto.
* **Sistema de Chord:** Mecánica avanzada que permite revelar celdas adyacentes rápidamente si las banderas coinciden con el número.

### 🎭 Personalización (Skins)
El juego incluye un sistema dinámico de apariencias que cambia iconos, colores y animaciones en tiempo real:
* **Temporadas:** Invierno ❄️ y Halloween 💀.
* **Estilos:** Clásico 🪟, Moderno 🧊 y Minimalista ◻️.

### 📊 Progreso y Estadísticas
* **Sistema de Logros:** Desbloquea medallas por velocidad, persistencia y victorias perfectas.
* **Ranking Local:** Registro de los mejores tiempos por categoría.
* **Persistencia de Datos:** Guardado automático de configuraciones y récords mediante `localStorage`.

---

## 🚀 Tecnologías Utilizadas

* **HTML5:** Estructura semántica.
* **CSS3:** Diseño responsivo, efectos de "Glassmorphism" y animaciones complejas (efecto de hundimiento en botones, sacudida de tablero).
* **Vanilla JavaScript (ES6+):** Lógica del juego basada en módulos, manipulación del DOM y gestión de estados.

---

## 🛠️ Instalación y Uso

No requiere dependencias externas. Solo clona y abre en tu navegador:

1.  Clona el repositorio:
    ```bash
    git clone [https://github.com/TU_USUARIO/buscaminas-pro.git](https://github.com/TU_USUARIO/buscaminas-pro.git)
    ```
2.  Entra en la carpeta:
    ```bash
    cd buscaminas-pro
    ```
3.  Abre el archivo `index.html` en tu navegador preferido.

---

## 🧠 Estructura del Proyecto

```text
├── index.html          # Estructura principal y contenedores de UI
├── css/
│   └── style.css       # Estilos globales, temas y animaciones
└── js/
    ├── main.js         # Orquestador: inicialización y eventos de botones
    ├── game.js         # Núcleo: lógica de minas, revelado y victoria
    ├── ui.js           # Interfaz: renderizado de celdas, menús y partículas
    ├── storage.js      # Datos: gestión de logros y puntuaciones
    └── state.js        # Estado global: variables en tiempo real del juego

📸 Vista Previa de la Interfaz
Menú Principal
Diseño centrado con secciones diferenciadas para personalización y dificultad. Incluye efectos visuales de elevación y profundidad al interactuar.

Modo de Juego
Barra superior elástica que se ajusta al tamaño del tablero, con contadores dinámicos de minas, banderas y tiempo.

📈 Roadmap (Futuras Mejoras)
[ ] Modo Multijugador online (WebSockets).

[ ] Implementación de sonidos ambientales y efectos especiales (SFX).

[ ] Soporte para gestos táctiles avanzados en móviles.

[ ] Conversión a PWA (Progressive Web App).

📄 Licencia
Este proyecto está bajo la Licencia MIT - Siéntete libre de usarlo, modificarlo y aprender de él.

Creado con ❤️ por [Tu Nombre/Usuario]


---

### ¿Cómo añadirlo correctamente?
1. Crea un nuevo archivo en tu proyecto llamado **README.md**.
2. Pega el código de arriba.
3. Asegúrate de cambiar `TU_USUARIO` en el enlace del clon por tu nombre real de GitHub.
4. Haz los comandos que te di antes: `git add README.md`, `git commit -m "Añadido README profesional"` y `git push`.

**¿Te gustaría que te ayude a crear una imagen de "banner" o captura de pantalla para ponerla al principio del README?** Eso lo hace ver mucho más profesional.