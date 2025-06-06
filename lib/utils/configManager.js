// lib/utils/configManager.js

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Nombre de la carpeta donde guardamos la configuración global del usuario.
 * Ejemplo en Linux/macOS: /home/usuario/.escrow/config.json
 */
const CONFIG_DIR_NAME = '.escrow';
const CONFIG_FILE_NAME = 'config.json';

/**
 * Devuelve la ruta al directorio de configuración global.
 * - En Linux/macOS: ~/.escrow
 * - En Windows: C:\Users\<Usuario>\.escrow
 */
function getConfigDirectory() {
  const homeDir = os.homedir();
  return path.join(homeDir, CONFIG_DIR_NAME);
}

/**
 * Devuelve la ruta completa al archivo de configuración JSON.
 * (por ejemplo: /home/usuario/.escrow/config.json)
 */
function getConfigFilePath() {
  return path.join(getConfigDirectory(), CONFIG_FILE_NAME);
}

/**
 * Lee (o crea si no existe) el archivo de configuración global.
 * Si no existía, regresa un objeto vacío {}.
 */
function loadConfig() {
  const configDir = getConfigDirectory();
  const configPath = getConfigFilePath();

  try {
    // Si la carpeta ~/.escrow no existe, devolvemos {} (sin crearla aún).
    if (!fs.existsSync(configDir)) {
      return {};
    }
    // Si el archivo config.json no existe, devolvemos {}.
    if (!fs.existsSync(configPath)) {
      return {};
    }
    // Leemos el JSON y lo parseamos.
    const raw = fs.readFileSync(configPath, { encoding: 'utf-8' });
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Error al leer la configuración global en '${configPath}': ${err.message}`);
  }
}

/**
 * Escribe (o sobreescribe) el objeto de configuración en el archivo config.json,
 * creando la carpeta ~/.escrow si hace falta.
 */
function saveConfig(configObject) {
  const configDir = getConfigDirectory();
  const configPath = getConfigFilePath();

  try {
    if (!fs.existsSync(configDir)) {
      // Creamos la carpeta ~/.escrow con permisos restrictivos (700)
      fs.mkdirSync(configDir, { recursive: true, mode: 0o700 });
    }
    const jsonContent = JSON.stringify(configObject, null, 2);
    // Escribimos config.json con permisos 600 (lectura/escritura solo para el usuario).
    fs.writeFileSync(configPath, jsonContent, { encoding: 'utf-8', mode: 0o600 });
  } catch (err) {
    throw new Error(`Error al guardar la configuración global en '${configPath}': ${err.message}`);
  }
}

/**
 * Devuelve el valor de la clave `key` en el config global. Si no existe,
 * regresa `fallback` (por defecto undefined).
 */
function getConfigValue(key, fallback = undefined) {
  const config = loadConfig();
  return Object.prototype.hasOwnProperty.call(config, key) ? config[key] : fallback;
}

/**
 * Asigna o actualiza la clave `key` con el `value` en el config global
 * y lo guarda en disco.
 */
function setConfigValue(key, value) {
  const config = loadConfig();
  config[key] = value;
  saveConfig(config);
}

/**
 * Elimina la clave `key` del config global (si existe) y vuelve a escribir el archivo.
 */
function unsetConfigValue(key) {
  const config = loadConfig();
  if (Object.prototype.hasOwnProperty.call(config, key)) {
    delete config[key];
    saveConfig(config);
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  getConfigValue,
  setConfigValue,
  unsetConfigValue,
};
