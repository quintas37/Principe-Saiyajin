// ========== ALMACENAMIENTO LOCAL ==========
class GestorVisitantes {
  constructor() {
    this.visitantes = this.cargarDatos();
  }

  cargarDatos() {
    const datos = localStorage.getItem('visitantes');
    return datos ? JSON.parse(datos) : [];
  }

  guardarDatos() {
    localStorage.setItem('visitantes', JSON.stringify(this.visitantes));
    this.actualizarEstadisticas();
  }

  agregarVisitante(visitante) {
    visitante.id = Date.now();
    visitante.fechaRegistro = new Date().toISOString();
    this.visitantes.push(visitante);
    this.guardarDatos();
    return visitante;
  }

  obtenerVisitantes() {
    return this.visitantes;
  }

  filtrar(filtros) {
    let resultado = this.visitantes;

    if (filtros.fecha) {
      resultado = resultado.filter(v => v.fecha === filtros.fecha);
    }

    if (filtros.tipo) {
      resultado = resultado.filter(v => v.tipoAcceso === filtros.tipo);
    }

    if (filtros.nombre) {
      const nombre = filtros.nombre.toLowerCase();
      resultado = resultado.filter(v => 
        v.nombre.toLowerCase().includes(nombre)
      );
    }

    return resultado;
  }

  eliminarPorId(id) {
    this.visitantes = this.visitantes.filter(v => v.id !== id);
    this.guardarDatos();
  }

  limpiarAntiguos(dias = 30) {
    const ahora = new Date();
    const fechaLimite = new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000);
    
    const visitantesAntiguos = this.visitantes.filter(v => 
      new Date(v.fechaRegistro) < fechaLimite
    );

    this.visitantes = this.visitantes.filter(v => 
      new Date(v.fechaRegistro) >= fechaLimite
    );

    this.guardarDatos();
    return visitantesAntiguos.length;
  }

  actualizarEstadisticas() {
    const hoy = new Date().toISOString().split('T')[0];
    const visitantesHoy = this.visitantes.filter(v => v.fecha === hoy);
    const vehicular = visitantesHoy.filter(v => v.tipoAcceso === 'vehicular').length;
    const peatonal = visitantesHoy.filter(v => v.tipoAcceso === 'peatonal').length;
    
    let menores = 0;
    visitantesHoy.forEach(v => {
      if (v.cantidadMenores) {
        menores += parseInt(v.cantidadMenores);
      }
    });

    const totalHoy = document.getElementById('totalHoy');
    const totalVehicular = document.getElementById('totalVehicular');
    const totalPeatonal = document.getElementById('totalPeatonal');
    const totalMenores = document.getElementById('totalMenores');

    if (totalHoy) totalHoy.textContent = visitantesHoy.length;
    if (totalVehicular) totalVehicular.textContent = vehicular;
    if (totalPeatonal) totalPeatonal.textContent = peatonal;
    if (totalMenores) totalMenores.textContent = menores;
  }
}

// ========== INSTANCIA GLOBAL ==========
const gestor = new GestorVisitantes();

// ========== FUNCIONES DE NAVEGACIÓN ==========
function mostrarSeccion(seccionId) {
  console.log('Mostrando sección:', seccionId);
  
  // Ocultar todas las secciones
  const secciones = document.querySelectorAll('.seccion');
  secciones.forEach(sec => {
    sec.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const seccionActual = document.getElementById(seccionId);
  if (seccionActual) {
    seccionActual.classList.add('active');
  }

  // Actualizar navegación
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
  });

  // Buscar y activar el enlace correcto
  const enlaceActivo = Array.from(navLinks).find(link => 
    link.getAttribute('onclick').includes(`'${seccionId}'`)
  );
  if (enlaceActivo) {
    enlaceActivo.classList.add('active');
  }

  // Si es consulta, recargar tabla
  if (seccionId === 'consulta') {
    mostrarVisitantes();
  }
}

