<div align="center">
  <h1>🧨 Buscaminas PRO - Edición Definitiva</h1>
  
  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License MIT">
    <img src="https://img.shields.io/badge/version-1.5.0-orange.svg" alt="Version 1.5.0">
    <img src="https://img.shields.io/badge/JavaScript-ES6+-yellow.svg" alt="JavaScript ES6+">
    <img src="https://img.shields.io/badge/Database-Supabase-green.svg" alt="Supabase">
  </p>

  <p>
    Una reinvención moderna, elegante y competitiva del clásico juego de lógica.
    <strong>Buscaminas PRO</strong> ahora integra funciones de nube, personalización inteligente y duelos en tiempo real.
  </p>
</div>

<hr>

<h2>✨ Novedades de la Versión 1.5.0</h2>

<ul>
  <li><strong>🌍 Sistema de Cuentas:</strong> Registro e inicio de sesión integrados con <strong>Supabase</strong> para sincronizar logros y estadísticas en la nube.</li>
  <li><strong>🎨 Menú de Temas Inteligente:</strong> Nuevo selector desplegable con previsualización de color en tiempo real para una interfaz más limpia.</li>
  <li><strong>⚔️ Modo Duelo 1vs1:</strong> Sistema de emparejamiento mediante enlaces únicos para competir contra amigos (Beta).</li>
  <li><strong>🛡️ Modo Invitado:</strong> Juega sin cuenta con persistencia de datos local (LocalStorage).</li>
</ul>

<hr>

<h2>🎮 Características Principales</h2>

<h3>🕹️ Jugabilidad Avanzada</h3>
<ul>
  <li><strong>5 Niveles de dificultad:</strong> Desde Principiante hasta el temido modo <strong>Experto</strong>.</li>
  <li><strong>Modo Blitz ⚡:</strong> Desafío contra el reloj donde cada celda revelada te otorga segundos extra.</li>
  <li><strong>Sistema de Chord:</strong> Optimiza tu tiempo revelando áreas seguras automáticamente si las banderas son correctas.</li>
</ul>

<h3>🎭 Personalización Visual</h3>
<p>Cambia la estética del juego instantáneamente desde el nuevo menú de <strong>Temas</strong>:</p>
<ul>
  <li><strong>Temporadas:</strong> ❄️ Invierno, 💀 Halloween.</li>
  <li><strong>Estilos Pro:</strong> 🌌 Cyberpunk (Especial), 🧊 Moderno, 🪟 Clásico y ◻️ Minimalista.</li>
</ul>

<hr>

<h2>🚀 Tecnologías Utilizadas</h2>
<ul>
  <li><strong>Frontend:</strong> HTML5, CSS3 (Variables dinámicas), JavaScript (ES6+).</li>
  <li><strong>Backend & Auth:</strong> <a href="https://supabase.com/">Supabase</a> (BaaS) para gestión de usuarios y base de datos global.</li>
  <li><strong>PWA:</strong> Service Workers para soporte offline y rendimiento optimizado.</li>
</ul>

<hr>

<h2>🛠️ Instalación y Desarrollo Local</h2>
<p>El proyecto es una aplicación estática moderna que no requiere compilación compleja.</p>

<ol>
  <li><strong>Clona el repositorio:</strong>
    <pre><code>git clone https://github.com/Davidgh2611/BuscaMinas.git</code></pre>
  </li>
  <li><strong>Navega al proyecto:</strong>
    <pre><code>cd BuscaMinas</code></pre>
  </li>
  <li><strong>Lanzamiento:</strong> Abre <code>index.html</code> con la extensión <em>Live Server</em> en VS Code para habilitar las funciones de módulos de JS.</li>
</ol>

<hr>

<h2>🧠 Estructura Arquitectónica</h2>

<pre><code>
├── index.html        # Punto de entrada y estructura UI
├── style.css         # Motor de estilos y sistema de temas
├── js/
│   ├── main.js       # Orquestador de eventos y Auth
│   ├── game.js       # Motor lógico del Buscaminas
│   ├── ui.js         # Manipulación del DOM y efectos
│   ├── db.js         # Conexión con Supabase
│   ├── state.js      # Gestión del estado global
│   └── storage.js    # Manejo de persistencia local/nube
└── manifest.json     # Configuración PWA
</code></pre>

<hr>

<h2>📄 Licencia</h2>
<p>Este proyecto se distribuye bajo la <strong>Licencia MIT</strong>.</p>

<hr>

<div align="center">
  <h2>❤️ Autor</h2>
  <p>
    Creado por <strong>Davidgh2611</strong>.<br>
    ¿Te gusta el proyecto? ⭐ ¡Déjame una estrella en el repositorio!
  </p>
</div>