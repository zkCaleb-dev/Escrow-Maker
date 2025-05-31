// lib/utils/config.js
const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
require('dotenv').config(); // Cargará variables desde .env


/**
 * Busca configuración previa en variables de entorno o en config/credentials.json.
 * Si no se encuentra, solicita al usuario que ingrese publicKey y secretKey, 
 * y luego guarda en config/credentials.json.
 * @returns {Promise<{publicKey: string, secretKey: string, baseUrl: string}>}
 */
async function getConfig() {
  // 1. Intentar leer de variables de entorno
  const baseUrlEnv = process.env.BASE_URL;
  const publicKeyEnv = process.env.PUBLIC_KEY;
  const secretKeyEnv = process.env.SECRET_KEY;
  const tokenEnv = process.env.TOKEN;

  // 2. Intentar leer de un archivo JSON si existe
  const configPath = path.join(__dirname, '../../config/credentials.json');
  let fileConfig = {};
  if (fs.existsSync(configPath)) {
    try {
      const contenido = fs.readFileSync(configPath, 'utf8');
      fileConfig = JSON.parse(contenido);
    } catch (err) {
      console.error('❌ Error al leer config/credentials.json:', err.message);
      process.exit(1);
    }
  }

  // 3. Definir valores finales (primero variables de entorno, si no, archivo, si no, vacío)
  const baseUrl = baseUrlEnv || fileConfig.baseUrl || 'http://localhost:3000';
  let publicKey = publicKeyEnv || fileConfig.publicKey || '';
  let secretKey = secretKeyEnv || fileConfig.secretKey || '';
  let token = tokenEnv || fileConfig.token || '';

  // 4. Si aún no existen publicKey y secretKey, solicitar al usuario
  if (!publicKey || !secretKey) {
    console.log('🔒 Configuración inicial: por favor ingresa las siguientes claves:');
    const respuestas = await inquirer.prompt([
      {
        type: 'input',
        name: 'publicKey',
        message: 'Ingresa tu Public Key de Stellar:',
        validate: (input) => {
          // Validar longitud y prefijo de una Public Key (ejemplo: comienza en “G” y 56 caracteres)
          if (!/^G[A-Z0-9]{55}$/.test(input.trim())) {
            return 'La Public Key debe iniciar con "G" y tener 56 caracteres válidos.';
          }
          return true;
        }
      },
      {
        type: 'password',
        name: 'secretKey',
        message: 'Ingresa tu Secret Key de Stellar:',
        mask: '*',
        validate: (input) => {
          // Validar longitud y prefijo de una Secret Key (ejemplo: comienza en “S” y 56 caracteres)
          if (!/^S[A-Z0-9]{55}$/.test(input.trim())) {
            return 'La Secret Key debe iniciar con "S" y tener 56 caracteres válidos.';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'baseUrlInput',
        message: 'Ingresa la URL base de tu API (por defecto http://localhost:3000):',
        default: baseUrl
      },
      {
        type: 'input',
        name: 'tokenInput',
        message: 'Ingresa tu Bearer Token (JWT):',
        default: token,
        validate: (input) => input.trim().length > 0 || 'El token no puede estar vacío.'
      },
    ]);
    publicKey = respuestas.publicKey.trim();
    secretKey = respuestas.secretKey.trim();
    
    // Guardar configuración en config/credentials.json
    const nuevaConfig = {
      baseUrl: respuestas.baseUrlInput.trim(),
      publicKey,
      secretKey,
      token
    };
    try {
      // Asegurarse de que la carpeta `config/` exista
      const carpetaConfig = path.join(__dirname, '../../config');
      if (!fs.existsSync(carpetaConfig)) {
        fs.mkdirSync(carpetaConfig);
      }
      fs.writeFileSync(configPath, JSON.stringify(nuevaConfig, null, 2), { mode: 0o600 });
      console.log(`✅ Claves guardadas en “config/credentials.json” con permisos 600 (solo lectura/escritura para el dueño).`);
    } catch (err) {
      console.error('❌ Error al guardar config/credentials.json:', err.message);
      process.exit(1);
    }
    return nuevaConfig;
  }

  // 5. Si ya estaban definidas, retornar directamente
    // 5. Si ya estaban definidas, retornar directamente
  return {
    baseUrl,
    publicKey: publicKey.trim(),
    secretKey: secretKey.trim(),
    token: token.trim()
  };

}

module.exports = { getConfig };
