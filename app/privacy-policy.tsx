import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    try {
      router.back();
    } catch (error) {
      console.error('❌ Navigation back failed:', error);
      router.push('/');
    }
  };

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Last Updated */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']}
          style={styles.updateCard}
        >
          <Text style={styles.updateTitle}>📅 Last Updated</Text>
          <Text style={styles.updateDate}>January 6, 2025</Text>
        </LinearGradient>

        {/* Introduction */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>🏠 Introduction</Text>
          <Text style={styles.sectionText}>
            Welcome to ADHDers Social Club! We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our app 
            and tell you about your privacy rights and how the law protects you.
          </Text>
        </LinearGradient>

        {/* Data We Collect */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>📊 Data We Collect</Text>
          
          <Text style={styles.subsectionTitle}>Account Information:</Text>
          <Text style={styles.bulletPoint}>• Name and email address</Text>
          <Text style={styles.bulletPoint}>• Profile picture (optional)</Text>
          <Text style={styles.bulletPoint}>• Account preferences and settings</Text>
          
          <Text style={styles.subsectionTitle}>Content Data:</Text>
          <Text style={styles.bulletPoint}>• Posts, comments, and interactions</Text>
          <Text style={styles.bulletPoint}>• Chat messages and voice recordings</Text>
          <Text style={styles.bulletPoint}>• Task data and progress tracking</Text>
          <Text style={styles.bulletPoint}>• Achievement and point records</Text>
          
          <Text style={styles.subsectionTitle}>Usage Data:</Text>
          <Text style={styles.bulletPoint}>• App usage patterns and features accessed</Text>
          <Text style={styles.bulletPoint}>• Device information and operating system</Text>
          <Text style={styles.bulletPoint}>• Log files and error reports</Text>
        </LinearGradient>

        {/* How We Use Your Data */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>🎯 How We Use Your Data</Text>
          <Text style={styles.bulletPoint}>• To provide and maintain our service</Text>
          <Text style={styles.bulletPoint}>• To personalize your experience and content</Text>
          <Text style={styles.bulletPoint}>• To facilitate social interactions within the app</Text>
          <Text style={styles.bulletPoint}>• To track your progress and achievements</Text>
          <Text style={styles.bulletPoint}>• To send you notifications and updates</Text>
          <Text style={styles.bulletPoint}>• To provide customer support</Text>
          <Text style={styles.bulletPoint}>• To improve our services and develop new features</Text>
          <Text style={styles.bulletPoint}>• To ensure security and prevent fraud</Text>
        </LinearGradient>

        {/* Data Sharing */}
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>🤝 Data Sharing</Text>
          <Text style={styles.sectionText}>
            We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:
          </Text>
          <Text style={styles.bulletPoint}>• With your explicit consent</Text>
          <Text style={styles.bulletPoint}>• To comply with legal obligations</Text>
          <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
          <Text style={styles.bulletPoint}>• With service providers who assist us (under strict confidentiality agreements)</Text>
          <Text style={styles.bulletPoint}>• In case of business transfer or merger (with notice to you)</Text>
        </LinearGradient>

        {/* Data Security */}
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>🔒 Data Security</Text>
          <Text style={styles.sectionText}>
            We implement appropriate technical and organizational security measures to protect your personal data:
          </Text>
          <Text style={styles.bulletPoint}>• Encryption of data in transit and at rest</Text>
          <Text style={styles.bulletPoint}>• Regular security assessments and updates</Text>
          <Text style={styles.bulletPoint}>• Access controls and authentication systems</Text>
          <Text style={styles.bulletPoint}>• Secure data centers and backup systems</Text>
          <Text style={styles.bulletPoint}>• Employee training on data protection</Text>
        </LinearGradient>

        {/* Your Rights */}
        <LinearGradient
          colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>⚖️ Your Rights</Text>
          <Text style={styles.sectionText}>
            Under data protection laws, you have the following rights:
          </Text>
          <Text style={styles.bulletPoint}>• Right to access your personal data</Text>
          <Text style={styles.bulletPoint}>• Right to rectify inaccurate data</Text>
          <Text style={styles.bulletPoint}>• Right to erase your data ("right to be forgotten")</Text>
          <Text style={styles.bulletPoint}>• Right to restrict processing</Text>
          <Text style={styles.bulletPoint}>• Right to data portability</Text>
          <Text style={styles.bulletPoint}>• Right to object to processing</Text>
          <Text style={styles.bulletPoint}>• Right to withdraw consent</Text>
        </LinearGradient>

        {/* Account Deletion */}
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>🗑️ Account Deletion</Text>
          <Text style={styles.sectionText}>
            You can request deletion of your account and all associated data at any time:
          </Text>
          <Text style={styles.bulletPoint}>• Visit our account deletion page</Text>
          <Text style={styles.bulletPoint}>• Contact us at adhderssocialclub@gmail.com</Text>
          <Text style={styles.bulletPoint}>• We will process your request within 30 days</Text>
          <Text style={styles.bulletPoint}>• All your data will be permanently deleted</Text>
          <Text style={styles.bulletPoint}>• You will receive confirmation once completed</Text>
          
          <TouchableOpacity 
            onPress={() => router.push('/delete-account')}
            style={styles.deleteAccountButton}
          >
            <LinearGradient colors={['#EF4444', '#DC2626']} style={styles.deleteAccountGradient}>
              <Text style={styles.deleteAccountText}>Request Account Deletion</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        {/* Data Retention */}
        <LinearGradient
          colors={['rgba(99, 102, 241, 0.1)', 'rgba(79, 70, 229, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>⏰ Data Retention</Text>
          <Text style={styles.sectionText}>
            We retain your personal data only as long as necessary:
          </Text>
          <Text style={styles.bulletPoint}>• Account data: Until you delete your account</Text>
          <Text style={styles.bulletPoint}>• Content data: Until you delete specific content or your account</Text>
          <Text style={styles.bulletPoint}>• Usage data: Up to 2 years for analytics purposes</Text>
          <Text style={styles.bulletPoint}>• Log files: Up to 1 year for security and troubleshooting</Text>
          <Text style={styles.bulletPoint}>• Legal compliance: As required by applicable law</Text>
        </LinearGradient>

        {/* Children's Privacy */}
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>👶 Children's Privacy</Text>
          <Text style={styles.sectionText}>
            Our service is not intended for children under the age of 13. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and you are 
            aware that your child has provided us with personal information, please contact us so we 
            can take appropriate action.
          </Text>
        </LinearGradient>

        {/* International Transfers */}
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>🌍 International Transfers</Text>
          <Text style={styles.sectionText}>
            Your information may be transferred to and maintained on servers located outside of your 
            jurisdiction. We ensure appropriate safeguards are in place to protect your data during 
            international transfers, including:
          </Text>
          <Text style={styles.bulletPoint}>• Adequacy decisions by data protection authorities</Text>
          <Text style={styles.bulletPoint}>• Standard contractual clauses</Text>
          <Text style={styles.bulletPoint}>• Certification schemes and codes of conduct</Text>
        </LinearGradient>

        {/* Policy Changes */}
        <LinearGradient
          colors={['rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>📝 Changes to This Policy</Text>
          <Text style={styles.sectionText}>
            We may update this privacy policy from time to time. We will notify you of any changes by:
          </Text>
          <Text style={styles.bulletPoint}>• Posting the new privacy policy on this page</Text>
          <Text style={styles.bulletPoint}>• Sending you an email notification</Text>
          <Text style={styles.bulletPoint}>• Displaying a prominent notice in the app</Text>
          <Text style={styles.bulletPoint}>• Changes are effective immediately upon posting</Text>
        </LinearGradient>

        {/* Contact Information */}
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.1)']}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>📧 Contact Us</Text>
          <Text style={styles.sectionText}>
            If you have any questions about this privacy policy or our data practices, please contact us:
          </Text>
          <Text style={styles.contactInfo}>📧 Email: adhderssocialclub@gmail.com</Text>
          <Text style={styles.contactInfo}>🌐 Website: ADHDers Social Club</Text>
          <Text style={styles.contactInfo}>⏰ Response Time: Within 48 hours</Text>
          
          <Text style={styles.finalNote}>
            We are committed to protecting your privacy and will respond to all inquiries promptly and professionally.
          </Text>
        </LinearGradient>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  updateCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  updateDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 22,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
    marginBottom: 4,
    marginLeft: 8,
  },
  deleteAccountButton: {
    marginTop: 16,
    alignSelf: 'stretch',
  },
  deleteAccountGradient: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contactInfo: {
    fontSize: 14,
    color: '#10B981',
    marginBottom: 6,
    fontWeight: '600',
  },
  finalNote: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});