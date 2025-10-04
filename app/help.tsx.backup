import React from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>How ADHDers works</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.h2}>Quick Start</Text>
      <Text style={styles.p}>1) Giriş yap → Anasayfada küçük görevler ekle</Text>
      <Text style={styles.p}>2) Her görev için küçük artışlar yap ("+")</Text>
      <Text style={styles.p}>3) Günlük toplam ilerleme barını doldur</Text>
      <Text style={styles.p}>4) Arkadaşlar & Gruplar: sohbet et, paylaş, motive ol</Text>

      <Text style={styles.h2}>Daily Tasks & Dopamine</Text>
      <Text style={styles.p}>- Her görevin kendi ilerleme çubuğu vardır. Tamamlanınca kupa ve konfeti ile kutlama alırsın.</Text>
      <Text style={styles.p}>- Altta günün toplam ilerleme barı, tüm görevlerin minik kazanımlarını toplar.</Text>
      <Text style={styles.p}>İpucu: Küçük ve net hedefler belirle (ör. 5 bardak su, 1 minik not, 3 esneme seti).</Text>

      <Text style={styles.h2}>Streaks</Text>
      <Text style={styles.p}>- Herhangi bir görevi tamamladığın gün kaydedilir; ardışık günler “streak” oluşturur.</Text>
      <Text style={styles.p}>İpucu: Çok yoğun günlerde tek bir minik görevi bitirmek bile seriyi korur.</Text>

      <Text style={styles.h2}>Personalization</Text>
      <Text style={styles.p}>- Profil sayfasından pastel paletini seç → arayüz sana göre şekillenir.</Text>
      <Text style={styles.p}>- Görev oluştururken renk seçebilirsin; görsel geri bildirim odaklıdır.</Text>

      <Text style={styles.h2}>Chats & Groups</Text>
      <Text style={styles.p}>- Grup oluştur, davet kodu ile katıl; mesaj ve sesli not (mock) gönder.</Text>
      <Text style={styles.p}>- Mesajlara reaksiyon ekleyerek birbirinizi motive edin.</Text>

      <Text style={styles.h2}>Friends & Feed</Text>
      <Text style={styles.p}>- Arkadaş isteği gönder/al; kısa güncellemeler paylaş ve reaksiyon topla.</Text>

      <Text style={styles.h2}>Backup / Restore</Text>
      <Text style={styles.p}>- Profil → Data Tools kısmından JSON yedek al ve geri yükle.</Text>

      <Text style={styles.h2}>Privacy</Text>
      <Text style={styles.p}>- Bu MVP’de tüm veriler cihazında yerel olarak saklanır. Gerçek zamanlı sürümde gizlilik ve güvenlik önceliğimizdir.</Text>

      <View style={{ height: 24 }} />
      <TouchableOpacity style={styles.cta} onPress={() => router.back()}>
        <Text style={styles.ctaText}>Tamam</Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginLeft: -40, // Compensate for back button
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 15,
    color: '#E5E7EB',
    marginBottom: 8,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 15,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 22,
  },
  tipText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  ctaSection: {
    marginTop: 32,
    marginBottom: 20,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bottomPadding: {
    height: 40,
  },
});