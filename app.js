// app.js - Servidor de bingo con dotenv
// Cargar variables de entorno lo antes posible
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { BingoGame } = require('./bingo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware básicos
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal - solo devuelve JSON
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de bingo activo',
    socket: {
      url: process.env.SOCKET_URL || 'No configurado',
      canal: process.env.SOCKET_CANAL || 'No configurado'
    }
  });
});

// Ruta para iniciar bingo
app.get('/start_bingo/:params', (req, res) => {
  try {
    console.log('Recibiendo solicitud con parámetros:', req.params.params);
    
    // Decodificar parámetros
    let params = {};
    try {
      params = JSON.parse(decodeURIComponent(req.params.params));
      console.log('Parámetros decodificados:', params);
    } catch (error) {
      console.log('Error al parsear parámetros:', error.message);
    }
    
    // Enviar respuesta inmediata
    res.json({ 
      status: 'ok', 
      message: 'Procesando solicitud',
      params: {
        codigo: params.codigo || 'Se generará automáticamente',
        start_in: params.start_in || 0,
        intervalo: params.intervalo || 10
      }
    });
    
    // Iniciar juego en segundo plano
    const game = new BingoGame(params);
    game.start().catch(err => console.error('Error en juego:', err));
    
  } catch (error) {
    console.error('Error general:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`Socket configurado en: ${process.env.SOCKET_URL || 'No configurado'}`);
  console.log(`Canal configurado: ${process.env.SOCKET_CANAL || 'No configurado'}`);
  console.log(`Token configurado: ${process.env.SOCKET_TOKEN ? 'Sí' : 'No'}`);
  console.log(`Ejemplo: http://localhost:${PORT}/start_bingo/%7B%22codigo%22%3A%22123refd%22%2C%22start_in%22%3A2%2C%22intervalo%22%3A12%7D`);
});