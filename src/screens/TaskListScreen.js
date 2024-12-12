import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Platform, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';
import DraggableFlatList from 'react-native-draggable-flatlist';
import NewTaskModal from '../components/NewTaskModal';
import TaskItem from '../components/TaskItem';
import TaskDetailsModal from '../components/TaskDetailsModal';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import TaskPopup from '../components/TaskPopup';
import HabitsScreen from './HabitsScreen';

const PRIORITIES = [
  { id: 'high', label: 'High', icon: 'flag', color: '#EF4444' },
  { id: 'medium', label: 'Medium', icon: 'flag', color: '#F59E0B' },
  { id: 'low', label: 'Low', icon: 'flag', color: '#10B981' },
];

const TaskListScreen = ({ onTaskComplete }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [dueDate, setDueDate] = useState(new Date());
  const [taskSections, setTaskSections] = useState([{ type: 'title', content: '', id: 'main' }]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [currentInput, setCurrentInput] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showHabitsScreen, setShowHabitsScreen] = useState(false);
  const addButtonScale = useRef(new Animated.Value(1)).current;
  const taskAnimations = useRef(new Map()).current;
  const theme = useTheme();
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // Remove the real-time subscription since we're handling updates optimistically
    return () => {};
  }, []);

  const getTaskAnimation = (taskId) => {
    if (!taskAnimations.has(taskId)) {
      taskAnimations.set(taskId, {
        scale: new Animated.Value(1),
        opacity: new Animated.Value(1)
      });
    }
    return taskAnimations.get(taskId);
  };

  const animateTaskCompletion = async (taskId) => {
    const { scale, opacity } = getTaskAnimation(taskId);
    scale.setValue(1);
    opacity.setValue(1);
    
    return new Promise((resolve) => {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
          bounciness: 12
        }),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }),
          Animated.spring(scale, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
            bounciness: 0
          })
        ])
      ]).start(() => resolve());
    });
  };

  const toggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
      const updatedAt = new Date().toISOString();
      
      // Optimistically update the UI
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? {
                ...task,
                status: newStatus,
                completed_at: newStatus === 'completed' ? updatedAt : null,
                updated_at: updatedAt
              }
            : task
        )
      );

      if (currentStatus !== 'completed') {
        onTaskComplete?.();
        await animateTaskCompletion(taskId);
      }

      // Update database
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          completed_at: newStatus === 'completed' ? updatedAt : null,
          updated_at: updatedAt
        })
        .eq('id', taskId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert the UI state on error
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? {
                ...task,
                status: currentStatus,
                completed_at: currentStatus === 'completed' ? updatedAt : null,
                updated_at: updatedAt
              }
            : task
        )
      );
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!taskName.trim()) {
      Alert.alert('Error', 'Please enter a task name');
      return;
    }

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session) throw new Error('Not authenticated');

      // Create sections array with headings and subtasks
      const sections = [];
      let currentHeading = null;

      taskSections.forEach(section => {
        if (section.type === 'heading') {
          currentHeading = {
            type: 'heading',
            content: section.content,
            subtasks: []
          };
          sections.push(currentHeading);
        } else if (section.type === 'subtask') {
          if (currentHeading) {
            currentHeading.subtasks.push({
              content: section.content,
              completed: false
            });
          } else {
            // Create a default heading if none exists
            currentHeading = {
              type: 'heading',
              content: 'Tasks',
              subtasks: [{
                content: section.content,
                completed: false
              }]
            };
            sections.push(currentHeading);
          }
        }
      });

      const { error } = await supabase
        .from('tasks')
        .insert({
          title: taskName.trim(),
          description: JSON.stringify(sections),
          status: 'active',
          priority: selectedPriority,
          due_date: dueDate.toISOString(),
          user_id: session.user.id,
          section: selectedCategory,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setTaskName('');
      setCurrentInput('');
      setTaskSections([{ type: 'title', content: '', id: 'main' }]);
      setSelectedCategory(null);
      setSelectedPriority('medium');
      setDueDate(new Date());
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating task:', error);
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      setShowTaskPopup(false);
      loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleUpdateSubtask = async (taskId, headingIndex, subtaskIndex, completed) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      let sections = [];
      try {
        sections = JSON.parse(task.description || '[]');
      } catch (e) {
        console.error('Error parsing task description:', e);
        return;
      }

      // Update the specific subtask
      sections[headingIndex].subtasks[subtaskIndex].completed = completed;

      // Calculate new completion percentage
      let total = 0;
      let completedCount = 0;
      sections.forEach(section => {
        if (section.subtasks) {
          total += section.subtasks.length;
          completedCount += section.subtasks.filter(st => st.completed).length;
        }
      });
      const completionPercentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      const { error } = await supabase
        .from('tasks')
        .update({
          description: JSON.stringify(sections),
          updated_at: new Date().toISOString(),
          completion_percentage: completionPercentage
        })
        .eq('id', taskId);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Error updating subtask:', error);
      throw error; // Re-throw to trigger error handling in TaskPopup
    }
  };

  const handleSwitchToHabits = () => {
    setShowHabitsScreen(true);
  };

  const handleSwitchToTasks = () => {
    setShowHabitsScreen(false);
  };

  const filteredTasks = tasks.filter(task => {
    if (task.completed) return false;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return PRIORITIES.findIndex(p => p.id === b.priority) - 
               PRIORITIES.findIndex(p => p.id === a.priority);
      case 'due_date':
        return new Date(a.due_date) - new Date(b.due_date);
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const handleLongPress = (taskId) => {
    setIsSelectionMode(true);
    setSelectedTasks(new Set([taskId]));
  };

  const handleTaskPress = (task) => {
    if (isSelectionMode) {
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(task.id)) {
          newSet.delete(task.id);
          if (newSet.size === 0) {
            setIsSelectionMode(false);
          }
        } else {
          newSet.add(task.id);
        }
        return newSet;
      });
    } else {
      setSelectedTask(task);
      setShowTaskPopup(true);
    }
  };

  const handleEditTask = () => {
    setShowTaskPopup(false);
    setShowTaskDetails(true);
  };

  const handleDeleteSelected = async () => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', Array.from(selectedTasks));

      if (error) throw error;
      
      setSelectedTasks(new Set());
      setIsSelectionMode(false);
      loadTasks();
    } catch (error) {
      console.error('Error deleting tasks:', error);
    }
  };

  const renderTask = useCallback(({ item, drag, isActive }) => {
    const priority = PRIORITIES.find(p => p.id === item.priority);
    const { scale, opacity } = getTaskAnimation(item.id);

    return (
      <TaskItem
        item={item}
        priority={priority}
        onPress={() => handleTaskPress(item)}
        onLongPress={() => {
          if (!isSelectionMode) {
            handleLongPress(item.id);
          } else {
            drag();
          }
        }}
        onToggleComplete={toggleTaskCompletion}
        onUpdateSubtask={handleUpdateSubtask}
        onRefresh={loadTasks}
        theme={theme}
        isActive={isActive}
        scale={scale}
        opacity={opacity}
        isSelected={selectedTasks.has(item.id)}
        isSelectionMode={isSelectionMode}
      />
    );
  }, [theme, isSelectionMode, selectedTasks]);

  const EmptyList = () => (
    <View style={styles.emptyListContent}>
      <MaterialCommunityIcons
        name="check-circle-outline"
        size={80}
        color="rgba(255, 255, 255, 0.1)"
      />
      <Text style={styles.emptyListText}>All caught up!</Text>
      <View style={styles.emptyListAddContainer}>
        <Text style={styles.emptyListSubtext}>Tap</Text>
        <View style={styles.emptyListPlusButton}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
        </View>
        <Text style={styles.emptyListSubtext}>to add a task</Text>
      </View>
    </View>
  );

  const BottomNav = useCallback(() => (
    <View style={styles.bottomNavContainer}>
      <View style={styles.navbarBackground} />
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, showHabitsScreen && styles.activeNavButton]}
          onPress={handleSwitchToHabits}
        >
          <MaterialCommunityIcons 
            name="chart-timeline-variant" 
            size={24} 
            color={showHabitsScreen ? "#007AFF" : "#fff"} 
          />
          <Text style={[styles.navText, showHabitsScreen && styles.activeNavText]}>Habits</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.addButton}
          onPress={showHabitsScreen ? handleSwitchToTasks : () => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.addButtonInner}>
            <MaterialCommunityIcons 
              name={showHabitsScreen ? "home" : "plus"} 
              size={24} 
              color="#fff" 
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton}>
          <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
          <Text style={styles.navText}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [showHabitsScreen]);

  return (
    <View style={styles.container}>
      <Header
        showSortMenu={showSortMenu}
        setShowSortMenu={setShowSortMenu}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        setSortBy={setSortBy}
        screenType={showHabitsScreen ? 'habits' : 'tasks'}
      />

      {showHabitsScreen ? (
        <HabitsScreen onSwitchToTasks={handleSwitchToTasks} />
      ) : (
        <>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            theme={theme}
          />

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

          {tasks.length > 0 && (
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {tasks.filter(t => !t.completed).length} remaining
              </Text>
              <Text style={styles.statsText}>•</Text>
              <Text style={styles.statsText}>
                {tasks.filter(t => t.completed).length} completed
              </Text>
            </View>
          )}

          <DraggableFlatList
            data={filteredTasks}
            renderItem={renderTask}
            keyExtractor={item => item.id.toString()}
            onDragEnd={({ from, to }) => {
              const updated = [...tasks];
              const [item] = updated.splice(from, 1);
              updated.splice(to, 0, item);
              setTasks(updated);
            }}
            contentContainerStyle={[
              styles.listContent,
              tasks.length === 0 && styles.emptyListContent,
              { paddingBottom: 120 } // Increased padding to prevent tasks from showing below navbar
            ]}
            ListEmptyComponent={EmptyList}
          />

          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.9)', '#000']}
            style={styles.fadeGradient}
            pointerEvents="none"
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </>
      )}

      <BottomNav />

      <NewTaskModal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        onCreateTask={handleCreateTask}
        taskName={taskName}
        setTaskName={setTaskName}
        currentInput={currentInput}
        setCurrentInput={setCurrentInput}
        taskSections={taskSections}
        setTaskSections={setTaskSections}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedPriority={selectedPriority}
        setSelectedPriority={setSelectedPriority}
        dueDate={dueDate}
        setDueDate={setDueDate}
      />

      <TaskPopup
        task={selectedTask}
        priority={PRIORITIES.find(p => p.id === selectedTask?.priority)}
        visible={showTaskPopup}
        onClose={() => setShowTaskPopup(false)}
        onEdit={updates => handleUpdateTask(selectedTask.id, updates)}
        onToggleComplete={toggleTaskCompletion}
        onDelete={() => {
          deleteTask(selectedTask.id);
          setShowTaskPopup(false);
        }}
        onUpdateSubtask={handleUpdateSubtask}
        theme={theme}
      />

      <TaskDetailsModal
        task={selectedTask}
        visible={showTaskDetails}
        onDismiss={() => {
          setShowTaskDetails(false);
          setSelectedTask(null);
        }}
        onToggleComplete={toggleTaskCompletion}
        onDelete={deleteTask}
        onUpdate={async (taskId, updates) => {
          try {
            const { error } = await supabase
              .from('tasks')
              .update(updates)
              .eq('id', taskId);

            if (error) throw error;
            loadTasks();
          } catch (error) {
            console.error('Error updating task:', error);
          }
        }}
        theme={theme}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.6,
  },
  listContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 160 : 140,
  },
  emptyListContent: {
    flexGrow: 1,
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
  navbarBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#000',
    zIndex: 0,  
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    zIndex: 2,  
    paddingHorizontal: 30,
    paddingVertical: 20,
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
    width: 70,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 70,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 12,
    borderStyle: 'dotted',
  },
  addButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
  activeNavButton: {
    opacity: 1,
  },
  activeNavText: {
    color: '#007AFF',
    opacity: 1,
  },
  fadeGradient: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    height: 60,
    zIndex: 1,
  },
});

export default TaskListScreen; 