import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Modal, Alert, ScrollView } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { useTasks } from "../../src/context/TasksContext";
import { useAuth } from "../../src/context/AuthContext";
import { TaskCard } from "../../src/components/TaskCard";
import { ProgressBar } from "../../src/components/ProgressBar";
import { Ionicons } from "@expo/vector-icons";
import { Celebration } from "../../src/components/Celebration";
import { Confetti } from "../../src/components/Confetti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SegmentedProgressBar } from "../../src/components/SegmentedProgressBar";
import { FocusModeTimer } from "../../src/components/FocusModeTimer";
import { WeeklyChallenges } from "../../src/components/WeeklyChallenges";
import { FocusSessionTracker } from "../../src/components/FocusSessionTracker";
import { EnhancedCelebration } from "../../src/components/EnhancedCelebration";
import { AchievementBadge } from "../../src/components/AchievementBadge";
import { StreakVisualization } from "../../src/components/StreakVisualization";
import { MoodTracker } from "../../src/components/MoodTracker";
import { MockAdBanner } from "../../src/components/MockAdBanner";
import { RewardedAdBanner } from "../../src/components/RewardedAdBanner";
import { useChallenges } from "../../src/hooks/useChallenges";
import { useFocusSession } from "../../src/hooks/useFocusSession";
import { usePoints } from "../../src/hooks/usePoints";
import { useAchievements } from "../../src/hooks/useAchievements";
import { useStreak } from "../../src/hooks/useStreak";
import { router } from "expo-router";

const COLOR_PRESETS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];

