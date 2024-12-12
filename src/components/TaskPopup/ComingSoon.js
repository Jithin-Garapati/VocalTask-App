import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ComingSoon = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="robot-excited" 
            size={64} 
            color="#3B82F6" 
            style={styles.icon}
          />
          <MaterialCommunityIcons 
            name="sparkles" 
            size={24} 
            color="#F59E0B" 
            style={styles.sparkle1}
          />
          <MaterialCommunityIcons 
            name="sparkles" 
            size={24} 
            color="#3B82F6" 
            style={styles.sparkle2}
          />
        </View>
        <Text style={styles.title}>AI Magic Coming Soon!</Text>
        <Text style={styles.description}>
          We're brewing something extraordinary! Soon you'll be able to:
        </Text>
        <View style={styles.featureList}>
          <FeatureItem 
            icon="brain" 
            text="Smart task organization and prioritization"
          />
          <FeatureItem 
            icon="text-box-check-outline" 
            text="Auto-generated subtasks and checklists"
          />
          <FeatureItem 
            icon="calendar-clock" 
            text="Intelligent deadline suggestions"
          />
          <FeatureItem 
            icon="lightbulb-on" 
            text="Task optimization recommendations"
          />
        </View>
        <View style={styles.badge}>
          <MaterialCommunityIcons 
            name="star-shooting" 
            size={20} 
            color="#F59E0B" 
          />
          <Text style={styles.badgeText}>Premium Feature</Text>
        </View>
      </View>
    </View>
  );
};

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <MaterialCommunityIcons 
      name={icon} 
      size={24} 
      color="#3B82F6" 
      style={styles.featureIcon}
    />
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  iconContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    opacity: 0.9,
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: -5,
    opacity: 0.8,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 0,
    left: -5,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  featureList: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    opacity: 0.9,
  },
  featureText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  badgeText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
});

export default ComingSoon;
