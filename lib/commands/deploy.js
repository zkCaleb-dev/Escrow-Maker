// lib/commands/deploy.js

const axios = require('axios');
const { getConfig } = require('../utils/config');
const { signTransaction } = require('../utils/signer');

/**
 * Acción principal para el comando `deploy`.
 * @param {Object} options  Flags u opciones pasadas al comando.
 */
async function deployEscrow(options) {
  try {
    // 1. Leer configuración (baseUrl, publicKey, secretKey, quizá token)
    const { baseUrl, publicKey, secretKey, token } = await getConfig();

    // 2. Preparar el payload (ajusta según tu API)
    console.log(`⏳ Solicitando XDR sin firmar a ${baseUrl}/deployer/single-release...`);
    const payload = {
      signer: publicKey,
      engagementId: 'Engagement01',
      title: 'title',
      description: 'Hey!',
      roles: {
        approver: 'GB6MP3L6UGIDY6O6MXNLSKHLXT2T2TCMPZIZGUTOGYKOLHW7EORWMFCK',
        serviceProvider: 'GB6MP3L6UGIDY6O6MXNLSKHLXT2T2TCMPZIZGUTOGYKOLHW7EORWMFCK',
        platformAddress: 'GB6MP3L6UGIDY6O6MXNLSKHLXT2T2TCMPZIZGUTOGYKOLHW7EORWMFCK',
        releaseSigner: 'GB6MP3L6UGIDY6O6MXNLSKHLXT2T2TCMPZIZGUTOGYKOLHW7EORWMFCK',
        disputeResolver: 'GB6MP3L6UGIDY6O6MXNLSKHLXT2T2TCMPZIZGUTOGYKOLHW7EORWMFCK',
        receiver: 'GB6MP3L6UGIDY6O6MXNLSKHLXT2T2TCMPZIZGUTOGYKOLHW7EORWMFCK'
      },
      amount: '10',
      platformFee: '1',
      milestones: [{ description: 'Milestone1' }],
      trustline: {
        address: 'CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA',
        decimals: 10000000
      },
      receiverMemo: 3356202
    };

    // 2.a. Incluir header Authorization si tienes token
    const axiosConfigDeploy = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    // 2.b. Llamar al endpoint para obtener el XDR sin firmar
    const deployEndpoint = `${baseUrl}/deployer/single-release`;
    const respuestaDeploy = await axios.post(
        deployEndpoint, 
        payload,
        axiosConfigDeploy
    );
    if (
        !respuestaDeploy.data ||
        !respuestaDeploy.data.unsignedTransaction
    ) {
        console.error('❌ El endpoint no devolvió un campo `unsignedTransaction` en la respuesta.');
        process.exit(1);
    }
    // Cambiamos a usar la propiedad correcta:
    const xdrSinFirmar = respuestaDeploy.data.unsignedTransaction;
    console.log('✅ XDR sin firmar recibido (propiedad unsignedTransaction).');

    // 3. Firmar el XDR
    console.log('🔏 Firmando la transacción con tu Secret Key...');
    const xdrFirmado = signTransaction(xdrSinFirmar, secretKey);

    // 4. Enviar el XDR firmado al endpoint de envío
    const sendEndpoint = `${baseUrl}/helper/send-transaction`;
    const axiosConfigSend = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};

    console.log(`⏳ Enviando XDR firmado a ${sendEndpoint}...`);
    const respuestaSend = await axios.post(
      sendEndpoint,
      { signedXdr: xdrFirmado },
      axiosConfigSend
    );

    if (respuestaSend.data.status) {
      console.log('✅ Transacción enviada con éxito.');
      console.log('ContractId: ', respuestaSend.data.contractId);
      console.log('Escrow Data: ', respuestaSend.data.escrow);
    } else {
      console.error('❌ El envío de la transacción falló.', respuestaSend.data || '');
      process.exit(1);
    }
  } catch (err) {
    // 5. Manejo de errores
    if (err.response && err.response.data) {
      console.error('❌ Error en la petición HTTP:', err.response.status, err.response.data);
    } else {
      console.error('❌ Error inesperado:', err.message);
    }
    process.exit(1);
  }
}

module.exports = deployEscrow;
