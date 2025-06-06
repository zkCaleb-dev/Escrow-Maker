// lib/commands/sign.js

const { Command } = require('commander');
const { getConfig } = require('../utils/config');
const { signTransaction } = require('../utils/signer');

async function signXdrAction(xdr, options) {
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

  console.log('\n✅ XDR firmado correctamente:\n');
  console.log(signedXdr);

  // 5. (Opcional) Podrías hacer la llamada a /helper/send-transaction aquí, usando `baseUrl` y `tokenConfig`
}

const signCmd = new Command('sign')
  .description('Firma un XDR usando la secretKey configurada o pasada por flag.')
  .argument('<xdr>', 'Cadena XDR sin firmar (base64)')
  .option(
    '--env <entorno>',
    'Entorno a usar: "local" o "dev" (por defecto: "local")',
    'local'
  )
  .option('--baseUrl <url>', 'Sobrescribe baseUrl local o dev')
  .option('--secretKey <clave>', 'Clave secreta para esta ejecución')
  .action(signXdrAction);

module.exports = { signXdr: signCmd };
