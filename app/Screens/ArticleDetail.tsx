import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { getAllArticles } from "../../constants/articles";

const Colors = {
  background: "#FFFFFF",
  primaryOrange: "#F7924A",
  darkOrange: "#E67E22",
  lightOrange: "#FDEFE5",
  orangeLight: "#FFF4ED",
  orangeMedium: "#FFE5D4",
  textPrimary: "#333333",
  textSecondary: "#666666",
  white: "#FFFFFF",
  borderColor: "#E0E0E0",
};

interface ArticleSection {
  title: string;
  items: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleData {
  title: string;
  description: string;
  icon: string;
  gradientColors: string[];
  contentType: "article" | "checklist" | "guide" | "video";
  intro: string;
  sections: ArticleSection[];
  relatedArticles?: string[];
  faq?: FAQItem[];
  videoUrl?: string;
}

const ArticleDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // Parse article data from params
  const articleData: ArticleData | null = params.articleData
    ? JSON.parse(params.articleData as string)
    : null;

  if (!articleData) {
    return (
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text>Article not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: Colors.primaryOrange }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Handle navigation to a Related Article
  const handleRelatedArticlePress = (relatedTitle: string) => {
    const allArticles = getAllArticles();

    // Clean the search string
    const targetTitle = relatedTitle.trim().toLowerCase();

    // Find the article with robust matching
    const relatedArticleData = allArticles.find(
      (a) => a.title.trim().toLowerCase() === targetTitle,
    );

    if (relatedArticleData) {
      // Force a push to the top of the stack
      router.push({
        pathname: "/Screens/ArticleDetail",
        params: {
          articleData: JSON.stringify(relatedArticleData),
          // Add a unique timestamp to force a refresh if needed
          timestamp: Date.now(),
        },
      });
    } else {
      console.warn("Article not found:", relatedTitle);
      Alert.alert(
        "Article Unavailable",
        `Could not find an article titled "${relatedTitle}".`,
      );
    }
  };

  const gradientColors = articleData.gradientColors as [
    string,
    string,
    ...string[],
  ];

  const getContentTypeIcon = () => {
    switch (articleData.contentType) {
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

  const getEmbedUrl = (videoUrl: string): string => {
    // Ensure we have a proper YouTube embed URL
    if (videoUrl.includes("youtube.com/embed/")) {
      return videoUrl;
    }
    // If it's a watch URL, convert to embed
    if (videoUrl.includes("youtube.com/watch?v=")) {
      const videoId = videoUrl.split("watch?v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // If it's a youtu.be short URL
    if (videoUrl.includes("youtu.be/")) {
      const videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return videoUrl;
  };

  const renderVideoPlayer = () => {
    const embedUrl = getEmbedUrl(articleData.videoUrl!);

    if (Platform.OS === "web") {
      // Web platform: Use iframe
      return (
        <View style={styles.videoContainer}>
          {/* @ts-ignore - iframe is valid for web */}
          <iframe
            src={embedUrl}
            style={styles.videoIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </View>
      );
    } else {
      // Native platforms: Use WebView
      return (
        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: embedUrl }}
            style={styles.videoWebView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        </View>
      );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            // Redirect to Insights Tab
            onPress={() => router.push("/(tabs)/insights")}
            activeOpacity={0.7}
            style={styles.breadcrumbItem}
          >
            <Text style={styles.breadcrumbLink} numberOfLines={1}>
              Insights
            </Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}> {">"} </Text>
          <View style={styles.breadcrumbItemFlex}>
            <Text
              style={styles.breadcrumbText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {articleData.title}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.contentTypeBadge}>
            <Ionicons
              name={getContentTypeIcon() as any}
              size={18}
              color={Colors.primaryOrange}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          {/* Decorative elements */}
          <MaterialCommunityIcons
            name="paw"
            size={100}
            color={Colors.primaryOrange}
            style={styles.decorativePaw1}
            opacity={0.1}
          />
          <MaterialCommunityIcons
            name="paw"
            size={60}
            color={Colors.primaryOrange}
            style={styles.decorativePaw2}
            opacity={0.1}
          />

          <View style={styles.heroIconContainer}>
            <View style={styles.heroIconCircle}>
              {/* Use Ionicons for reliability here if possible, or dynamic */}
              <Ionicons
                name={articleData.icon as any} // Ensure icon names match Ionicons
                size={40}
                color={Colors.primaryOrange}
              />
            </View>
          </View>
          <Text style={styles.heroTitle}>{articleData.title}</Text>
          <Text style={styles.heroDescription}>{articleData.description}</Text>
        </LinearGradient>

        {/* Article Meta Section */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>5 min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={Colors.textSecondary}
              />
              <Text style={styles.metaText}>Updated recently</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={16}
                color={Colors.primaryOrange}
              />
              <Text style={[styles.metaText, styles.metaTextVerified]}>
                Helpful Guide
              </Text>
            </View>
          </View>
        </View>

        {/* Intro */}
        <View style={styles.introSection}>
          <Text style={styles.introText}>{articleData.intro}</Text>
        </View>

        {/* Video Section */}
        {articleData.videoUrl && (
          <View style={styles.videoSection}>
            <View style={styles.videoHeader}>
              <Ionicons
                name="videocam"
                size={24}
                color={Colors.primaryOrange}
              />
              <Text style={styles.videoTitle}>Watch Video</Text>
            </View>
            {renderVideoPlayer()}
            <Text style={styles.videoDescription}>
              Learn more about {articleData.title.toLowerCase()} from expert
              veterinarians
            </Text>
          </View>
        )}

        {/* Content Sections */}
        {articleData.sections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {articleData.contentType === "checklist" ? (
              <View style={styles.checklistContainer}>
                {section.items.map((item, itemIndex) => (
                  <View key={itemIndex} style={styles.checklistItem}>
                    <View style={styles.checkbox}>
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={Colors.primaryOrange}
                      />
                    </View>
                    <Text style={styles.checklistText}>{item}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.itemsContainer}>
                {section.items.map((item, itemIndex) => {
                  // Skip empty items (used as spacers)
                  if (!item || item.trim() === "") {
                    return null;
                  }

                  const hasTitle = item.includes(":");
                  const [title, ...rest] = item.split(":");
                  const isMyth = title.trim().toUpperCase() === "MYTH";
                  const isFact = title.trim().toUpperCase() === "FACT";
                  const isReference =
                    title.trim().toUpperCase() === "REFERENCE";

                  // Handle reference items with links
                  if (isReference) {
                    const urlMatch = item.match(/https?:\/\/[^\s]+/);
                    const hasUrl = urlMatch !== null;
                    const url = hasUrl ? urlMatch[0] : "";
                    const textBeforeUrl = hasUrl
                      ? item.substring(0, item.indexOf(url)).trim()
                      : item;

                    return (
                      <View key={itemIndex} style={styles.referenceItem}>
                        <Text style={styles.referenceText}>
                          {textBeforeUrl}
                          {hasUrl && url && (
                            <Text
                              style={styles.referenceLink}
                              onPress={() => Linking.openURL(url)}
                            >
                              {url}
                            </Text>
                          )}
                        </Text>
                      </View>
                    );
                  }

                  // Check if next item is a fact (to group myth/fact pairs)
                  const nextItem =
                    itemIndex < section.items.length - 1
                      ? section.items[itemIndex + 1]
                      : null;
                  const isNextFact =
                    nextItem &&
                    nextItem.trim().toUpperCase().startsWith("FACT:");
                  const isLastInPair = isFact;

                  return (
                    <View
                      key={itemIndex}
                      style={[
                        styles.item,
                        isMyth && styles.mythItem,
                        isFact && styles.factItem,
                        isMyth && isNextFact && styles.mythInPair,
                        isFact && styles.factInPair,
                        isLastInPair && styles.lastInPair,
                      ]}
                    >
                      {hasTitle ? (
                        <>
                          <Text
                            style={[
                              styles.itemTitle,
                              isMyth && styles.mythTitle,
                              isFact && styles.factTitle,
                            ]}
                          >
                            {title}:
                          </Text>
                          <Text style={styles.itemText}>{rest.join(":")}</Text>
                        </>
                      ) : (
                        <Text style={styles.itemText}>{item}</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ))}

        {/* FAQ Section */}
        {articleData.faq && articleData.faq.length > 0 && (
          <View style={styles.faqSection}>
            <View style={styles.faqHeader}>
              <Ionicons
                name="help-circle-outline"
                size={24}
                color={Colors.primaryOrange}
              />
              <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
            </View>
            {articleData.faq.map((faq, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.faqQuestionContainer}>
                  <View style={styles.faqQuestionIcon}>
                    <Ionicons
                      name="help-circle"
                      size={20}
                      color={Colors.primaryOrange}
                    />
                  </View>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                </View>
                <View style={styles.faqAnswerContainer}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Related Articles */}
        {articleData.relatedArticles &&
          articleData.relatedArticles.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Related Articles</Text>
              {articleData.relatedArticles.map((related, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.relatedItem}
                  activeOpacity={0.7}
                  onPress={() => handleRelatedArticlePress(related)}
                >
                  <View style={styles.relatedItemLeft}>
                    <View style={styles.relatedIconContainer}>
                      <Ionicons
                        name="document-text-outline"
                        size={18}
                        color={Colors.primaryOrange}
                      />
                    </View>
                    <Text style={styles.relatedText}>{related}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Colors.primaryOrange}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    backgroundColor: Colors.white,
    minHeight: 56,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    flexShrink: 0,
  },
  breadcrumb: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    minWidth: 0,
  },
  breadcrumbItem: {
    flexShrink: 0,
  },
  breadcrumbItemFlex: {
    flex: 1,
    minWidth: 0,
  },
  breadcrumbLink: {
    fontSize: 13,
    color: Colors.primaryOrange,
    fontWeight: "600",
  },
  breadcrumbSeparator: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
    marginHorizontal: 2,
    flexShrink: 0,
  },
  breadcrumbText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  contentTypeBadge: {
    backgroundColor: Colors.orangeLight,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primaryOrange,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryOrange,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  heroSection: {
    padding: 35,
    alignItems: "center",
    marginBottom: 0,
    position: "relative",
    overflow: "hidden",
  },
  heroIconContainer: {
    marginBottom: 20,
  },
  heroIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primaryOrange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: Colors.primaryOrange,
  },
  decorativePaw1: {
    position: "absolute",
    right: -30,
    top: -30,
  },
  decorativePaw2: {
    position: "absolute",
    left: -20,
    bottom: -20,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.4,
    zIndex: 1,
  },
  heroDescription: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 26,
    zIndex: 1,
    paddingHorizontal: 10,
  },
  metaSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontWeight: "500",
  },
  metaTextVerified: {
    color: Colors.primaryOrange,
    fontWeight: "600",
  },
  introSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.orangeLight,
    marginTop: 0,
  },
  introText: {
    fontSize: 17,
    color: Colors.textPrimary,
    lineHeight: 28,
    fontStyle: "italic",
    fontWeight: "500",
  },
  videoSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  videoContainer: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: Colors.orangeLight,
    borderWidth: 3,
    borderColor: Colors.primaryOrange,
    shadowColor: Colors.primaryOrange,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  videoWebView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  videoIframe: {
    width: "100%",
    height: "100%",
    borderRadius: 13,
  } as any,
  videoDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    paddingHorizontal: 10,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    backgroundColor: Colors.white,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.4,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryOrange,
    alignSelf: "flex-start",
    paddingRight: 20,
  },
  itemsContainer: {
    gap: 16,
  },
  item: {
    marginBottom: 12,
    paddingLeft: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryOrange,
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 4,
  },
  mythItem: {
    borderLeftColor: "#FF6B6B",
    backgroundColor: "#FFF5F5",
    marginBottom: 6,
  },
  factItem: {
    borderLeftColor: "#51CF66",
    backgroundColor: "#F0FDF4",
  },
  mythInPair: {
    marginBottom: 6,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  factInPair: {
    marginTop: 0,
    marginBottom: 20,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  lastInPair: {
    marginBottom: 20,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  mythTitle: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  factTitle: {
    color: "#51CF66",
    fontWeight: "bold",
  },
  referenceItem: {
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.orangeLight,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryOrange,
  },
  referenceText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontStyle: "italic",
  },
  referenceLink: {
    color: Colors.primaryOrange,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  itemText: {
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  checklistContainer: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: Colors.orangeLight,
    borderRadius: 10,
    marginBottom: 8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: Colors.primaryOrange,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
    shadowColor: Colors.primaryOrange,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  checklistText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    lineHeight: 26,
    fontWeight: "500",
  },
  relatedSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    marginTop: 20,
    backgroundColor: Colors.orangeLight,
    borderTopWidth: 3,
    borderTopColor: Colors.primaryOrange,
  },
  relatedTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  relatedItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: Colors.primaryOrange,
    shadowColor: Colors.primaryOrange,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  relatedItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  relatedIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.orangeLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  relatedText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  faqSection: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    marginTop: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 3,
    borderTopColor: Colors.primaryOrange,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  faqTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  faqItem: {
    marginBottom: 20,
    backgroundColor: Colors.orangeLight,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  faqQuestionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  faqQuestionIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  faqAnswerContainer: {
    paddingLeft: 30,
  },
  faqAnswer: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
});

export default ArticleDetailScreen;
