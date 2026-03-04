// In: app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import React from 'react';
// Import the custom tab bar component we just created
import { CustomTabBar } from '../../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      // This critical line tells Expo Router to render our custom component
      // instead of its default tab bar.
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Each screen in the tab bar is defined here. The 'name' must match the filename. */}
      <Tabs.Screen name="home" options={{ headerShown: false }} />
      <Tabs.Screen name="chatbot" options={{ headerShown: false }} />
      {/* The scan button doesn't have a screen, it's just a button */}
      <Tabs.Screen name="search" options={{ headerShown: false }} />
      <Tabs.Screen name="profile" options={{ headerShown: false }} />
    </Tabs>
  );
}