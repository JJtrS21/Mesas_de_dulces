const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors()); // Permitir peticiones desde otros orígenes
app.use(bodyParser.json()); // Para leer JSON en el body de las peticiones

// Ruta para obtener los eventos actuales
app.get('/api/eventos', (req, res) => {
  fs.readFile('Eventos.json', 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo' });
    res.json(JSON.parse(data));
  });
});

// Ruta para agregar un nuevo evento
app.post('/api/pedidos', (req, res) => {
  const nuevoEvento = req.body;

  // Leer el archivo existente
  fs.readFile('Eventos.json', 'utf8', (err, data) => {
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
    fs.writeFile('Eventos.json', JSON.stringify(eventos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'No se pudo guardar el archivo' });

      res.json({ mensaje: 'Evento agregado correctamente', evento: nuevoEvento });
    });
  });
});

// ✅ NUEVA RUTA: actualizar evento existente
app.put('/api/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const nuevoEvento = req.body;

  fs.readFile('Eventos.json', 'utf8', (err, data) => {
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

    fs.writeFile('Eventos.json', JSON.stringify(eventos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Error al guardar los cambios.' });
      res.json({ mensaje: 'Evento actualizado correctamente.', evento: nuevoEvento });
    });
  });
});

// ✅ Obtener lista de productos
app.get('/api/productos', (req, res) => {
  fs.readFile('Productos.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer Productos.json:', err);
      return res.status(500).json({ error: 'Error al leer el archivo' });
    }
    const productos = JSON.parse(data);
    res.json(productos);
  });
});

// ✅Nueva Ruta: Agregar un nuevo producto
app.post('/api/productos', (req, res) => {
  const nuevoProducto = req.body;

  // Leer el archivo actual
  fs.readFile('Productos.json', 'utf8', (err, data) => {
    let productos = [];
    if (!err && data) {
      productos = JSON.parse(data);
    }

    // Agregar el nuevo producto al arreglo
    productos.push(nuevoProducto);

    // Guardar los cambios en el archivo
    fs.writeFile('Productos.json', JSON.stringify(productos, null, 2), (err) => {
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
