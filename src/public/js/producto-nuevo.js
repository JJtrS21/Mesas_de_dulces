document.getElementById("formProducto").addEventListener("submit", (e) => {
  e.preventDefault();

  const nombreProducto = document.getElementById("nombreProducto").value.trim();
  const precio = parseFloat(document.getElementById("precio").value);
  const categoria = document.getElementById("categoria").value;

  if (!nombreProducto || !categoria || isNaN(precio)) {
    alert("⚠️ Todos los campos son obligatorios.");
    return;
  }

  const nuevoProducto = {
    nombreProducto,
    precio,
    categoria
  };

  fetch("/api/productos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoProducto)
  })
    .then(res => res.json())
    .then(data => {
      console.log("Servidor respondió:", data);

      if (data.error) {
        alert("❌ " + data.error);
        return;
      }

      alert("✅ Producto agregado correctamente");
      document.getElementById("formProducto").reset();
    })
    .catch(err => {
      console.error("Error al guardar producto:", err);
      alert("❌ Error al guardar producto");
    });
});
