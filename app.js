// app.js - Servidor principal para el juego de bingo (versión simplificada)
const express = require('express');
const bodyParser = require('body-parser');
const { BingoGame } = require('./bingo');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para analizar cuerpos JSON
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Ruta para iniciar el juego de bingo
app.get('/start_bingo/:params', async (req, res) => {
  try {
    console.log('Recibiendo solicitud en /start_bingo con parámetros:', req.params.params);
    
    // Decodificar los parámetros JSON (si es posible)
    let params = {};
    try {
      params = JSON.parse(decodeURIComponent(req.params.params));
    } catch (parseError) {
      console.log('No se pudieron analizar los parámetros JSON, usando objeto vacío');
    }
    
    // Crear una nueva instancia del juego de bingo
    const game = new BingoGame(params);
    
    // Iniciar el juego (ahora solo muestra 'starting' en el log)
    const result = await game.start();
    
    // Devolver el resultado
    res.json({
      status: 'success',
      message: 'Procesamiento completado',
      result
    });
    
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});