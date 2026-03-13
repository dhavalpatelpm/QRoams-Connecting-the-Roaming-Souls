import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { QRoamsLogo } from "@/components/QRoamsLogo";
import { useAuth } from "@/context/AuthContext";

// ─── Country Data ────────────────────────────────────────────────────────────
type Country = { name: string; code: string; dial: string; flag: string };

const COUNTRIES: Country[] = [
  { name: "Afghanistan", code: "AF", dial: "+93", flag: "🇦🇫" },
  { name: "Albania", code: "AL", dial: "+355", flag: "🇦🇱" },
  { name: "Algeria", code: "DZ", dial: "+213", flag: "🇩🇿" },
  { name: "Argentina", code: "AR", dial: "+54", flag: "🇦🇷" },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺" },
  { name: "Austria", code: "AT", dial: "+43", flag: "🇦🇹" },
  { name: "Bangladesh", code: "BD", dial: "+880", flag: "🇧🇩" },
  { name: "Belgium", code: "BE", dial: "+32", flag: "🇧🇪" },
  { name: "Bolivia", code: "BO", dial: "+591", flag: "🇧🇴" },
  { name: "Brazil", code: "BR", dial: "+55", flag: "🇧🇷" },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
  { name: "Chile", code: "CL", dial: "+56", flag: "🇨🇱" },
  { name: "China", code: "CN", dial: "+86", flag: "🇨🇳" },
  { name: "Colombia", code: "CO", dial: "+57", flag: "🇨🇴" },
  { name: "Croatia", code: "HR", dial: "+385", flag: "🇭🇷" },
  { name: "Czech Republic", code: "CZ", dial: "+420", flag: "🇨🇿" },
  { name: "Denmark", code: "DK", dial: "+45", flag: "🇩🇰" },
  { name: "Ecuador", code: "EC", dial: "+593", flag: "🇪🇨" },
  { name: "Egypt", code: "EG", dial: "+20", flag: "🇪🇬" },
  { name: "Ethiopia", code: "ET", dial: "+251", flag: "🇪🇹" },
  { name: "Finland", code: "FI", dial: "+358", flag: "🇫🇮" },
  { name: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
  { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
  { name: "Ghana", code: "GH", dial: "+233", flag: "🇬🇭" },
  { name: "Greece", code: "GR", dial: "+30", flag: "🇬🇷" },
  { name: "Hungary", code: "HU", dial: "+36", flag: "🇭🇺" },
  { name: "India", code: "IN", dial: "+91", flag: "🇮🇳" },
  { name: "Indonesia", code: "ID", dial: "+62", flag: "🇮🇩" },
  { name: "Iran", code: "IR", dial: "+98", flag: "🇮🇷" },
  { name: "Iraq", code: "IQ", dial: "+964", flag: "🇮🇶" },
  { name: "Ireland", code: "IE", dial: "+353", flag: "🇮🇪" },
  { name: "Israel", code: "IL", dial: "+972", flag: "🇮🇱" },
  { name: "Italy", code: "IT", dial: "+39", flag: "🇮🇹" },
  { name: "Japan", code: "JP", dial: "+81", flag: "🇯🇵" },
  { name: "Jordan", code: "JO", dial: "+962", flag: "🇯🇴" },
  { name: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪" },
  { name: "South Korea", code: "KR", dial: "+82", flag: "🇰🇷" },
  { name: "Malaysia", code: "MY", dial: "+60", flag: "🇲🇾" },
  { name: "Mexico", code: "MX", dial: "+52", flag: "🇲🇽" },
  { name: "Morocco", code: "MA", dial: "+212", flag: "🇲🇦" },
  { name: "Myanmar", code: "MM", dial: "+95", flag: "🇲🇲" },
  { name: "Nepal", code: "NP", dial: "+977", flag: "🇳🇵" },
  { name: "Netherlands", code: "NL", dial: "+31", flag: "🇳🇱" },
  { name: "New Zealand", code: "NZ", dial: "+64", flag: "🇳🇿" },
  { name: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "Norway", code: "NO", dial: "+47", flag: "🇳🇴" },
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰" },
  { name: "Peru", code: "PE", dial: "+51", flag: "🇵🇪" },
  { name: "Philippines", code: "PH", dial: "+63", flag: "🇵🇭" },
  { name: "Poland", code: "PL", dial: "+48", flag: "🇵🇱" },
  { name: "Portugal", code: "PT", dial: "+351", flag: "🇵🇹" },
  { name: "Romania", code: "RO", dial: "+40", flag: "🇷🇴" },
  { name: "Russia", code: "RU", dial: "+7", flag: "🇷🇺" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦" },
  { name: "Spain", code: "ES", dial: "+34", flag: "🇪🇸" },
  { name: "Sri Lanka", code: "LK", dial: "+94", flag: "🇱🇰" },
  { name: "Sweden", code: "SE", dial: "+46", flag: "🇸🇪" },
  { name: "Switzerland", code: "CH", dial: "+41", flag: "🇨🇭" },
  { name: "Taiwan", code: "TW", dial: "+886", flag: "🇹🇼" },
  { name: "Tanzania", code: "TZ", dial: "+255", flag: "🇹🇿" },
  { name: "Thailand", code: "TH", dial: "+66", flag: "🇹🇭" },
  { name: "Turkey", code: "TR", dial: "+90", flag: "🇹🇷" },
  { name: "Uganda", code: "UG", dial: "+256", flag: "🇺🇬" },
  { name: "Ukraine", code: "UA", dial: "+380", flag: "🇺🇦" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
  { name: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
  { name: "Venezuela", code: "VE", dial: "+58", flag: "🇻🇪" },
  { name: "Vietnam", code: "VN", dial: "+84", flag: "🇻🇳" },
  { name: "Zimbabwe", code: "ZW", dial: "+263", flag: "🇿🇼" },
];

const POPULAR_CODES = ["US", "IN", "GB", "AU", "CA", "AE", "DE", "FR", "BR", "JP"];

// ─── Other data ───────────────────────────────────────────────────────────────
const INTERESTS = [
  "Music", "Travel", "Food", "Fitness", "Gaming", "Reading",
  "Movies", "Art", "Photography", "Dancing", "Cooking", "Yoga",
  "Cricket", "Football", "Trekking", "Coffee", "Dogs", "Cats",
  "Startups", "Tech",
];
const LOOKING_FOR = [
  { id: "chat", label: "Just Chat", icon: "chatbubble-outline" as const },
  { id: "audio", label: "Audio Call", icon: "call-outline" as const },
  { id: "video", label: "Video Call", icon: "videocam-outline" as const },
  { id: "meet", label: "Meet Up", icon: "people-outline" as const },
];
const PERSONALITY = ["Introvert", "Extrovert", "Ambivert"];
const RELATIONSHIP = ["Friendship", "Casual", "Serious", "Open to all"];
const GENDERS = ["Male", "Female", "Non-binary", "Other"];

// ─── Country Picker Modal ──────────────────────────────────────────────────────
function CountryPickerModal({
  visible,
  onClose,
  onSelect,
  selected,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (c: Country) => void;
  selected: Country;
}) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");

  const popular = COUNTRIES.filter((c) => POPULAR_CODES.includes(c.code));
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[pickerStyles.container, { paddingTop: insets.top + 8 }]}>
        {/* Handle */}
        <View style={pickerStyles.handle} />

        {/* Header */}
        <View style={pickerStyles.header}>
          <Text style={pickerStyles.title}>Select country code</Text>
          <TouchableOpacity onPress={onClose} style={pickerStyles.closeBtn}>
            <Ionicons name="close" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={pickerStyles.searchWrap}>
          <Ionicons name="search" size={16} color="#9CA3AF" />
          <TextInput
            style={pickerStyles.searchInput}
            placeholder="Search country or dial code..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          ListHeaderComponent={
            search.length === 0 ? (
              <View>
                <Text style={pickerStyles.sectionLabel}>Popular</Text>
                {popular.map((c) => (
                  <CountryRow
                    key={c.code}
                    country={c}
                    isSelected={selected.code === c.code}
                    onPress={() => { onSelect(c); onClose(); }}
                  />
                ))}
                <View style={pickerStyles.divider} />
                <Text style={pickerStyles.sectionLabel}>All countries</Text>
              </View>
            ) : null
          }
          renderItem={({ item: c }) => (
            <CountryRow
              country={c}
              isSelected={selected.code === c.code}
              onPress={() => { onSelect(c); onClose(); }}
            />
          )}
        />
      </View>
    </Modal>
  );
}

function CountryRow({
  country,
  isSelected,
  onPress,
}: {
  country: Country;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[pickerStyles.row, isSelected && pickerStyles.rowSelected]}
      activeOpacity={0.7}
    >
      <Text style={pickerStyles.flag}>{country.flag}</Text>
      <Text style={[pickerStyles.countryName, isSelected && pickerStyles.countryNameSelected]}>
        {country.name}
      </Text>
      <Text style={[pickerStyles.dialCode, isSelected && pickerStyles.dialCodeSelected]}>
        {country.dial}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={18} color={QColors.primary} />
      )}
    </TouchableOpacity>
  );
}

const pickerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: "#FAFAFA",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F3F4F6",
  },
  rowSelected: {
    backgroundColor: "#F5F3FF",
  },
  flag: {
    fontSize: 22,
    width: 32,
    textAlign: "center",
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  countryNameSelected: {
    fontFamily: "Inter_600SemiBold",
    color: QColors.primary,
  },
  dialCode: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  dialCodeSelected: {
    color: QColors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
    marginVertical: 4,
  },
});

// ─── Main Onboarding Screen ────────────────────────────────────────────────────
export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUser, setToken, setOnboarded } = useAuth();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 0
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const dobMonthRef = useRef<TextInput>(null);
  const dobYearRef = useRef<TextInput>(null);
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [occupation, setOccupation] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === "US")!
  );
  const [countryText, setCountryText] = useState("");
  const [phone, setPhone] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const calcAgeFromDob = (): number => {
    const d = parseInt(dobDay), m = parseInt(dobMonth), y = parseInt(dobYear);
    if (!d || !m || !y || y < 1900) return 25;
    const today = new Date();
    let a = today.getFullYear() - y;
    if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) a--;
    return Math.max(1, Math.min(120, a));
  };

  // Step 1
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLooking, setSelectedLooking] = useState<string[]>([]);
  const [personality, setPersonality] = useState("");
  const [relationship, setRelationship] = useState("");

  // Step 2 — Photos
  const [onboardPhotos, setOnboardPhotos] = useState<string[]>([]);

  const pickOnboardPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.75,
      base64: Platform.OS === "web",
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = Platform.OS === "web" && asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setOnboardPhotos((prev) => [...prev, uri].slice(0, 6));
    }
  };

  const takeOnboardPhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.75,
      base64: Platform.OS === "web",
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = Platform.OS === "web" && asset.base64
        ? `data:image/jpeg;base64,${asset.base64}`
        : asset.uri;
      setOnboardPhotos((prev) => [...prev, uri].slice(0, 6));
    }
  };

  const removeOnboardPhoto = (idx: number) => {
    setOnboardPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Step 3 — OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const animateToStep = (newStep: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setStep(newStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleCountrySelect = (c: Country) => {
    setSelectedCountry(c);
    setCountryText(c.name);
  };

  const handleCountryTextChange = (text: string) => {
    setCountryText(text);
    const match = COUNTRIES.find(
      (c) => c.name.toLowerCase() === text.toLowerCase()
    );
    if (match) setSelectedCountry(match);
  };

  const toggleInterest = (i: string) =>
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const toggleLooking = (id: string) =>
    setSelectedLooking((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleOtpChange = (text: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleFinish = async () => {
    const dob = dobDay && dobMonth && dobYear ? `${dobDay.padStart(2,"0")}/${dobMonth.padStart(2,"0")}/${dobYear}` : "";
    const mockUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      firstName: firstName || "QRomian",
      lastName: lastName || "",
      age: calcAgeFromDob(),
      dob,
      gender,
      city: city || "Unknown City",
      state: stateProvince || "",
      country: selectedCountry.name || "World",
      phone: selectedCountry.dial + phone,
      bio: `${personality ? personality + " · " : ""}Based in ${[city, stateProvince, selectedCountry.name].filter(Boolean).join(", ")}`,
      interests: selectedInterests,
      lookingFor: selectedLooking,
      photos: onboardPhotos,
      coinBalance: 100,
      isOnline: true,
      occupation: occupation || "",
      education: "",
      languages: ["English"],
      personalityType: personality.toLowerCase(),
      relationshipStyle: relationship.toLowerCase(),
    };
    await setUser(mockUser);
    await setToken("mock-token-" + Date.now());
    await setOnboarded(true);
    router.replace("/(tabs)");
  };

  const dobValid = dobDay.length > 0 && dobMonth.length > 0 && dobYear.length === 4;
  const step0Valid = firstName.length > 0 && dobValid && gender.length > 0;
  const step1Valid = selectedInterests.length >= 3 && selectedLooking.length >= 1;
  const step3Valid = otp.join("").length === 6;

  const topPad = Platform.OS === "web" ? 24 : insets.top;

  const STEPS = [
    { title: "Who are you?", subtitle: "Let's build your profile" },
    { title: "Your vibe", subtitle: "What makes you, you?" },
    { title: "Your photos", subtitle: "Show your best self" },
    { title: "Verify", subtitle: "Quick confirmation" },
  ];

  return (
    <View style={styles.root}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[QColors.primaryDark, QColors.primary, QColors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerTop}>
          <QRoamsLogo size={36} />
          <Text style={styles.appName}>QRoams</Text>
        </View>

        {/* Step progress */}
        <View style={styles.progressContainer}>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  i < step && styles.progressDotDone,
                  i === step && styles.progressDotActive,
                  i > step && styles.progressDotFuture,
                ]}
              >
                {i < step ? (
                  <Ionicons name="checkmark" size={12} color={QColors.primary} />
                ) : (
                  <Text
                    style={[
                      styles.progressDotNum,
                      i === step && { color: QColors.primary },
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < STEPS.length - 1 && (
                <View
                  style={[styles.progressLine, i < step && styles.progressLineDone]}
                />
              )}
            </View>
          ))}
        </View>

        <View style={styles.stepInfo}>
          <Text style={styles.stepTitle}>{STEPS[step].title}</Text>
          <Text style={styles.stepSubtitle}>{STEPS[step].subtitle}</Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.contentWrapper,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* ─── STEP 0 ─────────────────────────────────────────────────── */}
          {step === 0 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>First name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Sofia"
                    placeholderTextColor="#C4B5FD"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Last name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Martinez"
                    placeholderTextColor="#C4B5FD"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Date of birth *</Text>
                <View style={styles.dobRow}>
                  <View style={styles.dobSegment}>
                    <TextInput
                      style={[styles.input, styles.dobInput]}
                      placeholder="DD"
                      placeholderTextColor="#C4B5FD"
                      keyboardType="numeric"
                      value={dobDay}
                      maxLength={2}
                      onChangeText={(t) => {
                        setDobDay(t);
                        if (t.length === 2) dobMonthRef.current?.focus();
                      }}
                    />
                    <Text style={styles.dobLabel}>Day</Text>
                  </View>
                  <View style={styles.dobSep}><Text style={styles.dobSepText}>/</Text></View>
                  <View style={styles.dobSegment}>
                    <TextInput
                      ref={dobMonthRef}
                      style={[styles.input, styles.dobInput]}
                      placeholder="MM"
                      placeholderTextColor="#C4B5FD"
                      keyboardType="numeric"
                      value={dobMonth}
                      maxLength={2}
                      onChangeText={(t) => {
                        setDobMonth(t);
                        if (t.length === 2) dobYearRef.current?.focus();
                      }}
                    />
                    <Text style={styles.dobLabel}>Month</Text>
                  </View>
                  <View style={styles.dobSep}><Text style={styles.dobSepText}>/</Text></View>
                  <View style={[styles.dobSegment, { flex: 2 }]}>
                    <TextInput
                      ref={dobYearRef}
                      style={[styles.input, styles.dobInput]}
                      placeholder="YYYY"
                      placeholderTextColor="#C4B5FD"
                      keyboardType="numeric"
                      value={dobYear}
                      maxLength={4}
                      onChangeText={setDobYear}
                    />
                    <Text style={styles.dobLabel}>Year</Text>
                  </View>
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.pillRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.pill, gender === g && styles.pillActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text
                        style={[styles.pillText, gender === g && styles.pillTextActive]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="United States"
                  placeholderTextColor="#C4B5FD"
                  value={countryText}
                  onChangeText={handleCountryTextChange}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="New York"
                    placeholderTextColor="#C4B5FD"
                    value={city}
                    onChangeText={setCity}
                    autoCapitalize="words"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State / Province</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Gujarat"
                    placeholderTextColor="#C4B5FD"
                    value={stateProvince}
                    onChangeText={setStateProvince}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Profession */}
              <View>
                <Text style={styles.inputLabel}>Profession</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Software Engineer"
                  placeholderTextColor="#C4B5FD"
                  value={occupation}
                  onChangeText={setOccupation}
                  autoCapitalize="words"
                />
              </View>

              {/* Phone with country code picker */}
              <View>
                <Text style={styles.inputLabel}>Phone number</Text>
                <View style={styles.phoneRow}>
                  <TouchableOpacity
                    style={styles.dialBtn}
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.dialFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.dialCode}>{selectedCountry.dial}</Text>
                    <Ionicons name="chevron-down" size={13} color={QColors.primary} />
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="(555) 000-0000"
                    placeholderTextColor="#C4B5FD"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
                {/* Selected country display */}
                {selectedCountry && (
                  <View style={styles.countryTag}>
                    <Text style={styles.countryTagFlag}>{selectedCountry.flag}</Text>
                    <Text style={styles.countryTagText}>{selectedCountry.name}</Text>
                    <Text style={styles.countryTagDial}>{selectedCountry.dial}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !step0Valid && styles.primaryBtnDisabled]}
                onPress={() => step0Valid && animateToStep(1)}
                activeOpacity={step0Valid ? 0.85 : 1}
              >
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                />
                <Text style={styles.primaryBtnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>

              <Text style={styles.requiredNote}>* Required fields</Text>
            </ScrollView>
          )}

          {/* ─── STEP 1 ─────────────────────────────────────────────────── */}
          {step === 1 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
            >
              <View>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Pick your interests</Text>
                  <Text
                    style={[
                      styles.countBadge,
                      selectedInterests.length >= 3 && styles.countBadgeDone,
                    ]}
                  >
                    {selectedInterests.length}/3 min
                  </Text>
                </View>
                <View style={styles.chipsWrap}>
                  {INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <TouchableOpacity
                        key={interest}
                        onPress={() => toggleInterest(interest)}
                        style={[styles.interestChip, active && styles.interestChipActive]}
                      >
                        <Text
                          style={[
                            styles.interestChipText,
                            active && styles.interestChipTextActive,
                          ]}
                        >
                          {interest}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>I'm looking for</Text>
                <View style={styles.lookingGrid}>
                  {LOOKING_FOR.map((l) => {
                    const active = selectedLooking.includes(l.id);
                    return (
                      <TouchableOpacity
                        key={l.id}
                        onPress={() => toggleLooking(l.id)}
                        style={[styles.lookingCard, active && styles.lookingCardActive]}
                      >
                        <Ionicons
                          name={l.icon}
                          size={24}
                          color={active ? QColors.primary : "#9CA3AF"}
                        />
                        <Text
                          style={[
                            styles.lookingLabel,
                            active && styles.lookingLabelActive,
                          ]}
                        >
                          {l.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Personality type</Text>
                <View style={styles.pillRow}>
                  {PERSONALITY.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pill, personality === p && styles.pillActive]}
                      onPress={() => setPersonality(p)}
                    >
                      <Text
                        style={[styles.pillText, personality === p && styles.pillTextActive]}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={styles.inputLabel}>Relationship style</Text>
                <View style={styles.pillRow}>
                  {RELATIONSHIP.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.pill, relationship === r && styles.pillActive]}
                      onPress={() => setRelationship(r)}
                    >
                      <Text
                        style={[styles.pillText, relationship === r && styles.pillTextActive]}
                      >
                        {r}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => animateToStep(0)}
                >
                  <Ionicons name="arrow-back" size={18} color={QColors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { flex: 1 },
                    !step1Valid && styles.primaryBtnDisabled,
                  ]}
                  onPress={() => step1Valid && animateToStep(2)}
                  activeOpacity={step1Valid ? 0.85 : 1}
                >
                  <LinearGradient
                    colors={[QColors.primary, QColors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                  />
                  <Text style={styles.primaryBtnText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* ─── STEP 2 — Photos ─────────────────────────────────────── */}
          {step === 2 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
            >
              <View style={styles.photoStepIntro}>
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  style={styles.photoStepIconBg}
                >
                  <Ionicons name="images" size={28} color="#fff" />
                </LinearGradient>
                <Text style={styles.photoStepTitle}>Add your best photos</Text>
                <Text style={styles.photoStepSub}>
                  Profiles with photos get 3× more connections. Add up to 6 photos.
                </Text>
              </View>

              {/* Photo grid — 3 columns */}
              <View style={styles.photoGrid}>
                {Array.from({ length: 6 }).map((_, i) => {
                  const uri = onboardPhotos[i];
                  return uri ? (
                    <View key={i} style={styles.photoSlot}>
                      <Image source={{ uri }} style={styles.photoSlotImg} />
                      <TouchableOpacity
                        style={styles.photoSlotRemove}
                        onPress={() => removeOnboardPhoto(i)}
                      >
                        <Ionicons name="close-circle" size={22} color="#fff" />
                      </TouchableOpacity>
                      {i === 0 && (
                        <View style={styles.photoMainBadge}>
                          <Text style={styles.photoMainBadgeText}>Main</Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <TouchableOpacity
                      key={i}
                      style={[styles.photoSlot, styles.photoSlotEmpty]}
                      onPress={onboardPhotos.length < 6 ? pickOnboardPhoto : undefined}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={28} color={QColors.primary + "80"} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Pick buttons */}
              <View style={styles.photoPickRow}>
                <TouchableOpacity
                  style={[styles.photoPickBtn, { borderColor: QColors.primary }]}
                  onPress={pickOnboardPhoto}
                >
                  <Ionicons name="image-outline" size={18} color={QColors.primary} />
                  <Text style={[styles.photoPickBtnText, { color: QColors.primary }]}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoPickBtn, { borderColor: QColors.accent }]}
                  onPress={takeOnboardPhoto}
                >
                  <Ionicons name="camera-outline" size={18} color={QColors.accent} />
                  <Text style={[styles.photoPickBtnText, { color: QColors.accent }]}>Camera</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => animateToStep(1)}>
                  <Ionicons name="arrow-back" size={18} color={QColors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }]}
                  onPress={() => animateToStep(3)}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={[QColors.primary, QColors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                  />
                  <Text style={styles.primaryBtnText}>
                    {onboardPhotos.length === 0 ? "Skip for now" : "Continue"}
                  </Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* ─── STEP 3 ─────────────────────────────────────────────────── */}
          {step === 3 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Phone display card */}
              <View style={styles.phoneCard}>
                <LinearGradient
                  colors={[QColors.primaryLight, "#FCE7F3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.phoneCardGradient}
                >
                  <Text style={styles.phoneCardFlag}>{selectedCountry.flag}</Text>
                  <View>
                    <Text style={styles.phoneCardLabel}>Sending OTP to</Text>
                    <Text style={styles.phoneCardNumber}>
                      {selectedCountry.dial} {phone || "—"}
                    </Text>
                  </View>
                </LinearGradient>
              </View>

              {!otpSent ? (
                <View style={styles.sendOtpArea}>
                  <View style={styles.otpIllustration}>
                    <LinearGradient
                      colors={[QColors.primary, QColors.accent]}
                      style={styles.otpIconBg}
                    >
                      <Ionicons name="lock-closed" size={32} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.otpTitle}>Secure Verification</Text>
                    <Text style={styles.otpDesc}>
                      We'll send a 6-digit OTP to verify your phone number. Standard message rates may apply.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => {
                      const code = Math.floor(100000 + Math.random() * 900000).toString();
                      setOtpCode(code);
                      setOtpSent(true);
                    }}
                  >
                    <LinearGradient
                      colors={[QColors.primary, QColors.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                    />
                    <Ionicons name="send" size={18} color="#fff" />
                    <Text style={styles.primaryBtnText}>Send OTP</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 20 }}>
                  {/* OTP Code Display — shown on screen for development */}
                  <View style={styles.otpDisplayCard}>
                    <LinearGradient
                      colors={["#F5F3FF", "#FCE7F3"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.otpDisplayGradient}
                    >
                      <Ionicons name="mail-outline" size={18} color={QColors.primary} />
                      <Text style={styles.otpDisplayLabel}>Your OTP code</Text>
                      <Text style={styles.otpDisplayCode}>{otpCode}</Text>
                      <Text style={styles.otpDisplayHint}>Valid for 10 minutes · Do not share</Text>
                    </LinearGradient>
                  </View>

                  <View>
                    <Text style={styles.otpEntryLabel}>Enter the 6-digit code</Text>
                    <View style={styles.otpRow}>
                      {otp.map((val, idx) => (
                        <TextInput
                          key={idx}
                          ref={(r) => { otpRefs.current[idx] = r; }}
                          style={[styles.otpBox, val.length > 0 && styles.otpBoxFilled]}
                          value={val}
                          onChangeText={(t) => handleOtpChange(t.slice(-1), idx)}
                          keyboardType="numeric"
                          maxLength={1}
                          textAlign="center"
                          onKeyPress={({ nativeEvent }) => {
                            if (nativeEvent.key === "Backspace" && !val && idx > 0) {
                              const newOtp = [...otp];
                              newOtp[idx - 1] = "";
                              setOtp(newOtp);
                              otpRefs.current[idx - 1]?.focus();
                            }
                          }}
                        />
                      ))}
                    </View>
                    <Text style={styles.demoHint}>Demo mode — any 6 digits will work</Text>
                  </View>

                  <View style={styles.btnRow}>
                    <TouchableOpacity
                      style={styles.backBtn}
                      onPress={() => animateToStep(2)}
                    >
                      <Ionicons name="arrow-back" size={18} color={QColors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        { flex: 1 },
                        !step3Valid && styles.primaryBtnDisabled,
                      ]}
                      onPress={() => step3Valid && handleFinish()}
                      activeOpacity={step3Valid ? 0.85 : 1}
                    >
                      <LinearGradient
                        colors={[QColors.primary, QColors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                      />
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.primaryBtnText}>Enter QRoams</Text>
                    </TouchableOpacity>
                  </View>

                  <Pressable
                    onPress={() => { setOtp(["", "", "", "", "", ""]); setOtpSent(false); }}
                  >
                    <Text style={styles.resendText}>Didn't receive it? Resend OTP</Text>
                  </Pressable>
                </View>
              )}

              <Text style={styles.termsText}>
                By continuing you agree to our{" "}
                <Text style={{ color: QColors.primary }}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={{ color: QColors.primary }}>Privacy Policy</Text>
              </Text>
            </ScrollView>
          )}
        </Animated.View>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <CountryPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleCountrySelect}
        selected={selectedCountry}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appName: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.3,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressStep: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressDotActive: {
    backgroundColor: "#fff",
  },
  progressDotDone: {
    backgroundColor: "#fff",
  },
  progressDotFuture: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressDotNum: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "rgba(255,255,255,0.7)",
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginHorizontal: 6,
  },
  progressLineDone: {
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  stepInfo: {
    gap: 2,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
  },
  contentWrapper: {
    flex: 1,
  },
  stepContent: {
    padding: 24,
    gap: 20,
    paddingBottom: 48,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
  },
  pillActive: {
    borderColor: QColors.primary,
    backgroundColor: QColors.primaryLight,
  },
  pillText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  pillTextActive: {
    color: QColors.primary,
  },
  // Phone
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  dialBtn: {
    height: 52,
    paddingHorizontal: 12,
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minWidth: 88,
  },
  dialFlag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: QColors.primary,
  },
  countryTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: QColors.primaryLight,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  countryTagFlag: {
    fontSize: 15,
  },
  countryTagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: QColors.primary,
  },
  countryTagDial: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: QColors.primaryDark,
  },
  // Buttons
  primaryBtn: {
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  primaryBtnDisabled: {
    opacity: 0.35,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  requiredNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  backBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F3FF",
  },
  // Step 1
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  countBadge: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countBadgeDone: {
    color: "#10B981",
    backgroundColor: "#D1FAE5",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  interestChipActive: {
    backgroundColor: QColors.primaryLight,
    borderColor: QColors.primary,
  },
  interestChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  interestChipTextActive: {
    color: QColors.primary,
  },
  lookingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  lookingCard: {
    width: "47%",
    alignItems: "center",
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 8,
  },
  lookingCardActive: {
    borderColor: QColors.primary,
    backgroundColor: QColors.primaryLight,
  },
  lookingLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  lookingLabelActive: {
    color: QColors.primary,
  },
  // Step 2
  phoneCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  phoneCardGradient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
  },
  phoneCardFlag: {
    fontSize: 32,
  },
  phoneCardLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: QColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneCardNumber: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    marginTop: 2,
  },
  sendOtpArea: {
    gap: 24,
  },
  otpIllustration: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  otpIconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  otpTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  otpDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  otpDisplayCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  otpDisplayGradient: {
    padding: 20,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 16,
  },
  otpDisplayLabel: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  otpDisplayCode: {
    fontSize: 40,
    fontFamily: "Inter_700Bold",
    color: QColors.primary,
    letterSpacing: 6,
    marginVertical: 4,
  },
  otpDisplayHint: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: "#9CA3AF",
  },
  otpEntryLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
    marginBottom: 16,
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  otpBox: {
    width: 46,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    backgroundColor: "#F5F3FF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    textAlign: "center",
  },
  otpBoxFilled: {
    borderColor: QColors.primary,
    backgroundColor: QColors.primaryLight,
    color: QColors.primary,
  },
  demoHint: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginTop: 10,
  },
  dobRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 4,
  },
  dobSegment: {
    flex: 1,
    alignItems: "center",
  },
  dobInput: {
    textAlign: "center",
    letterSpacing: 2,
  },
  dobLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  dobSep: {
    paddingTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dobSepText: {
    fontSize: 20,
    color: "#C4B5FD",
    fontFamily: "Inter_700Bold",
  },
  photoStepIntro: {
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  photoStepIconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  photoStepTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#111827",
    textAlign: "center",
  },
  photoStepSub: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  photoSlot: {
    width: "31%",
    aspectRatio: 4 / 5,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  photoSlotEmpty: {
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  photoSlotImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoSlotRemove: {
    position: "absolute",
    top: 4,
    right: 4,
  },
  photoMainBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: QColors.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoMainBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  photoPickRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  photoPickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: "#fff",
  },
  photoPickBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  resendText: {
    textAlign: "center",
    fontSize: 14,
    color: QColors.primary,
    fontFamily: "Inter_500Medium",
  },
  termsText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
  },
});
