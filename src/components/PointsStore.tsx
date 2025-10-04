import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePoints } from '../hooks/usePoints';
import { useSubscription } from '../context/SubscriptionContext';
import { useAuth } from '../context/AuthContext';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'avatar_item' | 'sticker_pack' | 'sound_pack' | 'chat_invitation';
  icon: string;
  category: string;
  premium_only?: boolean;
}

const STORE_ITEMS: StoreItem[] = [
  // Avatar Items
  {
    id: 'avatar_crown',
    name: 'Golden Crown',
    description: 'Show your royal status',
    cost: 500,
    type: 'avatar_item',
    icon: '👑',
    category: 'Avatar',
  },
  {
    id: 'avatar_wizard_hat',
    name: 'Wizard Hat',
    description: 'For the wise ADHD masters',
    cost: 300,
    type: 'avatar_item',
    icon: '🧙‍♂️',
    category: 'Avatar',
  },
  {
    id: 'avatar_superhero',
    name: 'Superhero Cape',
    description: 'Every ADHDer is a superhero',
    cost: 400,
    type: 'avatar_item',
    icon: '🦸‍♀️',
    category: 'Avatar',
  },
  
  // Sticker Packs  
  {
    id: 'stickers_emotions',
    name: 'Emotion Pack',
    description: '20 mood stickers for chat',
    cost: 200,
    type: 'sticker_pack',
    icon: '😍',
    category: 'Stickers',
  },
  {
    id: 'stickers_adhd',
    name: 'ADHD Vibes Pack',
    description: 'Relatable ADHD moments',
    cost: 250,
    type: 'sticker_pack', 
    icon: '🧠',
    category: 'Stickers',
  },
  
  // Sound Packs
  {
    id: 'sounds_nature',
    name: 'Nature Sounds',
    description: 'Forest, rain, ocean sounds',
    cost: 300,
    type: 'sound_pack',
    icon: '🌿',
    category: 'Focus Sounds',
  },
  {
    id: 'sounds_lofi',
    name: 'Lo-Fi Beats',
    description: 'Chill beats for focus',
    cost: 350,
    type: 'sound_pack',
    icon: '🎵',
    category: 'Focus Sounds',
  },
  
  // Chat Invitations
  {
    id: 'chat_invite_1',
    name: 'Group Invitation',
    description: 'Create 1 invitation-only group',
    cost: 150,
    type: 'chat_invitation',
    icon: '💬',
    category: 'Chat',
  },
  {
    id: 'chat_invite_bundle',
    name: '5 Group Invitations',
    description: 'Create 5 invitation-only groups',
    cost: 600,
    type: 'chat_invitation',
    icon: '💬',
    category: 'Chat',
    premium_only: false, // Available to free users but expensive
  },
];

interface PointsStoreProps {
  style?: any;
}

export function PointsStore({ style }: PointsStoreProps) {
  const { pointsData, spendPoints, canAfford } = usePoints();
  const { subscription } = useSubscription();
  const { user, mode } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const categories = ['All', 'Avatar', 'Stickers', 'Focus Sounds', 'Chat'];

  // Fetch owned items from backend
  useEffect(() => {
    const fetchOwnedItems = async () => {
      if (mode === 'sync' && user?.token) {
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://adhders-social-club.onrender.com'}/api/me`, {
            headers: {
              'Authorization': `Bearer ${user.token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            const ownedItems = userData.owned_items || [];
            setPurchasedItems(new Set(ownedItems));
          }
        } catch (error) {
          console.error('Error fetching owned items:', error);
        }
      }
    };

    fetchOwnedItems();
  }, [user, mode]);

  // Filter items by category
  const getFilteredItems = () => {
    let items = STORE_ITEMS;
    
    if (selectedCategory !== 'All') {
      items = items.filter(item => item.category === selectedCategory);
    }
    
    return items;
  };

  // Purchase item
  const purchaseItem = async (item: StoreItem) => {
    if (purchasedItems.has(item.id)) {
      Alert.alert('Already Owned', 'You already own this item!');
      return;
    }

    if (!canAfford(item.cost)) {
      Alert.alert(
        'Insufficient Points', 
        `You need ${item.cost} points but only have ${pointsData?.total_points || 0} points.`
      );
      return;
    }

    setLoading(true);

    // Confirm purchase
    Alert.alert(
      'Confirm Purchase',
      `Purchase "${item.name}" for ${item.cost} points?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
        {
          text: 'Buy',
          style: 'default',
          onPress: async () => {
            try {
              const result = await spendPoints(item.cost, item.type, item.id);
              
              if (result.success) {
                setPurchasedItems(prev => new Set([...prev, item.id])); 
                Alert.alert(
                  '🎉 Purchase Successful!',
                  `You've purchased "${item.name}"! Check your profile to use it.`
                );
              } else {
                Alert.alert('Purchase Failed', result.error || 'Unknown error');
              }
            } catch (error) {
              Alert.alert('Purchase Failed', 'Network error. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Render store item
  const renderStoreItem = ({ item }: { item: StoreItem }) => {
    const isOwned = purchasedItems.has(item.id);
    const affordable = canAfford(item.cost);

    return (
      <View style={styles.storeItem}>
        <LinearGradient
          colors={isOwned ? 
            ['rgba(34, 197, 94, 0.2)', 'rgba(34, 197, 94, 0.1)'] :
            affordable ? 
              ['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)'] :
              ['rgba(107, 114, 128, 0.15)', 'rgba(75, 85, 99, 0.15)']
          }
          style={styles.storeItemGradient}
        >
          <View style={styles.itemHeader}>
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
            </View>
          </View>
          
          <View style={styles.itemFooter}>
            <View style={styles.costContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.itemCost}>{item.cost}</Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.purchaseButton,
                isOwned && styles.ownedButton,
                !affordable && !isOwned && styles.unaffordableButton,
                loading && styles.loadingButton
              ]}
              onPress={() => purchaseItem(item)}
              disabled={isOwned || loading}
            >
              <Text style={[
                styles.purchaseButtonText,
                isOwned && styles.ownedButtonText,
                !affordable && !isOwned && styles.unaffordableButtonText,
                loading && styles.loadingButtonText
              ]}>
                {loading ? 'Processing...' : isOwned ? 'Owned' : affordable ? 'Buy' : 'Can\'t Afford'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>🏪 Points Store</Text>
      <Text style={styles.subtitle}>
        You have {pointsData?.total_points || 0} points to spend
      </Text>
      
      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.activeCategoryButton
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category && styles.activeCategoryButtonText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Store Items */}
      <FlatList
        data={getFilteredItems()}
        keyExtractor={(item) => item.id}
        renderItem={renderStoreItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.storeList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeCategoryButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  categoryButtonText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  storeList: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  storeItem: {
    flex: 0.48,
  },
  storeItemGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  itemHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  itemIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  itemInfo: {
    alignItems: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 14,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCost: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  purchaseButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ownedButton: {
    backgroundColor: 'rgba(34, 197, 94, 0.8)',
  },
  unaffordableButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
  },
  purchaseButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  ownedButtonText: {
    color: '#fff',
  },
  unaffordableButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingButton: {
    backgroundColor: 'rgba(107, 114, 128, 0.8)',
  },
  loadingButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default PointsStore;