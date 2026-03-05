/**
 * TokenCounter.tsx
 *
 * Component for displaying token usage and status
 * Shows:
 * - Current token usage vs limit
 * - Visual progress indicator
 * - Status color (green/yellow/red)
 * - Warning when approaching/exceeding limit
 */

import React from "react";
import { Text, View } from "react-native";
import {
    formatTokenDisplay,
    getTokenStatusColor,
} from "../services/tokenCounter";

interface TokenCounterProps {
  currentTokens: number;
  maxTokens: number;
  isLimitExceeded?: boolean;
  showLabel?: boolean;
  size?: "small" | "medium" | "large";
}

/**
 * TokenCounter Component
 * Displays token usage with visual feedback
 */
export const TokenCounter: React.FC<TokenCounterProps> = ({
  currentTokens,
  maxTokens,
  isLimitExceeded = false,
  showLabel = true,
  size = "medium",
}) => {
  const displayInfo = formatTokenDisplay(currentTokens, maxTokens);
  const statusColor = getTokenStatusColor(displayInfo.percentage);

  // Determine sizing based on size prop
  const sizeStyles = {
    small: { fontSize: 12, height: 4, barHeight: 8 },
    medium: { fontSize: 14, height: 6, barHeight: 12 },
    large: { fontSize: 16, height: 8, barHeight: 16 },
  };

  const style = sizeStyles[size];

  return (
    <View style={{ gap: 8 }}>
      {/* Token Count Display */}
      {showLabel && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: style.fontSize,
              fontWeight: "600",
              color: "#333",
            }}
          >
            Token Usage
          </Text>
          <Text
            style={{
              fontSize: style.fontSize,
              fontWeight: "500",
              color: isLimitExceeded ? "#FF6B6B" : statusColor,
            }}
          >
            {displayInfo.used}
          </Text>
        </View>
      )}

      {/* Progress Bar */}
      <View
        style={{
          height: style.barHeight,
          backgroundColor: "#E0E0E0",
          borderRadius: 100,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${Math.min(displayInfo.percentage, 100)}%`,
            backgroundColor: statusColor,
            borderRadius: 100,
          }}
        />
      </View>

      {/* Status Text */}
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: style.fontSize - 2, color: "#666" }}>
          {displayInfo.remaining}
        </Text>
        <Text
          style={{
            fontSize: style.fontSize - 2,
            fontWeight: "500",
            color: displayInfo.percentage > 80 ? "#FF6B6B" : "#666",
          }}
        >
          {displayInfo.percentage}%
        </Text>
      </View>

      {/* Warning Messages */}
      {displayInfo.percentage >= 80 && !isLimitExceeded && (
        <View
          style={{
            backgroundColor: "#FFF3CD",
            borderLeftWidth: 4,
            borderLeftColor: "#FFA500",
            padding: 10,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: "#856404" }}>
            ⚠️ Approaching token limit. Consider starting a new chat soon.
          </Text>
        </View>
      )}

      {isLimitExceeded && (
        <View
          style={{
            backgroundColor: "#F8D7DA",
            borderLeftWidth: 4,
            borderLeftColor: "#FF6B6B",
            padding: 10,
            borderRadius: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: "#721C24", fontWeight: "600" }}>
            🛑 Token limit reached. Please start a new chat.
          </Text>
        </View>
      )}
    </View>
  );
};

export default TokenCounter;
