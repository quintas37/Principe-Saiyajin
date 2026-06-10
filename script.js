document.addEventListener("DOMContentLoaded", () => {
    inicializarMenu();
    inicializarFormulario();
    verificarCitaExistente();
});

// 1. ANIMACIÓN DEL ENCABEZADO CON EL SCROLL
function inicializarMenu() {
    const header = document.getElementById("mainHeader");
    if (!header) return; // Validación de seguridad

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });
}

// 2. SISTEMA DE FILTRADO DINÁMICO DE REQUISITOS
function filtrarRequisitos(categoria, botonActivo) {
    // Actualizar estados visuales de los botones de filtro
    const botones = document.querySelectorAll(".btn-filter");
    botones.forEach(btn => btn.classList.remove("active"));
    
    if (botonActivo) {
        botonActivo.classList.add("active");
    }

    // Filtrar los elementos del DOM
    const items = document.querySelectorAll(".req-item");
    items.forEach(item => {
        const categoriaAttr = item.getAttribute("data-category");
        if (!categoriaAttr) return;

        const categoriasItem = categoriaAttr.split(" ");
        if (categoria === "todos" || categoriasItem.includes(categoria)) {
            item.classList.remove("hidden");
            item.style.opacity = "1";
            item.style.transform = "scale(1)";
        } else {
            item.classList.add("hidden");
        }
    });
}

// Conectar las tarjetas de servicios directamente con el filtro automático
function seleccionarTramite(tipoTramite) {
    const botonCorrespondiente = document.querySelector(`.btn-filter[onclick*="${tipoTramite}"]`);
    if (botonCorrespondiente) {
        botonCorrespondiente.click();
    } else {
        // Fallback en caso de que no se encuentre el botón exacto
        filtrarRequisitos(tipoTramite, null);
    }
    
    const seccionRequisitos = document.getElementById("requisitos");
    if (seccionRequisitos) {
        seccionRequisitos.scrollIntoView({ behavior: "smooth" });
    }

    // Auto-seleccionar en el formulario abajo
    const selectTramite = document.getElementById("tramite");
    if (selectTramite) {
        selectTramite.value = tipoTramite;
    }
}

// 3. VALIDACIÓN INTELIGENTE DEL FORMULARIO DE FECHAS
function inicializarFormulario() {
    const inputFecha = document.getElementById("fecha");
    const form = document.getElementById("formCitas");

    if (!inputFecha || !form) return;

    // Configurar el límite de fecha mínimo (Día de hoy en zona horaria local)
    const hoyLocal = new Date();
    const anio = hoyLocal.getFullYear();
    const mes = String(hoyLocal.getMonth() + 1).padStart(2, '0');
    const dia = String(hoyLocal.getDate()).padStart(2, '0');
    const fechaMinimaLocal = `${anio}-${mes}-${dia}`;
    
    inputFecha.setAttribute("min", fechaMinimaLocal);

    // Evitar que el usuario guarde un fin de semana (Corrección de Zona Horaria)
    inputFecha.addEventListener("input", (e) => {
        if (!e.target.value) return;
        
        // Reemplazar guiones por diagonales fuerza a JavaScript a interpretar la fecha como hora local
        const fechaLocal = new Date(e.target.value.replace(/-/g, '\/'));
        const diaSemana = fechaLocal.getDay(); // 0 = Domingo, 6 = Sábado
        
        if (diaSemana === 0 || diaSemana === 6) {
            alert("Las oficinas de atención ciudadana operan únicamente de Lunes a Viernes.");
            e.target.value = "";
        }
    });

    // Procesar el envío y guardado de datos
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const selectTramite = document.getElementById("tramite");
        const inputNombre = document.getElementById("nombre");
        const inputHora = document.getElementById("hora");

        const datosCita = {
            nombre: inputNombre ? inputNombre.value : "Ciudadano Anónimo",
            tramite: selectTramite ? selectTramite.options[selectTramite.selectedIndex].text : "Trámite General",
            fecha: inputFecha.value,
            hora: inputHora ? inputHora.value : "00:00"
        };

        // Guardar de forma persistente en el navegador
        localStorage.setItem("citaCiudadana", JSON.stringify(datosCita));
        mostrarTicket(datosCita);
    });
}

// 4. PERSISTENCIA DE DATOS Y RENDERIZADO DEL TICKET
function mostrarTicket(datos) {
    const form = document.getElementById("formCitas");
    const ticket = document.getElementById("ticketCita");
    
    if (form) form.classList.add("hidden");
    if (!ticket) return;

    // Inyectar textos de forma segura con textContent (Previene XSS)
    const campos = {
        "ticketNombre": datos.nombre,
        "ticketTramite": datos.tramite,
        "ticketFecha": formatearFechaVisual(datos.fecha),
        "ticketHora": datos.hora
    };

    Object.keys(campos).forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = campos[id];
    });
    
    ticket.classList.remove("hidden");
}

// Función auxiliar para mostrar la fecha en formato DD/MM/AAAA en el ticket
function formatearFechaVisual(fechaString) {
    if (!fechaString) return "";
    const partes = fechaString.split("-");
    if (partes.length !== 3) return fechaString;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function verificarCitaExistente() {
    const citaGuardada = localStorage.getItem("citaCiudadana");
    if (citaGuardada) {
        try {
            mostrarTicket(JSON.parse(citaGuardada));
        } catch (e) {
            localStorage.removeItem("citaCiudadana"); // Limpiar en caso de datos corruptos
        }
    }
}

function cancelarCita() {
    if (confirm("¿Estás seguro de que deseas cancelar o reagendar tu cita asignada?")) {
        localStorage.removeItem("citaCiudadana");
        
        const ticket = document.getElementById("ticketCita");
        const form = document.getElementById("formCitas");
        
        if (ticket) ticket.classList.add("hidden");
        if (form) {
            form.classList.remove("hidden");
            form.reset();
        }
    }
}
