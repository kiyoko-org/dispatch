import {
  View,
  Text,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  Alert,
  Pressable,
  TextInput,
} from 'react-native';
import {
  User,
  MapPin,
  Cake,
  Camera as CameraIcon,
  ShieldCheck,
  Shield,
  ChevronLeft,
  ChevronRight,
  Navigation,
} from 'lucide-react-native';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import {
  deriveVerificationState,
  type VerificationRequest,
} from '@kiyoko-org/dispatch-lib';
import { useDispatchClient } from 'components/DispatchProvider';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import ManualVerificationModal from 'components/verification/ManualVerificationModal';
import { useTheme } from 'components/ThemeContext';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { useGuest } from 'contexts/GuestContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from 'lib/supabase';
import { isProfileComplete } from 'lib/guards/access-control';

// ── helpers ────────────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(month: number, year: number) {
  return new Date(year, month, 1).getDay();
}

function formatVerificationDocumentType(documentType: string | null | undefined) {
  if (!documentType) return 'ID document';

  switch (documentType) {
    case 'drivers_license':
      return "Driver's License";
    case 'postal_id':
      return 'Postal ID';
    case 'umid':
      return 'UMID';
    case 'passport':
      return 'Passport';
    default:
      return 'Other ID';
  }
}

function getVerificationCardConfig(state: 'verified' | 'pending' | 'rejected' | 'unverified') {
  switch (state) {
    case 'pending':
      return {
        backgroundColor: '#F59E0B18',
        borderColor: '#F59E0B40',
        accentColor: '#F59E0B',
        title: 'Verification Pending',
      };
    case 'rejected':
      return {
        backgroundColor: '#EF444418',
        borderColor: '#EF444440',
        accentColor: '#EF4444',
        title: 'Verification Rejected',
      };
    case 'verified':
      return {
        backgroundColor: '#22C55E18',
        borderColor: '#22C55E40',
        accentColor: '#22C55E',
        title: 'Level 2 Verified',
      };
    default:
      return {
        backgroundColor: '#2563EB18',
        borderColor: '#2563EB40',
        accentColor: '#2563EB',
        title: 'Level 2 Verification',
      };
  }
}

// ── CharCount ──────────────────────────────────────────────────────────────
function CharCount({ value, limit }: { value: string; limit: number }) {
  const n = value.length;
  if (n === 0) return null;
  return (
    <Text style={{ color: n >= limit ? '#EF4444' : '#F87171', fontSize: 11, marginTop: 3 }}>
      {n} / {limit} character{n !== 1 ? 's' : ''}
    </Text>
  );
}

// ── InlineField ────────────────────────────────────────────────────────────
type InlineFieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  limit: number;
  placeholder?: string;
  icon: React.ReactNode;
  multiline?: boolean;
  colors: Record<string, string>;
};

function InlineField({ label, value, onChange, limit, placeholder, icon, multiline = false, colors }: InlineFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        {icon}
        <Text style={{ marginLeft: 8, fontSize: 11, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 }}>
          {label}
        </Text>
      </View>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.slice(0, limit))}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
        placeholderTextColor={colors.textSecondary}
        maxLength={limit}
        multiline={multiline}
        style={{
          color: colors.text,
          fontSize: 15,
          fontWeight: '500',
          paddingVertical: 4,
          borderBottomWidth: focused ? 1.5 : 0,
          borderBottomColor: focused ? colors.primary : 'transparent',
          minHeight: multiline ? 56 : undefined,
          textAlignVertical: multiline ? 'top' : undefined,
        }}
      />
      {focused && <CharCount value={value} limit={limit} />}
    </View>
  );
}

// ── CalendarPicker ─────────────────────────────────────────────────────────
// Three-view picker: day grid → month grid → year list
// Tap the month or year in the header to jump directly — no endless scrolling.

type CalendarView = 'day' | 'month' | 'year';

type CalendarPickerProps = {
  visible: boolean;
  initial: string;
  onConfirm: (iso: string) => void;
  onClose: () => void;
  colors: Record<string, string>;
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_LIST = Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => CURRENT_YEAR - i); // newest first

