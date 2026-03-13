import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { QRomesLogo } from "@/components/QRomesLogo";
import { useAuth } from "@/context/AuthContext";

const { width: SCREEN_W } = Dimensions.get("window");

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

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUser, setToken, setOnboarded } = useAuth();
  const [step, setStep] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 0 - Welcome
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  // Step 1 - Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLooking, setSelectedLooking] = useState<string[]>([]);
  const [personality, setPersonality] = useState("");
  const [relationship, setRelationship] = useState("");

  // Step 2 - OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const goToStep = (newStep: number) => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_W * newStep,
      duration: 350,
      useNativeDriver: true,
    }).start();
    setStep(newStep);
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleLooking = (id: string) => {
    setSelectedLooking((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleOtpChange = (text: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleFinish = async () => {
    const mockUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      firstName,
      lastName,
      age: parseInt(age) || 25,
      gender,
      city,
      country,
      phone,
      bio: `${personality ? personality + " · " : ""}Based in ${city}, ${country}`,
      interests: selectedInterests,
      lookingFor: selectedLooking,
      photos: [],
      coinBalance: 100,
      isOnline: true,
      occupation: "",
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

  const step0Valid =
    firstName.length > 0 && age.length > 0 && gender.length > 0;
  const step1Valid =
    selectedInterests.length >= 3 && selectedLooking.length >= 1;
  const step2Valid = otp.join("").length === 6;

  const genderOptions = ["Male", "Female", "Non-binary", "Other"];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[QColors.primaryDark, QColors.primary, QColors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <QRomesLogo size={44} />

        {/* Progress */}
        <View style={styles.progressRow}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.progressBar,
                { backgroundColor: i <= step ? "#fff" : "rgba(255,255,255,0.3)" },
              ]}
            />
          ))}
        </View>
        <Text style={styles.stepLabel}>
          Step {step + 1} of 3
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Animated.View
          style={[
            styles.stepsContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {/* STEP 0 - Identity */}
          <View style={[styles.stepPanel, { width: SCREEN_W }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.stepTitle}>Let's get you started</Text>
              <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor="#9CA3AF"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor="#9CA3AF"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                maxLength={2}
              />

              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionRow}>
                {genderOptions.map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.optionChip,
                      gender === g && styles.optionChipActive,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        gender === g && styles.optionChipTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Country"
                placeholderTextColor="#9CA3AF"
                value={country}
                onChangeText={setCountry}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor="#9CA3AF"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <TouchableOpacity
                style={[styles.btn, !step0Valid && styles.btnDisabled]}
                onPress={() => step0Valid && goToStep(1)}
              >
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* STEP 1 - Vibe */}
          <View style={[styles.stepPanel, { width: SCREEN_W }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, gap: 16, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.stepTitle}>What's your vibe?</Text>
              <Text style={styles.stepSubtitle}>Help others know you better</Text>

              <Text style={styles.label}>Your interests (min. 3)</Text>
              <View style={styles.chips}>
                {INTERESTS.map((interest) => (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[
                      styles.chip,
                      selectedInterests.includes(interest) && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedInterests.includes(interest) && styles.chipTextActive,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>I'm looking for</Text>
              <View style={styles.optionRow}>
                {LOOKING_FOR.map((l) => (
                  <TouchableOpacity
                    key={l.id}
                    onPress={() => toggleLooking(l.id)}
                    style={[
                      styles.lookingCard,
                      selectedLooking.includes(l.id) && styles.lookingCardActive,
                    ]}
                  >
                    <Ionicons
                      name={l.icon}
                      size={22}
                      color={selectedLooking.includes(l.id) ? QColors.primary : "#9CA3AF"}
                    />
                    <Text
                      style={[
                        styles.lookingText,
                        selectedLooking.includes(l.id) && styles.lookingTextActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Personality type</Text>
              <View style={styles.optionRow}>
                {PERSONALITY.map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.optionChip,
                      personality === p && styles.optionChipActive,
                    ]}
                    onPress={() => setPersonality(p)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        personality === p && styles.optionChipTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Relationship style</Text>
              <View style={styles.optionRow}>
                {RELATIONSHIP.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.optionChip,
                      relationship === r && styles.optionChipActive,
                    ]}
                    onPress={() => setRelationship(r)}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        relationship === r && styles.optionChipTextActive,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.btn, !step1Valid && styles.btnDisabled]}
                onPress={() => step1Valid && goToStep(2)}
              >
                <LinearGradient
                  colors={[QColors.primary, QColors.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.btnText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* STEP 2 - OTP */}
          <View style={[styles.stepPanel, { width: SCREEN_W }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.stepTitle}>Verify your number</Text>
              <Text style={styles.stepSubtitle}>
                We'll send a 6-digit code to +{phone}
              </Text>

              <View style={styles.phoneDisplay}>
                <Ionicons name="phone-portrait-outline" size={20} color={QColors.primary} />
                <Text style={styles.phoneText}>{phone || "Your phone number"}</Text>
              </View>

              {!otpSent ? (
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => setOtpSent(true)}
                >
                  <LinearGradient
                    colors={[QColors.primary, QColors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.btnText}>Send OTP</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={styles.label}>Enter OTP</Text>
                  <View style={styles.otpRow}>
                    {otp.map((val, idx) => (
                      <TextInput
                        key={idx}
                        ref={(r) => { otpRefs.current[idx] = r; }}
                        style={[
                          styles.otpBox,
                          val.length > 0 && styles.otpBoxFilled,
                        ]}
                        value={val}
                        onChangeText={(t) => handleOtpChange(t.slice(-1), idx)}
                        keyboardType="numeric"
                        maxLength={1}
                        textAlign="center"
                        onKeyPress={({ nativeEvent }) => {
                          if (nativeEvent.key === "Backspace" && !val && idx > 0) {
                            otpRefs.current[idx - 1]?.focus();
                          }
                        }}
                      />
                    ))}
                  </View>

                  <Text style={styles.demoHint}>
                    Demo: enter any 6 digits to continue
                  </Text>

                  <TouchableOpacity
                    style={[styles.btn, !step2Valid && styles.btnDisabled]}
                    onPress={() => step2Valid && handleFinish()}
                  >
                    <LinearGradient
                      colors={[QColors.primary, QColors.accent]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.btnText}>Verify & Enter QRomes</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setOtpSent(false)}>
                    <Text style={styles.resend}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.terms}>
                By continuing you agree to our Terms & Privacy Policy
              </Text>
            </ScrollView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    alignItems: "center",
    gap: 12,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  progressBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  stepLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  stepsContainer: {
    flex: 1,
    flexDirection: "row",
  },
  stepPanel: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    color: "#111827",
  },
  stepSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#6B7280",
    marginTop: -8,
  },
  label: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#374151",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  input: {
    height: 52,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: "#111827",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
  },
  optionChipActive: {
    borderColor: QColors.primary,
    backgroundColor: QColors.primaryLight,
  },
  optionChipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  optionChipTextActive: {
    color: QColors.primary,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  chipActive: {
    backgroundColor: QColors.primaryLight,
    borderWidth: 1,
    borderColor: QColors.primary,
  },
  chipText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  chipTextActive: {
    color: QColors.primary,
  },
  lookingCard: {
    flex: 1,
    minWidth: "44%",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    gap: 6,
  },
  lookingCardActive: {
    borderColor: QColors.primary,
    backgroundColor: QColors.primaryLight,
  },
  lookingText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  lookingTextActive: {
    color: QColors.primary,
  },
  btn: {
    height: 52,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  phoneDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: QColors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  phoneText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: QColors.primary,
  },
  otpRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#111827",
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
  },
  resend: {
    textAlign: "center",
    fontSize: 14,
    color: QColors.primary,
    fontFamily: "Inter_500Medium",
  },
  terms: {
    textAlign: "center",
    fontSize: 11,
    color: "#9CA3AF",
    fontFamily: "Inter_400Regular",
    lineHeight: 16,
  },
});
