import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  Easing,
  interpolate,
  useSharedValue,
} from 'react-native-reanimated';
import { 
  DateTimeSelector, 
  PrioritySelector, 
  TaskSections,
  TaskHeader,
  TaskDetails,
  SubtaskList,
  TaskFooter,
  DatePickerModal,
  ComingSoon,
} from './TaskPopup/index';
import { supabase, updateTask } from '../utils/supabase'; // Import supabase instance

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const PRIORITIES = [
  { id: 'high', label: 'High', icon: 'flag', color: '#EF4444' },
  { id: 'medium', label: 'Medium', icon: 'flag', color: '#F59E0B' },
  { id: 'low', label: 'Low', icon: 'flag', color: '#10B981' },
];

const TaskPopup = ({ task, priority, visible, onClose, onEdit, onToggleComplete, onDelete, onUpdateSubtask, theme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDueDate, setEditedDueDate] = useState(new Date());
  const [editedPriority, setEditedPriority] = useState('medium');
  const [editedSections, setEditedSections] = useState([]);
  const [sections, setSections] = useState([]);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(new Date());
  const [currentStage, setCurrentStage] = useState('view');
  const [hasChanges, setHasChanges] = useState(false);

  const circlePosition = useSharedValue(0);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  const titleScale = useSharedValue(1);
  const titleOpacity = useSharedValue(1);
  const inputScale = useSharedValue(0.9);
  const inputOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { 
        duration: 200,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      scale.value = withSpring(1, {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
      });
      rotate.value = withSpring(1, {
        damping: 25,
        stiffness: 400,
      });
    } else {
      opacity.value = withTiming(0, { 
        duration: 150,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      });
      scale.value = withSpring(0.95, {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
      });
      rotate.value = withSpring(0, {
        damping: 25,
        stiffness: 400,
      });
    }
  }, [visible]);

  useEffect(() => {
    if (!task) return;
    
    const hasEdits = 
      editedTitle !== task.title ||
      editedDueDate?.toISOString() !== task.due_date ||
      editedPriority !== priority?.id ||
      JSON.stringify(editedSections) !== task.description;
    
    setHasChanges(hasEdits);
  }, [editedTitle, editedDueDate, editedPriority, editedSections, task, priority]);

  useEffect(() => {
    if (!task) return;
    
    setEditedTitle(task.title || '');
    setEditedDueDate(task.due_date ? new Date(task.due_date) : new Date());
    setEditedPriority(priority?.id || 'medium');
    
    try {
      const parsedSections = JSON.parse(task.description || '[]');
      setEditedSections(parsedSections);
      setSections(parsedSections);

      // Calculate completion percentage
      let total = 0;
      let completed = 0;
      parsedSections.forEach(section => {
        if (section.subtasks) {
          total += section.subtasks.length;
          completed += section.subtasks.filter(st => st.completed).length;
        }
      });
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      setCompletionPercentage(percentage);
    } catch (e) {
      console.error('Error parsing task description:', e);
      setEditedSections([]);
      setSections([]);
      setCompletionPercentage(0);
    }
  }, [task, priority]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const containerStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      rotate.value,
      [0, 1],
      [-5, 0]
    );

    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotation}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const handleDateConfirm = () => {
    setEditedDueDate(tempDate);
    setShowDatePicker(false);
  };

  const handleDatePress = (mode) => {
    setDatePickerMode(mode);
    setTempDate(editedDueDate);
    setShowDatePicker(true);
  };

  const handleEditPress = () => {
    if (isEditing) {
      // Save changes
      onEdit({
        title: editedTitle,
        due_date: editedDueDate.toISOString(),
        priority: editedPriority,
        description: JSON.stringify(editedSections),
      });
    }
    
    // Toggle edit mode animations
    if (!isEditing) {
      titleOpacity.value = withSpring(0);
      titleScale.value = withSpring(0.9);
      inputOpacity.value = withTiming(1);
      inputScale.value = withSpring(1);
    } else {
      titleOpacity.value = withSpring(1);
      titleScale.value = withSpring(1);
      inputOpacity.value = withTiming(0);
      inputScale.value = withSpring(0.9);
    }
    
    setIsEditing(!isEditing);
  };

  const handleStageChange = (stage) => {
    if (stage === 0) {
      setIsEditing(false);
    } else if (stage === 1) {
      setIsEditing(true);
      // Reset edited values to current task values
      setEditedTitle(task.title || '');
      setEditedDueDate(task.due_date ? new Date(task.due_date) : new Date());
      setEditedPriority(priority?.id || 'medium');
      try {
        setEditedSections(JSON.parse(task.description || '[]'));
      } catch (e) {
        setEditedSections([]);
      }
      // Reset hasChanges flag when entering edit mode
      setHasChanges(false);
    } else if (stage === 2) {
      // AI stage
    }
    circlePosition.value = withSpring(stage, {
      mass: 1,
      damping: 20,
      stiffness: 100,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
    setCurrentStage(stage);
  };

  const handleDiscardChanges = () => {
    setIsEditing(false);
    setCurrentStage(0);
    circlePosition.value = withSpring(0, {
      mass: 1,
      damping: 20,
      stiffness: 100,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
    setEditedTitle(task?.title || '');
    setEditedDueDate(task?.due_date ? new Date(task.due_date) : new Date());
    setEditedPriority(priority?.id || 'medium');
    setEditedSections(JSON.parse(task?.description || '[]'));
  };

  const handleSaveChanges = () => {
    onEdit({
      title: editedTitle,
      due_date: editedDueDate.toISOString(),
      priority: editedPriority,
      description: JSON.stringify(editedSections),
    });
    
    // Animate out
    opacity.value = withTiming(0, { 
      duration: 200,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
    scale.value = withSpring(0.95, {
      damping: 20,
      stiffness: 300,
      mass: 0.5,
    });
    
    // Reset states
    setIsEditing(false);
    setCurrentStage(0);
    circlePosition.value = withSpring(0);
    
    // Close after animation
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubtaskUpdate = async (sectionIndex, subtaskIndex, completed) => {
    try {
      const updatedSections = [...sections];
      updatedSections[sectionIndex].subtasks[subtaskIndex].completed = completed;
      setSections(updatedSections);

      // Calculate new completion percentage
      let total = 0;
      let completedCount = 0;
      updatedSections.forEach(section => {
        if (section.subtasks) {
          total += section.subtasks.length;
          completedCount += section.subtasks.filter(st => st.completed).length;
        }
      });
      const newPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      setCompletionPercentage(newPercentage);

      // Update task in Supabase
      await updateTask(task.id, {
        description: JSON.stringify(updatedSections)
      });

      // Call the parent's update handler
      if (onUpdateSubtask) {
        onUpdateSubtask(sectionIndex, subtaskIndex, completed);
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      // Revert the change if update fails
      const revertedSections = [...sections];
      revertedSections[sectionIndex].subtasks[subtaskIndex].completed = !completed;
      setSections(revertedSections);
    }
  };

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ scale: titleScale.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [{ scale: inputScale.value }],
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  }));

  const circleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: interpolate(
          circlePosition.value,
          [0, 1, 2],
          [0, 120, 240]
        )}
      ],
    };
  });

  const handleClose = () => {
    // Reset to view mode if in edit mode
    if (isEditing) {
      setIsEditing(false);
      setCurrentStage(0);
      // Reset animations
      titleOpacity.value = withSpring(1);
      titleScale.value = withSpring(1);
      inputOpacity.value = withTiming(0);
      inputScale.value = withSpring(0.9);
    }
    onClose();
  };

  if (!visible || !task) return null;

  return visible ? (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={1} 
      onPress={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <Animated.View 
        style={[styles.popup, containerStyle]}
        onStartShouldSetResponder={() => true}
        onResponderRelease={(e) => {
          e.stopPropagation();
        }}
      >
        {task && (
          <>
            <TaskHeader
              task={task}
              isEditing={isEditing}
              editedTitle={editedTitle}
              setEditedTitle={setEditedTitle}
              onClose={handleClose}
              titleStyle={titleStyle}
              inputStyle={inputStyle}
            />

            <ScrollView 
              style={styles.content} 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {currentStage === 2 ? (
                <ComingSoon />
              ) : isEditing ? (
                <View style={styles.editContent}>
                  <DateTimeSelector 
                    date={editedDueDate}
                    onDatePress={handleDatePress}
                  />
                  
                  <PrioritySelector
                    selectedPriority={editedPriority}
                    onPriorityChange={setEditedPriority}
                  />
                  
                  <TaskSections
                    sections={editedSections}
                    onSectionsChange={setEditedSections}
                  />
                </View>
              ) : (
                <>
                  <TaskDetails
                    task={task}
                    completionPercentage={completionPercentage}
                  />

                  <SubtaskList
                    sections={sections}
                    onUpdateSubtask={handleSubtaskUpdate}
                  />
                </>
              )}
            </ScrollView>

            <TaskFooter
              isEditing={isEditing}
              hasChanges={hasChanges}
              currentStage={currentStage}
              circleStyle={circleStyle}
              handleStageChange={handleStageChange}
              handleDiscardChanges={handleDiscardChanges}
              handleSaveChanges={handleSaveChanges}
            />

            <DatePickerModal
              showDatePicker={showDatePicker}
              datePickerMode={datePickerMode}
              tempDate={tempDate}
              setTempDate={setTempDate}
              setShowDatePicker={setShowDatePicker}
              handleDateConfirm={handleDateConfirm}
            />
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  ) : null;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  popup: {
    width: '90%',
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: '#121212',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  scrollContent: {
    padding: 20,
  },
  editContent: {
    gap: 24,
  },
});

export default TaskPopup;