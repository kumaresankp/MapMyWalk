import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {AppIcon, PrimaryButton, SecondaryButton} from '../components';
import {useAuth} from '../context/AuthContext';
import {COLORS, RADII, SHADOWS, SPACING, TYPOGRAPHY} from '../theme/theme';

type Props = {
  navigation: any;
};

const FEATURES = [
  {
    icon: 'gps' as const,
    title: 'Precision GPS Mapping',
    subtitle: 'Track walks and runs live with OpenFreeMap routes.',
  },
  {
    icon: 'shield' as const,
    title: 'Private Local Workouts',
    subtitle: 'Your routes and history stay safely stored on your device.',
  },
];

const WelcomeScreen = ({navigation}: Props) => {
  const {continueAsGuest, isConfigured} = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Brand Hero */}
        <View style={styles.heroBanner}>
          <View style={styles.logoFrame}>
            <Image
              source={require('../../assets/logo 512x512.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.brandName}>MyWalkMap</Text>
          <Text style={styles.tagline}>Every Step Has a Story.</Text>
        </View>

        <View style={styles.body}>
          {/* Highlights */}
          <View style={styles.featuresCard}>
            {FEATURES.map((item, index) => (
              <View
                key={item.title}
                style={[
                  styles.featureRow,
                  index > 0 && styles.featureRowBorder,
                ]}>
                <View style={styles.featureIcon}>
                  <AppIcon name={item.icon} size={20} color={COLORS.primary} />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>

          {!isConfigured ? (
            <View style={styles.configNotice}>
              <AppIcon name="alert" size={16} color={COLORS.warningDark} />
              <Text style={styles.configNoticeText}>
                Supabase credentials are not configured yet. You can still use all tracking features in Guest Mode.
              </Text>
            </View>
          ) : null}

          {/* Auth Actions */}
          <View style={styles.actions}>
            <PrimaryButton
              label="Sign In"
              onPress={() => navigation.navigate('Login')}
            />

            <SecondaryButton
              label="Create Account"
              tone="primary"
              onPress={() => navigation.navigate('SignUp')}
            />

            <Pressable
              onPress={continueAsGuest}
              style={({pressed}) => [
                styles.guestButton,
                pressed && styles.guestButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Continue as Guest">
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
              <AppIcon name="chevronRight" size={15} color={COLORS.textSecondary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxl,
  },
  heroBanner: {
    backgroundColor: COLORS.secondary,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: RADII.xl,
    borderBottomRightRadius: RADII.xl,
    alignItems: 'center',
    ...SHADOWS.floating,
  },
  logoFrame: {
    width: 80,
    height: 80,
    borderRadius: RADII.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.secondarySoft,
    borderWidth: 2,
    borderColor: 'rgba(32, 200, 245, 0.35)',
    marginBottom: SPACING.md,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  brandName: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    color: COLORS.textOnPrimary,
  },
  tagline: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.accent,
  },
  body: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    justifyContent: 'space-between',
  },
  featuresCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    ...SHADOWS.card,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  featureRowBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.borderSubtle,
  },
  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: RADII.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...TYPOGRAPHY.cardTitle,
    fontSize: 15,
  },
  featureSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 13,
    marginTop: 2,
  },
  configNotice: {
    marginTop: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.warningSoft,
    borderWidth: 1,
    borderColor: '#FEDF89',
    borderRadius: RADII.md,
    padding: SPACING.sm,
  },
  configNoticeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warningDark,
    lineHeight: 17,
  },
  actions: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  guestButton: {
    minHeight: 48,
    marginTop: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: RADII.md,
  },
  guestButtonPressed: {
    opacity: 0.7,
  },
  guestButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
});

export default WelcomeScreen;
