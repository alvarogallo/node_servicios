// bingo.js - Versión simplificada que solo muestra 'starting' en el log
class BingoGame {
    constructor(params) {
      // Guardamos los parámetros pero no hacemos nada con ellos por ahora
      this.params = params;
    }
  
    /**
     * Iniciar el juego de bingo (versión simplificada)
     * @returns {Promise} Resultado del juego
     */
    async start() {
      // Solo mostramos 'starting' en el log como solicitado
      console.log('starting');
      
      // Devolvemos un resultado básico
      return {
        status: 'success',
        message: 'Mostrado "starting" en el log'
      };
    }
  }
  
  module.exports = { BingoGame };