export default function HomeScreen() {
  console.log("🏠 HomeScreen rendering...");

  const { tasks, addTask, remove, increment } = useTasks();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [newTask, setNewTask] = useState("");
  const [taskGoal, setTaskGoal] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEnhancedCelebration, setShowEnhancedCelebration] = useState(false);
  
  // Home page navigation state
  const [activeTab, setActiveTab] = useState<'daily-tools' | 'self-check'>('daily-tools');

  // Hooks for dashboard features
  const { challenges, completeChallenge } = useChallenges();
  const { currentSession, startSession, endSession } = useFocusSession();
  const { pointsData } = usePoints();
  const { achievements } = useAchievements();
  const { streak } = useStreak();
  
  // Extract values from hooks
  const isSessionActive = !!currentSession;
  const totalPoints = pointsData?.total_points || 0;
  const todayPoints = pointsData?.breakdown?.tasks || 0;
  const recentAchievements = achievements.filter(a => a.unlocked).slice(0, 3);
  const currentStreak = streak;
  const bestStreak = streak; // Simplified for now

  // Task statistics
  const stats = useMemo(() => {
    const completed = tasks.filter(t => t.progress >= t.goal).length;
    const inProgress = tasks.filter(t => t.progress > 0 && t.progress < t.goal).length;
    const notStarted = tasks.filter(t => t.progress === 0).length;
    
    return {
      total: tasks.length,
      completed,
      inProgress,
      notStarted,
      completionRate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0
    };
  }, [tasks]);

  const handleAddTask = async () => {
    const title = newTask.trim();
    if (!title) return;

    try {
      const color = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
      addTask(title, taskGoal, color);
      setNewTask("");
      setTaskGoal(5);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      Alert.alert("Error", "Failed to create task");
    }
  };

  const handleTaskIncrement = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const wasCompleted = task.progress >= task.goal;
      const taskCompletedNow = await increment(taskId);
      
      // Show celebration if task was just completed
      if (taskCompletedNow && !wasCompleted) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    } catch (error) {
      console.error("Failed to increment task:", error);
    }
  };

  const renderTaskItem = ({ item, drag }: any) => (
    <ScaleDecorator>
      <TaskCard
        task={item}
        onIncrement={() => handleTaskIncrement(item.id)}
        onDelete={() => remove(item.id)}
        onLongPress={drag}
      />
    </ScaleDecorator>
  );

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={styles.container}
    >
      <View style={[styles.contentContainer, { paddingTop: insets.top + 20 }]}>
        {/* Glow Header */}
        <LinearGradient
          colors={['#8B5CF6', '#EC4899', '#F97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowHeader}
        >
          <Text style={styles.glowHeaderTitle}>🏠 ADHD Dashboard</Text>
          <Text style={styles.glowHeaderSubtitle}>Welcome back, {user?.name || 'Champion'}!</Text>
        </LinearGradient>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {[
            { key: 'daily-tools', label: '🛠️', title: 'Daily Tools' },
            { key: 'self-check', label: '💭', title: 'Self-Check' },
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, activeTab === tab.key && styles.activeTabButton]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Text style={styles.tabEmoji}>{tab.label}</Text>
              <Text style={[styles.tabTitle, activeTab === tab.key && styles.activeTabTitle]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Content with proper scrolling */}
        {activeTab === 'daily-tools' ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            scrollEnabled={true}
            bounces={true}
            alwaysBounceVertical={false}
          >
            {/* Focus Mode Section */}
            <View style={styles.focusSection}>
              <Text style={styles.sectionTitle}>🧠 Focus Mode</Text>
              <Text style={styles.sectionSubtitle}>Choose your focus session duration</Text>
              
              <View style={styles.focusCardsRow}>
                {/* Focus Cards */}
                <TouchableOpacity 
                  style={styles.focusCard}
                  onPress={() => router.push('/focus-timer?mode=Pomodoro&duration=25')}
                >
                  <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.focusCardGradient}>
                    <Text style={styles.focusCardEmoji}>🍅</Text>
                    <Text style={styles.focusCardTitle}>Pomodoro</Text>
                    <Text style={styles.focusCardDuration}>25 min</Text>
                    <Text style={styles.focusCardDescription}>Classic technique</Text>
                  </LinearGradient>
                </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.focusCard}
                      onPress={() => router.push('/focus-timer?mode=Deep Work&duration=50')}
                    >
                      <LinearGradient colors={['#EC4899', '#F97316']} style={styles.focusCardGradient}>
                        <Text style={styles.focusCardEmoji}>🧠</Text>
                        <Text style={styles.focusCardTitle}>Deep Work</Text>
                        <Text style={styles.focusCardDuration}>50 min</Text>
                        <Text style={styles.focusCardDescription}>Extended focus</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.focusCard}
                      onPress={() => router.push('/focus-timer?mode=ADHD Sprint&duration=15')}
                    >
                      <LinearGradient colors={['#F97316', '#FBBF24']} style={styles.focusCardGradient}>
                        <Text style={styles.focusCardEmoji}>⚡</Text>
                        <Text style={styles.focusCardTitle}>ADHD Sprint</Text>
                        <Text style={styles.focusCardDuration}>15 min</Text>
                        <Text style={styles.focusCardDescription}>Quick burst</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rewarded Ad Section */}
                <View style={styles.rewardedAdSection}>
                  <RewardedAdBanner />
                </View>

                {/* Add New Task Section */}
                <View style={styles.addTaskSection}>
                  <View style={styles.addTaskHeader}>
                    <Text style={styles.sectionTitle}>➕ Add New Task</Text>
                    <TouchableOpacity onPress={() => setShowModal(true)}>
                      <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.addTaskBtn}>
                        <Ionicons name="add" size={20} color="#fff" />
                        <Text style={styles.addTaskBtnText}>New Task</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                    style={styles.addTaskCard}
                  >
                    <Text style={styles.addTaskTitle}>🌟 Quick Add</Text>
                    <View style={styles.addTaskRow}>
                      <TextInput
                        style={styles.taskInput}
                        placeholder="What needs to be done?"
                        placeholderTextColor="#B9B9B9"
                        value={newTask}
                        onChangeText={setNewTask}
                        maxLength={100}
                      />
                      <TouchableOpacity onPress={handleAddTask} disabled={!newTask.trim()}>
                        <LinearGradient 
                          colors={newTask.trim() ? ['#8B5CF6', '#A855F7'] : ['#666', '#555']} 
                          style={styles.quickAddBtn}
                        >
                          <Ionicons name="add-circle" size={20} color="#fff" />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </LinearGradient>
                </View>

                <View style={styles.tasksSection}>
                  <Text style={styles.sectionTitle}>📝 Your Tasks ({tasks.length})</Text>
                  
                  {/* Tasks List */}
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggle={() => increment(task.id)}
                      onRemove={() => remove(task.id)}
                      onPress={() => {}}
                    />
                  ))}
                </View>
            </ScrollView>
        ) : activeTab === 'self-check' ? (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            scrollEnabled={true}
            bounces={true}
            alwaysBounceVertical={false}
          >
            {/* Self-Check Content */}
            <View style={styles.focusSection}>
              <Text style={styles.sectionTitle}>💭 Self-Check</Text>
              <Text style={styles.sectionSubtitle}>Monitor your mental health and progress</Text>
              
              <View style={styles.focusCardsRow}>
                <TouchableOpacity 
                  style={styles.focusCard}
                  onPress={() => router.push('/focus-timer?mode=Pomodoro&duration=25')}
                >
                  <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.focusCardGradient}>
                    <Text style={styles.focusCardEmoji}>🍅</Text>
                    <Text style={styles.focusCardTitle}>Pomodoro</Text>
                    <Text style={styles.focusCardDuration}>25 min</Text>
                    <Text style={styles.focusCardDescription}>Classic technique</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.focusCard}
                  onPress={() => router.push('/focus-timer?mode=Deep Work&duration=50')}
                >
                  <LinearGradient colors={['#EC4899', '#F97316']} style={styles.focusCardGradient}>
                    <Text style={styles.focusCardEmoji}>🧠</Text>
                    <Text style={styles.focusCardTitle}>Deep Work</Text>
                    <Text style={styles.focusCardDuration}>50 min</Text>
                    <Text style={styles.focusCardDescription}>Extended focus</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.focusCard}
                  onPress={() => router.push('/focus-timer?mode=ADHD Sprint&duration=15')}
                >
                  <LinearGradient colors={['#F97316', '#FBBF24']} style={styles.focusCardGradient}>
                    <Text style={styles.focusCardEmoji}>⚡</Text>
                    <Text style={styles.focusCardTitle}>ADHD Sprint</Text>
                    <Text style={styles.focusCardDuration}>15 min</Text>
                    <Text style={styles.focusCardDescription}>Quick burst</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rewardedAdSection}>
              <RewardedAdBanner />
            </View>

            <View style={styles.addTaskSection}>
              <View style={styles.addTaskHeader}>
                <Text style={styles.sectionTitle}>➕ Add New Task</Text>
                <TouchableOpacity onPress={() => setShowModal(true)}>
                  <LinearGradient colors={['#8B5CF6', '#EC4899']} style={styles.addTaskBtn}>
                    <Ionicons name="add" size={20} color="#fff" />
                    <Text style={styles.addTaskBtnText}>New Task</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
                style={styles.addTaskCard}
              >
                <Text style={styles.addTaskTitle}>🌟 Quick Add</Text>
                <View style={styles.addTaskRow}>
                  <TextInput
                    style={styles.taskInput}
                    placeholder="What needs to be done?"
                    placeholderTextColor="#B9B9B9"
                    value={newTask}
                    onChangeText={setNewTask}
                    maxLength={100}
                  />
                  <TouchableOpacity onPress={handleAddTask} disabled={!newTask.trim()}>
                    <LinearGradient 
                      colors={newTask.trim() ? ['#8B5CF6', '#A855F7'] : ['#666', '#555']} 
                      style={styles.quickAddBtn}
                    >
                      <Ionicons name="add-circle" size={20} color="#fff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>

            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(236, 72, 153, 0.1)']}
              style={styles.emptyTasksCard}
            >
              <Text style={styles.emptyTasksIcon}>📋✨</Text>
              <Text style={styles.emptyTasksTitle}>No tasks yet!</Text>
              <Text style={styles.emptyTasksDescription}>
                Add your first task to start building productive habits.
              </Text>
            </LinearGradient>
          </ScrollView>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          >
            {/* Self-Check content */}
            <View style={styles.quickStatsSection}>
              <Text style={styles.sectionTitle}>📊 Today's Overview</Text>
              <View style={styles.statsRow}>
                <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </LinearGradient>
                <LinearGradient colors={['#EC4899', '#F97316']} style={styles.statCard}>
                  <Text style={styles.statNumber}>{currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </LinearGradient>
                <TouchableOpacity onPress={() => router.push('/(tabs)/profile?tab=store')}>
                  <LinearGradient colors={['#F97316', '#FBBF24']} style={styles.statCard}>
                    <Text style={styles.statNumber}>{totalPoints}</Text>
                    <Text style={styles.statLabel}>Points</Text>
                    <Text style={styles.statSubLabel}>Tap to spend</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>🎯 Progress Tracker</Text>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
                style={styles.progressCard}
              >
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Daily Completion</Text>
                  <Text style={styles.progressPercentage}>{stats.completionRate}%</Text>
                </View>
                <ProgressBar 
                  progress={stats.completionRate} 
                  color="#8B5CF6"
                  backgroundColor="rgba(139, 92, 246, 0.2)"
                  height={12}
                  style={styles.progressBar}
                />
                <Text style={styles.progressSubtitle}>
                  {stats.completed} of {stats.total} tasks completed today
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.moodSection}>
              <Text style={styles.sectionTitle}>💭 Mood Tracker</Text>
              <MoodTracker />
            </View>

            <View style={styles.challengesSection}>
              <Text style={styles.sectionTitle}>🏆 Weekly Challenges</Text>
              <WeeklyChallenges 
                challenges={challenges} 
                onChallengeComplete={completeChallenge} 
              />
            </View>
          </ScrollView>
        )}

        {/* Add Task Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.modalContainer}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
              style={styles.modalOverlay}
            >
              <LinearGradient
                colors={['#1a1a2e', '#16213e']}
                style={styles.modalContent}
              >
                <Text style={styles.modalTitle}>✨ Create New Task</Text>
                
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter task title..."
                  placeholderTextColor="#B9B9B9"
                  value={newTask}
                  onChangeText={setNewTask}
                  autoFocus
                  maxLength={100}
                />
                
                <View style={styles.goalSection}>
                  <Text style={styles.goalLabel}>How many steps to complete?</Text>
                  <View style={styles.goalButtons}>
                    {[1, 3, 5, 10, 15, 20].map((goal) => (
                      <TouchableOpacity
                        key={goal}
                        onPress={() => setTaskGoal(goal)}
                        style={[
                          styles.goalButton,
                          taskGoal === goal && styles.goalButtonActive
                        ]}
                      >
                        <Text style={[
                          styles.goalButtonText,
                          taskGoal === goal && styles.goalButtonTextActive
                        ]}>
                          {goal}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <LinearGradient colors={['#666', '#555']} style={styles.modalBtn}>
                      <Text style={styles.modalBtnText}>Cancel</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={handleAddTask} disabled={!newTask.trim()}>
                    <LinearGradient 
                      colors={newTask.trim() ? ['#8B5CF6', '#EC4899'] : ['#666', '#555']} 
                      style={styles.modalBtn}
                    >
                      <Text style={styles.modalBtnText}>Create Task</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </LinearGradient>
          </KeyboardAvoidingView>
        </Modal>

        {/* Celebrations */}
        {showCelebration && <Celebration />}
        {showEnhancedCelebration && <EnhancedCelebration />}
      </View>

      {/* Banner Ad for Free Users */}
      <MockAdBanner />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  glowHeader: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  glowHeaderTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glowHeaderSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 4,
  },
  quickStatsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  statSubLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  progressSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  progressPercentage: {
    color: '#8B5CF6',
    fontSize: 20,
    fontWeight: '900',
  },
  progressBar: {
    marginBottom: 12,
  },
  progressSubtitle: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  moodSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addTaskSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  addTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addTaskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addTaskBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  addTaskCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  addTaskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  addTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    fontSize: 16,
  },
  quickAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  emptyTasksCard: {
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  emptyTasksIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTasksTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyTasksDescription: {
    color: '#E5E7EB',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: '#8B5CF6',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // New styles for tab navigation and focus cards
  tabNavigation: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabEmoji: {
    fontSize: 18,
  },
  tabTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabTitle: {
    color: '#fff',
  },
  
  // Focus section styles
  focusSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
    marginTop: -8,
  },
  focusCardsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  focusCard: {
    flex: 1,
  },
  focusCardGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  focusCardEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  focusCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  focusCardDuration: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  focusCardDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Challenges section
  challengesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  
  // Rewarded Ad section  
  rewardedAdSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  
  // Goal selection styles
  goalSection: {
    marginVertical: 20,
  },
  goalLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  goalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  goalButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  goalButtonActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8B5CF6',
  },
  goalButtonText: {
    color: '#B9B9B9',
    fontSize: 14,
    fontWeight: '600',
  },
  goalButtonTextActive: {
    color: '#fff',
  },
});