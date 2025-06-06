// lib/utils/config.js

const {
  getConfigValue,
} = require('./configManager');

/**
 * getConfig():
 *   - Lee desde el archivo de configuración global todas las claves que pueda necesitar
 *     (baseUrlLocal, baseUrlDev, publicKey, secretKey, token).
 *   - Si faltan publicKey/secretKey/token, aborta explicando al usuario qué hacer.
 *   - NO obliga a que baseUrlLocal o baseUrlDev existan; se validan en el comando específico
 *     (deploy.js o sign.js) según el flag --env.
 */
async function getConfig() {
  // 1. Obtenemos cada valor de la configuración global
  const baseUrlLocal = getConfigValue('baseUrlLocal');
  const baseUrlDev = getConfigValue('baseUrlDev');
  const publicKey = getConfigValue('publicKey');
  const secretKey = getConfigValue('secretKey');
  const token = getConfigValue('token');

  // 2. Verificamos que las claves públicas/privadas y el token existan
  const missing = [];
  if (!publicKey) missing.push('publicKey');
  if (!secretKey) missing.push('secretKey');
  if (!token) missing.push('token');

  if (missing.length > 0) {
    console.error(
      `❌ Faltan las siguientes claves en la configuración global: ${missing.join(
        ', '
      )}`
    );
    console.error(
      `   Ejecuta los comandos:\n` +
      `     escrow config set publicKey <tuPublicKey>\n` +
      `     escrow config set secretKey <tuSecretKey>\n` +
      `     escrow config set token <tuBearertoken>\n`
    );
    process.exit(1);
  }

  // 3. Devolvemos TODO lo que pueda usarse en otros comandos
  return {
    baseUrlLocal: baseUrlLocal ? baseUrlLocal.trim() : undefined,
    baseUrlDev: baseUrlDev ? baseUrlDev.trim() : undefined,
    publicKey: publicKey.trim(),
    secretKey: secretKey.trim(),
    token: token.trim(),
  };
}

module.exports = { getConfig };
