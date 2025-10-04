import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CreatePostModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreatePost: (text: string, imageUrl?: string, tags?: string[], visibility?: string) => Promise<void>;
};

export function CreatePostModal({ visible, onClose, onCreatePost }: CreatePostModalProps) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [loading, setLoading] = useState(false);

  const handleAddTag = () => {
    const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter some text for your post');
      return;
    }

    setLoading(true);
    try {
      await onCreatePost(
        text.trim(),
        imageUrl.trim() || undefined,
        tags,
        visibility
      );
      
      // Reset form
      setText('');
      setImageUrl('');
      setTagInput('');
      setTags([]);
      setVisibility('friends');
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  const visibilityOptions = [
    { key: 'friends', label: 'Friends Only', icon: '👥' },
    { key: 'public', label: 'Public', icon: '🌐' },
    { key: 'private', label: 'Only Me', icon: '🔒' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Create Post</Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            disabled={loading || !text.trim()}
            style={[
              styles.postButton,
              (!text.trim() || loading) && styles.postButtonDisabled
            ]}
          >
            <Text style={[
              styles.postButtonText,
              (!text.trim() || loading) && styles.postButtonTextDisabled
            ]}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Text Input */}
          <View style={styles.section}>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{text.length}/500</Text>
          </View>

          {/* Image URL Input */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Image URL (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#666"
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag..."
                placeholderTextColor="#666"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={handleAddTag}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.addTagButton}
                onPress={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handleRemoveTag(tag)}
                  >
                    <Text style={styles.tagText}>#{tag}</Text>
                    <Text style={styles.removeTagText}> ×</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Visibility */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Who can see this?</Text>
            <View style={styles.visibilityContainer}>
              {visibilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    styles.visibilityOption,
                    visibility === option.key && styles.visibilityOptionSelected
                  ]}
                  onPress={() => setVisibility(option.key as any)}
                >
                  <Text style={styles.visibilityIcon}>{option.icon}</Text>
                  <Text style={[
                    styles.visibilityLabel,
                    visibility === option.key && styles.visibilityLabelSelected
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
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
  cancelButton: {
    color: '#888',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  postButtonDisabled: {
    backgroundColor: '#333',
  },
  postButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#333',
  },
  characterCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    color: 'white',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  addTagButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: '500',
  },
  removeTagText: {
    color: '#888',
    fontSize: 12,
    marginLeft: 2,
  },
  visibilityContainer: {
    gap: 8,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  visibilityOptionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#1E2A3A',
  },
  visibilityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  visibilityLabel: {
    color: 'white',
    fontSize: 16,
  },
  visibilityLabelSelected: {
    color: '#4A90E2',
    fontWeight: '500',
  },
});