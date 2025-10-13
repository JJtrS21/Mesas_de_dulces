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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
