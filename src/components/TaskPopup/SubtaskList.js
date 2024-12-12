import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SubtaskList = ({ sections, onUpdateSubtask }) => {
  return (
    <>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {section.type === 'heading' && section.subtasks?.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.headingContainer}>
                <Text style={styles.headingDash}>-</Text>
                <Text style={styles.sectionTitle}>
                  {section.content}
                </Text>
              </View>
              <View style={styles.subtaskList}>
                {section.subtasks.map((subtask, subtaskIndex) => (
                  <TouchableOpacity 
                    key={subtaskIndex}
                    style={[
                      styles.subtaskItem,
                      subtask.completed && styles.completedSubtaskItem
                    ]}
                    onPress={() => onUpdateSubtask(sectionIndex, subtaskIndex, !subtask.completed)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons 
                      name={subtask.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                      size={22} 
                      color={subtask.completed ? "#10B981" : "rgba(255, 255, 255, 0.5)"}
                      style={styles.checkIcon}
                    />
                    <Text style={[
                      styles.subtaskText,
                      subtask.completed && styles.completedSubtaskText
                    ]}>
                      {subtask.content}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionContainer: {
    gap: 16,
  },
  headingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  headingDash: {
    fontSize: 12,
    color: '#3B82F6',
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtaskList: {
    gap: 12,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkIcon: {
    marginRight: 4,
  },
  completedSubtaskItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  subtaskText: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
  completedSubtaskText: {
    color: 'rgba(16, 185, 129, 0.8)',
    textDecorationLine: 'line-through',
  },
});

export default SubtaskList;
