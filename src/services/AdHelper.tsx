import { Platform } from 'react-native';
// AdMob temporarily disabled to fix crash
// import { TestIds } from 'react-native-google-mobile-ads';

class AdHelper {
  // AdMob temporarily disabled to fix crash
  static getBannerAdUnitId() {
    return null;
    // if (__DEV__) {
    //   // Development - use test IDs
    //   return Platform.OS === 'ios' ? TestIds.BANNER : TestIds.BANNER;
    // }
    // // Production - replace with real ad unit IDs when ready
    // return Platform.OS === 'ios' 
    //   ? 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'  // Will be replaced later
    //   : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'; // Will be replaced later
  }

  static getInterstitialAdUnitId() {
    return null;
    // if (__DEV__) {
    //   // Development - use test IDs
    //   return Platform.OS === 'ios' ? TestIds.INTERSTITIAL : TestIds.INTERSTITIAL;
    // }
    // // Production - replace with real ad unit IDs when ready
    // return Platform.OS === 'ios' 
    //   ? 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'  // Will be replaced later
    //   : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'; // Will be replaced later
  }

  static getRewardedAdUnitId() {
    return null;
    // if (__DEV__) {
    //   // Development - use test IDs
    //   return Platform.OS === 'ios' ? TestIds.REWARDED : TestIds.REWARDED;
    // }
    // // Production - replace with real ad unit IDs when ready
    // return Platform.OS === 'ios' 
    //   ? 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'  // Will be replaced later
    //   : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy'; // Will be replaced later
  }

  static logAdEvent(eventType: string, adType: string, details?: any) {
    // AdMob temporarily disabled to fix crash
    return;
    // if (__DEV__) {
    //   console.log(`🔧 AdMob ${eventType}: ${adType}`, details || '');
    // }
  }
}

export default AdHelper;