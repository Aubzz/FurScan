import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, PanResponder, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BUTTON_WIDTH = SCREEN_WIDTH * 0.85; // responsive width
const BUTTON_HEIGHT = 70;
const ICON_SIZE = 60;

export default function StartScreen() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fillAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const [completed, setCompleted] = useState(false);

  // Auto-navigate after 3 seconds if user hasn't dragged
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!completed) {
        setCompleted(true);
        router.push("/Screens/Login");
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [completed]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gesture) => {
        let newX = gesture.dx;
        if (newX < 0) newX = 0;
        if (newX > BUTTON_WIDTH - ICON_SIZE) newX = BUTTON_WIDTH - ICON_SIZE;

        slideAnim.setValue(newX);
        fillAnim.setValue(newX + ICON_SIZE / 2);

        const opacity = 1 - newX / (BUTTON_WIDTH - ICON_SIZE);
        textOpacity.setValue(opacity);
      },
      onPanResponderRelease: (e, gesture) => {
        if (gesture.dx >= BUTTON_WIDTH - ICON_SIZE - 5 && !completed) {
          setCompleted(true);
          Animated.timing(fillAnim, {
            toValue: BUTTON_WIDTH,
            duration: 200,
            useNativeDriver: false,
          }).start();
          router.push("/Screens/Login");
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            bounciness: 10,
            useNativeDriver: true,
          }).start();
          Animated.spring(fillAnim, {
            toValue: 0,
            bounciness: 10,
            useNativeDriver: false,
          }).start();
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Top Illustration */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../assets/images/start-illustration.png")}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <Text style={styles.subtitle}>Look After Your {"\n"} Fur Babies</Text>
        <Text style={styles.description}>
          Spot skin troubles early and keep your pet’s skin healthy.
        </Text>

        {/* Slider */}
        <View style={[styles.sliderContainer, { width: BUTTON_WIDTH, height: BUTTON_HEIGHT }]}>
          <Animated.View style={[styles.fillBackground, { width: fillAnim }]}>
            <LinearGradient
              colors={['#FFD93D', '#FFA65C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ flex: 1, borderRadius: BUTTON_HEIGHT / 2 }}
            />
          </Animated.View>

          <Animated.Text style={[styles.sliderText, { opacity: textOpacity }]}>
            Get Started
          </Animated.Text>

          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.sliderIcon,
              {
                width: ICON_SIZE,
                height: ICON_SIZE,
                borderRadius: ICON_SIZE / 2,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.arrow, { fontSize: 32 }]}>{'>'}</Text>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7924A" },
  imageContainer: { flex: 1, width: "100%", justifyContent: "center", alignItems: "center" },
  image: { width: "90%", height: "90%" },
  contentContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
    elevation: 5,
  },
  subtitle: { fontSize: 26, fontWeight: "700", textAlign: "center", color: "#333", marginBottom: 15 },
  description: { fontSize: 18, fontWeight: "500", textAlign: "center", color: "#949494", marginBottom: 30, lineHeight: 24 },
  sliderContainer: {
    borderRadius: BUTTON_HEIGHT / 2,
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 20,
    backgroundColor: "#F7924A",
  },
  fillBackground: {
    position: "absolute",
    height: "100%",
    borderRadius: BUTTON_HEIGHT / 2,
    left: 0,
    top: 0,
    overflow: "hidden",
  },
  sliderText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 22,
    zIndex: 0,
    color: "#fff",
  },
  sliderIcon: {
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    position: "absolute",
    left: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
    elevation: 5,
  },
  arrow: {
    fontWeight: "bold",
    color: "#FFA65C",
  },
});
