#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

// 1) Importar la función `deployEscrow` desde lib/commands/deploy.js
//    Nota: como en deploy.js hacemos `module.exports = deployEscrow;`,
//    acá capturamos directamente la función:
const deployEscrow = require('../lib/commands/deploy');

// 2) Importar la función `saludar` desde lib/commands/init.js
const { saludar } = require('../lib/commands/init');

// Configuración general de la CLI
program
  .name('escrow')
  .description('CLI para gestionar Escrows en Stellar a través de tu API local')
  .version('1.0.0');

// Comando `deploy`: invoca la función deployEscrow
program
  .command('deploy')
  .description('Solicita un XDR sin firmar, lo firma y lo envía al endpoint de transacción')
  .option('-e, --extra <json>', 'JSON adicional con parámetros del escrow')
  .action((options) => {
    // Aquí sí existe deployEscrow, porque lo importamos arriba
    deployEscrow(options);
  });

// Comando `greet`: invoca la función saludar
program
  .command('greet <nombre>')
  .description('Saluda al nombre especificado')
  .option('-u, --uppercase', 'Mostrar el saludo en mayúsculas')
  .action((nombre, options) => {
    saludar(nombre, options);
  });

program.parse(process.argv);
