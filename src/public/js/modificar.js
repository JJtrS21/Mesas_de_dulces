    const params = new URLSearchParams(window.location.search);
    const idEvento = parseInt(params.get('id'));

    if (isNaN(idEvento)) {
      alert("❌ No se especificó un ID de evento válido.");
      window.location.href = "index.html";
    }

    let datosJson = [];

    // ✅ Cargar evento actual
    fetch('/api/eventos')
      .then(res => res.json())
      .then(data => {
        datosJson = data;
        const evento = datosJson[idEvento];

        if (!evento) {
          alert("❌ Evento no encontrado.");
          window.location.href = "index.html";
          return;
        }

        // Rellenar formulario
        document.getElementById('nombreCliente').value = evento.nombreCliente;
        document.getElementById('fecha').value = evento.fecha;
        document.getElementById('ubicacion').value = evento.ubicacion;
        document.getElementById('productos').value = evento.productos.join(', ');
        document.getElementById('descripcion').value = evento.descripcion || '';

        document.getElementById("formModificar").style.display = "block";
      })
      .catch(err => {
        console.error('Error al cargar eventos:', err);
        alert("❌ Error al cargar los datos del evento.");
      });

    // ✅ Guardar cambios
    document.getElementById("formModificar").addEventListener("submit", (e) => {
      e.preventDefault();

      const eventoActualizado = {
        nombreCliente: document.getElementById('nombreCliente').value,
        fecha: document.getElementById('fecha').value,
        ubicacion: document.getElementById('ubicacion').value,
        productos: document.getElementById('productos').value.split(',').map(p => p.trim()),
        descripcion: document.getElementById('descripcion').value
      };

      fetch(`/api/eventos/${idEvento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventoActualizado)
      })
      .then(res => res.json())
      .then(data => {
        console.log('Servidor respondió:', data);
        alert("✅ Evento actualizado correctamente.");
        window.location.href = `detalle.html?id=${idEvento}`;
      })
      .catch(err => {
        console.error('Error al guardar cambios:', err);
        alert("❌ Error al guardar el evento.");
      });
    });