import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

const TaskFooter = ({ 
  isEditing, 
  hasChanges, 
  currentStage,
  circleStyle,
  handleStageChange,
  handleDiscardChanges,
  handleSaveChanges
}) => {
  return (
    <View style={styles.footer}>
      {isEditing && hasChanges ? (
        <View style={styles.editButtons}>
          <TouchableOpacity
            style={[styles.editButton, styles.discardButton]}
            onPress={handleDiscardChanges}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.editButton, styles.saveButton]}
            onPress={handleSaveChanges}
          >
            <MaterialCommunityIcons name="check" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Animated.View style={[styles.stageIndicator, circleStyle]} />
          <View style={styles.stagesContainer}>
            <TouchableOpacity 
              style={[
                styles.stageButton, 
                styles.stageButtonDotted,
                currentStage === 0 && styles.activeStage
              ]} 
              onPress={() => handleStageChange(0)}
            >
              <MaterialCommunityIcons 
                name="eye" 
                size={24} 
                color={currentStage === 0 ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.stageButton, 
                styles.stageButtonDotted,
                currentStage === 1 && styles.activeStage
              ]} 
              onPress={() => handleStageChange(1)}
            >
              <MaterialCommunityIcons 
                name="pencil" 
                size={24} 
                color={currentStage === 1 ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)'} 
              />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.stageButton, 
                styles.stageButtonDotted,
                currentStage === 2 && styles.activeStage
              ]} 
              onPress={() => handleStageChange(2)}
            >
              <MaterialCommunityIcons 
                name="star-four-points" 
                size={24} 
                color={currentStage === 2 ? '#3B82F6' : 'rgba(255, 255, 255, 0.6)'} 
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    minHeight: 80,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
  },
  saveButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  stagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    height: 48,
  },
  stageButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  stageButtonDotted: {
    borderStyle: 'dotted',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeStage: {
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderColor: '#3B82F6',
  },
  stageIndicator: {
    position: 'absolute',
    top: 16,
    left: 48,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
});

export default TaskFooter;
