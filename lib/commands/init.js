// lib/comandos/saludo.js

/**
 * Saluda al usuario.
 * @param {string} nombre Nombre de la persona a saludar.
 * @param {Object} options Opciones del comando (p. ej., uppercase).
 */
function saludar(nombre, options) {
  let mensaje = `Hola, ${nombre}. ¡Bienvenido/a a Hello CLI!`;
  if (options.uppercase) {
    mensaje = mensaje.toUpperCase();
  }
  console.log(mensaje);
}

module.exports = { saludar };
