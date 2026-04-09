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
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import HeaderWithSidebar from 'components/HeaderWithSidebar';
import { useTheme } from 'components/ThemeContext';
import { useCurrentProfile } from 'contexts/CurrentProfileContext';
import { useGuest } from 'contexts/GuestContext';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from 'lib/supabase';

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
  onBlurSave: (v: string) => void;
  limit: number;
  placeholder?: string;
  icon: React.ReactNode;
  multiline?: boolean;
  colors: Record<string, string>;
};

function InlineField({ label, value, onChange, onBlurSave, limit, placeholder, icon, multiline = false, colors }: InlineFieldProps) {
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
        onBlur={() => { setFocused(false); onBlurSave(value); }}
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
  const { profile, loading, refresh } = useCurrentProfile();
  const { isGuest, guestName } = useGuest();
  const router = useRouter();

  const [cameraModalVisible, setCameraModalVisible] = useState(false);
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

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setMiddleName(profile.middle_name ?? '');
      setLastName(profile.last_name ?? '');
      setBirthDate(profile.birth_date ?? '');
      setAddress1([profile.permanent_address_1, profile.permanent_address_2].filter(Boolean).join(', '));
    }
  }, [profile]);

  const saveField = useCallback(async (field: string, value: string) => {
    if (!profile?.id) return;
    await supabase
      .from('profiles')
      .update({ [field]: value.trim() || null })
      .eq('id', profile.id);
  }, [profile?.id]);

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
        saveField('permanent_address_1', addr);
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

  const processQrValue = async (qrValue: string) => {
    try {
      setVerifyLoading(true);
      const { data, error } = await supabase.functions.invoke('verify-national-id', { body: { qrData: qrValue } });
      if (error) {
        Alert.alert('Verification failed', 'Unable to verify the scanned QR.');
      } else if (data?.success) {
        Alert.alert('Success', 'Your account has been securely verified!');
        await refresh();
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
              You're browsing as a guest. Create an account to unlock all features and keep your data safe.
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

        {/* Verification banner */}
        {!profile?.is_verified && (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <View style={{ borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.primary }}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Shield size={15} color="white" />
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Level 2 Verification</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 13, opacity: 0.9 }}>
                  Scan your National ID to unlock all features.
                </Text>
              </View>
              <TouchableOpacity
                onPress={openCameraForQr}
                disabled={verifyLoading}
                style={{ borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)' }}>
                {verifyLoading
                  ? <ActivityIndicator color="white" size="small" />
                  : <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>Verify Now</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Verified badge */}
        {profile?.is_verified && (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <View style={{ borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#22C55E18', borderWidth: 1, borderColor: '#22C55E40' }}>
              <ShieldCheck size={20} color="#22C55E" />
              <View>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#22C55E' }}>Level 2 Verified</Text>
                <Text style={{ fontSize: 12, color: '#22C55E', opacity: 0.8 }}>Your identity has been verified</Text>
              </View>
            </View>
          </View>
        )}

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
          colors={colors as Record<string, string>}
          onConfirm={(iso) => {
            setBirthDate(iso);
            saveField('birth_date', iso);
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
            onBlurSave={(v) => saveField('first_name', v)}
            limit={30}
            icon={<User {...iconProps} />}
            colors={colors as Record<string, string>}
          />
          {divider}

          {/* Middle Name */}
          <InlineField
            label="MIDDLE NAME"
            value={middleName}
            onChange={setMiddleName}
            onBlurSave={(v) => saveField('middle_name', v)}
            limit={30}
            icon={<User {...iconProps} />}
            colors={colors as Record<string, string>}
          />
          {divider}

          {/* Last Name */}
          <InlineField
            label="LAST NAME"
            value={lastName}
            onChange={setLastName}
            onBlurSave={(v) => saveField('last_name', v)}
            limit={30}
            icon={<User {...iconProps} />}
            colors={colors as Record<string, string>}
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
              onBlurSave={(v) => saveField('permanent_address_1', v)}
              colors={colors as Record<string, string>}
            />
          </View>

        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// ── InlineAddressField (multiline variant with its own focus state) ─────────
function InlineAddressField({ value, onChange, onBlurSave, colors }: {
  value: string;
  onChange: (v: string) => void;
  onBlurSave: (v: string) => void;
  colors: Record<string, string>;
}) {
  const [focused, setFocused] = useState(false);
  const LIMIT = 150;

  return (
    <>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.slice(0, LIMIT))}
        onBlur={() => { setFocused(false); onBlurSave(value); }}
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
