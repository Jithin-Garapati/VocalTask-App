import React, { useState } from 'react';
import { View, ScrollView, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Modal, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

const TaskDetailsModal = ({ 
  task, 
  visible, 
  onDismiss, 
  onToggleComplete,
  onDelete,
  onUpdate,
  theme 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task?.title || '');
  const [editedDescription, setEditedDescription] = useState(task?.description || '');

  const handleSave = () => {
    onUpdate(task.id, {
      title: editedTitle,
      description: editedDescription,
      updated_at: new Date().toISOString()
    });
    setIsEditing(false);
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <IconButton
            icon="close"
            size={24}
            iconColor="#fff"
            onPress={onDismiss}
          />
          {isEditing ? (
            <View style={styles.editActions}>
              <IconButton
                icon="close"
                size={24}
                iconColor="#fff"
                onPress={() => {
                  setIsEditing(false);
                  setEditedTitle(task.title);
                  setEditedDescription(task.description);
                }}
              />
              <IconButton
                icon="check"
                size={24}
                iconColor="#3B82F6"
                onPress={handleSave}
              />
            </View>
          ) : (
            <IconButton
              icon="pencil"
              size={24}
              iconColor="#3B82F6"
              onPress={() => setIsEditing(true)}
            />
          )}
        </View>

        <ScrollView style={styles.modalScroll}>
          {isEditing ? (
            <>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Task Title"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
              />
              <TextInput
                style={styles.descriptionInput}
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Task Description"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline
                textAlignVertical="top"
              />
            </>
          ) : (
            <>
              <Text style={styles.modalTitle}>{task.title}</Text>
              {task.description && (
                <View style={styles.descriptionContainer}>
                  {task.description.split('\n').map((line, index) => (
                    <View key={index} style={styles.descriptionLine}>
                      <MaterialCommunityIcons 
                        name="minus" 
                        size={16} 
                        color="rgba(255, 255, 255, 0.3)" 
                        style={styles.bulletPoint}
                      />
                      <Text style={styles.descriptionText}>{line}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          <View style={styles.timelineSection}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <View style={styles.timelineList}>
              {task.completed_at && (
                <View style={styles.timelineItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
                  <Text style={styles.timelineText}>
                    Completed {moment(task.completed_at).format('MMM D, h:mm A')}
                  </Text>
                </View>
              )}
              <View style={styles.timelineItem}>
                <MaterialCommunityIcons name="clock-outline" size={20} color="#fff" />
                <Text style={styles.timelineText}>
                  Due {moment(task.due_date).format('MMM D, h:mm A')}
                </Text>
              </View>
              <View style={styles.timelineItem}>
                <MaterialCommunityIcons name="plus-circle" size={20} color="#fff" />
                <Text style={styles.timelineText}>
                  Created {moment(task.created_at).format('MMM D, h:mm A')}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={() => {
              onToggleComplete(task.id, task.status);
              onDismiss();
            }}
          >
            <MaterialCommunityIcons
              name={task.status === 'completed' ? 'refresh' : 'check'}
              size={24}
              color="#fff"
            />
            <Text style={styles.actionButtonText}>
              {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => {
              onDelete(task.id);
              onDismiss();
            }}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Delete Task</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#000',
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: '80%',
    overflow: 'hidden',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    padding: 0,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    marginRight: 8,
    marginTop: 4,
  },
  descriptionText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    flex: 1,
    lineHeight: 24,
  },
  descriptionInput: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    lineHeight: 24,
    minHeight: 120,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  timelineSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
    opacity: 0.9,
  },
  timelineList: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  modalActions: {
    padding: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  completeButton: {
    backgroundColor: '#3B82F6',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailsModal; 