// ========== INICIALIZACIÓN DEL DOM ==========
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM cargado');
  
  // Establecer fecha mínima a hoy
  const inputFecha = document.getElementById('fecha');
  if (inputFecha) {
    const hoy = new Date().toISOString().split('T')[0];
    inputFecha.min = hoy;
    inputFecha.value = hoy;
  }

  // Evento del formulario
  const formVisitante = document.getElementById('formVisitante');
  if (formVisitante) {
    formVisitante.addEventListener('submit', guardarVisitante);
    console.log('Formulario vinculado');
  }

  // Inicializar estadísticas
  gestor.actualizarEstadisticas();
  
  // Mostrar primera sección por defecto
  mostrarSeccion('inicio');
});

// ========== FUNCIONES DEL FORMULARIO ==========
function actualizarFormulario() {
  console.log('Actualizando formulario');
  
  const tipoAcceso = document.querySelector('input[name="tipoAcceso"]:checked');
  if (!tipoAcceso) return;
  
  const valor = tipoAcceso.value;
  const datosVehiculares = document.getElementById('datosVehiculares');
  const placaInput = document.getElementById('placa');
  const marcaInput = document.getElementById('marca');
  const colorInput = document.getElementById('color');
  const conductorInput = document.getElementById('conductor');

  if (valor === 'vehicular') {
    datosVehiculares.style.display = 'block';
    placaInput.required = true;
    marcaInput.required = true;
    colorInput.required = true;
    conductorInput.required = true;
  } else {
    datosVehiculares.style.display = 'none';
    placaInput.required = false;
    marcaInput.required = false;
    colorInput.required = false;
    conductorInput.required = false;
    placaInput.value = '';
    marcaInput.value = '';
    colorInput.value = '';
    conductorInput.value = '';
  }
}

function toggleMenores() {
  console.log('Toggle menores');
  
  const checkbox = document.getElementById('acompanaMenores');
  const seccionMenores = document.getElementById('seccionMenores');
  const cantidadMenores = document.getElementById('cantidadMenores');

  if (checkbox.checked) {
    seccionMenores.style.display = 'block';
    cantidadMenores.required = true;
  } else {
    seccionMenores.style.display = 'none';
    cantidadMenores.required = false;
    cantidadMenores.value = '';
    document.getElementById('camposMenores').innerHTML = '';
  }
}

function generarCamposMenores() {
  console.log('Generando campos de menores');
  
  const cantidad = parseInt(document.getElementById('cantidadMenores').value);
  const contenedor = document.getElementById('camposMenores');
  contenedor.innerHTML = '';

  if (isNaN(cantidad) || cantidad <= 0) return;

  for (let i = 1; i <= cantidad; i++) {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = `
      <label for="menor${i}">Nombre del Menor ${i} *</label>
      <input type="text" id="menor${i}" required placeholder="Nombre completo del menor ${i}">
    `;
    contenedor.appendChild(div);
  }
}

function guardarVisitante(e) {
  e.preventDefault();
  console.log('Guardando visitante');

  // Validar que se seleccione tipo de acceso
  const tipoAccesoSeleccionado = document.querySelector('input[name="tipoAcceso"]:checked');
  if (!tipoAccesoSeleccionado) {
    alert('Debe seleccionar un tipo de acceso');
    return;
  }

  // Recopilar datos del formulario
  const visitante = {
    nombre: document.getElementById('nombre').value,
    documento: document.getElementById('documento').value,
    telefono: document.getElementById('telefono').value,
    correo: document.getElementById('correo').value,
    empresa: document.getElementById('empresa').value,
    tipoAcceso: tipoAccesoSeleccionado.value,
    placa: document.getElementById('placa').value,
    marca: document.getElementById('marca').value,
    color: document.getElementById('color').value,
    conductor: document.getElementById('conductor').value,
    cantidadMenores: document.getElementById('cantidadMenores').value,
    menores: [],
    motivo: document.getElementById('motivo').value,
    departamento: document.getElementById('departamento').value,
    persona_contacto: document.getElementById('persona_contacto').value,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value,
    horaSalida: document.getElementById('horaSalida').value
  };

  // Recopilar datos de menores
  if (visitante.cantidadMenores) {
    const cantidad = parseInt(visitante.cantidadMenores);
    for (let i = 1; i <= cantidad; i++) {
      const inputMenor = document.getElementById(`menor${i}`);
      if (inputMenor && inputMenor.value) {
        visitante.menores.push(inputMenor.value);
      }
    }
  }

  console.log('Visitante a guardar:', visitante);

  // Guardar en gestor
  gestor.agregarVisitante(visitante);

  // Mostrar mensaje de éxito
  const mensajeExito = document.getElementById('mensajeExito');
  if (mensajeExito) {
    mensajeExito.style.display = 'flex';
    setTimeout(() => {
      mensajeExito.style.display = 'none';
    }, 5000);
  }

  // Limpiar formulario
  document.getElementById('formVisitante').reset();
  document.getElementById('datosVehiculares').style.display = 'none';
  document.getElementById('seccionMenores').style.display = 'none';
  document.getElementById('camposMenores').innerHTML = '';
  document.getElementById('acompanaMenores').checked = false;
  
  // Establecer fecha a hoy
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('fecha').value = hoy;

  // Actualizar estadísticas
  gestor.actualizarEstadisticas();
  
  alert('✓ ¡Visitante registrado exitosamente!');
}

