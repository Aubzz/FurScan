import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import {
  ArticleCard,
  CategoryItem,
  categories,
  getAllArticles,
  petCareBasics,
  preventionCare,
  skinHealth101,
  videoGuides
} from '../../constants/articles';

// Fixed card dimensions - won't change based on screen size
const CARD_WIDTH = 300;
const CARD_HEIGHT = 200;
const CARD_SPACING = 15;

const Colors = {
  background: '#FFFFFF',
  primaryOrange: '#F7924A',
  darkOrange: '#E67E22',
  lightOrange: '#FDEFE5',
  orangeGradient: ['#FF9A56', '#F7924A', '#E67E22'],
  orangeLight: '#FFF4ED',
  orangeMedium: '#FFE5D4',
  orangeAccent: '#FFB380',
  textPrimary: '#333333',
  textSecondary: '#666666',
  white: '#FFFFFF',
  borderColor: '#E0E0E0',
  orangeCard1: '#FFF4ED',
  orangeCard2: '#FFE5D4',
  orangeCard3: '#FFD4B8',
  orangeCard4: '#FFC9A3',
};

const InsightScreen = () => {
  const user = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const getProfileImageUrl = () => {
    const path = user.profileImagePath as string;
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}/${path.replace(/\\/g, '/')}`;
  };

  const profileImageUrl = getProfileImageUrl();

  // Section data (imported from constants/articles.ts)

  const renderCategoryIcon = (item: CategoryItem, index: number) => {
    const iconSize = 28;
    const iconColor = Colors.primaryOrange;
    
    const iconComponent = (() => {
      switch (item.iconType) {
        case 'feather':
          return <Feather name={item.icon as any} size={iconSize} color={iconColor} />;
        case 'ionicons':
          return <Ionicons name={item.icon as any} size={iconSize} color={iconColor} />;
        case 'material':
          return <MaterialCommunityIcons name={item.icon as any} size={iconSize} color={iconColor} />;
        default:
          return null;
      }
    })();

    return (
      <View style={styles.categoryIconContainer}>
        <View style={styles.categoryIconCircle}>
          {iconComponent}
        </View>
      </View>
    );
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'article':
        return 'document-text-outline';
      case 'checklist':
        return 'checkmark-circle-outline';
      case 'guide':
        return 'book-outline';
      case 'video':
        return 'videocam-outline';
      default:
        return 'document-text-outline';
    }
  };

  const handleCardPress = (article: ArticleCard) => {
    router.push({
      pathname: '/Screens/ArticleDetail',
      params: {
        articleData: JSON.stringify(article),
      },
    });
  };

  // Handle navigation to related article from ArticleDetail
  const navigateToArticleParam = user.navigateToArticle as string | undefined;
  React.useEffect(() => {
    if (navigateToArticleParam) {
      const allArticles = getAllArticles();
      const article = allArticles.find((a: ArticleCard) => a.title === navigateToArticleParam);
      if (article) {
        // Small delay to ensure screen is ready
        setTimeout(() => {
          handleCardPress(article);
        }, 100);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigateToArticleParam]);

  const renderArticleCard = (article: ArticleCard, index: number) => {
    const gradientColors = article.gradientColors && article.gradientColors.length >= 2
      ? article.gradientColors as [string, string, ...string[]]
      : [article.backgroundColor, article.backgroundColor] as [string, string];
    
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
          {/* Decorative paw print */}
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
                    style={styles.cardIcon}
                  />
                </View>
              </View>
            )}
            <Text style={styles.cardTitle}>{article.title}</Text>
            {article.description && (
              <Text style={styles.cardDescription}>{article.description}</Text>
            )}
            
            {/* Read More Button */}
            <View style={styles.readMoreContainer}>
              <Text style={styles.readMoreText}>Learn more</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.primaryOrange} />
            </View>
          </View>

          {/* Content Type Indicator */}
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
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.logoText}>Furemedy</Text>
          <TouchableOpacity onPress={() => console.log('Profile Tapped')}>
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
                <Feather name="user" size={24} color={Colors.textSecondary} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Top Category Bar */}
        <View style={styles.categoryBar}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              activeOpacity={0.7}
            >
              {renderCategoryIcon(category, index)}
              <Text style={styles.categoryLabel} numberOfLines={2}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Insights Content */}
        <ScrollView 
          style={styles.insightsContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderSection('Skin health 101', skinHealth101)}
          {renderSection('Prevention & care', preventionCare)}
          {renderSection('Pet care basics', petCareBasics)}
          {renderSection('Paw-Approved Videos', videoGuides)}
        </ScrollView>
      </View>
    </View>
  );
};

export default InsightScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 5,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primaryOrange,
    letterSpacing: 0.5,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightOrange,
  },
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  categoryBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: 0,
  },
  categoryLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
    width: '100%',
    maxWidth: 80,
    lineHeight: 18,
  },
  categoryIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
  },
  categoryIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
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
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 18,
    paddingHorizontal: 5,
    letterSpacing: 0.5,
  },
  horizontalScroll: {
    marginHorizontal: -20,
    minHeight: CARD_HEIGHT + 20,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    paddingRight: 5,
    minHeight: CARD_HEIGHT + 20,
  },
  articleCard: {
    marginRight: CARD_SPACING,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  decorativePaw: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.15,
  },
  cardContent: {
    zIndex: 1,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardIconContainer: {
    marginBottom: 10,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 22,
    flexShrink: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
    flexShrink: 1,
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
  },
  readMoreText: {
    fontSize: 14,
    color: Colors.primaryOrange,
    fontWeight: '600',
    marginRight: 6,
  },
  contentTypeIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderColor,
    paddingTop: 10,
    position: 'relative',
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: Colors.primaryOrange,
    fontWeight: '600',
  },
  scanButton: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: Colors.primaryOrange,
  },
});