const params = new URLSearchParams(window.location.search);
let idEvento = parseInt(params.get('id')) || 0; // por defecto muestra el primero

fetch('/api/eventos')
  .then(response => response.json())
  .then(data => {
    function mostrarEvento(index) {
      try {
        if (index < 0 || index >= data.length) return;

        const evento = data[index];

        document.getElementById("nombreCliente").textContent =
          evento.nombreCliente || evento.cliente || "Sin nombre";

        document.getElementById("fecha").textContent = evento.fecha || "Sin fecha";
        document.getElementById("ubicacion").textContent = evento.ubicacion || "Sin ubicación";
        document.getElementById("textoDescripcion").textContent = evento.descripcion || "Sin descripción";

        const lista = document.getElementById("listaProductos");
        lista.innerHTML = "";

        let productos = Array.isArray(evento.productos)
          ? evento.productos
          : evento.productos ? evento.productos.split(",") : [];

        productos.forEach(p => {
          const li = document.createElement("li");
          li.textContent = p.trim();
          lista.appendChild(li);
        });

      } catch (error) {
        console.error("Error mostrando el evento:", error);
      }
    }

    mostrarEvento(idEvento);

  })
  .catch(err => {
    console.error("Error en fetch:", err);
    document.getElementById("nombreCliente").textContent = "Error al cargar los datos";
  });

document.getElementById("editar").addEventListener("click", () => {
    window.location.href = `modificar.html?id=${idEvento}`;
});