// ========== CONSULTA Y FILTROS ==========
function mostrarVisitantes() {
  console.log('Mostrando visitantes');
  
  const filtros = {
    fecha: document.getElementById('filtroFecha').value || '',
    tipo: document.getElementById('filtroTipo').value || '',
    nombre: document.getElementById('filtroBusqueda').value || ''
  };

  console.log('Filtros:', filtros);

  const visitantes = gestor.filtrar(filtros);
  const cuerpoTabla = document.getElementById('cuerpoTabla');

  if (visitantes.length === 0) {
    cuerpoTabla.innerHTML = '<tr class="vacio"><td colspan="8">No hay registros disponibles</td></tr>';
    return;
  }

  cuerpoTabla.innerHTML = visitantes.map(v => `
    <tr>
      <td>${v.nombre}</td>
      <td>${v.documento}</td>
      <td>
        <span style="background-color: ${v.tipoAcceso === 'vehicular' ? '#eff6ff' : '#f0fdf4'}; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; color: #1f2937;">
          ${v.tipoAcceso === 'vehicular' ? '🚗 Vehicular' : '🚶 Peatonal'}
        </span>
      </td>
      <td>${v.fecha}</td>
      <td>${v.hora}</td>
      <td>${v.horaSalida || '-'}</td>
      <td>${v.departamento}</td>
      <td>
        <button class="btn" style="background-color: #ef4444; color: white; padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="eliminarVisitante(${v.id})">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </td>
    </tr>
  `).join('');
}

function filtrarVisitantes() {
  console.log('Filtrando visitantes');
  mostrarVisitantes();
}

function limpiarFiltros() {
  console.log('Limpiando filtros');
  document.getElementById('filtroFecha').value = '';
  document.getElementById('filtroTipo').value = '';
  document.getElementById('filtroBusqueda').value = '';
  mostrarVisitantes();
}

function eliminarVisitante(id) {
  console.log('Eliminando visitante:', id);
  if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
    gestor.eliminarPorId(id);
    mostrarVisitantes();
    gestor.actualizarEstadisticas();
    alert('✓ Registro eliminado');
  }
}

// ========== ARCHIVO Y EXPORTACIÓN ==========
function estadisticasArchivo() {
  console.log('Mostrando estadísticas');
  
  const todos = gestor.obtenerVisitantes();
  const vehicular = todos.filter(v => v.tipoAcceso === 'vehicular').length;
  const peatonal = todos.filter(v => v.tipoAcceso === 'peatonal').length;
  
  let menores = 0;
  todos.forEach(v => {
    if (v.cantidadMenores) {
      menores += parseInt(v.cantidadMenores);
    }
  });

  const totalVisitantes = document.getElementById('totalVisitantes');
  const totalVehicularArchivo = document.getElementById('totalVehicularArchivo');
  const totalPeatonalArchivo = document.getElementById('totalPeatonalArchivo');
  const totalMenoresArchivo = document.getElementById('totalMenoresArchivo');

  if (totalVisitantes) totalVisitantes.textContent = todos.length;
  if (totalVehicularArchivo) totalVehicularArchivo.textContent = vehicular;
  if (totalPeatonalArchivo) totalPeatonalArchivo.textContent = peatonal;
  if (totalMenoresArchivo) totalMenoresArchivo.textContent = menores;

  const estadisticas = document.getElementById('estadisticas');
  if (estadisticas) {
    estadisticas.style.display = 'block';
  }
}

