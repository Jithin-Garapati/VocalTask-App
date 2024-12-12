import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eqyzugckklrtjiwehegd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxeXp1Z2Nra2xydGppd2VoZWdkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4Mjg3MTYsImV4cCI6MjA0ODQwNDcxNn0.BHjBW0wuz8mY1PZPpnUS0BOf0gbxwgwBjcqUmE2PkDU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: { 'Content-Type': 'application/json' },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
  db: {
    schema: 'public',
  },
});

// Helper function to ensure user is authenticated with retry logic
export const ensureAuthenticated = async (retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error(`Authentication attempt ${attempt + 1} failed:`, error);
        if (attempt === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
        continue;
      }
      if (!session) {
        throw new Error('Not authenticated');
      }
      return session;
    } catch (error) {
      if (attempt === retries - 1) throw error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
};

// Wrapper function for database operations with retry logic
const withRetry = async (operation, retries = 3) => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === retries - 1) throw error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
};

// Task-related functions with retry logic
export const getTasks = async (filters = {}) => {
  return withRetry(async () => {
    try {
      const session = await ensureAuthenticated();
      const { data, error } = await supabase
        .rpc('get_tasks', { 
          p_user_id: session.user.id,
          p_status: filters.status,
          p_priority: filters.priority,
          p_section: filters.section,
          p_is_subtask: filters.is_subtask,
          p_parent_id: filters.parent_id,
          p_search: filters.search
        });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  });
};

export const createTask = async (taskData) => {
  return withRetry(async () => {
    try {
      const session = await ensureAuthenticated();
      console.log('Creating task with session:', {
        userId: session.user.id,
        taskData: taskData,
      });
      
      // Create the task object with all required fields
      const newTask = {
        title: taskData.title,
        description: taskData.description || null,
        user_id: session.user.id,
        status: taskData.status || 'active',
        priority: taskData.priority || 'medium',
        section: taskData.section || null,
        is_subtask: taskData.is_subtask || false,
        parent_id: taskData.parent_id || null,
        position: taskData.position || null,
        due_date: taskData.due_date || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Inserting task:', newTask);
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating task:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  });
};

export const updateTask = async (taskId, updates) => {
  return withRetry(async () => {
    try {
      const session = await ensureAuthenticated();
      
      // Ensure status and priority are valid enum values
      const validUpdates = {
        ...updates,
        updated_at: new Date().toISOString(),
        status: updates.status || undefined,
        priority: updates.priority || undefined
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(validUpdates)
        .eq('id', taskId)
        .eq('user_id', session.user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  });
};

export const deleteTask = async (taskId) => {
  return withRetry(async () => {
    try {
      const session = await ensureAuthenticated();
      const { error } = await supabase
        .from('tasks')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .eq('user_id', session.user.id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  });
};