import React from 'react';
import { View, TouchableOpacity, TextInput, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TaskSections = ({ sections, onSectionsChange }) => {
  const handleSectionTitleChange = (sectionIndex, text) => {
    const newSections = [...sections];
    newSections[sectionIndex].content = text;
    onSectionsChange(newSections);
  };

  const handleDeleteSection = (sectionIndex) => {
    const newSections = sections.filter((_, i) => i !== sectionIndex);
    onSectionsChange(newSections);
  };

  const handleSubtaskChange = (sectionIndex, subtaskIndex, text) => {
    const newSections = [...sections];
    newSections[sectionIndex].subtasks[subtaskIndex].content = text;
    onSectionsChange(newSections);
  };

  const handleSubtaskToggle = (sectionIndex, subtaskIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].subtasks[subtaskIndex].completed = 
      !newSections[sectionIndex].subtasks[subtaskIndex].completed;
    onSectionsChange(newSections);
  };

  const handleDeleteSubtask = (sectionIndex, subtaskIndex) => {
    const newSections = [...sections];
    newSections[sectionIndex].subtasks = 
      newSections[sectionIndex].subtasks.filter((_, i) => i !== subtaskIndex);
    onSectionsChange(newSections);
  };

  const handleAddSubtask = (sectionIndex) => {
    const newSections = [...sections];
    if (!newSections[sectionIndex].subtasks) {
      newSections[sectionIndex].subtasks = [];
    }
    newSections[sectionIndex].subtasks.push({
      content: '',
      completed: false
    });
    onSectionsChange(newSections);
  };

  const handleAddSection = () => {
    onSectionsChange([
      ...sections,
      {
        type: 'heading',
        content: '',
        subtasks: []
      }
    ]);
  };

  return (
    <View style={styles.editSection}>
      <Text style={styles.editSectionTitle}>Sections</Text>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <TextInput
              style={styles.sectionTitleInput}
              value={section.content}
              onChangeText={(text) => handleSectionTitleChange(sectionIndex, text)}
              placeholder="Section Title"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
            />
            <TouchableOpacity onPress={() => handleDeleteSection(sectionIndex)}>
              <MaterialCommunityIcons name="close" size={20} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>
          
          {section.subtasks?.map((subtask, subtaskIndex) => (
            <View key={subtaskIndex} style={styles.subtaskRow}>
              <TouchableOpacity
                style={styles.subtaskCheckbox}
                onPress={() => handleSubtaskToggle(sectionIndex, subtaskIndex)}
              >
                <MaterialCommunityIcons
                  name={subtask.completed ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"}
                  size={20}
                  color={subtask.completed ? "#3B82F6" : "rgba(255, 255, 255, 0.5)"}
                />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.subtaskInput,
                  subtask.completed && styles.completedSubtaskInput
                ]}
                value={subtask.content}
                onChangeText={(text) => handleSubtaskChange(sectionIndex, subtaskIndex, text)}
                placeholder="Subtask"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <TouchableOpacity onPress={() => handleDeleteSubtask(sectionIndex, subtaskIndex)}>
                <MaterialCommunityIcons name="close" size={20} color="rgba(255, 255, 255, 0.5)" />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addSubtaskButton}
            onPress={() => handleAddSubtask(sectionIndex)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
            <Text style={styles.addSubtaskText}>Add Subtask</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      <TouchableOpacity
        style={styles.addSectionButton}
        onPress={handleAddSection}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
        <Text style={styles.addSectionText}>Add Section</Text>
      </TouchableOpacity>
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
  sectionContainer: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginRight: 12,
  },
  subtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  subtaskCheckbox: {
    marginRight: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    marginRight: 8,
  },
  completedSubtaskInput: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  addSubtaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  addSubtaskText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
  addSectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addSectionText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TaskSections;
