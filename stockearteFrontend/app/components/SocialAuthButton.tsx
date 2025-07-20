import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity, Text, ActivityIndicator, Platform, StyleSheet } from 'react-native';

export function SocialAuthButton({ provider, onPress, loading, text }) {
  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.disabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {provider === 'google' && <AntDesign name="google" size={22} color="#EA4335" style={styles.icon} />}
      {provider === 'apple' && Platform.OS === 'ios' && <FontAwesome name="apple" size={22} color="#1e293b" style={styles.icon} />}
      {loading ? <ActivityIndicator color="#1e293b" /> : <Text style={styles.text}>{text}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginVertical: 6,
    minWidth: 180,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#1e293b',
    fontWeight: '700',
    fontSize: 15,
  },
  disabled: {
    opacity: 0.6,
  },
}); 