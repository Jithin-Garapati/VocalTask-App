import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RECURRENCE_PATTERNS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const PRIORITIES = [
  { value: 'high', label: 'High', color: '#EF4444' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'low', label: 'Low', color: '#10B981' },
];

const NewHabitModal = ({ visible, onDismiss, onCreateHabit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [time, setTime] = useState(new Date());
  const [recurrencePattern, setRecurrencePattern] = useState('daily');
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleCreateHabit = () => {
    if (!title.trim()) return;
    onCreateHabit({
      title: title.trim(),
      description: description ? JSON.stringify([{ type: 'text', content: description }]) : null,
      category: category.trim() || null,
      priority,
      reminder_time: time.toTimeString().split(' ')[0],
      recurrence_pattern: recurrencePattern,
      start_date: new Date().toISOString().split('T')[0],
      active: true
    });
    resetForm();
    onDismiss();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setPriority('medium');
    setTime(new Date());
    setRecurrencePattern('daily');
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      transparent
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerText}>New Habit</Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="rgba(255, 255, 255, 0.7)" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="What do you want to do?"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={title}
              onChangeText={setTitle}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor="#fff"
              theme={{ colors: { primary: '#fff', text: '#fff' } }}
            />

            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Description (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={description}
              onChangeText={setDescription}
              mode="flat"
              multiline
              numberOfLines={3}
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor="#fff"
              theme={{ colors: { primary: '#fff', text: '#fff' } }}
            />

            <TextInput
              style={styles.input}
              placeholder="Category (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={category}
              onChangeText={setCategory}
              mode="flat"
              underlineColor="transparent"
              activeUnderlineColor="transparent"
              textColor="#fff"
              theme={{ colors: { primary: '#fff', text: '#fff' } }}
            />

            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityContainer}>
              {PRIORITIES.map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    priority === p.value && { backgroundColor: p.color }
                  ]}
                  onPress={() => setPriority(p.value)}
                >
                  <Text style={[
                    styles.priorityText,
                    priority === p.value && styles.priorityTextSelected
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialCommunityIcons name="clock-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.timeText}>
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Recurrence</Text>
            <View style={styles.recurrenceContainer}>
              {RECURRENCE_PATTERNS.map(p => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.recurrenceButton,
                    recurrencePattern === p.value && styles.recurrenceButtonSelected
                  ]}
                  onPress={() => setRecurrencePattern(p.value)}
                >
                  <Text style={[
                    styles.recurrenceText,
                    recurrencePattern === p.value && styles.recurrenceTextSelected
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {(showTimePicker || Platform.OS === 'ios') && (
              <DateTimePicker
                value={time}
                mode="time"
                is24Hour={false}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                style={styles.timePicker}
                textColor="#fff"
              />
            )}

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateHabit}
            >
              <Text style={styles.createButtonText}>Create Habit</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#000',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  input: {
    backgroundColor: '#111',
    marginBottom: 16,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  priorityButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  priorityText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  priorityTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
    gap: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
  },
  recurrenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  recurrenceButton: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recurrenceButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  recurrenceText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  recurrenceTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timePicker: {
    height: 180,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewHabitModal;
