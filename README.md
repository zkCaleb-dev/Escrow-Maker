# Escrow Maker

## Instalación (global)
```bash
npm install -g .
```

## Ejecucion 
```bash
escrow deploy
```

## Configurar CLI por primera vez

# Configurar la URL base (local)
```bash
escrow config set baseUrl http://localhost:3000
```

# Configurar la URL que apunta a dev (dev.api.trustlesswork.com)
```bash
escrow config set baseUrlDev https://dev.api.trustlesswork.com
```

# Configurar la URL que apunta a dev (dev.api.trustlesswork.com)
```bash
escrow config set baseUrlLocal http://localhost:3000
```

# Configurar el token JWT
```bash
escrow config set token eyJhbGciOiJIUzI1NiIsInR…
```

# Configurar tu Public Key de Stellar
```bash
escrow config set publicKey GB6MP3L6UGIDY6O6…
```

# Configurar tu Secret Key de Stellar
```bash
escrow config set secretKey SBP7A6FN62JIOSPN7…
```

# Eliminar un campo de la configuracion
```bash
escrow config unset <campo>
```


## Verificar que se hayan guardado correctamente 
```bash
escrow config list
```

Salida esperada:
```yaml
Configuración global guardada:
  baseUrl: http://localhost:3000
  token: eyJhbGciOiJIUzI1NiIsInR…
  publicKey: GB6MP3L6UGIDY6O6…
  secretKey: SBP7A6FN62JIOSPN7…

```