import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function VincularSociales() {
  const { user } = useAuth();

  const vincularCuenta = async (provider: string) => {
    try {
      // Aquí implementarías la lógica específica para cada proveedor
      // Por ahora, simulamos el proceso
      console.log(`Vinculando cuenta con ${provider}`);
      alert(`Cuenta de ${provider} vinculada correctamente`);
    } catch (err) {
      alert(`Error al vincular con ${provider}`);
      console.error(err);
    }
  };

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Vincular redes sociales:</Text>

      <TouchableOpacity
        onPress={() => vincularCuenta('Google')}
        style={{ padding: 10, backgroundColor: '#eee', borderRadius: 6, marginBottom: 10 }}
      >
        <Text>Vincular con Google</Text>
      </TouchableOpacity>

      {Platform.OS === 'ios' && (
        <TouchableOpacity
          onPress={() => vincularCuenta('Apple')}
          style={{ padding: 10, backgroundColor: '#333', borderRadius: 6 }}
        >
          <Text style={{ color: '#fff' }}>Vincular con Apple</Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 