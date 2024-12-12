import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Keyboard,
  Animated,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

const CATEGORIES = [
  { id: 'work', label: 'Work', color: '#EF4444' },
  { id: 'personal', label: 'Personal', color: '#3B82F6' },
  { id: 'shopping', label: 'Shopping', color: '#10B981' },
  { id: 'health', label: 'Health', color: '#8B5CF6' },
];

const PRIORITIES = [
  { id: 'high', label: 'High', icon: 'flag', color: '#EF4444' },
  { id: 'medium', label: 'Medium', icon: 'flag', color: '#F59E0B' },
  { id: 'low', label: 'Low', icon: 'flag', color: '#10B981' },
];

const NewTaskModal = ({
  visible,
  onDismiss,
  onCreateTask,
  taskName,
  setTaskName,
  currentInput,
  setCurrentInput,
  taskSections,
  setTaskSections,
  selectedCategory,
  setSelectedCategory,
  selectedPriority,
  setSelectedPriority,
  dueDate,
  setDueDate,
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const contentInputRef = useRef(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  const rotationValues = useRef({}).current;
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const toggleSection = (headingId) => {
    setCollapsedSections(prev => ({
      ...prev,
      [headingId]: !prev[headingId]
    }));
  };

  const getRotationValue = (headingId) => {
    if (!rotationValues[headingId]) {
      rotationValues[headingId] = new Animated.Value(0);
    }
    return rotationValues[headingId];
  };

  const handleLongPress = (sectionId) => {
    setIsSelectionMode(true);
    setSelectedTasks(new Set([sectionId]));
  };

  const handlePress = (sectionId) => {
    if (isSelectionMode) {
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(sectionId)) {
          newSet.delete(sectionId);
          if (newSet.size === 0) {
            setIsSelectionMode(false);
          }
        } else {
          newSet.add(sectionId);
        }
        return newSet;
      });
    }
  };

  const handleDeleteSelected = () => {
    setTaskSections(prev => prev.filter(section => !selectedTasks.has(section.id)));
    setSelectedTasks(new Set());
    setIsSelectionMode(false);
    contentInputRef.current?.focus();
  };

  const renderSections = () => {
    let currentHeading = null;
    let sections = [];

    taskSections.forEach((section, index) => {
      if (section.type === 'heading') {
        if (currentHeading) {
          sections.push(currentHeading);
        }
        currentHeading = {
          heading: section,
          subtasks: []
        };
      } else if (section.type === 'subtask' && currentHeading) {
        currentHeading.subtasks.push(section);
      } else if (section.type === 'subtask') {
        sections.push({ heading: null, subtasks: [section] });
      }
    });

    if (currentHeading) {
      sections.push(currentHeading);
    }

    return (
      <>
        {isSelectionMode && (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionText}>
              {selectedTasks.size} selected
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteSelected}
            >
              <MaterialCommunityIcons name="delete" size={24} color="#EF4444" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        {sections.map((group, groupIndex) => (
          <View key={group.heading?.id || `group-${groupIndex}`}>
            {group.heading && (
              <TouchableOpacity
                style={[
                  styles.section,
                  styles.headingSection,
                  selectedTasks.has(group.heading.id) && styles.selectedSection
                ]}
                onPress={() => {
                  if (isSelectionMode) {
                    handlePress(group.heading.id);
                  } else {
                    toggleSection(group.heading.id);
                  }
                }}
                onLongPress={() => handleLongPress(group.heading.id)}
                delayLongPress={200}
              >
                <View style={styles.headingContent}>
                  {isSelectionMode && (
                    <MaterialCommunityIcons
                      name={selectedTasks.has(group.heading.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                      size={24}
                      color="#3B82F6"
                    />
                  )}
                  <MaterialCommunityIcons 
                    name="format-header-1" 
                    size={24} 
                    color="#3B82F6" 
                  />
                  <TextInput
                    style={[styles.sectionInput, styles.headingInput]}
                    value={group.heading.content}
                    onChangeText={(text) => {
                      setTaskSections(prev => 
                        prev.map(s => s.id === group.heading.id ? { ...s, content: text } : s)
                      );
                    }}
                  />
                </View>
                {!isSelectionMode && (
                  <View style={styles.headingActions}>
                    <TouchableOpacity 
                      onPress={() => {
                        setTaskSections(prev => prev.filter(s => s.id !== group.heading.id));
                        contentInputRef.current?.focus();
                      }}
                    >
                      <MaterialCommunityIcons name="close" size={20} color="rgba(255, 255, 255, 0.5)" />
                    </TouchableOpacity>
                    <Animated.View style={{
                      transform: [{
                        rotate: getRotationValue(group.heading.id).interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg']
                        })
                      }]
                    }}>
                      <MaterialCommunityIcons 
                        name="chevron-down" 
                        size={24} 
                        color="rgba(255, 255, 255, 0.5)" 
                      />
                    </Animated.View>
                  </View>
                )}
              </TouchableOpacity>
            )}
            {(!group.heading || !collapsedSections[group.heading.id]) && group.subtasks.map(subtask => (
              <TouchableOpacity
                key={subtask.id}
                style={[
                  styles.section,
                  styles.subtaskSection,
                  selectedTasks.has(subtask.id) && styles.selectedSection
                ]}
                onPress={() => {
                  if (isSelectionMode) {
                    handlePress(subtask.id);
                  }
                }}
                onLongPress={() => handleLongPress(subtask.id)}
                delayLongPress={200}
              >
                {isSelectionMode ? (
                  <MaterialCommunityIcons
                    name={selectedTasks.has(subtask.id) ? "checkbox-marked" : "checkbox-blank-outline"}
                    size={24}
                    color="#3B82F6"
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => {
                      setTaskSections(prev => 
                        prev.map(s => s.id === subtask.id ? { ...s, completed: !s.completed } : s)
                      );
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={subtask.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                      size={20} 
                      color="#3B82F6"
                    />
                  </TouchableOpacity>
                )}
                <TextInput
                  style={[
                    styles.sectionInput,
                    styles.subtaskInput,
                    subtask.completed && styles.completedInput
                  ]}
                  value={subtask.content}
                  onChangeText={(text) => {
                    setTaskSections(prev => 
                      prev.map(s => s.id === subtask.id ? { ...s, content: text } : s)
                    );
                  }}
                />
                {!isSelectionMode && (
                  <TouchableOpacity 
                    onPress={() => {
                      setTaskSections(prev => prev.filter(s => s.id !== subtask.id));
                      contentInputRef.current?.focus();
                    }}
                  >
                    <MaterialCommunityIcons name="close" size={20} color="rgba(255, 255, 255, 0.5)" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </>
    );
  };

  const handleAddSection = (type) => {
    if (!currentInput.trim()) return;
    
    const newSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: currentInput.trim()
    };
    
    setTaskSections(prev => [...prev, newSection]);
    setCurrentInput('');
    
    // Keep keyboard open and focus on input
    setTimeout(() => {
      contentInputRef.current?.focus();
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onDismiss}
      animationType="slide"
      transparent={true}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.container}>
          <ScrollView 
            style={styles.content}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
          >
            <Text style={styles.title}>New Task</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Task Name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={taskName}
              onChangeText={setTaskName}
              returnKeyType="next"
              onSubmitEditing={() => contentInputRef.current?.focus()}
            />

            <TextInput
              ref={contentInputRef}
              style={styles.input}
              placeholder="Add content..."
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={currentInput}
              onChangeText={setCurrentInput}
              returnKeyType="done"
              onSubmitEditing={() => handleAddSection('heading')}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.button, styles.headingButton]}
                onPress={() => handleAddSection('heading')}
              >
                <MaterialCommunityIcons 
                  name="format-header-1" 
                  size={24} 
                  color="#3B82F6" 
                />
                <Text style={[styles.buttonText, styles.headingButtonText]}>
                  Heading
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.subtaskButton]}
                onPress={() => handleAddSection('subtask')}
              >
                <MaterialCommunityIcons 
                  name="checkbox-blank-circle-outline" 
                  size={24} 
                  color="#3B82F6" 
                />
                <Text style={styles.buttonText}>
                  Subtask
                </Text>
              </TouchableOpacity>
            </View>

            {renderSections()}

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map(category => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={[
                    styles.category,
                    selectedCategory === category.id && styles.selectedCategory
                  ]}
                >
                  <Text style={styles.categoryText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(priority => (
                <TouchableOpacity
                  key={priority.id}
                  onPress={() => setSelectedPriority(priority.id)}
                  style={[
                    styles.priority,
                    selectedPriority === priority.id && styles.selectedPriority
                  ]}
                >
                  <MaterialCommunityIcons
                    name={priority.icon}
                    size={20}
                    color={selectedPriority === priority.id ? '#fff' : 'rgba(255, 255, 255, 0.7)'}
                  />
                  <Text style={styles.priorityText}>{priority.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialCommunityIcons name="calendar" size={20} color="#3B82F6" />
              <Text style={styles.dateText}>
                {moment(dueDate).format('MMM D, h:mm A')}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="datetime"
                is24Hour={false}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDueDate(selectedDate);
                  }
                }}
              />
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Button 
              mode="text" 
              onPress={() => {
                Keyboard.dismiss();
                onDismiss();
              }}
            >
              Cancel
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => {
                Keyboard.dismiss();
                onCreateTask();
              }} 
              disabled={!taskName.trim()}
              style={{
                backgroundColor: 'transparent',
                borderWidth: 2,
                borderColor: !taskName.trim() ? '#4B5563' : '#3B82F6',
                borderRadius: 12,
                shadowColor: !taskName.trim() ? '#4B5563' : '#3B82F6',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: !taskName.trim() ? 0 : 6,
              }}
              labelStyle={{
                color: !taskName.trim() ? '#4B5563' : '#3B82F6',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Create Task
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#000',
    margin: 20,
    borderRadius: 16,
    height: '80%',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headingButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  subtaskButton: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  headingButtonText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  subtaskSection: {
    marginLeft: 24,
    backgroundColor: 'rgba(26, 26, 26, 0.5)',
  },
  checkbox: {
    padding: 4,
  },
  sectionInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    padding: 0,
  },
  headingInput: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
  },
  subtaskInput: {
    fontSize: 16,
    opacity: 0.9,
  },
  completedInput: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    marginTop: 20,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  category: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategory: {
    backgroundColor: '#3B82F6',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priority: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  selectedPriority: {
    backgroundColor: '#3B82F6',
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
  },
  dateText: {
    color: '#fff',
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#000',
  },
  headingSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  headingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  selectedSection: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
  },
  selectionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewTaskModal; 