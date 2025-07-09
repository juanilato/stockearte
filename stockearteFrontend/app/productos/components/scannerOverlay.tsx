// Componente visual que muestra una superposición animada durante el escaneo de códigos de barras en el modal de escaneo.
// Indica visualmente el área de escaneo y el estado de confirmación.
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';

interface Props {
  confirmado?: boolean;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ScannerOverlay({ confirmado = false }: Props) {
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const successBgOpacity = useRef(new Animated.Value(0)).current;
  const successContentScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!confirmado) {
      successBgOpacity.setValue(0);
      successContentScale.setValue(0);

      const scanAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      );

      scanAnimation.start();
      return () => {
        scanAnimation.stop();
      };
    } else {
      scanLineAnim.setValue(0);

      Animated.sequence([
        Animated.timing(successBgOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successContentScale, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [confirmado]);

  const scanLinePosition = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 180],
  });

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
    >
      {!confirmado ? (
        <View style={{ width: 280, height: 180 }}>
          <View
            style={{
              width: 280,
              height: 180,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: 'rgba(255,255,255,0.4)',
                transform: [{ translateY: scanLinePosition }],
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: -40,
                left: 0,
                right: 0,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: '#cbd5e1',
                  fontSize: 14,
                  fontWeight: '500',
                  opacity: 0.9,
                }}
              >
                Escaneando código de barras...
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <View
          style={{
            width: 280,
            height: 180,
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#e0fce7',
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundColor: '#22c55e',
              borderRadius: 16,
              opacity: successBgOpacity,
            }}
          />
          <Animated.View
            style={{
              alignItems: 'center',
              transform: [
                {
                  scale: successContentScale.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
              opacity: successContentScale,
            }}
          >
            <MaterialCommunityIcons
              name="check-circle"
              size={64}
              color="#ffffff"
            />
            <Text
              style={{
                color: '#ffffff',
                fontSize: 18,
                fontWeight: '600',
                marginTop: 10,
              }}
            >
              Escaneado con éxito
            </Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
