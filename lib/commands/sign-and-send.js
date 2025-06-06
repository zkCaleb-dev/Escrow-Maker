// lib/commands/sign.js

const { Command } = require('commander');
const axios = require('axios');
const { getConfig } = require('../utils/config');
const { signTransaction } = require('../utils/signer');

async function signXdrAndSendAction(xdr, options) {
  // 1. Obtenemos la configuración global
  const {
    baseUrlLocal,
    baseUrlDev,
    publicKey: publicKeyConfig,
    secretKey: secretKeyConfig,
    token: tokenConfig,
  } = await getConfig();

  // 2. Determinamos entorno: 'local' por defecto
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
      `Usa:\n  escrow config set ${entorno === 'dev' ? 'baseUrlDev' : 'baseUrlLocal'} <url>`
    );
    process.exit(1);
  }

  // 3. Obtenemos la secretKey (flag o config)
  const secretKey = options.secretKey ? options.secretKey : secretKeyConfig;
  if (!secretKey) {
    console.error(
      '❌ No se encontró la Secret Key. Ejecuta:\n' +
      '  escrow config set secretKey <valor>\n' +
      'O bien usa --secretKey <valor> en este comando.'
    );
    process.exit(1);
  }

    // 4. Firmamos localmente
    let signedXdr;
    try {
        signedXdr = signTransaction(xdr, secretKey.trim());
    } catch (err) {
        console.error('❌ Error al firmar XDR:', err.message);
        process.exit(1);
    }

    const sendEndpoint = `${baseUrl}/helper/send-transaction`;
    console.log(`⏳ Enviando XDR firmado a ${sendEndpoint}...`);
    const axiosConfigSend = {
        headers: {
        Authorization: `Bearer ${tokenConfig.trim()}`,
        'Content-Type': 'application/json',
        },
    };

    let respuestaSend;
    try {
        respuestaSend = await axios.post(
        sendEndpoint,
        { signedXdr },
        axiosConfigSend
        );
    } catch (err) {
        console.error('❌ Error al enviar el XDR firmado:', err.message);
        process.exit(1);
    }

    if (respuestaSend.data && respuestaSend.data.status) {
        console.log('✅ Transacción enviada con éxito.');
    } else {
        console.error('❌ El envío de la transacción falló.', respuestaSend.data || '');
        process.exit(1);
    }
}

const signAndSendCmd = new Command('sign-and-send')
  .description('Firma un XDR usando la secretKey configurada o pasada por flag.')
  .argument('<xdr>', 'Cadena XDR sin firmar (base64)')
  .option(
    '--env <entorno>',
    'Entorno a usar: "local" o "dev" (por defecto: "local")',
    'local'
  )
  .option('--baseUrl <url>', 'Sobrescribe baseUrl local o dev')
  .option('--secretKey <clave>', 'Clave secreta para esta ejecución')
  .action(signXdrAndSendAction);

module.exports = { signAndSendXdr: signAndSendCmd };
