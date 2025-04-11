
let datos;
let musicaFondo;
let zonaActual = null;

fetch("datos/preguntas.json")
  .then(response => response.json())
  .then(json => {
    datos = json;
    const zonaId = getZonaIdFromURL();
    if (zonaId) {
      cargarZona(zonaId);
    } else {
      cargarZonas();
      mostrarInsignias();
    }
    reproducirMusicaFondo();
  });

function getZonaIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('zona');
}

function cargarZonas() {
  const zonasDiv = document.getElementById('zonas');
  if (!zonasDiv || !datos) return;

  for (const zonaId in datos.zonas) {
    const btn = document.createElement('button');
    btn.textContent = datos.zonas[zonaId].titulo;
    btn.onclick = () => {
      reproducirSonido("sonidos/descubrimiento.wav");
      setTimeout(() => {
        location.href = 'zona.html?zona=' + zonaId;
      }, 300);
    };
    zonasDiv.appendChild(btn);
  }
}

function cargarZona(zonaId) {
  const zona = datos.zonas[zonaId];
  if (!zona) return;

  zonaActual = zona;
  document.getElementById('titulo-zona').textContent = zona.titulo;
  document.getElementById('imagen-zona').src = zona.imagen;

  const contenedorPreguntas = document.getElementById('preguntas');
  let preguntasHTML = '';

  zona.preguntas.forEach((p, i) => {
    preguntasHTML += `
      <div class="pregunta">
        <p>${p.pregunta}</p>
        ${p.opciones.map((op, idx) => `
          <label>
            <input type="radio" name="pregunta${i}" value="${idx}"> ${op}
          </label><br>
        `).join('')}
      </div>
    `;
  });

  contenedorPreguntas.innerHTML = preguntasHTML;
}

function verificarRespuestas() {
  if (!zonaActual) return;

  let correctas = 0;
  zonaActual.preguntas.forEach((p, i) => {
    const seleccion = document.querySelector(`input[name="pregunta${i}"]:checked`);
    if (seleccion && parseInt(seleccion.value) === p.correcta) {
      correctas++;
    }
  });

  if (correctas === zonaActual.preguntas.length) {
    alert("¡Muy bien! Has ganado una insignia.");
    reproducirSonido("sonidos/exito.wav");
    guardarInsignia(zonaActual.insignia);
  } else {
    alert(`Tienes ${correctas}/${zonaActual.preguntas.length} correctas. ¡Intenta nuevamente!`);
    reproducirSonido("sonidos/error.wav");
  }
}

function guardarInsignia(insignia) {
  let guardadas = JSON.parse(localStorage.getItem('insignias') || '[]');
  if (!guardadas.some(i => i.imagen === insignia.imagen)) {
    guardadas.push(insignia);
    localStorage.setItem('insignias', JSON.stringify(guardadas));
    mostrarInsignias();
    reproducirSonido("sonidos/insignia.wav");
  }
}

function mostrarInsignias() {
  const contenedor = document.getElementById('insignias-coleccion');
  if (!contenedor) return;

  const guardadas = JSON.parse(localStorage.getItem('insignias') || '[]');
  contenedor.innerHTML = guardadas.map(i => `
    <div style="display:inline-block; text-align:center; margin:10px;">
      <img class="insignia-desbloqueada" src="${i.imagen}">
      <div style="font-size: 12px; color: #fff; margin-top: 5px;">
        <strong>${i.nombre}</strong><br>${i.descripcion}
      </div>
    </div>
  `).join('');
}

function reproducirSonido(ruta) {
  const sonido = new Audio(ruta);
  sonido.volume = 0.7;
  sonido.play().catch(e => {
    console.warn("Sonido bloqueado por el navegador hasta interacción");
  });
}

function reproducirMusicaFondo() {
  musicaFondo = new Audio("sonidos/fondo.wav");
  musicaFondo.loop = true;
  musicaFondo.volume = 0.3;
  musicaFondo.play().catch(() => {
    document.addEventListener("click", () => musicaFondo.play(), { once: true });
  });
}

const toggleMusicaBtn = document.getElementById("toggle-musica");
if (toggleMusicaBtn) {
  toggleMusicaBtn.addEventListener("click", () => {
    if (musicaFondo.paused) {
      musicaFondo.play();
    } else {
      musicaFondo.pause();
    }
  });
}

const botonLibro = document.getElementById("ver-libro");
if (botonLibro) {
  botonLibro.addEventListener("click", () => {
    reproducirSonido("sonidos/libro.wav");
    setTimeout(() => {
      location.href = "insignias.html";
    }, 300);
  });
}

const volverBtn = document.getElementById("volver-mapa");
if (volverBtn) {
  volverBtn.addEventListener("click", () => {
    reproducirSonido("sonidos/volver.wav");
    setTimeout(() => {
      location.href = "index.html";
    }, 300);
  });
}
