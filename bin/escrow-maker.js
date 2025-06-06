#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

// 1) Importamos los subcomandos tipo Command:
const deployCmd = require('../lib/commands/deploy');      // exporta directamente el Command('deploy')
const configCmd = require('../lib/commands/config');      // exporta directamente el Command('config')

// 2) Importamos el comando de saludo (init.js) que sí es una función
const { saludar } = require('../lib/commands/init');

// 3) Importamos el subcomando sign (exporta { signXdr: signCmd })
const { signXdr: signCmd } = require('../lib/commands/sign');

program
  .name('escrow')
  .version('1.0.0')
  .description('CLI “escrow” para interactuar con Trustless Work');

// 4) Registramos el subcomando `config`
//    (lib/commands/config.js exporta un objeto Command con todos sus subcomandos)
program.addCommand(configCmd);

// 5) Registramos el subcomando `deploy`
//    (lib/commands/deploy.js exporta un objeto Command('deploy') ya configurado)
program.addCommand(deployCmd);

// 6) Registramos el subcomando `sign`
//    (lib/commands/sign.js exportó { signXdr: signCmd }, donde signCmd es el objeto Command)
program.addCommand(signCmd);

// 7) El comando “greet” sigue siendo una función manual, así que lo definimos con `.command().action()`
program
  .command('greet <nombre>')
  .description('Saluda al nombre proporcionado.')
  .action((nombre, opts) => {
    saludar(nombre, opts);
  });

// 8) Finalmente parseamos los argumentos
program.parse(process.argv);
