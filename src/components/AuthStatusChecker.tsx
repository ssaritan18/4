import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getAuthToken } from '../utils/authTokenHelper';

export function AuthStatusChecker() {
  const { isAuthenticated, token } = useAuth();
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getAuthToken();
        setStoredToken(token);
      } catch (error) {
        console.error('Error checking stored token:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkToken();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Checking authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Authentication Status</Text>
      <Text style={styles.text}>Context isAuthenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</Text>
      <Text style={styles.text}>Context token: {token ? '✅ Present' : '❌ Missing'}</Text>
      <Text style={styles.text}>Stored token: {storedToken ? '✅ Present' : '❌ Missing'}</Text>
      
      {!isAuthenticated && (
        <TouchableOpacity 
          style={styles.button}
          onPress={() => {
            console.log('🔍 Debug info:', {
              contextAuth: isAuthenticated,
              contextToken: !!token,
              storedToken: !!storedToken
            });
          }}
        >
          <Text style={styles.buttonText}>Debug Info</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
