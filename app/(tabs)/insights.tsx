import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";
// Make sure you export these data arrays from your constants file
import {
  ArticleCard,
  categories,
  getAllArticles,
  petCareBasics,
  preventionCare,
  skinHealth101,
  videoGuides,
} from "../../constants/articles";

// Fixed card dimensions
const CARD_WIDTH = 300;
const CARD_HEIGHT = 200;
const CARD_SPACING = 15;

const Colors = {
  background: "#FFFFFF",
  primaryOrange: "#F7924A",
  textPrimary: "#333333",
  textSecondary: "#666666",
  white: "#FFFFFF",
  lightOrange: "#FDEFE5",
  borderColor: "#E0E0E0",
};

const InsightsTab = () => {
  const user = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getProfileImageUrl = () => {
    const path = user.profileImagePath as string;
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path.replace(/\\/g, "/")}`;
  };

  const profileImageUrl = getProfileImageUrl();

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return "document-text-outline";
      case "checklist":
        return "checkmark-circle-outline";
      case "guide":
        return "book-outline";
      case "video":
        return "videocam-outline";
      default:
        return "document-text-outline";
    }
  };

  const handleCardPress = (article: ArticleCard) => {
    router.push({
      pathname: "/Screens/ArticleDetail",
      params: {
        articleData: JSON.stringify(article),
      },
    });
  };

  // Handle navigation to related article
  const navigateToArticleParam = user.navigateToArticle as string | undefined;
  React.useEffect(() => {
    if (navigateToArticleParam) {
      const allArticles = getAllArticles();
      const article = allArticles.find(
        (a: ArticleCard) => a.title === navigateToArticleParam,
      );
      if (article) {
        setTimeout(() => {
          handleCardPress(article);
        }, 100);
      }
    }
  }, [navigateToArticleParam]);

  const renderArticleCard = (article: ArticleCard, index: number) => {
    const gradientColors =
      article.gradientColors && article.gradientColors.length >= 2
        ? (article.gradientColors as [string, string, ...string[]])
        : ([article.backgroundColor, article.backgroundColor] as [
            string,
            string,
          ]);

    return (
      <TouchableOpacity
        key={index}
        style={[styles.articleCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
        activeOpacity={0.8}
        onPress={() => handleCardPress(article)}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <MaterialCommunityIcons
            name="paw"
            size={60}
            color={Colors.primaryOrange}
            style={styles.decorativePaw}
            opacity={0.15}
          />

          <View style={styles.cardContent}>
            {article.icon && (
              <View style={styles.cardIconContainer}>
                <View style={styles.cardIconCircle}>
                  <Ionicons
                    name={article.icon as any}
                    size={24}
                    color={Colors.primaryOrange}
                  />
                </View>
              </View>
            )}
            <Text style={styles.cardTitle} numberOfLines={2}>
              {article.title}
            </Text>
            {article.description && (
              <Text style={styles.cardDescription} numberOfLines={2}>
                {article.description}
              </Text>
            )}

            <View style={styles.readMoreContainer}>
              <Text style={styles.readMoreText}>Read Now</Text>
              <Ionicons
                name="arrow-forward"
                size={16}
                color={Colors.primaryOrange}
              />
            </View>
          </View>

          <View style={styles.contentTypeIndicator}>
            <Ionicons
              name={getContentTypeIcon(article.contentType) as any}
              size={18}
              color={Colors.primaryOrange}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderSection = (title: string, articles: ArticleCard[]) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        style={styles.horizontalScroll}
      >
        {articles.map((article, index) => renderArticleCard(article, index))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Insights</Text>
        </View>

        {/* Top Category Bar */}
        <View style={styles.categoryBar}>
          {categories.map((item, index) => (
            <View key={index} style={styles.categoryItem}>
              <View style={styles.categoryIconContainer}>
                <View style={styles.categoryIconCircle}>
                  {item.iconType === "feather" && (
                    <Feather
                      name={item.icon as any}
                      size={24}
                      color={Colors.primaryOrange}
                    />
                  )}
                  {item.iconType === "ionicons" && (
                    <Ionicons
                      name={item.icon as any}
                      size={24}
                      color={Colors.primaryOrange}
                    />
                  )}
                </View>
              </View>
              <Text style={styles.categoryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.insightsContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderSection("Skin health 101", skinHealth101)}
          {renderSection("Prevention & care", preventionCare)}
          {renderSection("Pet care basics", petCareBasics)}
          {renderSection("Paw-Approved Videos", videoGuides)}
        </ScrollView>
      </View>
    </View>
  );
};

export default InsightsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    // Add padding bottom to account for CustomTabBar
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 20,
    paddingTop: 5,
    marginTop: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primaryOrange,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightOrange,
  },
  profileImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  categoryBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    marginBottom: 8,
  },
  categoryItem: {
    alignItems: "center",
    flex: 1,
  },
  categoryLabel: {
    fontSize: 11,
    color: Colors.textPrimary,
    marginTop: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  categoryIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  categoryIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  sectionContainer: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    minHeight: CARD_HEIGHT + 20,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 5,
  },
  articleCard: {
    marginRight: CARD_SPACING,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    padding: 20,
    width: "100%",
    height: "100%",
  },
  decorativePaw: {
    position: "absolute",
    right: -10,
    top: -10,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardIconContainer: {
    marginBottom: 10,
  },
  cardIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  readMoreContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  readMoreText: {
    fontSize: 14,
    color: Colors.primaryOrange,
    fontWeight: "600",
    marginRight: 6,
  },
  contentTypeIndicator: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});