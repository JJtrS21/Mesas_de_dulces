//Importaciones
const express = require('express'); //Servidor
const fs = require('fs'); //Lectura y escritura de archivos
const cors = require('cors');  //Seguridad ante origenes externos
const bodyParser = require('body-parser'); //Interprete de datos
const path = require('path'); //Rutas seguras y compatibles
const { error } = require('console');

const app = express(); //Crear el objeto servidor
const PORT = 3000; //Asignar el puerto

//Importación para Inventario
// Umbral global para bajo stock
const UMBRAL_BAJO_STOCK = 5;

function estadoStock(cantidad, umbral = UMBRAL_BAJO_STOCK) {
  if (cantidad === 0) return 'Agotado';
  if (cantidad <= umbral) return 'Reabastecer';
  return 'Disponible';
}

// Obtener inventario
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
      cantidad: p.cantidad || 0,
      precio: p.precio,
      categoria: p.categoria,
      estado: estadoStock(p.cantidad || 0)
    }));

    res.json(inventario);
  });
});
// Actualizar cantidad de un producto del inventario
app.put('/api/inventario/:id', (req, res) => {
  const id = req.params.id;
  const cantidad = req.body?.cantidad; // ✅ más seguro

  if (cantidad === undefined) {
    return res.status(400).json({ error: 'No se envió cantidad en el body' });
  }
  if (!Number.isFinite(cantidad) || cantidad < 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  const filePath = path.join(__dirname, 'data', 'productos.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer productos.json' });

    let productos = [];
    try {
      productos = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'JSON inválido en productos.json' });
    }

    const idx = productos.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    productos[idx].cantidad = cantidad;

    fs.writeFile(filePath, JSON.stringify(productos, null, 2), (errW) => {
      if (errW) return res.status(500).json({ error: 'No se pudo guardar el inventario' });

      const estado = estadoStock(cantidad);

      res.json({
        mensaje: 'Inventario actualizado',
        producto: {
          ...productos[idx],
          estado
        }
      });
    });
  });
});

// Actualizar cantidad de un producto del inventario
app.put('/api/inventario/:id', (req, res) => {
  const id = req.params.id; // puede ser string
  const { cantidad } = req.body;

  if (!Number.isFinite(cantidad) || cantidad < 0) {
    return res.status(400).json({ error: 'Cantidad inválida' });
  }

  const filePath = path.join(__dirname, 'data', 'productos.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer productos.json' });

    let productos = [];
    try {
      productos = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'JSON inválido en productos.json' });
    }

    const idx = productos.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    productos[idx].cantidad = cantidad;

    fs.writeFile(filePath, JSON.stringify(productos, null, 2), (errW) => {
      if (errW) return res.status(500).json({ error: 'No se pudo guardar el inventario' });

      const umbral = Number.isFinite(productos[idx].umbralBajo) ? productos[idx].umbralBajo : UMBRAL_BAJO_STOCK;
      res.json({
        mensaje: 'Inventario actualizado',
        producto: {
          ...productos[idx],
          estado: estadoStock(productos[idx].cantidad, umbral)
        }
      });
    });
  });
});
//Atajo para inventario
app.get('/inventario', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'inventario.html'));
});

// Agregar un nuevo producto y persistir
app.post('/api/productos', (req, res) => {
  const nuevoProducto = req.body;
  const filePath = path.join(__dirname, 'data', 'productos.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    let productos = [];
    if (!err && data) {
      try {
        productos = JSON.parse(data);
      } catch (e) {
        return res.status(500).json({ error: 'JSON inválido en productos.json' });
      }
    }

    // Validaciones básicas
    if (!nuevoProducto.id || !nuevoProducto.nombre) {
      return res.status(400).json({ error: 'id y nombre son obligatorios' });
    }
    if (!Number.isFinite(nuevoProducto.cantidad)) nuevoProducto.cantidad = 0;
    if (!Number.isFinite(nuevoProducto.precio)) nuevoProducto.precio = 0;

    productos.push(nuevoProducto);

    fs.writeFile(filePath, JSON.stringify(productos, null, 2), (errW) => {
      if (errW) {
        console.error('Error al guardar producto:', errW);
        return res.status(500).json({ error: 'Error al guardar el producto' });
      }
      console.log('✅ Producto agregado:', nuevoProducto);
      res.json({ mensaje: 'Producto agregado correctamente', producto: nuevoProducto });
    });
  });
});


//Middlewares

app.use(cors()); //Permitir peticiones desde otros orígenes

app.use(bodyParser.json()); //Para leer JSON en el body de las peticiones

app.use(express.static(path.join(__dirname, '..', 'public'))); //Busca los archivos en la carpeta 'public'

//Mapea la raíz con 'index.html'
app.get('/', (req, res) => { 
  res.sendFile(path.join(__dirname, '..', 'public', 'html', 'index.html'));
});

// Ruta para obtener la lista de eventos
app.get('/api/eventos', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'eventos.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo' });
    res.json(JSON.parse(data));
  });
});

// Ruta para agregar un nuevo evento
app.post('/api/eventos', (req, res) => {
  const nuevoEvento = req.body;
  // Leer el archivo existente
  fs.readFile(path.join(__dirname, 'data', 'eventos.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'No se pudo leer el archivo' });
    let eventos = [];
    try {
      eventos = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'JSON inválido en el archivo' });
    }
    // Agregar el nuevo evento
    eventos.push(nuevoEvento);
    // Guardar el archivo actualizado
    fs.writeFile(path.join(__dirname, 'data', 'eventos.json'), JSON.stringify(eventos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'No se pudo guardar el archivo' });
      res.json({ mensaje: 'Evento agregado correctamente', evento: nuevoEvento });
    });
  });
});

// Ruta para actualizar evento existente
app.put('/api/eventos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const nuevoEvento = req.body;

  fs.readFile(path.join(__dirname, 'data', 'eventos.json'), 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo JSON.' });
    let eventos = [];
    try {
      eventos = JSON.parse(data);
    } catch (e) {
      return res.status(500).json({ error: 'JSON inválido en el archivo.' });
    }
    if (id < 0 || id >= eventos.length) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }
    // Reemplazar el evento con los nuevos datos
    eventos[id] = nuevoEvento;
    fs.writeFile(path.join(__dirname, 'data', 'eventos.json'), JSON.stringify(eventos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Error al guardar los cambios.' });
      res.json({ mensaje: 'Evento actualizado correctamente.', evento: nuevoEvento });
    });
  });
});

// Obtener lista de productos
app.get('/api/productos', (req, res) => {
  fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer Productos.json:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    const productos = JSON.parse(data);
    res.json(productos);
  });
});

// Agregar un nuevo producto
app.post('/api/productos', (req, res) => {
  const nuevoProducto = req.body;
  // Leer el archivo actual
  fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf8', (err, data) => {
    let productos = [];
    if (!err && data) {
      productos = JSON.parse(data);
    }
    // Agregar el nuevo producto al arreglo
    productos.push(nuevoProducto);
    // Guardar los cambios en el archivo
    fs.readFile(path.join(__dirname, 'data', 'productos.json'), 'utf8', (err, data) => {
      if (err) {
        console.error('Error al guardar producto:', err);
        return res.status(500).json({ error: 'Error al guardar el producto' });
      }
      console.log('✅ Producto agregado correctamente:', nuevoProducto);
      res.json({ mensaje: 'Producto agregado correctamente', producto: nuevoProducto });
    });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});