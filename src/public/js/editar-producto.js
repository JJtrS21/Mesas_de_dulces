document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formEditarProducto');
  const btnEliminar = document.getElementById('btnEliminarProducto');

  // Obtener ID desde la URL (como string, ej: "prod-001")
  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get('id');

  if (!idProducto) {
    alert('ID de producto no especificado.');
    window.location.href = '/html/inventario.html';
    return;
  }

  // Referencias a campos
  const inputNombre = document.getElementById('nombre');
  const inputPrecio = document.getElementById('precio');
  const selectCategoria = document.getElementById('categoria');

  // Lista canónica de categorías
  const categoriasValidas = ['Bocadillos Salados', 'Plato Fuerte', 'Postre', 'Entrada'];

  // Cargar datos del producto desde la API
  fetch(`/api/productos/${encodeURIComponent(idProducto)}`)
    .then(res => {
      if (!res.ok) throw new Error(`Producto no encontrado (${res.status})`);
      return res.json();
    })
    .then(producto => {
      inputNombre.value = producto.nombreProducto || '';
      inputPrecio.value = Number.isFinite(producto.precio) ? producto.precio : '';

      // Normalizar categoría y asignar solo si está en la lista válida
      if (producto.categoria) {
        const normal = producto.categoria.toString().trim();
        // aceptar variantes como "Postres" -> "Postre"
        const map = {
          'postres': 'Postre',
          'postre': 'Postre',
          'bocadillos salados': 'Bocadillos Salados',
          'bocadillo salado': 'Bocadillos Salados',
          'plato fuerte': 'Plato Fuerte',
          'entrada': 'Entrada'
        };
        const catLower = normal.toLowerCase();
        const catFinal = map[catLower] || normal;
        selectCategoria.value = categoriasValidas.includes(catFinal) ? catFinal : '';
      } else {
        selectCategoria.value = '';
      }
    })
    .catch(err => {
      console.error('Error cargando producto:', err);
      alert('No se pudo cargar el producto. Será redirigido al inventario.');
      window.location.href = '/html/inventario.html';
    });

  // Validación simple
  function validarCampos(datos) {
    if (!datos.nombreProducto || datos.nombreProducto.trim().length < 2) {
      return 'El nombre del producto es demasiado corto.';
    }
    if (!Number.isFinite(datos.precio) || datos.precio < 0) {
      return 'Precio inválido.';
    }
    if (!categoriasValidas.includes(datos.categoria)) {
      return 'Seleccione una categoría válida.';
    }
    return null;
  }

  // Guardar cambios (PUT)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const datosActualizados = {
      nombreProducto: inputNombre.value.trim(),
      precio: parseFloat(inputPrecio.value),
      categoria: selectCategoria.value
    };

    const errorValid = validarCampos(datosActualizados);
    if (errorValid) {
      alert(errorValid);
      return;
    }

    fetch(`/api/productos/${encodeURIComponent(idProducto)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosActualizados)
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Error ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then(resp => {
        alert('Producto actualizado correctamente.');
        window.location.href = '/html/inventario.html';
      })
      .catch(err => {
        console.error('Error al actualizar:', err);
        alert('Ocurrió un error al actualizar el producto. Revisa la consola.');
      });
  });

  // Eliminar producto (DELETE)
  btnEliminar.addEventListener('click', () => {
    const confirmar = confirm('¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    fetch(`/api/productos/${encodeURIComponent(idProducto)}`, {
      method: 'DELETE'
    })
      .then(async res => {
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`Error ${res.status} - ${text}`);
        }
        return res.json();
      })
      .then(resp => {
        alert('Producto eliminado correctamente.');
        window.location.href = '/html/inventario.html';
      })
      .catch(err => {
        console.error('Error al eliminar:', err);
        alert('Ocurrió un error al eliminar el producto. Revisa la consola.');
      });
  });
});