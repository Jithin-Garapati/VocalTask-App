import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { TextInput, Text, Button, SegmentedButtons } from 'react-native-paper';
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
          <ScrollView>
            <View style={styles.header}>
              <Text style={styles.headerText}>New Recurring Task</Text>
              <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
                <MaterialCommunityIcons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="What do you want to do?"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              theme={{ colors: { primary: '#fff', text: '#fff' } }}
            />

            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              theme={{ colors: { primary: '#fff', text: '#fff' } }}
            />

            <TextInput
              style={styles.input}
              placeholder="Category (optional)"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={category}
              onChangeText={setCategory}
              mode="outlined"
              theme={{ colors: { primary: '#fff', text: '#fff' } }}
            />

            <Text style={styles.label}>Priority</Text>
            <SegmentedButtons
              value={priority}
              onValueChange={setPriority}
              buttons={PRIORITIES.map(p => ({
                value: p.value,
                label: p.label,
                style: { backgroundColor: p.value === priority ? p.color : 'transparent' }
              }))}
              style={styles.segmentedButtons}
            />

            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialCommunityIcons name="clock-outline" size={24} color="#fff" />
              <Text style={styles.timeText}>
                Remind me at {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Recurrence</Text>
            <SegmentedButtons
              value={recurrencePattern}
              onValueChange={setRecurrencePattern}
              buttons={RECURRENCE_PATTERNS.map(p => ({
                value: p.value,
                label: p.label,
              }))}
              style={styles.segmentedButtons}
            />

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

            <Button
              mode="contained"
              onPress={handleCreateHabit}
              style={styles.createButton}
              labelStyle={styles.buttonText}
            >
              Create Recurring Task
            </Button>
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
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  input: {
    backgroundColor: '#2a2a2a',
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  timeText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  timePicker: {
    backgroundColor: '#2a2a2a',
    marginBottom: 20,
  },
  segmentedButtons: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#007AFF',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NewHabitModal;