function exportarExcel() {
  console.log('Exportando a Excel');
  
  const visitantes = gestor.obtenerVisitantes();
  
  if (visitantes.length === 0) {
    alert('No hay registros para exportar');
    return;
  }

  let csv = 'Nombre,Documento,Teléfono,Correo,Empresa,Tipo Acceso,Placa,Marca,Color,Conductor,Cantidad Menores,Motivo,Departamento,Persona Contacto,Fecha,Hora Entrada,Hora Salida\n';

  visitantes.forEach(v => {
    const nombre = (v.nombre || '').replace(/"/g, '""');
    const documento = (v.documento || '').replace(/"/g, '""');
    const correo = (v.correo || '').replace(/"/g, '""');
    const empresa = (v.empresa || '').replace(/"/g, '""');
    const placa = (v.placa || '').replace(/"/g, '""');
    const marca = (v.marca || '').replace(/"/g, '""');
    const conductor = (v.conductor || '').replace(/"/g, '""');
    const motivo = (v.motivo || '').replace(/"/g, '""');
    const persona = (v.persona_contacto || '').replace(/"/g, '""');
    
    csv += `"${nombre}","${documento}","${v.telefono}","${correo}","${empresa}","${v.tipoAcceso}","${placa}","${marca}","${v.color}","${conductor}","${v.cantidadMenores}","${motivo}","${v.departamento}","${persona}","${v.fecha}","${v.hora}","${v.horaSalida}"\n`;
  });

  descargarArchivo(csv, 'visitantes.csv', 'text/csv;charset=utf-8;');
}

function exportarPDF() {
  console.log('Exportando a PDF');
  
  const visitantes = gestor.obtenerVisitantes();
  
  if (visitantes.length === 0) {
    alert('No hay registros para exportar');
    return;
  }

  let contenido = 'SISTEMA DE REGISTRO DE VISITANTES\n';
  contenido += '='.repeat(80) + '\n\n';

  visitantes.forEach((v, index) => {
    contenido += `REGISTRO #${index + 1}\n`;
    contenido += '-'.repeat(80) + '\n';
    contenido += `Nombre: ${v.nombre}\n`;
    contenido += `Documento: ${v.documento}\n`;
    contenido += `Teléfono: ${v.telefono}\n`;
    contenido += `Correo: ${v.correo}\n`;
    contenido += `Empresa: ${v.empresa}\n`;
    contenido += `Tipo de Acceso: ${v.tipoAcceso.toUpperCase()}\n`;
    
    if (v.tipoAcceso === 'vehicular') {
      contenido += `  - Placa: ${v.placa}\n`;
      contenido += `  - Marca: ${v.marca}\n`;
      contenido += `  - Color: ${v.color}\n`;
      contenido += `  - Conductor: ${v.conductor}\n`;
    }

    if (v.menores && v.menores.length > 0) {
      contenido += `Menores: ${v.menores.join(', ')}\n`;
    }

    contenido += `Departamento: ${v.departamento}\n`;
    contenido += `Persona Contacto: ${v.persona_contacto}\n`;
    contenido += `Fecha: ${v.fecha}\n`;
    contenido += `Hora Entrada: ${v.hora}\n`;
    contenido += `Hora Salida: ${v.horaSalida || 'No especificada'}\n`;
    contenido += `Motivo: ${v.motivo}\n`;
    contenido += '\n';
  });

  descargarArchivo(contenido, 'visitantes.txt', 'text/plain;charset=utf-8;');
}

function descargarArchivo(contenido, nombreArchivo, tipo) {
  console.log('Descargando archivo:', nombreArchivo);
  
  const blob = new Blob([contenido], { type: tipo });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function confirmarLimpiarArchivo() {
  console.log('Confirmar limpiar archivo');
  
  const confirmacion = prompt('Esto eliminará todos los registros de más de 30 días. Escribe "CONFIRMAR" para continuar:');
  
  if (confirmacion === 'CONFIRMAR') {
    const eliminados = gestor.limpiarAntiguos(30);
    alert(`✓ Se han eliminado ${eliminados} registros antiguos.`);
    gestor.actualizarEstadisticas();
  }
}

// ========== LOG DE INICIALIZACIÓN ==========
console.log('Script de visitantes cargado correctamente');
