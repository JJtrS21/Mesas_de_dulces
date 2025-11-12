  let datosJson = [];

  // Leer archivo JSON
 fetch('Productos.json')
    .then(response => response.json())
    .then(data => {
      datosJson = data;
      document.getElementById("formAgregar").style.display = "block";
    })
    .catch(error => console.error('Error al cargar el archivo JSON:', error));

  // Agregar nuevo evento
  document.getElementById("formAgregar").addEventListener("submit", function(event) {
    event.preventDefault();
  fetch('http://localhost:3000/api/productos', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nombreProducto: document.getElementById('nombreProducto').value,
      precio: document.getElementById('precio').value,
      categoria: document.getElementById('categoria').value
    })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Servidor respondió:', data);
    alert("✅ Evento agregado correctamente.");
      
  // Limpiar formulario
    document.getElementById("formAgregar").reset();
  })
  .catch(err => {
    console.error('Error al enviar datos:', err);
    alert("❌ Error al guardar el evento.");
  });
});