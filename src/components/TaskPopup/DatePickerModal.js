import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePickerModal = ({ 
  showDatePicker,
  datePickerMode,
  tempDate,
  setTempDate,
  setShowDatePicker,
  handleDateConfirm 
}) => {
  if (!showDatePicker) return null;

  return (
    <View style={styles.datePickerOverlay}>
      <View style={styles.datePickerModal}>
        <View style={styles.datePickerHeader}>
          <Text style={styles.datePickerTitle}>
            {datePickerMode === 'date' ? 'Select Date' : 'Select Time'}
          </Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowDatePicker(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>
        </View>

        <DateTimePicker
          testID="dateTimePicker"
          value={tempDate}
          mode={datePickerMode}
          is24Hour={false}
          onChange={(event, date) => {
            if (date) setTempDate(date);
          }}
          display="spinner"
          themeVariant="dark"
        />

        <View style={styles.datePickerActions}>
          <TouchableOpacity 
            style={[styles.datePickerButton, styles.cancelButton]}
            onPress={() => setShowDatePicker(false)}
          >
            <Text style={styles.datePickerButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.datePickerButton, styles.confirmButton]}
            onPress={handleDateConfirm}
          >
            <Text style={[styles.datePickerButtonText, styles.confirmButtonText]}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  datePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: '90%',
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  datePickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
  },
  datePickerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});

export default DatePickerModal;
