import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

export const useAnimacionesInicio = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const welcomeSlideAnim = useRef(new Animated.Value(-50)).current;
  const metricsSlideAnim = useRef(new Animated.Value(50)).current;
  const actionsSlideAnim = useRef(new Animated.Value(-30)).current;
  const statsSlideAnim = useRef(new Animated.Value(30)).current;
  const activitySlideAnim = useRef(new Animated.Value(-40)).current;

  const iniciarAnimaciones = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(welcomeSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(metricsSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(actionsSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 600,
        useNativeDriver: true,
      }),
      Animated.timing(statsSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 800,
        useNativeDriver: true,
      }),
      Animated.timing(activitySlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return {
    fadeAnim,
    slideAnim,
    welcomeSlideAnim,
    metricsSlideAnim,
    actionsSlideAnim,
    statsSlideAnim,
    activitySlideAnim,
    iniciarAnimaciones,
  };
}; 