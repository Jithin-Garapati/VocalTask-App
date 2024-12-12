import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PRIORITIES = [
  { id: 'high', label: 'High', icon: 'flag', color: '#EF4444' },
  { id: 'medium', label: 'Medium', icon: 'flag', color: '#F59E0B' },
  { id: 'low', label: 'Low', icon: 'flag', color: '#10B981' },
];

const PrioritySelector = ({ selectedPriority, onPriorityChange }) => {
  return (
    <View style={styles.editSection}>
      <Text style={styles.editSectionTitle}>Priority</Text>
      <View style={styles.priorityButtons}>
        {PRIORITIES.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.priorityButton,
              selectedPriority === p.id && { 
                backgroundColor: `${p.color}20`,
                borderColor: p.color,
              }
            ]}
            onPress={() => onPriorityChange(p.id)}
          >
            <MaterialCommunityIcons 
              name={p.icon} 
              size={18} 
              color={p.color}
            />
            <Text style={[
              styles.priorityButtonText,
              selectedPriority === p.id && { color: p.color }
            ]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  editSection: {
    marginBottom: 24,
  },
  editSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#fff',
  },
  priorityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priorityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  priorityButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PrioritySelector;
