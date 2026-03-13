import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
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
import { QRomesLogo } from "@/components/QRomesLogo";
import { useAuth } from "@/context/AuthContext";

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

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { setUser, setToken, setOnboarded } = useAuth();
  const [step, setStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Step 0
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  // Step 1
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedLooking, setSelectedLooking] = useState<string[]>([]);
  const [personality, setPersonality] = useState("");
  const [relationship, setRelationship] = useState("");

  // Step 2
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const animateToStep = (newStep: number) => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -20, duration: 180, useNativeDriver: true }),
      ]),
    ]).start(() => {
      setStep(newStep);
      slideAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const toggleInterest = (i: string) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const toggleLooking = (id: string) => {
    setSelectedLooking((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleOtpChange = (text: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleFinish = async () => {
    const mockUser = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      firstName: firstName || "QRomian",
      lastName: lastName || "",
      age: parseInt(age) || 25,
      gender,
      city: city || "Unknown City",
      country: country || "World",
      phone,
      bio: `${personality ? personality + " · " : ""}Based in ${city || "Unknown"}, ${country || "World"}`,
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

  const step0Valid = firstName.length > 0 && age.length > 0 && gender.length > 0;
  const step1Valid = selectedInterests.length >= 3 && selectedLooking.length >= 1;
  const step2Valid = otp.join("").length === 6;

  const topPad = Platform.OS === "web" ? 24 : insets.top;

  const STEPS = [
    { title: "Who are you?", subtitle: "Let's build your profile", icon: "person-circle-outline" as const },
    { title: "Your vibe", subtitle: "What makes you, you?", icon: "heart-outline" as const },
    { title: "Verify", subtitle: "Quick confirmation", icon: "shield-checkmark-outline" as const },
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
          <QRomesLogo size={36} />
          <Text style={styles.appName}>QRomes</Text>
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
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={[styles.progressDotNum, i === step && { color: QColors.primary }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.progressLine, i < step && styles.progressLineDone]} />
              )}
            </View>
          ))}
        </View>

        {/* Current step info */}
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
          {step === 0 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name row */}
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
                    returnKeyType="next"
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
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Age */}
              <View>
                <Text style={styles.inputLabel}>Age *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="25"
                  placeholderTextColor="#C4B5FD"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  maxLength={2}
                  returnKeyType="next"
                />
              </View>

              {/* Gender */}
              <View>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.pillRow}>
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.pill, gender === g && styles.pillActive]}
                      onPress={() => setGender(g)}
                    >
                      <Text style={[styles.pillText, gender === g && styles.pillTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Country + City */}
              <View style={styles.inputRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Country</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Spain"
                    placeholderTextColor="#C4B5FD"
                    value={country}
                    onChangeText={setCountry}
                    returnKeyType="next"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Barcelona"
                    placeholderTextColor="#C4B5FD"
                    value={city}
                    onChangeText={setCity}
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Phone */}
              <View>
                <Text style={styles.inputLabel}>Phone number</Text>
                <View style={styles.phoneRow}>
                  <View style={styles.phonePrefixBox}>
                    <Text style={styles.phonePrefixText}>+1</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="(555) 000-0000"
                    placeholderTextColor="#C4B5FD"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
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

          {step === 1 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Interests */}
              <View>
                <View style={styles.labelRow}>
                  <Text style={styles.inputLabel}>Pick your interests</Text>
                  <Text style={[styles.countBadge, selectedInterests.length >= 3 && styles.countBadgeDone]}>
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
                        <Text style={[styles.interestChipText, active && styles.interestChipTextActive]}>
                          {interest}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Looking for */}
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
                        <Text style={[styles.lookingLabel, active && styles.lookingLabelActive]}>
                          {l.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Personality */}
              <View>
                <Text style={styles.inputLabel}>Personality type</Text>
                <View style={styles.pillRow}>
                  {PERSONALITY.map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.pill, personality === p && styles.pillActive]}
                      onPress={() => setPersonality(p)}
                    >
                      <Text style={[styles.pillText, personality === p && styles.pillTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Relationship */}
              <View>
                <Text style={styles.inputLabel}>Relationship style</Text>
                <View style={styles.pillRow}>
                  {RELATIONSHIP.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.pill, relationship === r && styles.pillActive]}
                      onPress={() => setRelationship(r)}
                    >
                      <Text style={[styles.pillText, relationship === r && styles.pillTextActive]}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.btnRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => animateToStep(0)}>
                  <Ionicons name="arrow-back" size={18} color={QColors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryBtn, { flex: 1 }, !step1Valid && styles.primaryBtnDisabled]}
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

          {step === 2 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.stepContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Phone display */}
              <View style={styles.phoneCard}>
                <LinearGradient
                  colors={[QColors.primaryLight, "#FCE7F3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.phoneCardGradient}
                >
                  <Ionicons name="phone-portrait-outline" size={22} color={QColors.primary} />
                  <View>
                    <Text style={styles.phoneCardLabel}>Sending code to</Text>
                    <Text style={styles.phoneCardNumber}>{phone || "Your phone number"}</Text>
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
                      We'll send a 6-digit OTP to verify your identity. Standard message rates may apply.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={() => setOtpSent(true)}
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
                <View style={{ gap: 24 }}>
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
                    <TouchableOpacity style={styles.backBtn} onPress={() => animateToStep(1)}>
                      <Ionicons name="arrow-back" size={18} color={QColors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.primaryBtn, { flex: 1 }, !step2Valid && styles.primaryBtnDisabled]}
                      onPress={() => step2Valid && handleFinish()}
                      activeOpacity={step2Valid ? 0.85 : 1}
                    >
                      <LinearGradient
                        colors={[QColors.primary, QColors.accent]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
                      />
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.primaryBtnText}>Enter QRomes</Text>
                    </TouchableOpacity>
                  </View>

                  <Pressable onPress={() => { setOtp(["","","","","",""]); setOtpSent(false); }}>
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
    </View>
  );
}

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
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  progressDotActive: {
    backgroundColor: "#fff",
  },
  progressDotDone: {
    backgroundColor: "rgba(255,255,255,0.9)",
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
  phoneRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  phonePrefixBox: {
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  phonePrefixText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: QColors.primary,
  },
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
  phoneCardLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    color: QColors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  phoneCardNumber: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
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
