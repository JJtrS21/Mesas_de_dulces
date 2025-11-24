//Importaciones
const express = require('express'); 
const fs = require('fs'); 
const cors = require('cors');  
const bodyParser = require('body-parser');
const path = require('path');
const { error } = require('console');

const app = express();
const PORT = 3000;

// =========================================
//   MIDDLEWARES
// =========================================
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Página principal
app.get('/', (req, res) => { 
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// Página para agregar productos
app.get('/producto-nuevo', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'producto-nuevo.html'));
});

// ================================
// INVENTARIO
// ================================

const UMBRAL_BAJO_STOCK = 5;

function estadoStock(cantidad, umbral = UMBRAL_BAJO_STOCK) {
  if (cantidad === 0) return 'Agotado';
  if (cantidad <= umbral) return 'Reabastecer';
  return 'Disponible';
}

app.get('/api/inventario', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer productos.json:', err);
      return res.status(500).json({ error: 'Error al leer el archivo de productos' });
    }

    let productos = [];
    try {
      productos = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'JSON inválido en productos.json' });
    }

    const inventario = productos.map(p => ({
      id: p.id,
      nombreProducto: p.nombreProducto,
      precio: p.precio,
      categoria: p.categoria,
      cantidad: 0,
      estado: estadoStock(0)
    }));

    res.json(inventario);
  });
});

app.put('/api/inventario/:id', (req, res) => {
  const cantidad = req.body?.cantidad;

  if (cantidad === undefined) {
    return res.status(400).json({ error: 'No se envió cantidad' });
  }
  if (!Number.isFinite(cantidad) || cantidad < 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  res.json({
    mensaje: 'Cantidad actualizada solo en memoria (productos JSON no usa cantidades)',
    cantidad
  });
});

//Atajo para inventario
app.get('/inventario', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'inventario.html'));
});

// =============================================
//   UTILIDADES ARCHIVOS
// =============================================
const RUTA_PRODUCTOS = path.join(__dirname, 'data', 'productos.json');

function leerArchivo(ruta, callback) {
  fs.readFile(ruta, 'utf8', (err, data) => {
    if (err) return callback(err);
    try {
      callback(null, JSON.parse(data));
    } catch (e) {
      callback(new Error("JSON inválido"));
    }
  });
}

function escribirArchivo(ruta, contenido, callback) {
  fs.writeFile(ruta, JSON.stringify(contenido, null, 2), callback);
}

// ===============================
// PRODUCTOS
// ===============================
app.get('/api/productos', (req, res) => {
  leerArchivo(RUTA_PRODUCTOS, (err, productos) => {
    if (err) {
      console.error("Error al leer productos:", err);
      return res.status(500).json({ error: "No se pudo leer productos.json" });
    }
    res.json(productos);
  });
});

app.post('/api/productos', (req, res) => {
  const nuevoProducto = req.body;

  if (!nuevoProducto || !nuevoProducto.nombreProducto) {
    return res.status(400).json({ error: "Falta nombreProducto" });
  }

  // Convertir precio si viene como texto
  nuevoProducto.precio = Number(nuevoProducto.precio);
  if (!Number.isFinite(nuevoProducto.precio)) {
    return res.status(400).json({ error: "El precio debe ser número" });
  }

  if (!nuevoProducto.categoria) {
    return res.status(400).json({ error: "Falta categoría" });
  }

  // Normalizar categoría para evitar errores
  const categoriasValidas = [
    "Bocadillos Salados",
    "Plato Fuerte",
    "Postres",
    "Entrada"
  ];

  // Corregir formato automático
  const categoriaCorregida = categoriasValidas.find(
    c => c.toLowerCase() === nuevoProducto.categoria.toLowerCase()
  );

  nuevoProducto.categoria = categoriaCorregida || nuevoProducto.categoria;

  leerArchivo(RUTA_PRODUCTOS, (err, productos) => {
    if (err) return res.status(500).json({ error: "Error al leer productos" });

    const nuevoId = "prod-" + String(productos.length + 1).padStart(3, '0');
    nuevoProducto.id = nuevoId;

    productos.push(nuevoProducto);

    escribirArchivo(RUTA_PRODUCTOS, productos, err => {
      if (err) return res.status(500).json({ error: "Error al guardar producto" });

      res.json({
        mensaje: "Producto agregado correctamente",
        producto: nuevoProducto
      });
    });
  });
});

app.get('/api/productos/:id', (req, res) => {
  const id = req.params.id;

  leerArchivo(RUTA_PRODUCTOS, (err, productos) => {
    if (err) return res.status(500).json({ error: "No se pudo leer productos" });

    const producto = productos.find(p => p.id === id);

    if (!producto) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(producto);
  });
});

app.put('/api/productos/:id', (req, res) => {
  const id = req.params.id;
  const cambios = req.body;

  leerArchivo(RUTA_PRODUCTOS, (err, productos) => {
    if (err) return res.status(500).json({ error: "No se pudo leer productos" });

    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Evitar cambios de ID
    cambios.id = productos[index].id;

    // Actualizar producto
    productos[index] = { ...productos[index], ...cambios };

    escribirArchivo(RUTA_PRODUCTOS, productos, err => {
      if (err) return res.status(500).json({ error: "Error al guardar producto" });

      res.json({
        mensaje: "Producto actualizado correctamente",
        producto: productos[index]
      });
    });
  });
});

app.delete('/api/productos/:id', (req, res) => {
  const id = req.params.id;

  leerArchivo(RUTA_PRODUCTOS, (err, productos) => {
    if (err) return res.status(500).json({ error: "No se pudo leer productos" });

    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const eliminado = productos.splice(index, 1);

    escribirArchivo(RUTA_PRODUCTOS, productos, err => {
      if (err) return res.status(500).json({ error: "Error al guardar cambios" });

      res.json({
        mensaje: "Producto eliminado correctamente",
        eliminado
      });
    });
  });
});

// =========================================
//            EVENTOS
// =========================================
app.get('/api/eventos', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'eventos.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/eventos', (req, res) => {
  const nuevoEvento = req.body;
  fs.readFile(path.join(__dirname, 'data', 'eventos.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer el archivo' });

    let eventos = [];
    try { eventos = JSON.parse(data); } 
    catch { return res.status(500).json({ error: 'JSON inválido' }); }

    eventos.push(nuevoEvento);

    fs.writeFile(
      path.join(__dirname, 'data', 'eventos.json'),
      JSON.stringify(eventos, null, 2),
      err => {
        if (err) return res.status(500).json({ error: 'Error al guardar' });
        res.json({ mensaje: 'Evento agregado', evento: nuevoEvento });
      }
    );
  });
});

// Modificar evento
app.put('/api/eventos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const nuevoEvento = req.body;

  fs.readFile(path.join(__dirname, 'data', 'eventos.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo' });

    let eventos;
    try { eventos = JSON.parse(data); } 
    catch { return res.status(500).json({ error: 'JSON inválido' }); }

    if (!eventos[id]) return res.status(404).json({ error: "Evento no encontrado" });

    eventos[id] = nuevoEvento;

    fs.writeFile(
      path.join(__dirname, 'data', 'eventos.json'),
      JSON.stringify(eventos, null, 2),
      err => {
        if (err) return res.status(500).json({ error: "Error al guardar" });
        res.json({ mensaje: "Evento actualizado", evento: nuevoEvento });
      }
    );
  });
});

// =========================================
//   INICIAR SERVIDOR
// =========================================
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
