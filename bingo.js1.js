// bingo.js - Versión con letras de bingo e integración con servidor de sockets usando dotenv
const https = require('https');

class BingoGame {
  constructor(params) {
    // Guardamos los parámetros
    this.params = params;
    
    // Extraemos el código o generamos uno único si no se proporciona
    if (params?.codigo) {
      this.codigo = params.codigo;
    } else {
      // Generar un código único con timestamp + random
      const timestamp = new Date().getTime();
      const random = Math.floor(Math.random() * 10000);
      this.codigo = `bg_${timestamp}_${random}`;
      console.log(`Código generado automáticamente: ${this.codigo}`);
    }
    
    // Extraemos el parámetro start_in (minutos para iniciar)
    // Extraemos el parámetro start_in (minutos para iniciar)
    this.startIn = 0;
    if (params && params.start_in !== undefined) {
    const minutes = parseInt(params.start_in);
    // Validamos que sea un número no negativo (permitimos cualquier valor positivo)
    if (!isNaN(minutes) && minutes >= 0) {
        this.startIn = minutes;
        console.log(`Tiempo de inicio configurado: ${minutes} minutos`);
    } else {
        console.log('Valor de start_in inválido, debe ser un número no negativo. Usando 0.');
    }
    }
        
    // Extraemos el parámetro intervalo (segundos entre números de bingo)
    this.intervalo = 10; // Valor por defecto: 10 segundos
    if (params && params.intervalo !== undefined) {
      const segundos = parseInt(params.intervalo);
      // Validamos que sea un número positivo
      if (!isNaN(segundos) && segundos > 0) {
        this.intervalo = segundos;
      } else {
        console.log('Valor de intervalo inválido, debe ser un número positivo. Usando 10 segundos por defecto.');
      }
    }
    
    // Configuración del servidor de sockets desde variables de entorno
    this.socketConfig = {
      url: process.env.SOCKET_URL || 'https://sockets.unatecla.com/enviar-mensaje',
      token: process.env.SOCKET_TOKEN || '0123456789',
      canal: process.env.SOCKET_CANAL || 'bingo_revendedor_jugador'
    };
    
    // Inicializamos el array de números de bingo (1-75)
    this.bingoNumbers = [];
    
    // En el bingo, los números se asocian con letras:
    // B: 1-15, I: 16-30, N: 31-45, G: 46-60, O: 61-75
    // Creamos un array de objetos con número y letra
    for (let i = 1; i <= 75; i++) {
      let letra = '';
      if (i <= 15) letra = 'B';
      else if (i <= 30) letra = 'I';
      else if (i <= 45) letra = 'N';
      else if (i <= 60) letra = 'G';
      else letra = 'O';
      
      this.bingoNumbers.push({
        numero: i,
        letra: letra,
        combinacion: `${letra}${i}`
      });
    }
    
    // Mezclamos los números
    this.shuffleBingoNumbers();
  }

  /**
   * Mezcla el array de números de bingo (algoritmo Fisher-Yates)
   */
  shuffleBingoNumbers() {
    for (let i = this.bingoNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bingoNumbers[i], this.bingoNumbers[j]] = [this.bingoNumbers[j], this.bingoNumbers[i]];
    }
  }

  /**
   * Función de utilidad para crear retrasos
   * @param {number} ms - Milisegundos a esperar
   * @returns {Promise} Promesa que se resuelve después del retraso
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Envía un mensaje al servidor de sockets
   * @param {Object} mensaje - Mensaje a enviar
   * @returns {Promise} Promesa que se resuelve con la respuesta
   */
/**
 * Envía un mensaje al servidor de sockets
 * @param {Object} mensaje - Mensaje a enviar
 * @param {number} numeroDeLaSerie - Número de orden (1-75)
 * @returns {Promise} Promesa que se resuelve con la respuesta
 */
