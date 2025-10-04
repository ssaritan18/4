import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

// Google Sign-In Configuration
export const configureGoogleSignIn = () => {
  if (!webClientId) {
    console.warn(
      '[GoogleSignIn] Missing EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID – Google Sign-In will be disabled until it is provided.'
    );
    return;
  }

  GoogleSignin.configure({
    webClientId,
    iosClientId: iosClientId || undefined,
    offlineAccess: true,
    hostedDomain: '',
    forceCodeForRefreshToken: true,
    accountName: '',
    openIdConnect: true,
  });
};

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  photo?: string;
  idToken: string;
  serverAuthCode?: string;
}

export class GoogleSignInService {
  private static instance: GoogleSignInService;
  
  public static getInstance(): GoogleSignInService {
    if (!GoogleSignInService.instance) {
      GoogleSignInService.instance = new GoogleSignInService();
    }
    return GoogleSignInService.instance;
  }

  constructor() {
    configureGoogleSignIn();
  }

  /**
   * Check if Google Sign-In is available on this device
   */
  async isGoogleSignInAvailable(): Promise<boolean> {
    try {
      return await GoogleSignin.hasPlayServices();
    } catch (error) {
      console.error('Google Sign-In availability check failed:', error);
      return false;
    }
  }

  /**
   * Sign in with Google and return user information
   */
  async signIn(): Promise<GoogleUser | null> {
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();
      
      // Sign in
      const userInfo = await GoogleSignin.signIn();
      
      if (!userInfo.idToken) {
        throw new Error('No ID token received from Google');
      }

      // Extract user information
      const googleUser: GoogleUser = {
        id: userInfo.user.id,
        name: userInfo.user.name || '',
        email: userInfo.user.email || '',
        photo: userInfo.user.photo || undefined,
        idToken: userInfo.idToken,
        serverAuthCode: userInfo.serverAuthCode,
      };

      console.log('✅ Google Sign-In successful:', {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        hasPhoto: !!googleUser.photo,
        hasServerAuthCode: !!googleUser.serverAuthCode
      });

      return googleUser;
    } catch (error: any) {
      console.error('❌ Google Sign-In failed:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled Google Sign-In');
        return null;
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google Sign-In is already in progress');
        return null;
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Google Play Services not available');
        throw new Error('Google Play Services not available. Please update Google Play Services.');
      } else {
        console.error('Unknown Google Sign-In error:', error);
        throw new Error('Google Sign-In failed. Please try again.');
      }
    }
  }

  /**
   * Sign out from Google
   */
  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
      console.log('✅ Google Sign-Out successful');
    } catch (error) {
      console.error('❌ Google Sign-Out failed:', error);
      throw new Error('Failed to sign out from Google');
    }
  }

  /**
   * Get current user if already signed in
   */
  async getCurrentUser(): Promise<GoogleUser | null> {
    try {
      const userInfo = await GoogleSignin.signInSilently();
      
      if (!userInfo.idToken) {
        return null;
      }

      return {
        id: userInfo.user.id,
        name: userInfo.user.name || '',
        email: userInfo.user.email || '',
        photo: userInfo.user.photo || undefined,
        idToken: userInfo.idToken,
        serverAuthCode: userInfo.serverAuthCode,
      };
    } catch (error) {
      console.log('No user currently signed in to Google');
      return null;
    }
  }

  /**
   * Revoke access and sign out
   */
  async revokeAccess(): Promise<void> {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      console.log('✅ Google access revoked successfully');
    } catch (error) {
      console.error('❌ Failed to revoke Google access:', error);
      throw new Error('Failed to revoke Google access');
    }
  }
}

// Export singleton instance
export const googleSignInService = GoogleSignInService.getInstance();
