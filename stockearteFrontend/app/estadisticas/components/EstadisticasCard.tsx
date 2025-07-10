import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EstadisticasCardProps {
  icon: string;
  value: string;
  label: string;
  color: string;
  onPress?: () => void;
  children?: React.ReactNode;
}

export default function EstadisticasCard({ 
  icon, 
  value, 
  label, 
  color, 
  onPress, 
  children 
}: EstadisticasCardProps) {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.card, onPress && styles.cardPressable]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
          <MaterialCommunityIcons name={icon as any} size={20} color={color} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <Text style={styles.value}>{value}</Text>
      
      {children && (
        <View style={styles.childrenContainer}>
          {children}
        </View>
      )}
    </CardComponent>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardPressable: {
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  childrenContainer: {
    marginTop: 12,
    width: '100%',
  },
}); 