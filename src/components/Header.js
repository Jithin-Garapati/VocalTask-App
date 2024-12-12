import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform, Animated, Easing } from 'react-native';
import { Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

const Header = ({ 
  showSortMenu, 
  setShowSortMenu, 
  showProfileMenu, 
  setShowProfileMenu,
  setSortBy,
  screenType = 'tasks'
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevScreenType = useRef(screenType);

  useEffect(() => {
    // Reset position based on direction
    const isGoingUp = prevScreenType.current === 'tasks' && screenType === 'habits';
    slideAnim.setValue(isGoingUp ? 40 : -40);
    fadeAnim.setValue(0);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    prevScreenType.current = screenType;
  }, [screenType]);

  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          my{' '}
        </Text>
        <View style={styles.boldTextContainer}>
          <Animated.Text 
            style={[
              styles.headerTitleBold,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            {screenType}
          </Animated.Text>
        </View>
        <View style={styles.headerDot} />
      </View>
      {screenType === 'tasks' && (
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowSortMenu(true)} style={styles.headerButton}>
            <MaterialCommunityIcons name="sort" size={22} color="#fff" opacity={0.9} />
          </TouchableOpacity>
          <Menu
            visible={showSortMenu}
            onDismiss={() => setShowSortMenu(false)}
            anchor={{ x: width - 40, y: 100 }}
          >
            <Menu.Item
              onPress={() => {
                setSortBy('created_at');
                setShowSortMenu(false);
              }}
              title="Date Created"
              leadingIcon="clock-outline"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('priority');
                setShowSortMenu(false);
              }}
              title="Priority"
              leadingIcon="flag"
            />
            <Menu.Item
              onPress={() => {
                setSortBy('due_date');
                setShowSortMenu(false);
              }}
              title="Due Date"
              leadingIcon="calendar"
            />
          </Menu>
          <TouchableOpacity onPress={() => setShowProfileMenu(true)} style={styles.headerButton}>
            <MaterialCommunityIcons name="dots-vertical" size={22} color="#fff" opacity={0.9} />
          </TouchableOpacity>
          <Menu
            visible={showProfileMenu}
            onDismiss={() => setShowProfileMenu(false)}
            anchor={{ x: width - 40, y: 100 }}
          >
            <Menu.Item
              onPress={async () => {
                await supabase.auth.signOut();
                setShowProfileMenu(false);
              }}
              title="Sign Out"
              leadingIcon="logout"
            />
          </Menu>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 20,
    backgroundColor: '#000',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    color: '#fff',
    opacity: 0.6,
  },
  boldTextContainer: {
    height: 40,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  headerTitleBold: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    opacity: 1,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
});

export default Header;