import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

const DateTimeSelector = ({ date, onDatePress }) => {
  return (
    <View style={styles.editSection}>
      <Text style={styles.editSectionTitle}>Due Date</Text>
      <View style={styles.dateTimeRow}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => onDatePress('date')}
        >
          <MaterialCommunityIcons 
            name="calendar" 
            size={20} 
            color="#3B82F6" 
          />
          <Text style={styles.dateText}>
            {moment(date).format('MMM D, YYYY')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => onDatePress('time')}
        >
          <MaterialCommunityIcons 
            name="clock-outline" 
            size={20} 
            color="#3B82F6" 
          />
          <Text style={styles.dateText}>
            {moment(date).format('h:mm A')}
          </Text>
        </TouchableOpacity>
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
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DateTimeSelector;
