# node_servicios


// Ejemplo de uso mediante curl o Postman

// 1. Ejemplo básico (usando numeración automática)
// curl -X POST -H "Content-Type: application/json" -d '{"codigo":"bingo_test1","start_in":1,"intervalo":5}' http://localhost:3000/start_bingo

// 2. Ejemplo con numeración personalizada (75 números del 1 al 75 en orden diferente)
// curl -X POST -H "Content-Type: application/json" -d '{
//   "codigo": "bingo_personalizado", 
//   "start_in": 1, 
//   "intervalo": 5,
//   "numeracion": "12,5,34,67,23,45,9,71,18,29,51,62,3,25,37,49,7,19,31,59,65,74,14,26,38,52,63,1,16,30,41,55,68,8,22,39,43,57,70,11,27,35,47,60,73,4,20,33,46,58,69,2,17,28,40,54,66,13,24,36,50,64,6,21,32,44,56,72,10,15,42,53,61,75"
// }' http://localhost:3000/start_bingo

// 3. Para probar la validación, intenta con menos o más números, o con números fuera del rango 1-75
// curl -X POST -H "Content-Type: application/json" -d '{
//   "codigo": "bingo_invalido", 
//   "start_in": 1, 
//   "intervalo": 5,
//   "numeracion": "1,2,3"
// }' http://localhost:3000/start_bingo
// Esto debería generar un mensaje de error y usar la secuencia estándar mezclada

// Para usar en JavaScript con fetch:
/*
fetch('http://localhost:3000/start_bingo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    codigo: 'bingo_personalizado',
    start_in: 1,
    intervalo: 5,
    numeracion: '12,5,34,67,23,45,9,71,18,29,51,62,3,25,37,49,7,19,31,59,65,74,14,26,38,52,63,1,16,30,41,55,68,8,22,39,43,57,70,11,27,35,47,60,73,4,20,33,46,58,69,2,17,28,40,54,66,13,24,36,50,64,6,21,32,44,56,72,10,15,42,53,61,75'
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
*/

