import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../services/firebase'; // adjust import path if needed
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';

// Register the redirect URI handler for web browser redirects
WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');

  // Access the Google Client ID from environment variables
  const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: googleClientId,
    webClientId: googleClientId,
    // You can add these if you need platform-specific client IDs
    // androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    // iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  });

  /* ────────── Google OAuth Response Handling ────────── */
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken) {
        handleGoogleSignIn(authentication.accessToken);
      }
    }
  }, [response]);

  const handleGoogleSignIn = async (accessToken: string) => {
    try {
      const credential = GoogleAuthProvider.credential(null, accessToken);
      await signInWithCredential(auth, credential);
    } catch (err: any) {
      Alert.alert('Google sign‑in failed', err.message);
    }
  };

  /* ────────── Email / Password ────────── */
  const emailLogin = async () => {
    if (!email || !pw) return Alert.alert('Oops', 'Enter both e‑mail and password.');
    
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pw);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email.trim(), pw);
        } catch (createErr: any) {
          Alert.alert('Error', createErr.message);
        }
      } else {
        Alert.alert('Error', err.message);
      }
    }
  };

  /* ────────── Google OAuth (using updated API) ────────── */
  const googleLogin = async () => {
    if (!googleClientId) {
      return Alert.alert('Missing client ID', 'Add EXPO_PUBLIC_GOOGLE_CLIENT_ID to .env');
    }
    
    await promptAsync();
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="e‑mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="password"
        value={pw}
        onChangeText={setPw}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Email Log‑in / Sign‑up" onPress={emailLogin} />
      <View style={{ height: 12 }} />
      <Button 
        title="Continue with Google" 
        onPress={googleLogin}
        disabled={!request}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },
});