import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Colors = {
  primaryOrange: "#F7924A",
  lightOrange: "#FDEFE5",
  textSecondary: "#888888",
  white: "#FFFFFF",
};

export function CustomTabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeRouteName = state.routes[state.index].name;

  return (
    <View style={[styles.navBarContainer, { paddingBottom: insets.bottom }]}>
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/(tabs)/home")}
        >
          <MaterialCommunityIcons
            name="paw"
            size={26}
            color={
              activeRouteName === "home"
                ? Colors.primaryOrange
                : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.navText,
              activeRouteName === "home" && styles.navTextActive,
            ]}
          >
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/(tabs)/chatbot")}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={26}
            color={
              activeRouteName === "chatbot"
                ? Colors.primaryOrange
                : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.navText,
              activeRouteName === "chatbot" && styles.navTextActive,
            ]}
          >
            Chatbot
          </Text>
        </TouchableOpacity>

        <View style={styles.navButton} />

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/(tabs)/insights")}
        >
          <Ionicons
            name="bulb-outline"
            size={26}
            color={
              activeRouteName === "insights"
                ? Colors.primaryOrange
                : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.navText,
              activeRouteName === "insights" && styles.navTextActive,
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Feather
            name="user"
            size={26}
            color={
              activeRouteName === "profile"
                ? Colors.primaryOrange
                : Colors.textSecondary
            }
          />
          <Text
            style={[
              styles.navText,
              activeRouteName === "profile" && styles.navTextActive,
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.scanButton, { bottom: 25 + insets.bottom }]}
        onPress={() => router.push("/Screens/PetInfoScreen")}
      >
        <Ionicons name="scan-outline" size={30} color={Colors.primaryOrange} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBarContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    flexDirection: "row",
    height: 70,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: Colors.white,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  navTextActive: {
    color: Colors.primaryOrange,
    fontWeight: "bold",
  },
  scanButton: {
    position: "absolute",
    left: "50%",
    marginLeft: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: Colors.lightOrange,
    borderWidth: 6,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});
