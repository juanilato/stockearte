// Script de prueba para endpoints de IA (interpretar archivo y voz)
// Autor: Stockearte
// ---------------------------------------------
const fs = require('fs');
const FormData = require('form-data');

// Función para probar la interpretación de archivos (envía un archivo de texto al backend)
async function testInterpretarArchivo() {
  try {
    console.log('🪪 Probando interpretación de archivos...');
    
    // Crear un archivo de prueba con productos ficticios
    const testContent = `
    Lista de Productos:
    
    1. Laptop HP Pavilion - Precio: $1200 - Costo: $800 - Stock: 5
    2. Mouse Logitech - Precio: $25 - Costo: $15 - Stock: 20
    3. Teclado Mecánico - Precio: $150 - Costo: $100 - Stock: 8
    4. Monitor Samsung 24" - Precio: $300 - Costo: $200 - Stock: 12
    `;
    
    fs.writeFileSync('test-productos.txt', testContent);
    
    // Enviar archivo al endpoint /api/interpretar
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test-productos.txt'));
    
    const response = await fetch('http://localhost:3000/api/interpretar', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Resultado de interpretación:', JSON.stringify(result, null, 2));
    
    // Limpiar archivo de prueba
    fs.unlinkSync('test-productos.txt');
    
  } catch (error) {
    console.error('❌ Error en prueba de archivos:', error.message);
  }
}

// Función para probar la interpretación de voz (envía texto y productos al backend)
async function testInterpretarVoz() {
  try {
    console.log('🪪 Probando interpretación de voz...');
    
    // Productos de ejemplo
    const productos = [
      { id: 1, nombre: "Laptop HP Pavilion", precioVenta: 1200, precioCosto: 800 },
      { id: 2, nombre: "Mouse Logitech", precioVenta: 25, precioCosto: 15 },
      { id: 3, nombre: "Teclado Mecánico", precioVenta: 150, precioCosto: 100 },
    ];
    
    const texto = "Quiero comprar 2 laptops HP y un mouse";
    
    // Enviar datos al endpoint /api/interpretar-voz
    const response = await fetch('http://localhost:3000/api/interpretar-voz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ texto, productos }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Resultado de interpretación de voz:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error en prueba de voz:', error.message);
  }
}

// Ejecutar ambas pruebas secuencialmente
envía texto y productos al backend
async function runTests() {
  console.log('🚀 Iniciando pruebas de IA...\n');
  
  await testInterpretarArchivo();
  console.log('');
  await testInterpretarVoz();
  
  console.log('\n✨ Pruebas completadas');
}

runTests(); 