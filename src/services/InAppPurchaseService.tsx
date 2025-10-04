import {
  initConnection,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getProducts,
  requestPurchase,
  acknowledgePurchaseAndroid,
  finishTransaction,
  getPurchaseHistory,
  getAvailablePurchases,
  Product,
  Purchase,
  PurchaseError,
  SubscriptionPurchase,
} from 'react-native-iap';
import { Platform, Alert } from 'react-native';

// Mock Product IDs - Easy to change for production
const PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'adhders_premium_monthly',
  PREMIUM_YEARLY: 'adhders_premium_yearly', // For future
};

export interface PurchaseResult {
  success: boolean;
  purchase?: Purchase;
  error?: string;
  userCancelled?: boolean;
}

export interface RestoreResult {
  success: boolean;
  purchases: Purchase[];
  error?: string;
}

export class InAppPurchaseService {
  private static instance: InAppPurchaseService;
  private isConnected = false;
  private products: Product[] = [];
  private purchaseUpdateSubscription: any;
  private purchaseErrorSubscription: any;

  private constructor() {}

  static getInstance(): InAppPurchaseService {
    if (!InAppPurchaseService.instance) {
      InAppPurchaseService.instance = new InAppPurchaseService();
    }
    return InAppPurchaseService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🔧 Initializing In-App Purchase Service...');
      
      // Initialize connection
      const result = await initConnection();
      console.log('📱 IAP Connection result:', result);
      
      this.isConnected = true;

      // Set up listeners
      this.setupPurchaseListeners();

      // Load products
      await this.loadProducts();

      console.log('✅ In-App Purchase Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize IAP service:', error);
      
      // Mock success for development
      if (__DEV__) {
        console.log('🔧 Development mode - using mock IAP service');
        this.isConnected = true;
        this.products = this.getMockProducts();
        return true;
      }
      
      return false;
    }
  }

  private setupPurchaseListeners() {
    // Purchase update listener
    this.purchaseUpdateSubscription = purchaseUpdatedListener((purchase: Purchase) => {
      console.log('🛒 Purchase updated:', purchase);
      this.handlePurchaseUpdate(purchase);
    });

    // Purchase error listener
    this.purchaseErrorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.log('❌ Purchase error:', error);
      this.handlePurchaseError(error);
    });
  }

  private async handlePurchaseUpdate(purchase: Purchase) {
    try {
      console.log('🔄 Processing purchase update:', purchase.productId);
      
      // Validate purchase with backend
      const validationResult = await this.validatePurchaseWithBackend(purchase);
      
      if (validationResult.success) {
        // Acknowledge purchase on Android
        if (Platform.OS === 'android') {
          await acknowledgePurchaseAndroid(purchase.purchaseToken);
        }
        
        // Finish transaction on iOS
        if (Platform.OS === 'ios') {
          await finishTransaction(purchase);
        }
        
        console.log('✅ Purchase completed successfully');
        Alert.alert(
          '🎉 Purchase Successful!',
          'Welcome to Premium! You now have access to all premium features.',
          [{ text: 'Great!', style: 'default' }]
        );
      } else {
        console.error('❌ Purchase validation failed:', validationResult.error);
        Alert.alert('Purchase Error', 'There was an issue validating your purchase. Please contact support.');
      }
    } catch (error) {
      console.error('❌ Error handling purchase update:', error);
    }
  }

  private handlePurchaseError(error: PurchaseError) {
    console.log('Purchase Error Details:', error);
    
    // Don't show alert for user cancellation
    if (error.code === 'E_USER_CANCELLED') {
      console.log('👤 User cancelled purchase');
      return;
    }
    
    Alert.alert(
      'Purchase Failed',
      `There was an issue processing your purchase: ${error.message}`,
      [{ text: 'OK', style: 'default' }]
    );
  }

  private async loadProducts(): Promise<void> {
    try {
      const productIds = Object.values(PRODUCT_IDS);
      console.log('📦 Loading products:', productIds);
      
      const products = await getProducts(productIds);
      this.products = products;
      
      console.log('✅ Products loaded:', products.length);
      products.forEach(product => {
        console.log(`💰 ${product.productId}: ${product.localizedPrice}`);
      });
    } catch (error) {
      console.error('❌ Failed to load products:', error);
      
      // Use mock products in development
      if (__DEV__) {
        this.products = this.getMockProducts();
        console.log('🔧 Using mock products for development');
      }
    }
  }

  private getMockProducts(): Product[] {
    return [
      {
        productId: PRODUCT_IDS.PREMIUM_MONTHLY,
        price: '4.99',
        currency: 'USD',
        localizedPrice: '$4.99',
        title: 'ADHDers Premium Monthly',
        description: 'Monthly premium subscription with all features',
        type: 'subs',
      } as Product,
    ];
  }

  async purchasePremiumMonthly(): Promise<PurchaseResult> {
    try {
      if (!this.isConnected) {
        throw new Error('IAP service not initialized');
      }

      console.log('🛒 Starting premium monthly purchase...');
      
      const purchase = await requestPurchase(PRODUCT_IDS.PREMIUM_MONTHLY);
      
      return {
        success: true,
        purchase: purchase as Purchase,
      };
    } catch (error: any) {
      console.error('❌ Purchase failed:', error);
      
      if (error.code === 'E_USER_CANCELLED') {
        return {
          success: false,
          userCancelled: true,
          error: 'User cancelled purchase',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Purchase failed',
      };
    }
  }

  async restorePurchases(): Promise<RestoreResult> {
    try {
      console.log('🔄 Restoring purchases...');
      
      const purchases = await getAvailablePurchases();
      console.log('📱 Found purchases:', purchases.length);
      
      // Validate each purchase with backend
      const validatedPurchases: Purchase[] = [];
      
      for (const purchase of purchases) {
        const validationResult = await this.validatePurchaseWithBackend(purchase);
        if (validationResult.success) {
          validatedPurchases.push(purchase);
        }
      }
      
      return {
        success: true,
        purchases: validatedPurchases,
      };
    } catch (error: any) {
      console.error('❌ Restore failed:', error);
      return {
        success: false,
        purchases: [],
        error: error.message || 'Restore failed',
      };
    }
  }

  private async validatePurchaseWithBackend(purchase: Purchase): Promise<{success: boolean, error?: string}> {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
      
      const response = await fetch(`${backendUrl}/api/subscriptions/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`, // Get from auth context
        },
        body: JSON.stringify({
          platform: Platform.OS,
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
          receiptData: purchase.transactionReceipt || purchase.purchaseToken,
          transactionId: purchase.transactionId,
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        return { success: true };
      } else {
        return { success: false, error: result.message || 'Validation failed' };
      }
    } catch (error: any) {
      console.error('❌ Backend validation error:', error);
      
      // Mock success for development
      if (__DEV__) {
        console.log('🔧 Development mode - mocking successful validation');
        return { success: true };
      }
      
      return { success: false, error: error.message };
    }
  }

  private getAuthToken(): string {
    // This should get the token from your auth context
    // For now, return a mock token
    return 'mock_auth_token';
  }

  getProducts(): Product[] {
    return this.products;
  }

  getPremiumMonthlyProduct(): Product | undefined {
    return this.products.find(p => p.productId === PRODUCT_IDS.PREMIUM_MONTHLY);
  }

  isServiceConnected(): boolean {
    return this.isConnected;
  }

  async cleanup() {
    console.log('🧹 Cleaning up IAP service...');
    
    if (this.purchaseUpdateSubscription) {
      this.purchaseUpdateSubscription.remove();
    }
    
    if (this.purchaseErrorSubscription) {
      this.purchaseErrorSubscription.remove();
    }
  }
}

// Export singleton instance
export const iapService = InAppPurchaseService.getInstance();