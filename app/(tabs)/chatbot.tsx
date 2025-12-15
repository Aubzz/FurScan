import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { sendMessage } from "../services/botpressApi";

const { width } = Dimensions.get("window");

// Typing animation
const TypingDots = () => {
  return (
    <View style={{ flexDirection: "row", padding: 5 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#999", marginHorizontal: 2, opacity: 0.3 }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#999", marginHorizontal: 2, opacity: 0.6 }} />
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#999", marginHorizontal: 2, opacity: 1 }} />
    </View>
  );
};

// Component to render text with bold formattingg
const FormattedText = ({ text }: { text: string }) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return (
    <Text style={{ color: "inherit" }}>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={index} style={{ fontWeight: "bold" }}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
};

export default function ChatbotScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [drawerAnim] = useState(new Animated.Value(width));
  const [loading, setLoading] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const suggestions = ["Ringworm", "Hotspots", "Itchy Skin", "Ear Mites", "Fleas"];

  const openDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: width * 0.25,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, {
      toValue: width,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const send = async (text: string) => {
    setChat((prev) => [...prev, { role: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await sendMessage(text);
      setChat((prev) => [...prev, { role: "assistant", text: response }]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      send(message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>

      {/* Header */}
      <View style={{ padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => openDrawer()}>
          <Text style={{ fontSize: 20 }}>☰</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: "bold" }}>Chat with AI bot</Text>

        <TouchableOpacity>
          <Text style={{ fontSize: 20 }}>⋯</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting */}
      <View style={{ alignItems: "center", paddingVertical: 20 }}>
        <Image
          source={require("../../assets/images/samplecat.png")}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Good morning, [Name]</Text>
        <Text style={{ color: "#777", marginTop: 5 }}>
          How can I help you and your pet?
        </Text>
      </View>

      {/* Suggestions */}
      <View style={{ paddingHorizontal: 15, marginBottom: 10 }}>
        <FlatList
          horizontal
          scrollEnabled={false}
          data={suggestions}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => send(item)}
              style={{
                backgroundColor: "#FFE1C6",
                paddingHorizontal: 12,
                paddingVertical: 6,
                marginRight: 8,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#D97706", fontSize: 12 }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={chat}
        keyExtractor={(_, index) => index.toString()}
        style={{ flex: 1, paddingHorizontal: 15, paddingBottom: 10 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: item.role === "user" ? "#F79C4E" : "#E5E5EA",
              marginVertical: 5,
              padding: 12,
              borderRadius: 15,
              maxWidth: "80%",
            }}
          >
            <FormattedText 
              text={item.text} 
            />
          </View>
        )}
        ListFooterComponent={
          loading ? (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: "#E5E5EA",
                padding: 10,
                borderRadius: 15,
                marginVertical: 10,
              }}
            >
              <TypingDots />
            </View>
          ) : null
        }
      />

      {/* Input - Fixed at bottom above tab bar */}
      <View
        style={{
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderColor: "#ddd",
          paddingHorizontal: 10,
          paddingVertical: 15,
          paddingBottom: 90,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Paperclip Icon */}
          <TouchableOpacity style={{ marginRight: 10 }}>
            <Text style={{ fontSize: 20 }}>📎</Text>
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            placeholder="Ask me anything about your pet's skin & care..."
            placeholderTextColor="#999"
            style={{
              flex: 1,
              backgroundColor: "#F5F5F5",
              paddingHorizontal: 15,
              paddingVertical: 12,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: "#DDD",
              fontSize: 14,
            }}
          />

          {/* Send Button */}
          <TouchableOpacity
            onPress={handleSendMessage}
            disabled={loading}
            style={{
              marginLeft: 10,
              minWidth: 40,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#F79C4E" />
            ) : (
              <Text style={{ fontSize: 20 }}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Slide-Out Drawer */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: width * 0.9,
          backgroundColor: "#fff",
          borderLeftWidth: 2,
          borderColor: "#ddd",
          right: drawerAnim,
          padding: 25,
          paddingTop: 40,
          zIndex: 1000,
        }}
      >
        <TouchableOpacity onPress={closeDrawer} style={{ marginBottom: 40 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#F79C4E" }}>
            ✕ Close
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 30, color: "#333" }}>
          Chat History
        </Text>

        <FlatList
          data={[
            "What is ringworm?",
            "How to treat hotspots?",
            "Why my cat is itchy?",
          ]}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                send(item);
                closeDrawer();
              }}
              style={{
                paddingVertical: 22,
                paddingHorizontal: 18,
                borderBottomWidth: 2,
                borderColor: "#E0E0E0",
                backgroundColor: "#F8F8F8",
                marginBottom: 12,
                borderRadius: 10,
                minHeight: 60,
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 18, color: "#333", fontWeight: "600" }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
}
