#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

const deploySingleCmd = require('../lib/commands/deploy-single');  
const deployMultiCmd = require('../lib/commands/deploy-multi');  
const configCmd = require('../lib/commands/config');

const { signXdr: signCmd } = require('../lib/commands/sign');
const { signAndSendXdr: signAndSendCmd } = require('../lib/commands/sign-and-send');

program
  .name('escrow')
  .version('1.0.0')
  .description('CLI “escrow” para interactuar con Trustless Work');

program.addCommand(configCmd);

program.addCommand(deploySingleCmd);
program.addCommand(deployMultiCmd);

program.addCommand(signCmd);
program.addCommand(signAndSendCmd);

program.parse(process.argv);
