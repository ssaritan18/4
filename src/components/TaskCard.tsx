import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { ProgressBar } from "./ProgressBar";
import { Ionicons } from "@expo/vector-icons";
import { MockInterstitialAd } from "./MockInterstitialAd";

export function TaskCard({ task, onIncrement, onDelete, onDrag }: { task: any; onIncrement: () => void; onDelete: () => void; onDrag?: () => void }) {
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(false);
  
  const ratio = task.goal ? task.progress / task.goal : 0;
  const completed = ratio >= 1;
  
  const handleIncrement = () => {
    const willBeCompleted = task.goal ? (task.progress + 1) / task.goal >= 1 : false;
    const wasAlreadyCompleted = completed;
    
    // Call the original increment
    onIncrement();
    
    // Show interstitial ad if task just got completed (not if already completed)
    if (willBeCompleted && !wasAlreadyCompleted) {
      setTimeout(() => {
        setShowInterstitial(true);
      }, 500); // Small delay after celebration animation
    }
  };
  
  return (
    <LinearGradient
      colors={completed ? ['rgba(16, 185, 129, 0.1)', 'rgba(52, 211, 153, 0.1)'] : ['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
      style={styles.card}
    >
      <TouchableOpacity onLongPress={onDrag} delayLongPress={200} style={styles.dragHandle}>
        <Ionicons name="reorder-three" color="rgba(255,255,255,0.6)" size={22} />
      </TouchableOpacity>
      
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          {completed ? (
            <View style={styles.completedBadge}>
              <Ionicons name="trophy" size={16} color="#FFB347" />
            </View>
          ) : null}
          <Text style={styles.title}>{task.title}</Text>
        </View>
        
        {/* Modern Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar 
            progress={ratio} 
            color={completed ? "#10B981" : "#8B5CF6"}
            backgroundColor={completed ? "rgba(16, 185, 129, 0.2)" : "rgba(139, 92, 246, 0.2)"}
            height={8}
            style={styles.progressBar}
          />
        </View>
        
        <Text style={styles.meta}>
          {task.progress} / {task.goal} • {Math.round(ratio * 100)}% complete
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleIncrement}>
          <LinearGradient 
            colors={['#8B5CF6', '#A855F7']} 
            style={styles.actionBtn}
          >
            <Ionicons name="add" color="#fff" size={18} />
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onDelete}>
          <LinearGradient 
            colors={['#EF4444', '#F87171']} 
            style={styles.actionBtn}
          >
            <Ionicons name="trash" color="#fff" size={18} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      
      {/* Achievement Interstitial Ad */}
      <MockInterstitialAd
        visible={showInterstitial}
        onClose={() => setShowInterstitial(false)}
        adType="achievement"
        context={{
          taskName: task.title
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { 
    borderRadius: 16, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: "row", 
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  title: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700",
    flex: 1,
  },
  meta: { 
    color: "#E5E7EB", 
    marginTop: 8, 
    fontSize: 12,
    fontWeight: '500',
  },
  completedBadge: {
    backgroundColor: 'rgba(255, 179, 71, 0.2)',
    borderRadius: 12,
    padding: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 71, 0.4)',
  },
  progressContainer: {
    marginBottom: 4,
  },
  progressBar: {
    borderRadius: 4,
  },
  actions: { 
    marginLeft: 12, 
    gap: 8, 
    flexDirection: 'row' 
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: { 
    paddingHorizontal: 8, 
    marginRight: 8,
    paddingVertical: 4,
  },
});