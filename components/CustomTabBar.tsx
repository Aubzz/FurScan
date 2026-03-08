import { Feather, Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Link, useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Colors = {
  primaryOrange: "#F7924A",
  textSecondary: "#666666",
  white: "#FFFFFF",
  shadow: "#000",
};

export function CustomTabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Gets the name of the currently active tab (home, chatbot, insights, profile)
  const activeRouteName = state.routes[state.index].name;

  if (activeRouteName === "chatbot") {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
        {/* HOME */}
        <Link href="/home" asChild>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Ionicons
              name={activeRouteName === "home" ? "home" : "home-outline"}
              size={30}
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
        </Link>

        {/* CHATBOT */}
        <Link href="/chatbot" asChild>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Ionicons
              name={
                activeRouteName === "chatbot"
                  ? "chatbubble-ellipses"
                  : "chatbubble-ellipses-outline"
              }
              size={30}
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
        </Link>

        {/* SPACER FOR CENTER BUTTON */}
        <View style={styles.navSpacer} />

        {/* INSIGHTS */}
        <Link href="/insights" asChild>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Ionicons
              name={
                activeRouteName === "insights" ? "bulb-outline" : "bulb-outline"
              }
              size={30}
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
        </Link>

        {/* PROFILE */}
        <Link href="/profile" asChild>
          <TouchableOpacity style={styles.navButton} activeOpacity={0.7}>
            <Feather
              name="user"
              size={30}
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
        </Link>
      </View>

      {/* FLOATING SCAN BUTTON */}
      <TouchableOpacity
        style={[
          styles.scanButton,
          { bottom: Platform.OS === "ios" ? insets.bottom + 20 : 40 },
        ]}
        onPress={() => router.push("/Screens/PetInfoScreen")}
        activeOpacity={0.8}
      >
        <View style={styles.scanInner}>
          <Ionicons name="scan-outline" size={32} color={Colors.white} />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: Colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  navBar: {
    flexDirection: "row",
    height: 85,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 10,
  },
  navButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  navSpacer: {
    width: 80, // Leaves a gap for the floating button
  },
  navText: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: "500",
  },
  navTextActive: {
    color: Colors.primaryOrange,
  },
  scanButton: {
    position: "absolute",
    left: "38%",
    marginLeft: 10, // Perfectly centers the 70px wide button
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.white,
    padding: 5,
    elevation: 20,
    shadowColor: Colors.primaryOrange,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  scanInner: {
    flex: 1,
    backgroundColor: Colors.primaryOrange,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
});
