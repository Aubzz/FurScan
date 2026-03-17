/**
 * ChatWelcome.tsx
 *
 * Modern AI Assistant Welcome Screen
 * Displays when no messages exist in the chat
 * Clean, centered layout with condition cards
 */

import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface ChatWelcomeProps {
  onCardPress: (topic: string) => void;
}

const CONDITIONS = [
  { id: 1, label: "Fungal Infection", icon: "virus" },
  { id: 2, label: "Ringworm", icon: "ring" },
  { id: 3, label: "Dermatitis", icon: "water-alert" },
  { id: 4, label: "Sarcoptic Mange", icon: "bug" },
  { id: 5, label: "Demodectic Mange", icon: "microscope" },
  { id: 6, label: "Hypersensitivity", icon: "alert-circle" },
];

export default function ChatWelcome({ onCardPress }: ChatWelcomeProps) {
  const screenWidth = Dimensions.get("window").width;
  const isMobile = screenWidth < 768;
  const cardWidth = isMobile
    ? (screenWidth - 48) / 2
    : (Math.min(screenWidth - 80, 600) - 24) / 2;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}
      contentContainerStyle={{ 
        flexGrow: 1, 
        justifyContent: "center",
        paddingHorizontal: isMobile ? 16 : 40,
        paddingVertical: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Logo/Icon */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#ffffff",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 5,
            overflow: "hidden",
          }}
        >
          <Image
            source={require("../assets/images/dogbot.png")}
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
            }}
            resizeMode="cover"
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
            color: "#1A1A1A",
            marginBottom: 8,
            letterSpacing: -0.5,
            textAlign: "center",
          }}
        >
          FurScan AI Assistant
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: 15,
            fontWeight: "400",
            color: "#888888",
            marginBottom: 32,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Ask anything about your dog's skin health and common conditions
        </Text>

        {/* Divider */}
        <View
          style={{
            width: 40,
            height: 2,
            backgroundColor: "#F79C4E",
            marginBottom: 32,
            borderRadius: 1,
          }}
        />

        {/* Common Topics Label */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "#999999",
            marginBottom: 16,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Common Conditions
        </Text>

        {/* Condition Cards Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            maxWidth: 600,
          }}
        >
          {CONDITIONS.map((condition) => (
            <TouchableOpacity
              key={condition.id}
              onPress={() =>
                onCardPress(
                  `Tell me about ${condition.label} in dogs`
                )
              }
              activeOpacity={0.7}
              style={{
                width: cardWidth,
                paddingHorizontal: 12,
                paddingVertical: 16,
                backgroundColor: "#F9F9F9",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#E7E7E7",
                alignItems: "center",
                gap: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.04,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <MaterialCommunityIcons
                name={condition.icon as any}
                size={24}
                color="#F79C4E"
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: "#1A1A1A",
                  textAlign: "center",
                }}
                numberOfLines={2}
              >
                {condition.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer hint */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: "400",
            color: "#CCCCCC",
            marginTop: 32,
            textAlign: "center",
            lineHeight: 18,
          }}
        >
          Or type your question in the input below
        </Text>
      </View>
    </ScrollView>
  );
}