async enviarASocket(mensaje, numeroDeLaSerie) {
    return new Promise((resolve, reject) => {
      const arr_viene = {
        numero: mensaje.combinacion,
        num: numeroDeLaSerie, // Añadimos el contador (1-75)
        time_utc: Math.floor(Date.now() / 1000)
      };
      
      const data = {
        canal: this.socketConfig.canal,
        token: this.socketConfig.token,
        evento: this.codigo, // Usar directamente el código como evento, sin prefijo
        mensaje: JSON.stringify(arr_viene)
      };
      
      const postData = JSON.stringify(data);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      try {
        const req = https.request(this.socketConfig.url, options, (res) => {
          let responseData = '';
          
          res.on('data', (chunk) => {
            responseData += chunk;
          });
          
          res.on('end', () => {
            try {
              console.log(`Socket enviado: ${mensaje.combinacion} (${numeroDeLaSerie}/75) al evento: ${this.codigo}`);
              resolve(responseData);
            } catch (error) {
              console.error('Error al procesar respuesta del socket:', error);
              reject(error);
            }
          });
        });
        
        req.on('error', (error) => {
          console.error('Error al enviar al socket:', error);
          reject(error);
        });
        
        req.write(postData);
        req.end();
      } catch (error) {
        console.error('Error al crear la solicitud:', error);
        reject(error);
      }
    });
  }

  /**
   * Envía mensaje de "faltan" al servidor de sockets
   * @param {number} minutos - Minutos restantes
   */
  async enviarFaltan(minutos) {
    const arr_viene = {
      faltan: minutos,
      time_utc: Math.floor(Date.now() / 1000)
    };
    
    const data = {
      canal: this.socketConfig.canal,
      token: this.socketConfig.token,
      evento: this.codigo, // Usar directamente el código como evento, sin prefijo
      mensaje: JSON.stringify(arr_viene)
    };
    
    try {
      const postData = JSON.stringify(data);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = https.request(this.socketConfig.url, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          console.log(`Socket faltan enviado: ${minutos} al evento: ${this.codigo}`);
        });
      });
      
      req.on('error', (error) => {
        console.error('Error al enviar faltan al socket:', error);
      });
      
      req.write(postData);
      req.end();
    } catch (error) {
      console.error('Error al crear la solicitud faltan:', error);
    }
  }
/**
 * Iniciar el juego de bingo (con contador regresivo e intervalo)
 * @returns {Promise} Resultado del juego
 */
async start() {
    console.log(`Iniciando juego con código: ${this.codigo}`);
    console.log(`Usando servidor de sockets: ${this.socketConfig.url}`);
    
    // Si start_in es mayor que 0, hacemos la cuenta regresiva
    let minutesLeft = this.startIn;
    
    if (minutesLeft > 0) {
      // Mostrar el tiempo inicial restante
      console.log(`faltan:${minutesLeft}`);
      await this.enviarFaltan(minutesLeft);
      
      // Bucle para la cuenta regresiva (cada minuto)
      while (minutesLeft > 0) {
        // Para pruebas, cambiar a un valor menor (ej. 5000 ms = 5 segundos)
        // En producción, usar 60000 ms = 1 minuto
        await this.delay(60000);
        
        // Decrementar y mostrar el tiempo restante
        minutesLeft--;
        
        // Mostrar los minutos restantes (incluso cuando sea 0)
        if (minutesLeft > 0) {
          console.log(`faltan:${minutesLeft}`);
          await this.enviarFaltan(minutesLeft);
        }
      }
    }
    
    // Cuando el contador llega a cero, mostramos 'starting'
    console.log('starting');
    
    // Enviamos mensaje de inicio (faltan:0)
    await this.enviarFaltan(0);
    
    // Esperamos el intervalo especificado antes del primer número
    console.log(`Esperando ${this.intervalo} segundos antes del primer número...`);
    await this.delay(this.intervalo * 1000);
    
    // Mostramos todos los números de bingo (1-75) con el intervalo especificado
    const numerosMostrados = [];
    
    // Recorremos todos los números mezclados
    for (let i = 0; i < this.bingoNumbers.length; i++) {
      const bingoItem = this.bingoNumbers[i];
      const numeroDeLaSerie = i + 1; // El contador empieza en 1 y termina en 75
      
      console.log(`bingo:${bingoItem.combinacion} (${numeroDeLaSerie}/75)`);
      
      // Enviamos el número al servidor de sockets con su posición en la serie
      try {
        await this.enviarASocket(bingoItem, numeroDeLaSerie);
      } catch (error) {
        console.error('Error al enviar número al socket:', error);
      }
      
      numerosMostrados.push({
        ...bingoItem,
        posicion: numeroDeLaSerie
      });
      
      // No esperar después del último número
      if (i < this.bingoNumbers.length - 1) {
        // Esperar el intervalo especificado antes de mostrar el siguiente número
        await this.delay(this.intervalo * 1000);
      }
    }
    
    console.log('Juego de bingo completado. Se han mostrado todos los números.');
    
    // Devolvemos un resultado completo
    return {
      status: 'success',
      message: 'Juego de bingo completado',
      codigo: this.codigo,
      startIn: this.startIn,
      intervalo: this.intervalo,
      socket: this.socketConfig.url,
      total_numeros: numerosMostrados.length,
      numerosMostrados: numerosMostrados.map(item => `${item.combinacion} (${item.posicion}/75)`)
    };
  }
  /**
   * Iniciar el juego de bingo (con contador regresivo e intervalo)
   * @returns {Promise} Resultado del juego
   */

}

module.exports = { BingoGame };