function CalendarPicker({ visible, initial, onConfirm, onClose, colors }: CalendarPickerProps) {
  const today = new Date();
  const parsed = initial ? new Date(initial) : null;

  const [view, setView] = useState<CalendarView>('day');
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(parsed?.getDate() ?? null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(parsed?.getMonth() ?? null);
  const [selectedYear, setSelectedYear] = useState<number | null>(parsed?.getFullYear() ?? null);

  const yearScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      const p = initial ? new Date(initial) : null;
      setView('day');
      setViewYear(p?.getFullYear() ?? today.getFullYear());
      setViewMonth(p?.getMonth() ?? today.getMonth());
      setSelectedDay(p?.getDate() ?? null);
      setSelectedMonth(p?.getMonth() ?? null);
      setSelectedYear(p?.getFullYear() ?? null);
    }
  }, [visible]);

  // Scroll year list to the selected/current year when that view opens
  useEffect(() => {
    if (view === 'year') {
      const targetYear = selectedYear ?? viewYear;
      const idx = YEAR_LIST.indexOf(targetYear);
      if (idx >= 0) {
        setTimeout(() => yearScrollRef.current?.scrollTo({ y: idx * 48, animated: false }), 50);
      }
    }
  }, [view]);

  // ── day view helpers ────────────────────────────────────────────
  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }
  function pickDay(day: number) {
    setSelectedDay(day); setSelectedMonth(viewMonth); setSelectedYear(viewYear);
  }

  // ── month view ──────────────────────────────────────────────────
  function pickMonth(m: number) {
    setViewMonth(m);
    setView('day');
  }

  // ── year view ───────────────────────────────────────────────────
  function pickYear(y: number) {
    setViewYear(y);
    setView('month');
  }

  // ── confirm ─────────────────────────────────────────────────────
  function confirm() {
    if (selectedDay !== null && selectedMonth !== null && selectedYear !== null) {
      const mm = String(selectedMonth + 1).padStart(2, '0');
      const dd = String(selectedDay).padStart(2, '0');
      onConfirm(`${selectedYear}-${mm}-${dd}`);
    }
    onClose();
  }

  // ── day grid ────────────────────────────────────────────────────
  const totalDays = daysInMonth(viewMonth, viewYear);
  const startOffset = firstDayOfMonth(viewMonth, viewYear);
  const cells: (number | null)[] = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}
        onPress={onClose}>
        <Pressable style={{ width: '100%', borderRadius: 20, backgroundColor: colors.surface, overflow: 'hidden' }} onPress={() => {}}>

          {/* ── Header ── */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            {view === 'day' ? (
              <TouchableOpacity onPress={prevMonth} style={{ padding: 6 }}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setView('day')} style={{ padding: 6 }}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
            )}

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={() => setView(view === 'month' ? 'day' : 'month')}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: view === 'month' ? colors.primary : colors.surfaceVariant }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: view === 'month' ? '#fff' : colors.text }}>
                  {MONTHS[viewMonth]}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setView(view === 'year' ? 'day' : 'year')}
                style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: view === 'year' ? colors.primary : colors.surfaceVariant }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: view === 'year' ? '#fff' : colors.text }}>
                  {viewYear}
                </Text>
              </TouchableOpacity>
            </View>

            {view === 'day' ? (
              <TouchableOpacity onPress={nextMonth} style={{ padding: 6 }}>
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            ) : <View style={{ width: 32 }} />}
          </View>

          {/* ── Year view ── */}
          {view === 'year' && (
            <ScrollView ref={yearScrollRef} style={{ maxHeight: 280 }} showsVerticalScrollIndicator={false}>
              {YEAR_LIST.map(y => {
                const isSel = y === (selectedYear ?? viewYear);
                return (
                  <TouchableOpacity
                    key={y}
                    onPress={() => pickYear(y)}
                    style={{ height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? colors.primary + '18' : 'transparent' }}>
                    <Text style={{ fontSize: 16, fontWeight: isSel ? '700' : '400', color: isSel ? colors.primary : colors.text }}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* ── Month view ── */}
          {view === 'month' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 12 }}>
              {MONTHS.map((m, mi) => {
                const isSel = mi === (selectedMonth ?? viewMonth);
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => pickMonth(mi)}
                    style={{ width: '25%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: isSel ? colors.primary : 'transparent', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: isSel ? '700' : '500', color: isSel ? '#fff' : colors.text }}>
                      {m.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ── Day view ── */}
          {view === 'day' && (
            <>
              <View style={{ flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12 }}>
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                  <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: colors.textSecondary }}>{d}</Text>
                ))}
              </View>
              <View style={{ padding: 12 }}>
                {weeks.map((week, wi) => (
                  <View key={wi} style={{ flexDirection: 'row', marginBottom: 2 }}>
                    {week.map((day, di) => {
                      const isSel = day !== null && day === selectedDay && viewMonth === selectedMonth && viewYear === selectedYear;
                      return (
                        <TouchableOpacity
                          key={di}
                          onPress={() => day && pickDay(day)}
                          disabled={!day}
                          style={{ flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: isSel ? colors.primary : 'transparent' }}>
                          {day ? (
                            <Text style={{ fontSize: 14, fontWeight: isSel ? '700' : '400', color: isSel ? '#fff' : colors.text }}>{day}</Text>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── Actions ── */}
          <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TouchableOpacity onPress={onClose} style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: colors.surfaceVariant }}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirm}
              disabled={selectedDay === null}
              style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: selectedDay !== null ? colors.primary : colors.surfaceVariant }}>
              <Text style={{ color: selectedDay !== null ? '#fff' : colors.textSecondary, fontWeight: '600' }}>Confirm</Text>
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { colors, isDark } = useTheme();
  const { client, isInitialized } = useDispatchClient();
  const { profile, loading, refresh } = useCurrentProfile();
  const { isGuest, guestName } = useGuest();
  const router = useRouter();

  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [manualVerificationModalVisible, setManualVerificationModalVisible] = useState(false);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [verificationRequestsLoading, setVerificationRequestsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Local field state — initialised from profile
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [address1, setAddress1] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  const normalizeValue = useCallback((value: string) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }, []);

  const resetDraftFromProfile = useCallback(() => {
    if (!profile) return;
    setFirstName(profile.first_name ?? '');
    setMiddleName(profile.middle_name ?? '');
    setLastName(profile.last_name ?? '');
    setBirthDate(profile.birth_date ?? '');
    setAddress1(profile.permanent_address_1 ?? '');
  }, [profile]);

  useEffect(() => {
    resetDraftFromProfile();
  }, [resetDraftFromProfile]);

  const changedProfileFields = useMemo(() => {
    if (!profile) return {} as Record<string, string | null>;

    const changes: Record<string, string | null> = {};

    const firstNameValue = normalizeValue(firstName);
    if (firstNameValue !== (profile.first_name ?? null)) {
      changes.first_name = firstNameValue;
    }

    const middleNameValue = normalizeValue(middleName);
    if (middleNameValue !== (profile.middle_name ?? null)) {
      changes.middle_name = middleNameValue;
    }

    const lastNameValue = normalizeValue(lastName);
    if (lastNameValue !== (profile.last_name ?? null)) {
      changes.last_name = lastNameValue;
    }

    const birthDateValue = normalizeValue(birthDate);
    if (birthDateValue !== (profile.birth_date ?? null)) {
      changes.birth_date = birthDateValue;
    }

    const addressValue = normalizeValue(address1);
    if (addressValue !== (profile.permanent_address_1 ?? null)) {
      changes.permanent_address_1 = addressValue;
    }

    return changes;
  }, [address1, birthDate, firstName, lastName, middleName, normalizeValue, profile]);

  const hasUnsavedChanges = Object.keys(changedProfileFields).length > 0;

  const saveProfileEdits = useCallback(async () => {
    if (!client || !profile?.id || !hasUnsavedChanges) return;

    setSaveLoading(true);

    try {
      const { error } = await client.updateProfile(profile.id, changedProfileFields);

      if (error) {
        Alert.alert('Save failed', error.message || 'Could not save profile changes.');
        return;
      }

      await refresh();
      Alert.alert('Saved', 'Profile changes saved.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not save profile changes.';
      Alert.alert('Save failed', message);
    } finally {
      setSaveLoading(false);
    }
  }, [changedProfileFields, client, hasUnsavedChanges, profile?.id, refresh]);

  const loadVerificationRequests = useCallback(async () => {
    if (!client || !profile?.id) {
      setVerificationRequests([]);
      return;
    }

    setVerificationRequestsLoading(true);

    try {
      const { data, error } = await client.fetchMyVerificationRequests();
      if (error) {
        console.error('Failed to fetch verification requests', error);
        return;
      }

      setVerificationRequests((data ?? []) as VerificationRequest[]);
    } catch (error) {
      console.error('Unexpected verification request fetch error', error);
    } finally {
      setVerificationRequestsLoading(false);
    }
  }, [client, profile?.id]);

  useEffect(() => {
    if (!isInitialized || !client || !profile?.id) return;
    void loadVerificationRequests();
  }, [client, isInitialized, loadVerificationRequests, profile?.id]);

  async function handleGetLocation() {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [geo] = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      if (geo) {
        const parts = [geo.streetNumber, geo.street, geo.district, geo.city, geo.region].filter(Boolean);
        const addr = parts.join(', ').slice(0, 150);
        setAddress1(addr);
      }
    } catch {
      Alert.alert('Error', 'Could not get location. Please try again.');
    } finally {
      setLocationLoading(false);
    }
  }

  const openCameraForQr = async () => {
    try {
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) { Alert.alert('Permission required', 'Camera permission is required to scan the QR code.'); return; }
      }
      setIsScanning(false);
      setCameraModalVisible(true);
    } catch { Alert.alert('Error', 'Unable to request camera permission.'); }
  };

  const openManualVerification = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Save Profile First',
        'Save your profile changes before uploading another ID.',
      );
      return;
    }

    if (!isProfileComplete(profile)) {
      Alert.alert(
        'Complete Profile First',
        'Complete and save your first name, last name, birth date, and current address before uploading another ID.',
      );
      return;
    }

    setManualVerificationModalVisible(true);
  }, [hasUnsavedChanges, profile]);

  const processQrValue = async (qrValue: string) => {
    try {
      setVerifyLoading(true);
      const { data, error } = await supabase.functions.invoke('verify-national-id', { body: { qrData: qrValue } });
      if (error) {
        Alert.alert('Verification failed', 'Unable to verify the scanned QR.');
      } else if (data?.success) {
        Alert.alert('Success', 'Your account has been securely verified!');
        await refresh();
        await loadVerificationRequests();
      } else {
        Alert.alert('Verification failed', data?.error || 'Invalid or fraudulent ID recognized.');
      }
    } catch { Alert.alert('Verification error', 'An error occurred. Please try again.'); }
    finally { setIsScanning(false); setVerifyLoading(false); }
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (isScanning) return;
    setIsScanning(true);
    setCameraModalVisible(false);
    processQrValue(data);
  };

  const formatDate = (iso: string) => {
    if (!iso) return 'Not set';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Not set';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const verificationState = useMemo(() => {
    return deriveVerificationState({
      isVerified: profile?.is_verified,
      requests: verificationRequests,
    });
  }, [profile?.is_verified, verificationRequests]);

  const verificationCard = getVerificationCardConfig(verificationState.state);
  const latestVerificationRequest = verificationState.latestRequest;
  const savedProfileComplete = useMemo(() => isProfileComplete(profile), [profile]);
  const colorMap = colors as unknown as Record<string, string>;

  const iconProps = { size: 15, color: colors.textSecondary };
  const divider = <View style={{ marginLeft: 16, height: 1, backgroundColor: colors.border }} />;

  // ── Guest view ──────────────────────────────────────────────────
  if (isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <HeaderWithSidebar title="Profile" showBackButton={false} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{ height: 80, width: 80, borderRadius: 40, backgroundColor: colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <User size={40} color={colors.textSecondary} />
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 4 }}>{guestName}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginBottom: 32 }}>Guest Account</Text>
          <View style={{ width: '100%', borderRadius: 16, padding: 20, marginBottom: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 13, textAlign: 'center', color: colors.textSecondary }}>
              You&apos;re browsing as a guest. Create an account to unlock all features and keep your data safe.
            </Text>
          </View>
          <TouchableOpacity
            style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 16, gap: 8, backgroundColor: colors.primary }}
            onPress={() => router.push('/auth/sign-up')}>
            <ShieldCheck size={20} color="#fff" />
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Get Verified</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading && !profile) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <HeaderWithSidebar title="Profile" showBackButton={false} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  // ── Authenticated view ───────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
      <HeaderWithSidebar title="Profile" showBackButton={false} />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Verification section */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <View
            style={{
              borderRadius: 16,
              padding: 16,
              backgroundColor: verificationState.state === 'unverified' ? colors.primary : verificationCard.backgroundColor,
              borderWidth: verificationState.state === 'unverified' ? 0 : 1,
              borderColor: verificationState.state === 'unverified' ? 'transparent' : verificationCard.borderColor,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              {verificationState.state === 'verified' ? (
                <ShieldCheck size={20} color={verificationCard.accentColor} />
              ) : (
                <Shield size={18} color={verificationState.state === 'unverified' ? '#fff' : verificationCard.accentColor} />
              )}

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: '700',
                    fontSize: 15,
                    color: verificationState.state === 'unverified' ? '#fff' : verificationCard.accentColor,
                  }}
                >
                  {verificationCard.title}
                </Text>

                {verificationState.state === 'verified' && (
                  <Text style={{ marginTop: 4, fontSize: 12, color: verificationCard.accentColor, opacity: 0.85 }}>
                    Your identity has been verified.
                  </Text>
                )}

                {verificationState.state === 'unverified' && (
                  <Text style={{ marginTop: 4, fontSize: 13, color: '#fff', opacity: 0.92 }}>
                    Verify with National ID or upload another ID for manual review. Uploading another ID requires a complete saved profile.
                  </Text>
                )}

                {verificationState.state === 'pending' && (
                  <>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.text }}>
                      {latestVerificationRequest
                        ? `${formatVerificationDocumentType(latestVerificationRequest.document_type)} submitted on ${formatDate(latestVerificationRequest.created_at)}`
                        : 'Your verification request is currently under review.'}
                    </Text>
                    <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                      You already have a pending request. Please wait for admin review.
                    </Text>
                  </>
                )}

                {verificationState.state === 'rejected' && (
                  <>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.text }}>
                      {latestVerificationRequest
                        ? `${formatVerificationDocumentType(latestVerificationRequest.document_type)} was reviewed on ${formatDate(latestVerificationRequest.reviewed_at ?? latestVerificationRequest.updated_at)}`
                        : 'Your last manual verification request was rejected.'}
                    </Text>
                    {!!latestVerificationRequest?.review_notes && (
                      <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                        Notes: {latestVerificationRequest.review_notes}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>

            {verificationRequestsLoading && verificationState.state !== 'verified' ? (
              <View style={{ paddingTop: 12 }}>
                <ActivityIndicator color={verificationState.state === 'unverified' ? '#fff' : verificationCard.accentColor} />
              </View>
            ) : null}

            {verificationState.state === 'unverified' && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  onPress={openCameraForQr}
                  disabled={verifyLoading}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.18)',
                  }}
                >
                  {verifyLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Verify National ID</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openManualVerification}
                  disabled={!client || verificationRequestsLoading}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#fff',
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Upload Another ID</Text>
                </TouchableOpacity>
              </View>
            )}

            {verificationState.state === 'rejected' && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <TouchableOpacity
                  onPress={openCameraForQr}
                  disabled={verifyLoading}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.primary,
                  }}
                >
                  {verifyLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Try National ID</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openManualVerification}
                  disabled={!client || verificationRequestsLoading}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>Submit Another ID</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {!savedProfileComplete && (
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            <View
              style={{
                borderRadius: 16,
                padding: 16,
                backgroundColor: '#F59E0B18',
                borderWidth: 1,
                borderColor: '#F59E0B40',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#B45309' }}>
                Complete your profile first
              </Text>
              <Text style={{ marginTop: 6, fontSize: 12, color: colors.textSecondary }}>
                Save your first name, last name, birth date, and current address to unlock Emergency, Report Incident, and Upload Another ID.
              </Text>
              {hasUnsavedChanges && (
                <Text style={{ marginTop: 6, fontSize: 12, color: '#B45309' }}>
                  You still have unsaved profile changes.
                </Text>
              )}
            </View>
          </View>
        )}

        {client && profile?.id ? (
          <ManualVerificationModal
            visible={manualVerificationModalVisible}
            profileId={profile.id}
            client={client}
            colors={colorMap}
            onClose={() => setManualVerificationModalVisible(false)}
            onSubmitted={async () => {
              await refresh();
              await loadVerificationRequests();
            }}
          />
        ) : null}

        {/* Camera Modal */}
        <Modal visible={cameraModalVisible} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setCameraModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'black' }}>
            <CameraView style={{ flex: 1 }} facing="back" onBarcodeScanned={handleBarcodeScanned} />
            <View style={{ position: 'absolute', top: 48, left: 16, right: 16 }}>
              <Pressable onPress={() => setCameraModalVisible(false)} style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10 }}>
                <Text style={{ color: 'white', fontWeight: '600' }}>Cancel</Text>
              </Pressable>
            </View>
            <View style={{ position: 'absolute', bottom: 48, left: 0, right: 0, alignItems: 'center' }}>
              <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <CameraIcon size={18} color="white" />
                <Text style={{ color: 'white', fontSize: 13, fontWeight: '500' }}>Point at National ID QR Code</Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Calendar modal */}
        <CalendarPicker
          visible={calendarVisible}
          initial={birthDate}
          colors={colorMap}
          onConfirm={(iso) => {
            setBirthDate(iso);
          }}
          onClose={() => setCalendarVisible(false)}
        />

        {/* Personal Information */}
        <View style={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' }}>
            Personal Information
          </Text>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>
            Tap a field to edit
          </Text>
        </View>

        <View style={{ marginHorizontal: 16, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>

          {/* First Name */}
          <InlineField
            label="FIRST NAME"
            value={firstName}
            onChange={setFirstName}
            limit={30}
            icon={<User {...iconProps} />}
            colors={colorMap}
          />
          {divider}

          {/* Middle Name */}
          <InlineField
            label="MIDDLE NAME"
            value={middleName}
            onChange={setMiddleName}
            limit={30}
            icon={<User {...iconProps} />}
            colors={colorMap}
          />
          {divider}

          {/* Last Name */}
          <InlineField
            label="LAST NAME"
            value={lastName}
            onChange={setLastName}
            limit={30}
            icon={<User {...iconProps} />}
            colors={colorMap}
          />
          {divider}

          {/* Date of Birth — calendar tap */}
          <TouchableOpacity onPress={() => setCalendarVisible(true)} activeOpacity={0.7}>
            <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Cake {...iconProps} />
                <Text style={{ marginLeft: 8, fontSize: 11, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 }}>
                  DATE OF BIRTH
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '500', color: birthDate ? colors.text : colors.textSecondary }}>
                {birthDate ? formatDate(birthDate) : 'Tap to select date'}
              </Text>
            </View>
          </TouchableOpacity>
          {divider}

          {/* Current Address */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MapPin {...iconProps} />
                <Text style={{ marginLeft: 8, fontSize: 11, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5 }}>
                  CURRENT ADDRESS
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleGetLocation}
                disabled={locationLoading}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: colors.surfaceVariant }}>
                {locationLoading
                  ? <ActivityIndicator size="small" color={colors.primary} />
                  : <Navigation size={13} color={colors.primary} />}
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.primary }}>
                  {locationLoading ? 'Locating…' : 'Use Location'}
                </Text>
              </TouchableOpacity>
            </View>
            <InlineAddressField
              value={address1}
              onChange={setAddress1}
              colors={colorMap}
            />
          </View>

        </View>

        {hasUnsavedChanges && (
          <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
            <TouchableOpacity
              onPress={() => void saveProfileEdits()}
              disabled={saveLoading}
              style={{
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: saveLoading ? colors.surfaceVariant : colors.primary,
              }}>
              {saveLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>Save Changes</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={resetDraftFromProfile}
              disabled={saveLoading}
              style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: '600' }}>Discard</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── InlineAddressField (multiline variant with its own focus state) ─────────
function InlineAddressField({ value, onChange, colors }: {
  value: string;
  onChange: (v: string) => void;
  colors: Record<string, string>;
}) {
  const [focused, setFocused] = useState(false);
  const LIMIT = 150;

  return (
    <>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.slice(0, LIMIT))}
        onBlur={() => setFocused(false)}
        onFocus={() => setFocused(true)}
        placeholder="Enter address"
        placeholderTextColor={colors.textSecondary}
        maxLength={LIMIT}
        multiline
        style={{
          color: colors.text,
          fontSize: 15,
          fontWeight: '500',
          paddingVertical: 4,
          borderBottomWidth: focused ? 1.5 : 0,
          borderBottomColor: focused ? colors.primary : 'transparent',
          minHeight: 48,
          textAlignVertical: 'top',
        }}
      />
      {focused && <CharCount value={value} limit={LIMIT} />}
    </>
  );
}
