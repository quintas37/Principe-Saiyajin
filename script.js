
/**
 * Portal de Servicios Ciudadanos
 * Optimizada para rendimiento y accesibilidad.*/

document.addEventListener('DOMContentLoaded', () => {
  // --- SELECTORES DE ELEMENTOS ---
  const form = document.getElementById('formCitas');
  const inputFecha = document.getElementById('fecha');
  const errorFecha = document.getElementById('error-fecha');
  const selectHora = document.getElementById('hora');
  const ticketCita = document.getElementById('ticketCita');
  const ticketNombre = document.getElementById('ticketNombre');

  // --- CONFIGURACIÓN ---
  const CONFIG = {
    horaInicio: 9,
    horaFin: 18,
    intervaloMinutos: 30
  };

  // --- INICIALIZACIÓN ---
  const inicializarFormulario = () => {
    // 1. Limitar fecha mínima a hoy de forma local (evita desfase UTC)
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset();
    const hoyLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
    inputFecha.min = hoyLocal.toISOString().split('T')[0];

    // 2. Poblar select de horas dinámicamente
    poblarHorarios();
  };

  // --- FUNCIONES AUXILIARES ---
  
  // Genera las opciones de hora dinámicamente en formato 12h para el usuario y 24h para el valor
  const poblarHorarios = () => {
    const fragment = document.createDocumentFragment();
    
    // Opción por defecto
    const defecto = document.createElement('option');
    defecto.value = "";
    defecto.disabled = true;
    defecto.selected = true;
    defecto.textContent = "-- Selecciona una hora --";
    fragment.appendChild(defecto);

    for (let h = CONFIG.horaInicio; h <= CONFIG.horaFin; h++) {
      const hora24 = String(h).padStart(2, '0');
      
      // Bloque :00
      fragment.appendChild(crearOpcionHora(`${hora24}:00`, h, "00"));

      // Bloque :30 (No incluir 18:30 si el límite es 18:00)
      if (h < CONFIG.horaFin) {
        fragment.appendChild(crearOpcionHora(`${hora24}:30`, h, "30"));
      }
    }
    selectHora.appendChild(fragment);
  };

  // Formatea el texto de visualización a formato am/pm de manera elegante
  const crearOpcionHora = (valor24, hora, minutos) => {
    const sufijo = hora >= 12 ? 'p.m.' : 'a.m.';
    let hora12 = hora % 12;
    hora12 = hora12 === 0 ? 12 : hora12; // Convierte 0 a 12 para medianoche/mediodía
    
    const opcion = document.createElement('option');
    opcion.value = valor24;
    opcion.textContent = `${hora12}:${minutos} ${sufijo}`;
    return opcion;
  };

  // --- CONTROLADORES DE EVENTOS (MANEJO DE EVENTOS) ---

  // Validación en tiempo real del input de fecha
  inputFecha.addEventListener('input', (e) => {
    const fechaSeleccionada = new Date(e.target.value + 'T00:00:00');
    const diaSemana = fechaSeleccionada.getDay(); // 0: Domingo, 6: Sábado

    if (diaSemana === 0 || diaSemana === 6) {
      // Mostrar error visual moderno
      errorFecha.style.display = 'block';
      e.target.classList.add('input-error');
      e.target.value = ''; // Resetea el valor inválido
    } else {
      // Ocultar error si el día es correcto
      errorFecha.style.display = 'none';
      e.target.classList.remove('input-error');
    }
  });

  // Procesamiento y envío del formulario
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue

    // Extraer y sanitizar datos de forma segura
    const datosCita = {
      nombre: document.getElementById('nombre').value.trim(),
      tramite: document.getElementById('tramite').options[document.getElementById('tramite').selectedIndex].text,
      fecha: inputFecha.value.split('-').reverse().join('/'), // Convierte YYYY-MM-DD a DD/MM/YYYY
      hora: selectHora.options[selectHora.selectedIndex].text
    };

    // Renderizar la información en el Ticket final de forma elegante
    ticketNombre.innerHTML = `
      <span style="display:block; margin-bottom: 0.5rem;"><strong>Ciudadano:</strong> ${datosCita.nombre}</span>
      <span style="display:block; margin-bottom: 0.5rem;"><strong>Servicio:</strong> ${datosCita.tramite}</span>
      <span style="display:block; margin-bottom: 0.5rem;"><strong>Fecha:</strong> ${datosCita.fecha}</span>
      <span style="display:block;"><strong>Horario asignado:</strong> ${datosCita.hora}</span>
    `;

    // Efecto visual fluido para mostrar el ticket
    form.style.opacity = '0.3';
    form.style.pointerEvents = 'none'; // Deshabilita interacciones posteriores
    
    ticketCita.style.display = 'block';
    ticketCita.style.opacity = '0';
    ticketCita.style.transform = 'translateY(20px)';
    ticketCita.style.transition = 'all 0.5s ease';

    // Disparador micro-timed para la animación de entrada
    setTimeout(() => {
      ticketCita.style.opacity = '1';
      ticketCita.style.transform = 'translateY(0)';
      ticketCita.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  });

  // Ejecución inicial
  inicializarFormulario();
});

// --- FUNCIONES GLOBALES (Para los botones superiores del HTML) ---
window.seleccionarTramite = (idTramite) => {
  const selectTramite = document.getElementById('tramite');
  if (selectTramite) {
    selectTramite.value = idTramite;
    // Dispara manualmente el evento de scroll suave hacia el formulario
    document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
  }
};

window.filtrarRequisitos = (categoria, botonActivo) => {
  // Cambiar estado visual de los botones de filtro
  document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
  botonActivo.classList.add('active');

  // Filtrar la lista de requisitos con opacidad y transiciones
  document.querySelectorAll('.req-item').forEach(item => {
    const categoriasItem = item.getAttribute('data-category').split(' ');
    
    if (categoria === 'todos' || categoriasItem.includes(categoria)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
};
