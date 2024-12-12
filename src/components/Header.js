import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

const Header = ({ 
  showSortMenu, 
  setShowSortMenu, 
  showProfileMenu, 
  setShowProfileMenu,
  setSortBy 
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          my <Text style={styles.headerTitleBold}>tasks</Text>
        </Text>
        <View style={styles.headerDot} />
      </View>
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

        <TouchableOpacity 
          onPress={() => setShowProfileMenu(true)} 
          style={styles.headerButton}
        >
          <MaterialCommunityIcons name="account-circle" size={24} color="#fff" opacity={0.9} />
        </TouchableOpacity>
        <Menu
          visible={showProfileMenu}
          onDismiss={() => setShowProfileMenu(false)}
          anchor={{ x: width - 20, y: 100 }}
        >
          <Menu.Item
            onPress={() => {
              setShowProfileMenu(false);
              supabase.auth.signOut();
            }}
            title="Sign Out"
            leadingIcon="logout"
          />
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#fff',
    letterSpacing: -0.5,
    opacity: 0.9,
  },
  headerTitleBold: {
    fontWeight: '700',
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3B82F6',
    marginLeft: 4,
    marginTop: -16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
  },
});

export default Header; 