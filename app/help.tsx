import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Glow Header */}
      <LinearGradient
        colors={['#8B5CF6', '#EC4899', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.glowHeader}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>📚 How Glow Works</Text>
        
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Start Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionTitle}>🚀 Quick Start</Text>
            <Text style={styles.stepText}>1️⃣ Sign in → Add small daily tasks on homepage</Text>
            <Text style={styles.stepText}>2️⃣ Make small progress on each task ("+" button)</Text>
            <Text style={styles.stepText}>3️⃣ Fill your daily total progress bar</Text>
            <Text style={styles.stepText}>4️⃣ Friends & Groups: chat, share, stay motivated</Text>
          </LinearGradient>
        </View>

        {/* Tasks & Motivation Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionTitle}>🎯 Daily Tasks & Dopamine</Text>
            <Text style={styles.bodyText}>
              Every task has its own progress bar. When completed, you get celebration with trophies and confetti! 🏆✨
            </Text>
            <Text style={styles.bodyText}>
              The bottom progress bar collects all your small wins throughout the day.
            </Text>
            <Text style={styles.tipText}>
              💡 Tip: Set small, clear goals (e.g., 5 glasses of water, 1 small note, 3 stretches)
            </Text>
          </LinearGradient>
        </View>

        {/* Streaks Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(249, 115, 22, 0.1)', 'rgba(251, 191, 36, 0.1)']}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionTitle}>🔥 Streaks</Text>
            <Text style={styles.bodyText}>
              Any day you complete a task gets recorded. Consecutive days create "streaks" that build momentum.
            </Text>
            <Text style={styles.tipText}>
              💡 Tip: Even on busy days, completing one tiny task keeps your streak alive!
            </Text>
          </LinearGradient>
        </View>

        {/* Personalization Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)']}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionTitle}>🎨 Personalization</Text>
            <Text style={styles.bodyText}>
              Choose your color palette from Profile page → interface adapts to your preferences with our Glow aesthetic.
            </Text>
            <Text style={styles.bodyText}>
              Pick colors when creating tasks for visual feedback that matches your ADHD brain.
            </Text>
          </LinearGradient>
        </View>

        {/* Social Features Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionTitle}>💬 Chats & Community</Text>
            <Text style={styles.bodyText}>
              Create groups, join with invite codes, send messages and voice notes. React to messages to motivate each other.
            </Text>
            <Text style={styles.bodyText}>
              Send friend requests, share short updates, and collect reactions from your ADHD community.
            </Text>
          </LinearGradient>
        </View>

        {/* Privacy & Data Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
            style={styles.sectionCard}
          >
            <Text style={styles.sectionTitle}>🔒 Privacy & Data</Text>
            <Text style={styles.bodyText}>
              In this MVP, all data is stored locally on your device. In the full version, privacy and security are our top priorities.
            </Text>
            <Text style={styles.bodyText}>
              Backup & restore your data via Profile → Data Tools for JSON export/import.
            </Text>
          </LinearGradient>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity style={styles.ctaButton} onPress={() => router.back()}>
            <LinearGradient
              colors={['#10B981', '#34D399']}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>✨ Got it! Let's Go</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: -40, // Compensate for back button
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 15,
    color: '#E5E7EB',
    marginBottom: 8,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 15,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  ctaSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});