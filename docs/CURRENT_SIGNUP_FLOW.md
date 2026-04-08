# Current Signup Flow - Detailed Analysis

## File Location
**Path**: `dispatch/app/auth/sign-up.tsx` (2,060+ lines)

## Flow Diagram

```
User Opens Signup Screen
         ↓
Step 1: Personal Information Form
    - Email (validates via client.emailExists())
    - Password
    - First Name, Middle Name, Last Name, Suffix
    - Sex (Male/Female)
    - Birth Date (year, month, day)
    - Permanent Address (street, barangay, city, province)
    - Birth Location (city, province)
    - Optional: National ID QR Scan
         ↓
Validation (Zod Schema)
         ↓
Submit: signUpWithEmail()
         ↓
Supabase Auth API Call
         ↓
Database Trigger (handle_new_user)
         ↓
Profile Created in profiles table
         ↓
Email Verification Sent
         ↓
Redirect to Login Screen
```

## Code Breakdown

### 1. Form State Management (Lines 238-264)
```typescript
// Location: app/auth/sign-up.tsx:238-264

const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [firstName, setFirstName] = useState('');
const [middleName, setMiddleName] = useState('');
const [lastName, setLastName] = useState('');
const [suffix, setSuffix] = useState('');
const [sex, setSex] = useState<'Male' | 'Female' | ''>('');
const [birthYear, setBirthYear] = useState('');
const [birthMonth, setBirthMonth] = useState('');
const [birthDay, setBirthDay] = useState('');
const [permanentStreet, setPermanentStreet] = useState('');
const [permanentBarangay, setPermanentBarangay] = useState('');
const [permanentCity, setPermanentCity] = useState('');
const [permanentProvince, setPermanentProvince] = useState('');
const [birthCity, setBirthCity] = useState('');
const [birthProvince, setBirthProvince] = useState('');
const [noMiddleName, setNoMiddleName] = useState(false);
```

**Total Fields**: 15+ user input fields

### 2. Validation Schema (Lines 35-206)
```typescript
// Location: app/auth/sign-up.tsx:35-206

const signUpSchema = z.object({
  firstName: z.string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(20, 'First name must be at most 20 characters')
    .refine(
      (val) => !hasDangerousCharacters(val),
      'Invalid characters detected. Please remove special characters...'
    ),
  
  middleName: z.string()
    .trim()
    .refine((val) => val === '' || (val.length >= 2 && val.length <= 20), {
      message: 'Middle name must be 2-20 characters long',
    })
    .refine(
      (val) => val === '' || !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
  
  noMiddleName: z.boolean(),
  
  lastName: z.string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(20, 'Last name must be at most 20 characters')
    .refine(
      (val) => !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
  
  suffix: z.string(),
  
  sex: z.enum(['Male', 'Female'], {
    message: 'Please select your sex',
  }),
  
  birthYear: z.string()
    .min(1, 'Year is required')
    .refine((val) => /^\d{4}$/.test(val), 'Year must be 4 digits')
    .refine(
      (val) => {
        const year = parseInt(val);
        const currentYear = new Date().getFullYear();
        const minYear = 1900;
        const maxYear = currentYear - 18;
        return year >= minYear && year <= maxYear;
      },
      `Year must be between 1900 and ${new Date().getFullYear() - 18}`
    ),
  
  birthMonth: z.string()
    .min(1, 'Month is required')
    .refine((val) => /^\d{1,2}$/.test(val), 'Month must be numeric')
    .refine((val) => {
      const month = parseInt(val);
      return month >= 1 && month <= 12;
    }, 'Month must be between 1 and 12'),
  
  birthDay: z.string()
    .min(1, 'Day is required')
    .refine((val) => /^\d{1,2}$/.test(val), 'Day must be numeric')
    .refine((val) => {
      const day = parseInt(val);
      return day >= 1 && day <= 31;
    }, 'Day must be between 1 and 31'),
  
  permanentStreet: z.string()
    .trim()
    .max(128, 'Street address must not exceed 128 characters')
    .refine(
      (val) => val === '' || !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
    
  permanentBarangay: z.string()
    .trim()
    .min(1, 'Barangay is required')
    .refine(
      (val) => !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
    
  permanentCity: z.string()
    .trim()
    .min(1, 'City is required')
    .refine(
      (val) => !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
    
  permanentProvince: z.string()
    .trim()
    .min(1, 'Province is required')
    .refine(
      (val) => !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
  
  birthCity: z.string(),
  birthProvince: z.string(),
  
  email: z.string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email must not exceed 254 characters')
    .refine(
      (val) => !hasDangerousCharacters(val),
      'Invalid characters detected...'
    ),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(64, 'Password must not exceed 64 characters')
    .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
    .refine((val) => /[a-z]/.test(val), 'Password must contain at least one lowercase letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine(
      (val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val),
      'Password must contain at least one special character'
    ),
})
.refine(
  (data) => {
    if (!data.noMiddleName) {
      return data.middleName.trim().length >= 2 && data.middleName.trim().length <= 20;
    }
    return true;
  },
  {
    message: 'Middle name is required',
    path: ['middleName'],
  }
)
.refine(
  (data) => {
    // Validate birthdate combination
    if (!data.birthYear || !data.birthMonth || !data.birthDay) {
      return true;
    }

    const year = parseInt(data.birthYear);
    const month = parseInt(data.birthMonth);
    const day = parseInt(data.birthDay);

    // Check if year is within valid range
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear - 18) {
      return false;
    }

    // Get days in the month
    const daysInMonth = new Date(year, month, 0).getDate();

    return day <= daysInMonth;
  },
  {
    message: 'Invalid date for the selected month/year',
    path: ['birthDay'],
  }
);
```

