import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';

const TaskHeader = ({ 
  task, 
  isEditing, 
  editedTitle, 
  setEditedTitle, 
  onClose,
  titleStyle,
  inputStyle 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.titleContainer}>
          {!isEditing ? (
            <Animated.View style={[styles.titleContainer, titleStyle]}>
              {task.status === 'completed' ? (
                <View style={styles.completedTitleContainer}>
                  <Text style={styles.completedTitle}>
                    {task.title}
                  </Text>
                  <MaterialCommunityIcons 
                    name="check-circle" 
                    size={24} 
                    color="rgba(16, 185, 129, 0.8)"
                    style={styles.completedIcon}
                  />
                </View>
              ) : (
                <View style={styles.activeTitleContainer}>
                  <Text style={styles.title}>
                    {task.title}
                  </Text>
                </View>
              )}
            </Animated.View>
          ) : (
            <Animated.View style={[styles.inputWrapper, inputStyle]}>
              <TextInput
                style={styles.titleInput}
                value={editedTitle}
                onChangeText={setEditedTitle}
                placeholder="Task title"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                multiline={false}
              />
            </Animated.View>
          )}
        </View>
      </View>
      <TouchableOpacity 
        style={styles.headerButton} 
        onPress={onClose}
      >
        <MaterialCommunityIcons name="close" size={22} color="rgba(255, 255, 255, 0.9)" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  titleContainer: {
    width: '100%',
  },
  completedTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '700',
    marginBottom: 6,
    textDecorationLine: 'line-through',
  },
  completedIcon: {
    marginLeft: 12,
    marginTop: 4,
  },
  activeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 6,
  },
  titleInput: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '700',
    padding: 0,
    margin: 0,
  },
  inputWrapper: {
    width: '100%',
  },
});

export default TaskHeader;
