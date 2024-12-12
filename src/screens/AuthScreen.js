import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated,
  Alert,
  Linking,
  KeyboardAvoidingView,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

const { width } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  const parseAuthResponse = (url) => {
    try {
      const fragment = url.split('#')[1];
      if (!fragment) return null;

      const params = new URLSearchParams(fragment);
      return {
        access_token: params.get('access_token'),
        refresh_token: params.get('refresh_token'),
        expires_in: parseInt(params.get('expires_in')),
        token_type: params.get('token_type'),
      };
    } catch (error) {
      console.error('Error parsing auth response:', error);
      return null;
    }
  };

  const handleAuthResponse = async (url) => {
    console.log('Handling auth response URL:', url);
    const params = parseAuthResponse(url);
    
    if (params?.access_token) {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (error) {
          console.error('Error setting session:', error);
          throw error;
        }

        console.log('Session set successfully:', data);
        return data.session;
      } catch (error) {
        console.error('Error in handleAuthResponse:', error);
        Alert.alert('Authentication Error', 'Failed to complete sign in. Please try again.');
      }
    }
    return null;
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 35,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Handle deep linking
    const handleDeepLink = async ({ url }) => {
      console.log('Received deep link:', url);
      if (url) {
        const session = await handleAuthResponse(url);
        if (session) {
          console.log('Authentication successful:', session);
        }
      }
    };

    // Add deep link listener
    Linking.addEventListener('url', handleDeepLink);

    // Check for initial URL
    Linking.getInitialURL().then(url => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      Linking.removeAllListeners('url');
    };
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      // Animate button press
      Animated.sequence([
        Animated.timing(buttonScaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Get the redirect URL based on the environment
      const scheme = 'vocaltask';
      const redirectUrl = Platform.select({
        android: `${scheme}://`,
        ios: `${scheme}://`,
      });

      console.log('Using redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: false,
          scopes: 'email profile',
        },
      });

      if (error) {
        console.error('Auth error:', error);
        Alert.alert('Authentication Error', error.message);
        return;
      }

      if (data?.url) {
        console.log('Opening auth URL:', data.url);
        
        // Set a timeout for the auth process
        const authTimeout = setTimeout(() => {
          WebBrowser.dismissAuthSession();
          Alert.alert(
            'Authentication Timeout',
            'The sign-in process took too long. Please try again.'
          );
        }, 60000); // 1 minute timeout

        try {
          const result = await WebBrowser.openAuthSessionAsync(
            data.url,
            redirectUrl,
            {
              showInRecents: true,
              preferEphemeralSession: true,
            }
          );
          
          // Clear the timeout since we got a response
          clearTimeout(authTimeout);
          
          console.log('Auth result:', result);

          if (result.type === 'success' && result.url) {
            const session = await handleAuthResponse(result.url);
            if (session) {
              console.log('Successfully authenticated:', session);
            }
          } else if (result.type === 'cancel') {
            console.log('Auth cancelled by user');
          }
        } catch (error) {
          clearTimeout(authTimeout);
          console.error('WebBrowser error:', error);
          Alert.alert(
            'Authentication Error',
            'Failed to open authentication window. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      Alert.alert(
        'Authentication Error',
        'Failed to sign in with Google. Please try again.'
      );
    }
  };

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      let { data, error } = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

      if (error) throw error;

      if (isSignUp && data?.user?.identities?.length === 0) {
        Alert.alert('Error', 'Email already registered');
      } else if (isSignUp) {
        Alert.alert('Success', 'Check your email for verification link');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#000000', '#1A1A1A']}
        style={styles.gradient}
      />
      
      <Animated.ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={80}
            color="#fff"
            style={styles.icon}
          />
          <Text style={styles.title}>VocalTask</Text>
          <Text style={styles.subtitle}>
            Your voice-powered task manager
          </Text>
        </View>

        <View style={styles.authContainer}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            theme={{ colors: { primary: '#3B82F6' } }}
          />
          
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            theme={{ colors: { primary: '#3B82F6' } }}
          />

          <TouchableOpacity
            style={[styles.button, styles.emailButton]}
            onPress={handleEmailAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsSignUp(!isSignUp)}
            style={styles.switchButton}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons
                name="google"
                size={20}
                color="#DB4437"
                style={styles.googleIcon}
              />
              <Text style={styles.googleButtonText}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </Animated.ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.7,
  },
  authContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
  },
  button: {
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emailButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  switchText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    height: 48,
    borderRadius: 24,
    marginBottom: 24,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
  termsLink: {
    color: '#3B82F6',
  },
});

export default AuthScreen; 