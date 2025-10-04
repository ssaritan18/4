export default {
  expo: {
    name: "ADHDers Social Club",
    slug: "adhders-social-club",
    version: "1.0.1",
    owner: "ssaritan",
    platforms: ["ios", "android"],
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "adhders",
    userInterfaceStyle: "automatic",
    newArchEnabled: false, // DISABLED for compatibility
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#000000"
    },
    android: {
      package: "com.adhders.socialclub",
      versionCode: 3,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#000000"
      },
      permissions: [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES",
        "READ_MEDIA_VIDEO"
      ]
    },
    ios: {
      bundleIdentifier: "com.adhders.socialclub",
      buildNumber: "26",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        GADApplicationIdentifier: "ca-app-pub-8247392015171096~2470722104",
        NSCameraUsageDescription: "We use your camera so you can take photos to share in chats and update your profile picture.",
        NSPhotoLibraryUsageDescription: "We access your photo library so you can choose existing images to share with the community.",
        NSPhotoLibraryAddUsageDescription: "We need photo library access to save the images you capture inside the app.",
        NSMicrophoneUsageDescription: "This app needs access to microphone for voice messages."
      }
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#000000"
        }
      ],
      "expo-font",
      "expo-web-browser"
    ],
    extra: {
      backendUrl: "https://adhders-social-club.onrender.com",
      ENABLE_ADMOB: false,
      ENABLE_ANIMATIONS: false,
      ENABLE_REANIMATED: false,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "113266512370-6ie1bbg7eofblst28jmbvv9sgq8hm0m0.apps.googleusercontent.com",
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "113266512370-61f75151au1thrs6clh7mi1mctfd44ul.apps.googleusercontent.com",
      eas: {
        projectId: "48f9e931-8683-4fd8-ac6c-99c5feb158e8"
      }
    },
    experiments: {
      typedRoutes: true
    }
  }
};
