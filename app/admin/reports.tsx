import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/lib/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Report {
  id: string;
  type: string;
  reason: string;
  description: string;
  reporter_name: string;
  reporter_email: string;
  status: string;
  created_at: string;
  target_user_id?: string;
  target_post_id?: string;
  admin_notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

interface DeletionRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  reason: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
}

const { width } = Dimensions.get('window');

export default function AdminReportsScreen() {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  
  // State management
  const [activeTab, setActiveTab] = useState<'reports' | 'deletions'>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedDeletion, setSelectedDeletion] = useState<DeletionRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load data on component mount
  useEffect(() => {
    loadReports();
    loadDeletionRequests();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/api/admin/reports${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setReports(response.data.reports || []);
        console.log('✅ Reports loaded:', response.data.reports?.length || 0);
      }
    } catch (error) {
      console.error('❌ Failed to load reports:', error);
      Alert.alert('Error', 'Failed to load reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadDeletionRequests = async () => {
    try {
      const response = await api.get('/api/admin/deletion-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setDeletionRequests(response.data.deletion_requests || []);
        console.log('✅ Deletion requests loaded:', response.data.deletion_requests?.length || 0);
      }
    } catch (error) {
      console.error('❌ Failed to load deletion requests:', error);
      Alert.alert('Error', 'Failed to load deletion requests. Please try again.');
    }
  };

  const updateReportStatus = async (reportId: string, status: string, notes: string) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/admin/reports/${reportId}`, {
        status,
        admin_notes: notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        Alert.alert('Success', `Report status updated to ${status}`);
        setModalVisible(false);
        setSelectedReport(null);
        setAdminNotes('');
        await loadReports(); // Reload reports
      }
    } catch (error) {
      console.error('❌ Failed to update report:', error);
      Alert.alert('Error', 'Failed to update report status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processAccountDeletion = async (deletionRequest: DeletionRequest) => {
    Alert.alert(
      'Confirm Account Deletion',
      `Are you sure you want to permanently delete ${deletionRequest.user_name}'s account? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await api.delete(`/api/admin/account/${deletionRequest.user_id}?deletion_request_id=${deletionRequest.id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });

              if (response.data.success) {
                Alert.alert('Account Deleted', 'User account has been permanently deleted.');
                await loadDeletionRequests(); // Reload deletion requests
              }
            } catch (error) {
              console.error('❌ Failed to delete account:', error);
              Alert.alert('Error', 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return ['#F59E0B', '#D97706'];
      case 'reviewed': return ['#3B82F6', '#2563EB'];
      case 'resolved': return ['#10B981', '#059669'];
      case 'rejected': return ['#EF4444', '#DC2626'];
      case 'completed': return ['#10B981', '#059669'];
      default: return ['#6B7280', '#4B5563'];
    }
  };

  const goBack = () => {
    try {
      router.back();
      console.log('✅ Navigation back successful');
    } catch (error) {
      console.error('❌ Navigation back failed:', error);
      // Fallback navigation
      router.push('/(tabs)/profile');
    }
  };

  const renderReportCard = (report: Report) => (
    <TouchableOpacity
      key={report.id}
      onPress={() => {
        setSelectedReport(report);
        setAdminNotes(report.admin_notes || '');
        setModalVisible(true);
      }}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={getStatusColor(report.status)}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.cardDate}>{formatDate(report.created_at)}</Text>
        </View>
        
        <Text style={styles.cardTitle}>{report.type.toUpperCase()} REPORT</Text>
        <Text style={styles.cardReason}>{report.reason}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {report.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.reporterInfo}>
            👤 {report.reporter_name}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderDeletionCard = (deletion: DeletionRequest) => (
    <TouchableOpacity
      key={deletion.id}
      onPress={() => {
        setSelectedDeletion(deletion);
        Alert.alert(
          'Account Deletion Request',
          `User: ${deletion.user_name}\nEmail: ${deletion.user_email}\nReason: ${deletion.reason}\nRequested: ${formatDate(deletion.requested_at)}`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Process Delete',
              style: 'destructive',
              onPress: () => processAccountDeletion(deletion)
            }
          ]
        );
      }}
    >
      <LinearGradient
        colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.1)']}
        style={styles.card}
      >
        <View style={styles.cardHeader}>
          <LinearGradient
            colors={getStatusColor(deletion.status)}
            style={styles.statusBadge}
          >
            <Text style={styles.statusText}>{deletion.status.toUpperCase()}</Text>
          </LinearGradient>
          <Text style={styles.cardDate}>{formatDate(deletion.requested_at)}</Text>
        </View>
        
        <Text style={styles.cardTitle}>ACCOUNT DELETION</Text>
        <Text style={styles.cardReason}>{deletion.reason}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.reporterInfo}>
            👤 {deletion.user_name}
          </Text>
          <Text style={styles.reporterInfo}>
            📧 {deletion.user_email}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderReportModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f172a']}
          style={styles.modalContent}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Details</Text>
            <View style={{ width: 24 }} />
          </View>

          {selectedReport && (
            <ScrollView style={styles.modalScroll}>
              {/* Report Info */}
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
                style={styles.modalSection}
              >
                <Text style={styles.modalSectionTitle}>📋 Report Information</Text>
                <Text style={styles.modalField}>Type: {selectedReport.type}</Text>
                <Text style={styles.modalField}>Reason: {selectedReport.reason}</Text>
                <Text style={styles.modalField}>Status: {selectedReport.status}</Text>
                <Text style={styles.modalField}>Date: {formatDate(selectedReport.created_at)}</Text>
              </LinearGradient>

              {/* Description */}
              <LinearGradient
                colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
                style={styles.modalSection}
              >
                <Text style={styles.modalSectionTitle}>📝 Description</Text>
                <Text style={styles.modalDescription}>{selectedReport.description}</Text>
              </LinearGradient>

              {/* Reporter Info */}
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
                style={styles.modalSection}
              >
                <Text style={styles.modalSectionTitle}>👤 Reporter</Text>
                <Text style={styles.modalField}>Name: {selectedReport.reporter_name}</Text>
                <Text style={styles.modalField}>Email: {selectedReport.reporter_email}</Text>
              </LinearGradient>

              {/* Admin Notes */}
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.1)']}
                style={styles.modalSection}
              >
                <Text style={styles.modalSectionTitle}>📝 Admin Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={adminNotes}
                  onChangeText={setAdminNotes}
                  placeholder="Add admin notes..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                />
              </LinearGradient>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => updateReportStatus(selectedReport.id, 'reviewed', adminNotes)}
                  disabled={loading}
                >
                  <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Mark Reviewed</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                  disabled={loading}
                >
                  <LinearGradient colors={['#10B981', '#059669']} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Mark Resolved</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updateReportStatus(selectedReport.id, 'rejected', adminNotes)}
                  disabled={loading}
                >
                  <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f172a']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#EC4899', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔒 Admin Panel</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('reports')}
          style={[styles.tab, activeTab === 'reports' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.activeTabText]}>
            📋 Reports ({reports.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('deletions')}
          style={[styles.tab, activeTab === 'deletions' && styles.activeTab]}
        >
          <Text style={[styles.tabText, activeTab === 'deletions' && styles.activeTabText]}>
            🗑️ Deletions ({deletionRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Bar (for reports) */}
      {activeTab === 'reports' && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {['all', 'pending', 'reviewed', 'resolved', 'rejected'].map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => {
                  setStatusFilter(filter);
                  loadReports();
                }}
                style={[styles.filterButton, statusFilter === filter && styles.activeFilterButton]}
              >
                <Text style={[styles.filterText, statusFilter === filter && styles.activeFilterText]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {!loading && activeTab === 'reports' && (
          <View style={styles.cardContainer}>
            {reports.length === 0 ? (
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.emptyState}
              >
                <Text style={styles.emptyStateEmoji}>📋</Text>
                <Text style={styles.emptyStateTitle}>No Reports Found</Text>
                <Text style={styles.emptyStateDescription}>
                  No reports match the current filter criteria.
                </Text>
              </LinearGradient>
            ) : (
              reports.map(renderReportCard)
            )}
          </View>
        )}

        {!loading && activeTab === 'deletions' && (
          <View style={styles.cardContainer}>
            {deletionRequests.length === 0 ? (
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.emptyState}
              >
                <Text style={styles.emptyStateEmoji}>🗑️</Text>
                <Text style={styles.emptyStateTitle}>No Deletion Requests</Text>
                <Text style={styles.emptyStateDescription}>
                  No account deletion requests at this time.
                </Text>
              </LinearGradient>
            ) : (
              deletionRequests.map(renderDeletionCard)
            )}
          </View>
        )}
      </ScrollView>

      {/* Report Detail Modal */}
      {renderReportModal()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  filterContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  filterScroll: {
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  cardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardReason: {
    fontSize: 14,
    color: '#8B5CF6',
    marginBottom: 8,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reporterInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  modalSection: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  modalField: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  modalDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  notesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});