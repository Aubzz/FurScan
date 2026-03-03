import { Redirect } from 'expo-router';
import React from 'react';

export default function HomeScreen() {
  // This instantly bypasses the old UI and sends them to your actual Start Screen
  return <Redirect href="/Screens/StartScreen" />; 
}