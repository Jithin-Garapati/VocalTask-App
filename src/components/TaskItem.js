import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, UIManager } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import { supabase, updateTask } from '../utils/supabase';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TaskItem = ({
  item,
  priority,
  onPress,
  onLongPress,
  onToggleComplete,
  onUpdateSubtask,
  onRefresh,
  theme,
  isActive,
  itemScale,
  itemOpacity,
  isSelected,
  isSelectionMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localDescription, setLocalDescription] = useState([]);
  const rotation = useSharedValue(0);
  const slideY = useSharedValue(-20);
  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);
  const arrowBounce = useSharedValue(1);
  const backdropOpacity = useSharedValue(0);

  const parseDescription = (description) => {
    if (!description) return [];
    
    try {
      const parsed = JSON.parse(description);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [{
        type: 'heading',
        content: 'Tasks',
        subtasks: [{ content: description, completed: false }]
      }];
    } catch (error) {
      return [{
        type: 'heading',
        content: 'Tasks',
        subtasks: [{ content: description, completed: false }]
      }];
    }
  };

  // Update local description when item changes
  useEffect(() => {
    setLocalDescription(parseDescription(item.description));
  }, [item.description]);

  const parsedDescription = localDescription;
  const hasSubtasks = parsedDescription.length > 0 && parsedDescription.some(section => 
    section.subtasks && section.subtasks.length > 0
  );

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    // Bounce the arrow
    arrowBounce.value = withSpring(1.2, {
      damping: 3,
      stiffness: 200,
    }, () => {
      arrowBounce.value = withSpring(1, {
        damping: 10,
        stiffness: 200,
      });
    });

    // Rotate arrow
    rotation.value = withSpring(toValue, {
      damping: 15,
      stiffness: 200,
    });

    // Slide and fade content with backdrop
    slideY.value = withSpring(toValue ? 0 : -20, {
      damping: 15,
      stiffness: 200,
    });
    
    contentOpacity.value = withSpring(toValue, {
      damping: 15,
      stiffness: 200,
    });
    
    contentScale.value = withSpring(toValue ? 1 : 0.9, {
      damping: 15,
      stiffness: 200,
    });

    backdropOpacity.value = withSpring(toValue, {
      damping: 15,
      stiffness: 200,
    });
  };

  const handleSubtaskUpdate = async (sectionIndex, subtaskIndex, completed) => {
    try {
      const updatedDescription = [...localDescription];
      updatedDescription[sectionIndex].subtasks[subtaskIndex].completed = completed;
      setLocalDescription(updatedDescription);

      // Update task in Supabase
      await updateTask(item.id, {
        description: JSON.stringify(updatedDescription)
      });

      // Call the parent's update handler
      if (onUpdateSubtask) {
        onUpdateSubtask(sectionIndex, subtaskIndex, completed);
      }

      // Trigger refresh to update the UI
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
      // Revert the change if update fails
      const revertedDescription = [...localDescription];
      revertedDescription[sectionIndex].subtasks[subtaskIndex].completed = !completed;
      setLocalDescription(revertedDescription);
    }
  };

  const arrowStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          rotate: `${interpolate(
            rotation.value,
            [0, 1],
            [0, 180],
            Extrapolate.CLAMP
          )}deg` 
        },
        { scale: arrowBounce.value }
      ],
    };
  });

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        backdropOpacity.value,
        [0, 1],
        [0, 0.8],
        Extrapolate.CLAMP
      ),
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    const blur = interpolate(
      contentOpacity.value,
      [0, 1],
      [0, 15],
      Extrapolate.CLAMP
    );

    return {
      opacity: contentOpacity.value,
      transform: [
        { translateY: slideY.value },
        { scale: contentScale.value }
      ],
    };
  });

  const dueTextStyle = {
    fontSize: 12,
    color: theme.colors.placeholder,
  };

  return (
    <View style={[
      styles.taskCard,
      {
        backgroundColor: priority ? `${priority.color}10` : '#1A1A1A',
        borderColor: priority ? `${priority.color}20` : 'rgba(255, 255, 255, 0.08)',
      },
      isSelected && styles.selectedCard,
      isExpanded && styles.expandedCard
    ]}>
      <Animated.View style={{ 
        transform: [{ 
          scale: typeof itemScale === 'number' ? itemScale : itemScale?._value ?? 1 
        }],
        opacity: typeof itemOpacity === 'number' ? itemOpacity : itemOpacity?._value ?? 1,
      }}>
        <View style={styles.taskContainer}>
          <TouchableOpacity
            style={styles.taskContent}
            onPress={onPress}
            onLongPress={onLongPress}
            delayLongPress={200}
            activeOpacity={0.7}
          >
            {isSelectionMode ? (
              <MaterialCommunityIcons
                name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                size={22}
                color={theme.colors.primary}
                style={styles.checkbox}
              />
            ) : (
              <TouchableOpacity
                onPress={() => onToggleComplete(item.id, item.status)}
                style={styles.checkboxContainer}
              >
                <MaterialCommunityIcons
                  name={item.status === 'completed' ? 'checkbox-marked-circle-outline' : 'checkbox-blank-outline'}
                  size={22}
                  color={item.status === 'completed' ? '#10B981' : theme.colors.placeholder}
                  style={[styles.checkbox, { borderRadius: 8 }]}
                />
              </TouchableOpacity>
            )}
            
            <View style={styles.taskTextContainer}>
              <View style={styles.taskTitleRow}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.status === 'completed' && styles.completedText,
                  ]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {hasSubtasks && (
                  <TouchableOpacity
                    onPress={toggleExpand}
                    style={styles.expandButton}
                    activeOpacity={0.7}
                  >
                    <Animated.View style={[styles.arrowContainer, arrowStyle]}>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={theme.colors.text}
                        style={styles.arrow}
                      />
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </View>
              {(item.due_date || priority) && (
                <View style={styles.metaContainer}>
                  {item.due_date && (
                    <>
                      <MaterialCommunityIcons
                        name="clock-outline"
                        size={13}
                        color={theme.colors.placeholder}
                        style={styles.metaIcon}
                      />
                      <Text style={dueTextStyle}>
                        {moment(item.due_date).format('MMM D')}
                      </Text>
                    </>
                  )}
                  {priority && (
                    <>
                      <View style={styles.metaDot} />
                      <Text style={[styles.priorityText, { color: priority.color }]}>
                        {priority.label}
                      </Text>
                    </>
                  )}
                </View>
              )}
            </View>
          </TouchableOpacity>

          {isExpanded && hasSubtasks && (
            <Animated.View style={[styles.expandedContent, contentStyle]}>
              <Animated.View style={[styles.backdrop, backdropStyle]} />
              {parsedDescription.map((section, sectionIndex) => (
                section.type === 'heading' && section.subtasks?.length > 0 && (
                  <View key={sectionIndex} style={styles.section}>
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
                            onPress={() => handleSubtaskUpdate(sectionIndex, subtaskIndex, !subtask.completed)}
                            activeOpacity={0.7}
                          >
                            <MaterialCommunityIcons
                              name={subtask.completed ? "checkbox-marked-circle-outline" : "checkbox-blank-outline"}
                              size={20}
                              color={subtask.completed ? "#10B981" : "rgba(255, 255, 255, 0.5)"}
                              style={{ borderRadius: 8 }}
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
                  </View>
                )
              ))}
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  expandedCard: {
    marginBottom: 12,
  },
  taskContainer: {
    padding: 14,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    marginRight: 12,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  expandButton: {
    padding: 6,
    marginRight: -6,
  },
  arrowContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    backgroundColor: 'transparent',
  },
  expandedContent: {
    overflow: 'hidden',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  section: {
    marginBottom: 16,
  },
  sectionContainer: {
    gap: 12,
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
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  subtaskList: {
    gap: 8,
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  completedSubtaskItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  subtaskText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
    fontWeight: '500',
  },
  completedSubtaskText: {
    color: 'rgba(16, 185, 129, 0.8)',
    textDecorationLine: 'line-through',
  },
  selectedCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
});

export default TaskItem;