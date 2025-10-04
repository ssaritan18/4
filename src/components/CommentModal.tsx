import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CommentModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  loading?: boolean;
};

export function CommentModal({ visible, onClose, onSubmit, loading = false }: CommentModalProps) {
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    const trimmedComment = comment.trim();
    if (trimmedComment) {
      onSubmit(trimmedComment);
      setComment(''); // Clear input
      onClose(); // Close modal
    }
  };

  const handleClose = () => {
    setComment(''); // Clear on close
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Comment</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!comment.trim() || loading}
            style={[
              styles.submitButton,
              (!comment.trim() || loading) && styles.submitButtonDisabled
            ]}
          >
            {loading ? (
              <Text style={styles.submitButtonTextDisabled}>Posting...</Text>
            ) : (
              <Text style={[
                styles.submitButtonText,
                !comment.trim() && styles.submitButtonTextDisabled
              ]}>
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.label}>Share your thoughts on this post:</Text>
          <TextInput
            style={styles.input}
            placeholder="Write your comment here..."
            placeholderTextColor="#666"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={500}
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.characterCount}>
            {comment.length}/500
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Be respectful and constructive in your comments.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#666',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
    textAlignVertical: 'top',
  },
  characterCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
});