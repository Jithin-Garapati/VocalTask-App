import React, { useEffect, useRef, useState } from 'react';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { supabase } from './src/utils/supabase';
import TaskListScreen from './src/screens/TaskListScreen';
import AuthScreen from './src/screens/AuthScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    accent: '#60A5FA',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F8FAFC',
    placeholder: '#64748B',
    success: '#10B981',
    error: '#EF4444',
  },
};

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sound = useRef(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("Session error:", sessionError);
          setError(sessionError.message);
        }
        console.log("Current session:", session);
        setSession(session);
      } catch (err) {
        console.error("Auth initialization error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log("Auth state changed:", event, session);
        setSession(session);
      } catch (err) {
        console.error("Auth state change error:", err);
        setError(err.message);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setupAudio();
    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const setupAudio = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
        });
      }

      const { sound: taskSound } = await Audio.Sound.createAsync(
        require('./assets/task-complete.mp3'),
        { shouldPlay: false }
      );
      sound.current = taskSound;
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const playCompletionSound = async () => {
    try {
      if (sound.current) {
        if (Platform.OS === 'ios') {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
          });
        }
        await sound.current.setPositionAsync(0);
        await sound.current.playAsync();
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <StatusBar style="light" />
        <View style={styles.container}>
          {session && session.user ? (
            <TaskListScreen onTaskComplete={playCompletionSound} session={session} />
          ) : (
            <AuthScreen />
          )}
        </View>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
