import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import NewHabitModal from '../components/Habits/NewHabitModal';

const HabitsScreen = ({ onSwitchToTasks }) => {
  const [habits, setHabits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHabits(data || []);
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  };

  const handleCreateHabit = async (habit) => {
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .insert([habit])
        .select();

      if (error) throw error;
      loadHabits();
    } catch (error) {
      console.error('Error creating habit:', error);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadHabits();
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  const handleToggleActive = async (id, active) => {
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .update({ active })
        .eq('id', id);

      if (error) throw error;
      loadHabits();
    } catch (error) {
      console.error('Error toggling habit:', error);
    }
  };

  const renderHabit = ({ item }) => {
    const priorityColor = {
      high: '#EF4444',
      medium: '#F59E0B',
      low: '#10B981'
    }[item.priority] || '#F59E0B';

    return (
      <View style={styles.habitItem}>
        <View style={styles.habitContent}>
          <View style={styles.habitHeader}>
            <Text style={styles.habitTitle}>{item.title}</Text>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          </View>
          {item.category && (
            <Text style={styles.habitCategory}>{item.category}</Text>
          )}
          <View style={styles.habitFooter}>
            <View style={styles.habitInfo}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.habitTime}>
                {new Date(`2000-01-01T${item.reminder_time}`).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
            <View style={styles.habitInfo}>
              <MaterialCommunityIcons name="repeat" size={16} color="rgba(255, 255, 255, 0.7)" />
              <Text style={styles.habitRecurrence}>
                {item.recurrence_pattern.charAt(0).toUpperCase() + item.recurrence_pattern.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.habitActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: item.active ? '#10B981' : '#4B5563' }]}
            onPress={() => handleToggleActive(item.id, !item.active)}
          >
            <MaterialCommunityIcons 
              name={item.active ? "play" : "pause"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#991B1B' }]}
            onPress={() => handleDeleteHabit(item.id)}
          >
            <MaterialCommunityIcons name="delete-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={habits}
        renderItem={renderHabit}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={80}
              color="rgba(255, 255, 255, 0.1)"
            />
            <Text style={styles.emptyText}>No recurring tasks yet</Text>
            <Text style={styles.emptySubtext}>
              Add tasks that you want to do regularly
            </Text>
          </View>
        )}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <MaterialCommunityIcons name="plus" size={32} color="#fff" />
      </TouchableOpacity>

      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity 
            style={styles.navButton}
            onPress={() => onSwitchToTasks()}
          >
            <MaterialCommunityIcons name="home" size={24} color="#fff" />
            <Text style={styles.navText}>Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
            <Text style={styles.navText}>Alerts</Text>
          </TouchableOpacity>
        </View>
      </View>

      <NewHabitModal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        onCreateHabit={handleCreateHabit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  listContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 160 : 140,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  habitContent: {
    flex: 1,
  },
  habitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  habitTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  habitCategory: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 8,
  },
  habitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  habitTime: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 14,
    marginLeft: 4,
  },
  habitRecurrence: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 14,
    marginLeft: 4,
  },
  habitActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 16,
    textAlign: 'center',
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 32,
    height: 64,
    paddingHorizontal: 24,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    width: 72,
  },
  navText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.7,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 120,
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HabitsScreen;
