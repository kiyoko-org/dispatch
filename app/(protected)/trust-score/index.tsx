import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingDown,
  Phone,
  FileText,
  Clock,
  MapPin,
  Minus,
  Plus,
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { supabase } from 'lib/supabase';
import { useAuth } from 'hooks/useAuth';

export default function TrustScorePage() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [trustScore, setTrustScore] = useState<number>(3);
  const [lowPriority, setLowPriority] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTrustScore();
  }, []);

  const loadTrustScore = async () => {
    try {
      const stored = await AsyncStorage.getItem('trust_score');
      if (stored !== null) {
        const score = parseInt(stored);
        setTrustScore(score);
        setLowPriority(score <= 0);
      }
    } catch (error) {
      console.error('Error loading trust score:', error);
    }
  };

  const getTrustLevel = (score: number) => {
    if (score === 3) return { label: 'Excellent Trust', color: '#10B981', bgColor: '#10B98120' }; // Green
    if (score === 2) return { label: 'Good Trust', color: '#F59E0B', bgColor: '#F59E0B20' }; // Amber
    if (score === 1) return { label: 'Low Trust', color: '#F97316', bgColor: '#F9731620' }; // Orange
    return { label: 'No Trust - Low Priority', color: '#DC2626', bgColor: '#DC262620' }; // Dark Red
  };

  const getTrustPercentage = (score: number) => {
    return Math.round((score / 3) * 100);
  };

  // Test functions to modify trust score (frontend only - no backend)
  const decrementTrustScore = () => {
    if (trustScore <= 0) return;
    
    const newScore = trustScore - 1;
    setTrustScore(newScore);
    setLowPriority(newScore <= 0);
  };

  const incrementTrustScore = () => {
    if (trustScore >= 3) return;
    
    const newScore = trustScore + 1;
    setTrustScore(newScore);
    setLowPriority(false);
  };

  const saveTrustScore = async () => {
    setSaving(true);
    try {
      // Save to AsyncStorage so it persists across screens
      await AsyncStorage.setItem('trust_score', trustScore.toString());
      // Simulate saving delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error saving trust score:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      <HeaderWithSidebar title="Trust Score" showBackButton={true} backRoute="/home" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Trust Score Display */}
        <View className="items-center py-8 px-6">
          {/* Large Shield Icon with Glow Effect */}
          <View
            className="items-center justify-center mb-6"
            style={{ 
              position: 'relative',
            }}
          >
            <View
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                backgroundColor: trustScore === 0 ? getTrustLevel(0).bgColor : getTrustLevel(trustScore || 3).bgColor,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: trustScore === 0 ? getTrustLevel(0).color : getTrustLevel(trustScore || 3).color,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
              }}
            >
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Shield size={72} color={trustScore === 0 ? getTrustLevel(0).color : getTrustLevel(trustScore || 3).color} strokeWidth={2.5} />
              )}
            </View>
          </View>
          
          {!loading && trustScore !== null && (
            <>
              {/* Visual Level Bars - Larger and More Prominent */}
              <View className="flex-row gap-3 mb-6" style={{ width: '80%', maxWidth: 280 }}>
                {[1, 2, 3].map((level) => (
                  <View
                    key={level}
                    style={{
                      flex: 1,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: trustScore >= level 
                        ? getTrustLevel(trustScore).color 
                        : colors.border,
                      shadowColor: trustScore >= level ? getTrustLevel(trustScore).color : 'transparent',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.4,
                      shadowRadius: 4,
                      elevation: trustScore >= level ? 3 : 0,
                    }}
                  />
                ))}
              </View>

              {/* Level Number with Better Typography */}
              <Text className="text-6xl font-bold mb-2" style={{ color: getTrustLevel(trustScore).color, letterSpacing: -2 }}>
                Level {trustScore}
              </Text>
              <Text className="text-lg mb-6" style={{ color: colors.textSecondary, fontWeight: '500' }}>
                of 3 trust levels
              </Text>
              
              {/* Status Badge with Better Design */}
              <View
                className="px-6 py-3 rounded-full"
                style={{ 
                  backgroundColor: getTrustLevel(trustScore).bgColor,
                  borderWidth: 1.5,
                  borderColor: getTrustLevel(trustScore).color + '40',
                  shadowColor: getTrustLevel(trustScore).color,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <Text className="text-base font-semibold" style={{ color: getTrustLevel(trustScore).color }}>
                  {getTrustLevel(trustScore).label}
                </Text>
              </View>
              
              {/* Low Priority Warning with Enhanced Design */}
              {lowPriority && (
                <View
                  className="px-5 py-3 rounded-full mt-4"
                  style={{ 
                    backgroundColor: '#DC262615',
                    borderWidth: 1.5,
                    borderColor: '#DC2626',
                  }}
                >
                  <View className="flex-row items-center">
                    <AlertTriangle size={18} color="#DC2626" />
                    <Text className="text-sm font-semibold ml-2" style={{ color: '#DC2626' }}>
                      Flagged as Low Priority
                    </Text>
                  </View>
                </View>
              )}

              {/* Test Controls */}
              <View className="gap-3 mt-8" style={{ width: '90%', maxWidth: 320 }}>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={decrementTrustScore}
                    disabled={trustScore <= 0}
                    style={{
                      flex: 1,
                      backgroundColor: trustScore <= 0 ? colors.border : '#EF4444',
                      paddingVertical: 14,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: trustScore <= 0 ? 0.5 : 1,
                    }}
                  >
                    <Minus size={20} color="white" strokeWidth={2.5} />
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                      Decrease
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={incrementTrustScore}
                    disabled={trustScore >= 3}
                    style={{
                      flex: 1,
                      backgroundColor: trustScore >= 3 ? colors.border : '#10B981',
                      paddingVertical: 14,
                      borderRadius: 12,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      opacity: trustScore >= 3 ? 0.5 : 1,
                    }}
                  >
                    <Plus size={20} color="white" strokeWidth={2.5} />
                    <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>
                      Increase
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={saveTrustScore}
                  disabled={saving}
                  style={{
                    backgroundColor: colors.primary,
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Honor System Explanation */}
        <View className="px-6 py-4">
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View className="flex-row items-center mb-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Info size={20} color={colors.primary} />
              </View>
              <Text className="text-xl font-bold flex-1" style={{ color: colors.text }}>
                How Trust Works
              </Text>
            </View>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
              Trust Score is an honor system. If you're trusted, you're trusted. Your score reflects your responsible use of the Dispatch platform and helps maintain the integrity of our community safety network. You start with a score of 3 (100%) and it decreases if reports are marked as false alarms.
            </Text>
          </View>

          {/* Building Trust Section */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              Building Trust
            </Text>
            
            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TrustItem
                icon={FileText}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Submit Verified Reports"
                description="Accurate incident reports that are confirmed by authorities"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={CheckCircle}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Timely Emergency Responses"
                description="Quick and appropriate responses to emergency situations"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={MapPin}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Accurate Location Information"
                description="Providing precise location details for incidents"
                colors={colors}
              />
              <Divider colors={colors} />
              <TrustItem
                icon={Clock}
                iconBg={colors.success + '20'}
                iconColor={colors.success}
                title="Consistent Platform Use"
                description="Regular, responsible engagement with the community"
                colors={colors}
              />
            </View>
          </View>

          {/* Reasons for Low Trust */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
              What Lowers Trust
            </Text>
            
            <View
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <TrustItem
                icon={Phone}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Prank Emergency Calls"
                description="Making false emergency calls wastes critical resources and endangers lives"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={AlertTriangle}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="False Report Submissions"
                description="Submitting fabricated or misleading incident reports"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={TrendingDown}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Spam or Abuse"
                description="Excessive irrelevant reports or platform misuse"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={MapPin}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Inaccurate Location Data"
                description="Repeatedly providing wrong locations for incidents"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={FileText}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Unverified Information"
                description="Sharing unconfirmed or sensationalized information"
                colors={colors}
                isNegative
              />
              <Divider colors={colors} />
              <TrustItem
                icon={AlertTriangle}
                iconBg={colors.error + '20'}
                iconColor={colors.error}
                title="Community Guidelines Violations"
                description="Behavior that disrupts community safety or violates terms"
                colors={colors}
                isNegative
              />
            </View>
          </View>

          {/* Why Trust Matters */}
          <View
            className="rounded-2xl p-6 mb-6"
            style={{
              backgroundColor: colors.primary + '10',
              borderWidth: 1,
              borderColor: colors.primary + '30',
            }}
          >
            <View className="flex-row items-center mb-3">
              <Shield size={24} color={colors.primary} />
              <Text className="text-lg font-bold ml-3" style={{ color: colors.text }}>
                Why Trust Matters
              </Text>
            </View>
            <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
              A high Trust Score helps emergency responders prioritize reports, ensures faster response times, and maintains the credibility of the platform. Together, we create a safer community through responsible reporting.
            </Text>
          </View>

          {/* Restoring Trust */}
          <View
            className="rounded-2xl p-6"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
              Restoring Your Trust Score
            </Text>
            <Text className="text-base leading-6 mb-4" style={{ color: colors.textSecondary }}>
              If your Trust Score has been affected, you can rebuild it by:
            </Text>
            <View className="space-y-2">
              <BulletPoint text="Submitting accurate and verified reports" colors={colors} />
              <BulletPoint text="Using emergency features responsibly" colors={colors} />
              <BulletPoint text="Providing helpful location and incident details" colors={colors} />
              <BulletPoint text="Following community guidelines" colors={colors} />
              <BulletPoint text="Demonstrating consistent positive engagement" colors={colors} />
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function TrustItem({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  colors,
  isNegative = false,
}: {
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  colors: any;
  isNegative?: boolean;
}) {
  return (
    <View className="flex-row p-4">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: iconBg }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold mb-1" style={{ color: colors.text }}>
          {title}
        </Text>
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          {description}
        </Text>
      </View>
    </View>
  );
}

function Divider({ colors }: { colors: any }) {
  return (
    <View
      className="ml-16"
      style={{
        height: 1,
        backgroundColor: colors.border,
      }}
    />
  );
}

function BulletPoint({ text, colors }: { text: string; colors: any }) {
  return (
    <View className="flex-row items-start mb-2">
      <Text className="text-base mr-2" style={{ color: colors.primary }}>
        •
      </Text>
      <Text className="text-base flex-1" style={{ color: colors.textSecondary }}>
        {text}
      </Text>
    </View>
  );
}

