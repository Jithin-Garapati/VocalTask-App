import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import moment from 'moment';

const TaskDetails = ({ task, completionPercentage }) => {
  return (
    <View style={styles.detailsSection}>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons 
            name="calendar-clock" 
            size={18} 
            color="#3B82F6"
          />
          <View>
            <Text style={styles.detailLabel}>Due Date</Text>
            <Text style={styles.detailText}>
              {moment(task.due_date).format('MMM D, h:mm A')}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons 
            name="clock-check-outline" 
            size={18} 
            color="#3B82F6"
          />
          <View>
            <Text style={styles.detailLabel}>Created</Text>
            <Text style={styles.detailText}>
              {moment(task.created_at).format('MMM D, h:mm A')}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons 
            name="progress-check" 
            size={18} 
            color="#3B82F6"
          />
          <View>
            <Text style={styles.detailLabel}>Progress</Text>
            <Text style={styles.detailText}>
              {completionPercentage}% Complete
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { 
              width: `${completionPercentage}%`,
              backgroundColor: "#3B82F6" 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsSection: {
    marginBottom: 20,
    opacity: 0.85,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default TaskDetails;
