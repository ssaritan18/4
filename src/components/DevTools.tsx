import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../context/SubscriptionContext';

export function DevTools() {
  const { subscription, upgradeToPremium, cancelSubscription } = useSubscription();

  if (__DEV__) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>🛠️ Dev Tools</Text>
        <Text style={styles.status}>
          Current: {subscription.tier} | Active: {subscription.isActive ? 'Yes' : 'No'}
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={upgradeToPremium}>
          <Text style={styles.buttonText}>Force Premium</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={cancelSubscription}>
          <Text style={styles.buttonText}>Force Free</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return null;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
  },
  title: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    color: '#fff',
    fontSize: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#8B5CF6',
    padding: 5,
    borderRadius: 4,
    marginBottom: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
  },
});