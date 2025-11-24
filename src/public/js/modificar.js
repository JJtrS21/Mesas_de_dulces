const params = new URLSearchParams(window.location.search);
const idEvento = parseInt(params.get('id'));

if (isNaN(idEvento)) {
  alert("❌ No se especificó un ID de evento válido.");
  window.location.href = "/html/index.html";
}

let datosJson = [];

// ==============================
//  CARGAR EVENTO + PRODUCTOS
// ==============================
Promise.all([
  fetch('/api/eventos').then(res => res.json()),
  fetch('/api/productos').then(res => res.json())
])
.then(([eventos, productos]) => {

  datosJson = eventos;
  const evento = datosJson[idEvento];

  if (!evento) {
    alert("❌ Evento no encontrado.");
    window.location.href = "/html/index.html";
    return;
  }

  // ===============================
  //     RELLENAR CAMPOS BÁSICOS
  // ===============================
  document.getElementById('nombreCliente').value = evento.nombreCliente;
  document.getElementById('fecha').value = evento.fecha;
  document.getElementById('ubicacion').value = evento.ubicacion;
  document.getElementById('estado').value = evento.estado; 
  document.getElementById('personas').value = evento.personas;
  document.getElementById('precioPersona').value = evento.precioPersona;
  document.getElementById('descripcion').value = evento.descripcion || '';

  // Convertir productos guardados a mapa: { nombre → cantidad }
  const mapaCantidades = {};
  if (Array.isArray(evento.productos)) {
    evento.productos.forEach(p => {
      mapaCantidades[p.nombre] = p.cantidad;
    });
  }

  const cont = document.getElementById("listaProductos");
  cont.innerHTML = "";

  // ===============================
  //   GENERAR LISTA DE PRODUCTOS
  // ===============================
  productos.forEach(prod => {
    const cantidad = mapaCantidades[prod.nombreProducto] || 0;

    const fila = document.createElement("div");
    fila.classList.add("prod-item");

    fila.innerHTML = `
      <label style="display:block; margin-bottom: 8px;">
        <input type="checkbox" class="checkProd" data-nombre="${prod.nombreProducto}"
              ${cantidad > 0 ? "checked" : ""}>

        ${prod.nombreProducto} — $${prod.precio} (${prod.categoria})

        <input type="number" min="1"
              class="cantProd"
              data-nombre="${prod.nombreProducto}"
              value="${cantidad > 0 ? cantidad : ''}"
              ${cantidad > 0 ? "" : "disabled"}
              style="width:70px; margin-left:10px;">
      </label>
    `;

    cont.appendChild(fila);
  });

  // ===============================
  //   CÁLCULO PRECIO POR PERSONA
  // ===============================
  function calcularPrecioPorPersona(personas) {
    if (personas >= 30 && personas <= 60) return 80;
    if (personas >= 61 && personas <= 100) return 60;
    if (personas >= 101 && personas <= 150) return 45;
    if (personas > 150) return 35;
    return "";
  }

  document.getElementById("personas").addEventListener("input", () => {
    const personas = parseInt(document.getElementById("personas").value);

    if (!isNaN(personas)) {
      const precio = calcularPrecioPorPersona(personas);
      document.getElementById("precioPersona").value = precio;
    } else {
      document.getElementById("precioPersona").value = "";
    }
  });

  // ===============================
  //  CHECKBOX HABILITA CANTIDAD
  // ===============================
  document.querySelectorAll(".checkProd").forEach(ch => {
    ch.addEventListener("change", e => {
      const nombre = e.target.dataset.nombre;
      const inputCantidad = document.querySelector(
        `.cantProd[data-nombre="${nombre}"]`
      );

      if (e.target.checked) {
        inputCantidad.disabled = false;
        if (!inputCantidad.value) inputCantidad.value = 1;
      } else {
        inputCantidad.disabled = true;
        inputCantidad.value = "";
      }
    });
  });

  document.getElementById("formModificar").style.display = "block";

})
.catch(err => {
  console.error("Error al cargar los datos del evento:", err);
  alert("❌ Error al cargar los datos del servidor.");
});


// ===============================
//       GUARDAR CAMBIOS (REEMPLAZAR)
// ===============================
document.getElementById("formModificar").addEventListener("submit", (e) => {
  e.preventDefault();

  // Leer personas y precio por persona (tal como están en el DOM)
  const personas = parseInt(document.getElementById("personas").value, 10) || 0;
  const precioPersona = parseFloat(document.getElementById("precioPersona").value) || 0;
  const totalPersonas = Math.ceil(personas * precioPersona);

  // Procesar productos seleccionados (extraer precio del texto del label)
  const productosActualizados = [];
  let totalProductos = 0;

  document.querySelectorAll(".checkProd").forEach(ch => {
    if (!ch.checked) return;

    const nombre = ch.dataset.nombre;
    const inputCantidad = document.querySelector(`.cantProd[data-nombre="${nombre}"]`);
    const cantidad = parseInt(inputCantidad.value, 10) || 0;

    // Extraer precio unitario desde el label que contiene el checkbox
    // El label tiene texto como: "NombreProducto — $19.99 (Categoría)"
    let precioUnit = 0;
    const label = ch.closest("label");
    if (label) {
      const txt = label.textContent || "";
      const m = txt.match(/—\s*\$([0-9]+(?:\.[0-9]+)?)/);
      if (m) precioUnit = parseFloat(m[1]);
    }

    const subtotal = Math.ceil(precioUnit * cantidad);

    productosActualizados.push({
      nombre,
      cantidad,
      precioUnitario: precioUnit,
      subtotal
    });

    totalProductos += subtotal;
  });

  const totalEvento = Math.ceil(totalProductos + totalPersonas);

  // Construir el objeto del evento con los nombres de campo que usas
  const eventoActualizado = {
    nombreCliente: document.getElementById("nombreCliente").value.trim(),
    fecha: document.getElementById("fecha").value,
    ubicacion: document.getElementById("ubicacion").value.trim(),
    descripcion: document.getElementById("descripcion").value.trim(),

    personas: personas,
    precioPersona: precioPersona,

    productos: productosActualizados,

    totalProductos: totalProductos,
    totalPersonas: totalPersonas,
    totalEvento: totalEvento,

    estado: document.getElementById("estado").value
  };

  // Enviar PUT al servidor
  fetch(`/api/eventos/${idEvento}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(eventoActualizado)
  })
    .then(res => res.json())
    .then(() => {
      alert("✅ Evento actualizado correctamente");
      window.location.href = `detalle.html?id=${idEvento}`;
    })
    .catch(err => {
      console.error("Error al guardar:", err);
      alert("❌ Error al guardar los cambios.");
    });
});

