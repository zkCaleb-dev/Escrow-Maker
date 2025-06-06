// lib/commands/config.js

const { Command } = require('commander');
const {
  loadConfig,
  getConfigValue,
  setConfigValue,
  unsetConfigValue,
} = require('../utils/configManager');

const configCmd = new Command('config')
  .description('Administra la configuración global de la CLI (publicKey, secretKey, baseUrl, token, etc.)');

/**
 * 1) escrow config list
 */
configCmd
  .command('list')
  .description('Muestra todas las claves y sus valores actualmente guardados')
  .action(() => {
    try {
      const config = loadConfig();
      if (Object.keys(config).length === 0) {
        console.log('No hay valores de configuración guardados. Usa "escrow config set <clave> <valor>" para definir alguno.');
        return;
      }
      console.log('Configuración global guardada:');
      for (const [key, value] of Object.entries(config)) {
        console.log(`  ${key}: ${value}`);
      }
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

/**
 * 2) escrow config get <clave>
 */
configCmd
  .command('get <key>')
  .description('Muestra el valor actual de la clave de configuración <key>.')
  .action((key) => {
    try {
      const value = getConfigValue(key);
      if (value === undefined) {
        console.log(`La clave '${key}' no está definida.`);
        process.exit(1);
      }
      console.log(value);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

/**
 * 3) escrow config set <clave> <valor>
 */
configCmd
  .command('set <key> <value>')
  .description('Asigna o actualiza la clave de configuración <key> con el <value> proporcionado.')
  .action((key, value) => {
    try {
      setConfigValue(key, value);
      console.log(`Se guardó '${key}' = '${value}' en la configuración global.`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

/**
 * 4) escrow config unset <clave>
 */
configCmd
  .command('unset <key>')
  .description('Elimina la clave de configuración <key> si existe.')
  .action((key) => {
    try {
      const existing = getConfigValue(key);
      if (existing === undefined) {
        console.log(`La clave '${key}' no existía.`);
        process.exit(0);
      }
      unsetConfigValue(key);
      console.log(`Se eliminó la clave '${key}' de la configuración global.`);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  });

module.exports = configCmd;
