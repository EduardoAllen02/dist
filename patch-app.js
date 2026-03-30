// Ejecutar con: node patch-app.js
// Parchea app.js para que el content-path funcione con el dominio actual de Rowi.
const fs = require('fs');

const ALREADY_PATCHED = 'rowi(?:lab)?-models';
const OLD = 'rowi-models.s3.amazonaws.com\\/.[^\\/]*';
const NEW = 'rowi(?:lab)?-models\\.s3[^\\/]*\\.amazonaws\\.com\\/[^\\/]+';

let code = fs.readFileSync('app.js', 'utf8');

if (code.includes(ALREADY_PATCHED)) {
  console.log('✓ app.js ya está parcheado, nada que hacer.');
  process.exit(0);
}

const patched = code.replace(OLD, NEW);

if (patched === code) {
  console.error('✗ No se encontró el string a reemplazar. El formato de app.js puede haber cambiado.');
  process.exit(1);
}

fs.writeFileSync('app.js', patched);
console.log('✓ app.js parcheado correctamente.');
