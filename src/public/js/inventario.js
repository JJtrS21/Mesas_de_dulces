let productosOriginales = [];  // aquí se guardan todos los productos

async function cargarInventario() {
  try {
    const resp = await fetch('/api/inventario');
    const productos = await resp.json();

    // Guardamos en memoria para filtrar/buscar
    productosOriginales = productos;

    // Llenar select de categorías
    cargarCategorias(productos);

    // Ordenamos alfabéticamente
    const ordenados = ordenarPorNombre(productos);

    // Renderizamos tabla
    renderTabla(ordenados);

  } catch (err) {
    console.error('Error al cargar inventario:', err);
  }
}

// --- Ordenar productos ---
function ordenarPorNombre(lista) {
  return [...lista].sort((a, b) =>
    a.nombreProducto.localeCompare(b.nombreProducto, 'es')
  );
}

// --- Cargar categorías al select ---
function cargarCategorias(productos) {
  const select = document.getElementById('filtroCategoria');
  const categorias = [...new Set(productos.map(p => p.categoria))];

  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// --- Renderizar tabla ---
function renderTabla(lista) {
  const tbody = document.getElementById('tablaInventario');
  tbody.innerHTML = '';

  lista.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nombreProducto}</td>
      <td>$${p.precio}</td>
      <td>
        <a href="/html/editar-producto.html?id=${p.id}" class="btn-editar">
          ✏️ Editar
        </a>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Búsqueda y filtros combinados ---
function aplicarFiltros() {
  const texto = document.getElementById('buscarInput').value.toLowerCase();
  const categoria = document.getElementById('filtroCategoria').value;

  let filtrados = productosOriginales.filter(p =>
    p.nombreProducto.toLowerCase().includes(texto)
  );

  if (categoria !== "") {
    filtrados = filtrados.filter(p => p.categoria === categoria);
  }

  filtrados = ordenarPorNombre(filtrados);

  renderTabla(filtrados);
}

// --- Eventos ---
document.addEventListener('DOMContentLoaded', cargarInventario);
document.getElementById('buscarInput').addEventListener('input', aplicarFiltros);
document.getElementById('filtroCategoria').addEventListener('change', aplicarFiltros);