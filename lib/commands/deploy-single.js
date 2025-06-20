// lib/commands/deploy.js

const { Command } = require('commander');
const axios = require('axios');
const { getConfig } = require('../utils/config');
const { signTransaction } = require('../utils/signer');

async function deployEscrowAction(options) {
  const {
    baseUrlLocal,
    baseUrlDev,
    publicKey: publicKeyConfig,
    secretKey: secretKeyConfig,
    token: tokenConfig,
  } = await getConfig();

  const entorno = options.env.trim().toLowerCase();
  let baseUrl;

  if (entorno === 'dev') {
    baseUrl = options.baseUrl ? options.baseUrl : baseUrlDev;
  } else {
    baseUrl = options.baseUrl ? options.baseUrl : baseUrlLocal;
  }

  if (!baseUrl) {
    console.error(
      `❌ No se encontró la URL para el entorno "${entorno}". ` +
      `Por favor, haz:\n` +
      `  escrow config set ${entorno === 'dev' ? 'baseUrlDev' : 'baseUrlLocal'} <url>\n` +
      `O puedes usar --baseUrl <url> en este comando temporalmente.`
    );
    process.exit(1);
  }

  if (!/^https?:\/\//.test(baseUrl)) {
    console.error('❌ El campo baseUrl debe comenzar con "http://" o "https://".');
    process.exit(1);
  }

  const publicKey = options.publicKey ? options.publicKey : publicKeyConfig;
  const secretKey = options.secretKey ? options.secretKey : secretKeyConfig;
  const token = options.token ? options.token : tokenConfig;

  if (!/^G[A-Z0-9]{55}$/.test(publicKey)) {
    console.error(
      '❌ La Public Key no tiene un formato válido (debe iniciar con "G" y tener 56 caracteres).'
    );
    process.exit(1);
  }
  if (!/^S[A-Z0-9]{55}$/.test(secretKey)) {
    console.error(
      '❌ La Secret Key no tiene un formato válido (debe iniciar con "S" y tener 56 caracteres).'
    );
    process.exit(1);
  }

  if (!token) {
    console.error(
      '❌ No se encontró el token. Ejecuta:\n' +
      '  escrow config set token <tuBearertoken>'
    );
    process.exit(1);
  }

  console.log(`⏳ Solicitando XDR sin firmar a ${baseUrl}/deployer/single-release...`);
  const payload = {
    signer: publicKey.trim(),
    engagementId: 'Engagement from SingleRelease',
    title: 'SingleRelease Escrow',
    description: 'Make from Escrow-Maker',
    roles: {
      approver: publicKey.trim(),
      serviceProvider: publicKey.trim(),
      platformAddress: publicKey.trim(),
      releaseSigner: publicKey.trim(),
      disputeResolver: publicKey.trim(),
      receiver: publicKey.trim(),
    },
    amount: 10,
    platformFee: 1,
    milestones: [{ description: 'Milestone1' }],
    trustline: {
      address: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
      decimals: 10000000,
    },
    receiverMemo: 3356202,
  };

  const axiosConfigDeploy = {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    },
  };

  const deployEndpoint = `${baseUrl}/deployer/single-release`;
  let respuestaDeploy;
  try {
    respuestaDeploy = await axios.post(deployEndpoint, payload, axiosConfigDeploy);
  } catch (err) {
    console.error('❌ Error al solicitar el XDR sin firmar:', err.message);
    process.exit(1);
  }

  if (
    !respuestaDeploy.data ||
    !respuestaDeploy.data.unsignedTransaction
  ) {
    console.error('❌ El endpoint no devolvió un campo `unsignedTransaction`.');
    process.exit(1);
  }
  const xdrSinFirmar = respuestaDeploy.data.unsignedTransaction;
  console.log('✅ XDR sin firmar recibido.');

  console.log('🔏 Firmando la transacción con tu Secret Key...');
  let xdrFirmado;
  try {
    xdrFirmado = signTransaction(xdrSinFirmar, secretKey.trim());
  } catch (err) {
    console.error('❌ Falló el firmar el XDR:', err.message);
    process.exit(1);
  }

  const sendEndpoint = `${baseUrl}/helper/send-transaction`;
  console.log(`⏳ Enviando XDR firmado a ${sendEndpoint}...`);
  const axiosConfigSend = {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      'Content-Type': 'application/json',
    },
  };

  let respuestaSend;
  try {
    respuestaSend = await axios.post(
      sendEndpoint,
      { signedXdr: xdrFirmado },
      axiosConfigSend
    );
  } catch (err) {
    console.error('❌ Error al enviar el XDR firmado:', err.message);
    process.exit(1);
  }

  if (respuestaSend.data && respuestaSend.data.status) {
    console.log('✅ Transacción enviada con éxito.');
    console.log('ContractId: ', respuestaSend.data.contractId);
    console.log('Escrow Data: ', respuestaSend.data.escrow);
  } else {
    console.error('❌ El envío de la transacción falló.', respuestaSend.data || '');
    process.exit(1);
  }
}

const deploySingleCmd = new Command('deploy-single')
  .description('Obtiene un XDR sin firmar, lo firma y lo envía automáticamente.')
  .option(
    '--env <entorno>',
    'Entorno a usar: "local" o "dev" (por defecto: "local")',
    'local'
  )
  .option('--baseUrl <url>', 'Sobrescribe baseUrl local o dev con este valor')
  .option('--publicKey <clave>', 'Public Key (sobrescribe la config global)')
  .option('--secretKey <clave>', 'Secret Key (sobrescribe la config global)')
  .option('--token <token>', 'Token (sobrescribe la config global)')
  .action(deployEscrowAction);

module.exports = deploySingleCmd;