**Security Features**:
- Dangerous character detection: `/[`;><\x00]/`
- Prevents SQL injection and XSS attempts
- Age verification (must be 18+)
- Email format validation
- Strong password requirements

### 3. Email Availability Check (Lines 471-521)
```typescript
// Location: app/auth/sign-up.tsx:471-521

const nextStep = async () => {
  if (currentStep === 1) {
    if (!client) {
      const message = isInitialized
        ? 'Unable to verify this email right now. Please try again in a moment.'
        : 'We are still getting things ready. Please try again in a moment.';
      Alert.alert('Hold on', message);
      return;
    }

    setEmailCheckVisible(true);

    try {
      // SUPABASE CALL 1: Check if email exists
      const {exists, error: emailCheckError } = await withTimeout(
        client.emailExists(email.trim()),
        10_000,
        'Email check timed out'
      );

      if (emailCheckError) {
        throw new Error(emailCheckError);
      }

      if (exists) {
        Alert.alert(
          'Email already in use',
          'An account with this email already exists. Please use a different email address.'
        );
        return;
      }

      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } catch (error) {
      console.error('Email availability check failed', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const userMessage =
        errorMessage === 'Email check timed out'
          ? 'The email check is taking longer than expected. Please try again.'
          : 'We could not confirm your email address just now. Please try again.';
      Alert.alert('Unable to verify email', userMessage);
    } finally {
      setEmailCheckVisible(false);
    }

    return;
  }

  if (currentStep < 3) {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  }
};
```

**API Call**: 
- Method: `client.emailExists(email.trim())`
- Location: dispatch-lib (RPC function: `email_exists_rpc`)
- Timeout: 10 seconds
- Purpose: Prevent duplicate email accounts

### 4. National ID QR Verification (REQUIRED IF SCANNED - Lines 539-613)
```typescript
// Location: app/auth/sign-up.tsx:539-613

const processQrValue = async (qrValue: string) => {
  setScannedQr(qrValue);
  setVerifying(true);

  try {
    // Verify QR with National ID API
    const result = await verifyNationalIdQR(qrValue);

    if (!result.isVerified || !result.data) {
      setVerified(false);
      setIdData(null);
      resetScanState();
      Alert.alert('Verification failed', 'Unable to verify the scanned QR. Please try again.');
      return;
    }

    // Auto-fill form with ID data
    setFirstName(result.data.first_name || '');
    setMiddleName(result.data.middle_name || '');
    setLastName(result.data.last_name || '');
    setSex(result.data.sex === 'M' ? 'Male' : result.data.sex === 'F' ? 'Female' : '');
    
    const [year, month, day] = result.data.birth_date.split('-');
    setBirthYear(year);
    setBirthMonth(parseInt(month, 10).toString());
    setBirthDay(parseInt(day, 10).toString());
    
    const [city, province] = result.data.place_of_birth.split(', ');
    setBirthCity(city || '');
    setBirthProvince(province || '');

    setIdData(result);
    setVerified(true);
    setCameraModalVisible(false);
    setScannedDialogVisible(true);
  } catch (error) {
    setVerified(false);
    setIdData(null);
    resetScanState();
    Alert.alert('Error', 'An error occurred while verifying the QR code.');
  } finally {
    setVerifying(false);
  }
};
```

**Features**:
- Scans Philippine National ID QR code
- Validates with government API
- Auto-fills personal information
- **IMPORTANT**: If user scans National ID, they MUST keep the scanned data
- System validates that form fields MATCH the scanned ID data (Lines 300-351)
- Stores PCN (Philippine Citizen Number) for verification
- **NOT optional** - if you scan, you must use the scanned data

### 5. Main Signup Function (Lines 353-404)
```typescript
// Location: app/auth/sign-up.tsx:353-404

async function signUpWithEmail() {
  setLoading(true);

  console.log('Redirect URL: ', createURL('/home'));

  // Register for FCM push notifications
  const fcmToken = await registerForFCMToken().catch(() => null);

  // SUPABASE CALL 2: Create user account
  const {
    data: {session},
    error,
  } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        first_name: firstName,
        suffix: suffix,
        middle_name: middleName,
        no_middle_name: noMiddleName,
        last_name: lastName,
        role: 'user',
        sex: sex,
        birth_date: `${birthYear}-${birthMonth.padStart(2, '0')}-${birthDay.padStart(2, '0')}`,
        permanent_address_1: `${permanentStreet}, ${permanentBarangay}`,
        permanent_address_2: `${permanentCity}, ${permanentProvince}`,
        birth_city: birthCity,
        birth_province: birthProvince,
        id_card_number: idData?.data.pcn,
        fcm_token: fcmToken,
      },
    },
  });

  setLoading(false);

  if (error) {
    Alert.alert(error.message);
    console.error(error.stack);
    return;
  }

  if (!session) {
    Alert.alert('Please check your inbox for email verification!', '', [
      {
        text: 'OK',
        onPress: () => {
          router.replace('/auth/login');
        },
      },
    ]);
  }
}
```

**API Call**: 
- Method: `supabase.auth.signUp()`
- Creates user in `auth.users` table
- Sends all profile data in `options.data` (user metadata)
- Triggers email verification
- No session returned (requires email verification first)

**Data Sent to Supabase**:
1. `email` - User's email address
2. `password` - Encrypted password
3. `options.data` (raw_user_meta_data):
   - `first_name`
   - `suffix`
   - `middle_name`
   - `no_middle_name`
   - `last_name`
   - `role` (hardcoded to 'user')
   - `sex`
   - `birth_date`
   - `permanent_address_1`
   - `permanent_address_2`
   - `birth_city`
   - `birth_province`
   - `id_card_number` (from QR scan, if available)
   - `fcm_token`

### 6. Database Trigger (Server-side)
```sql
-- Location: supabase/migrations/20250818_profiles_schema.sql:27-36

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, middle_name, last_name, avatar_url, id_card_number)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'middle_name', 
    new.raw_user_meta_data->>'last_name', 
    new.raw_user_meta_data->>'avatar_url', 
    new.raw_user_meta_data->>'id_card_number'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

