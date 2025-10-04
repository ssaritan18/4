import React, { useRef, useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export interface MediaItem {
  uri: string;
  type: 'image' | 'video';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

interface MediaPickerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onMediaSelected: (media: MediaItem[]) => void;
  allowMultiple?: boolean;
}

export const MediaPickerBottomSheet: React.FC<MediaPickerBottomSheetProps> = ({
  isVisible,
  onClose,
  onMediaSelected,
  allowMultiple = true
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bottom sheet snap points
  const snapPoints = useMemo(() => ['25%', '40%'], []);

  // Handle bottom sheet changes
  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const requestCameraPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Kamera erişimi için izin gerekiyor. Lütfen ayarlardan kamera iznini etkinleştirin.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'İzin Gerekli',
        'Galeri erişimi için izin gerekiyor. Lütfen ayarlardan galeri iznini etkinleştirin.',
        [{ text: 'Tamam' }]
      );
      return false;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    setIsProcessing(true);
    try {
      const hasPermission = await requestCameraPermissions();
      if (!hasPermission) {
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 60
      });

      if (!result.canceled && result.assets) {
        const mediaItems: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type as 'image' | 'video',
          fileName: asset.fileName || `${asset.type}_${Date.now()}`,
          fileSize: asset.fileSize,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height
        }));

        onMediaSelected(mediaItems);
        onClose();
      }
    } catch (error) {
      console.error('Camera capture error:', error);
      Alert.alert('Hata', 'Kamera kullanılamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGallerySelection = async () => {
    setIsProcessing(true);
    try {
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) {
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: allowMultiple,
        allowsEditing: !allowMultiple,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 300
      });

      if (!result.canceled && result.assets) {
        const mediaItems: MediaItem[] = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type as 'image' | 'video',
          fileName: asset.fileName || `${asset.type}_${Date.now()}`,
          fileSize: asset.fileSize,
          mimeType: asset.mimeType,
          width: asset.width,
          height: asset.height
        }));

        onMediaSelected(mediaItems);
        onClose();
      }
    } catch (error) {
      console.error('Gallery selection error:', error);
      Alert.alert('Hata', 'Galeri erişimi başarısız. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show/hide bottom sheet based on isVisible prop
  React.useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.snapToIndex(1);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text style={styles.title}>Medya Seç</Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.option, isProcessing && styles.optionDisabled]}
              onPress={handleCameraCapture}
              disabled={isProcessing}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#34C759' }]}>
                <Ionicons name="camera" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Kamera</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.option, isProcessing && styles.optionDisabled]}
              onPress={handleGallerySelection}
              disabled={isProcessing}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#007AFF' }]}>
                <Ionicons name="images" size={24} color="white" />
              </View>
              <Text style={styles.optionText}>Galeri</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetBackground: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#666',
    width: 40,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  option: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  optionDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});

export default MediaPickerBottomSheet;