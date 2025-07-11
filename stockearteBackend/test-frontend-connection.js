const fetch = require('node-fetch');

async function testFrontendConnection() {
  console.log('🧪 Probando conexión frontend -> backend...');
  
  try {
    // Probar endpoint básico
    const response = await fetch('http://localhost:3000/api');
    console.log('✅ Endpoint básico:', response.status, response.statusText);
    
    // Probar endpoint de interpretación de voz
    const vozResponse = await fetch('http://localhost:3000/api/interpretar-voz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        texto: 'test',
        productos: []
      })
    });
    console.log('✅ Endpoint interpretar-voz:', vozResponse.status, vozResponse.statusText);
    
    if (vozResponse.ok) {
      const data = await vozResponse.json();
      console.log('📄 Respuesta:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendConnection(); 