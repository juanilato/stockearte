import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ModernLoadingProps {
  type: 'productos' | 'materiales' | 'ventas' | 'estadisticas' | 'inicio';
  message?: string;
}

export default function ModernLoading({ type, message }: ModernLoadingProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const getConfig = () => {
    switch (type) {
      case 'productos':
        return {
          icon: 'package-variant',
          color: '#3b82f6',
          title: 'Cargando Productos',
          subtitle: 'Sincronizando inventario...',
        };
      case 'materiales':
        return {
          icon: 'cube-outline',
          color: '#8b5cf6',
          title: 'Cargando Materiales',
          subtitle: 'Organizando componentes...',
        };
      case 'ventas':
        return {
          icon: 'cart-outline',
          color: '#ef4444',
          title: 'Cargando Ventas',
          subtitle: 'Preparando scanner...',
        };
      case 'estadisticas':
        return {
          icon: 'chart-line',
          color: '#10b981',
          title: 'Cargando Estadísticas',
          subtitle: 'Analizando datos...',
        };
      case 'inicio':
        return {
          icon: 'home-outline',
          color: '#f59e0b',
          title: 'Cargando Inicio',
          subtitle: 'Preparando dashboard...',
        };
      default:
        return {
          icon: 'loading',
          color: '#64748b',
          title: 'Cargando',
          subtitle: 'Por favor espera...',
        };
    }
  };

  const config = getConfig();

  useEffect(() => {
    // Animación de entrada
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animación de pulso
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Animación de rotación
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    pulseAnimation.start();
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.content}>
        {/* Icono animado */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${config.color}15`,
              transform: [
                { scale: pulseAnim },
                { rotate: spin },
              ],
            },
          ]}
        >
          <MaterialCommunityIcons
            name={config.icon as any}
            size={48}
            color={config.color}
          />
        </Animated.View>

        {/* Texto */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subtitle}>
            {message || config.subtitle}
          </Text>
        </View>

        {/* Indicador de carga */}
        <View style={styles.loadingIndicator}>
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: config.color,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: config.color,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              {
                backgroundColor: config.color,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  content: {
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 