**What Happens**:
1. Trigger fires AFTER user is inserted into `auth.users`
2. Extracts data from `raw_user_meta_data` JSON field
3. Creates corresponding row in `public.profiles` table
4. **NOTE**: Trigger only copies 5 fields - other fields added by later migrations!

**Current Issue**:
- Trigger references fields like `id_card_number` that were added in later migrations
- This means the trigger was updated manually (not in migration file)
- Actual trigger in database likely has more fields than shown in original migration

### 7. Post-Signup Flow
```typescript
// If no session returned (email verification required)
if (!session) {
  Alert.alert('Please check your inbox for email verification!', '', [
    {
      text: 'OK',
      onPress: () => {
        router.replace('/auth/login');  // Redirect to login
      },
    },
  ]);
}
```

**Email Verification**:
- Supabase automatically sends verification email
- User must click link in email
- After verification, user can login normally
- `auth.users.email_confirmed_at` gets set

## Summary

### Current Signup Data Collection
**Required Fields** (15 total):
1. Email ✅
2. Password ✅
3. First Name
4. Last Name
5. Sex
6. Birth Year
7. Birth Month
8. Birth Day
9. Permanent Street
10. Permanent Barangay
11. Permanent City
12. Permanent Province
13. Birth City
14. Birth Province

**Optional Fields**:
15. Middle Name
16. Suffix
17. National ID Card Number (QR scan) - **BUT if you scan, you MUST use the scanned data**

**Auto-captured**:
- FCM Token (for push notifications)
- Role (hardcoded to 'user')

### Supabase API Calls

1. **Email Check**: `client.emailExists(email)` 
   - RPC call to check if email is already registered
   - Prevents duplicates

2. **Sign Up**: `supabase.auth.signUp({ email, password, options: { data: {...} } })`
   - Creates user in auth.users
   - Stores all profile data in raw_user_meta_data
   - Triggers email verification
   - Triggers database trigger to create profile

### Database Side Effects

1. **auth.users** table
   - New row created with encrypted password
   - Email stored
   - raw_user_meta_data contains all profile fields as JSON
   - email_confirmed_at is NULL (until email verified)

2. **public.profiles** table (via trigger)
   - New row created with user ID
   - Fields extracted from raw_user_meta_data
   - Additional fields added by later migrations (sex, birth_date, addresses, etc.)

## Changes Needed for Minimal Signup

### What to Keep:
- Email ✅
- Password ✅
- Confirm Password (NEW) ✅
- FCM Token (auto-captured) ✅
- Role (auto-set to 'user') ✅

### What to Remove/Make Optional:
- First Name → OPTIONAL
- Middle Name → OPTIONAL
- Last Name → OPTIONAL
- Suffix → OPTIONAL
- Sex → OPTIONAL
- Birth Date → OPTIONAL
- Permanent Address → OPTIONAL
- Birth City/Province → OPTIONAL
- National ID QR Scan → MOVE to profile completion

### What to Update:
- `signUpWithEmail()` function: Only send email, password, fcm_token
- Validation schema: Make all personal fields optional
- Database trigger: Handle missing metadata fields gracefully
- Add `is_verified = false` default for new profiles

