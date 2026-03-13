import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QColors } from "@/constants/colors";
import { useTheme } from "@/constants/theme";
import { useAuth, User } from "@/context/AuthContext";
import { useThemeContext } from "@/context/ThemeContext";

const INTERESTS_ALL = [
  "Music", "Travel", "Food", "Fitness", "Gaming", "Reading",
  "Movies", "Art", "Photography", "Dancing", "Cooking", "Yoga",
  "Cricket", "Football", "Trekking", "Coffee", "Dogs", "Cats",
  "Startups", "Tech",
];
const LOOKING_FOR_ALL = [
  { id: "chat", label: "Just Chat", icon: "chatbubble-outline" as const },
  { id: "audio", label: "Audio Call", icon: "call-outline" as const },
  { id: "video", label: "Video Call", icon: "videocam-outline" as const },
  { id: "meet", label: "Meet Up", icon: "people-outline" as const },
];
const PERSONALITY_OPTIONS = ["Introvert", "Extrovert", "Ambivert"];
const RELATIONSHIP_OPTIONS = ["Friendship", "Casual", "Serious", "Open to all"];
const GENDER_OPTIONS = ["Male", "Female", "Non-binary", "Other"];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { isDark, colors } = useTheme();
  const { toggle: toggleTheme } = useThemeContext();
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(user?.isOnline ?? true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const editAnim = useRef(new Animated.Value(0)).current;

  // Editable state — mirrors user fields
  const [draft, setDraft] = useState<Partial<User>>({});

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  // Sync draft when user changes
  useEffect(() => {
    if (user) {
      setDraft({
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        bio: user.bio ?? "",
        city: user.city,
        country: user.country,
        phone: user.phone,
        occupation: user.occupation ?? "",
        education: user.education ?? "",
        interests: [...(user.interests ?? [])],
        lookingFor: [...(user.lookingFor ?? [])],
        personalityType: user.personalityType ?? "",
        relationshipStyle: user.relationshipStyle ?? "",
        photos: [...(user.photos ?? [])],
      });
    }
  }, [user]);

  const startEditing = () => {
    setIsEditing(true);
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(editAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const cancelEditing = () => {
    // Reset draft to current user
    if (user) {
      setDraft({
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        gender: user.gender,
        bio: user.bio ?? "",
        city: user.city,
        country: user.country,
        phone: user.phone,
        occupation: user.occupation ?? "",
        education: user.education ?? "",
        interests: [...(user.interests ?? [])],
        lookingFor: [...(user.lookingFor ?? [])],
        personalityType: user.personalityType ?? "",
        relationshipStyle: user.relationshipStyle ?? "",
        photos: [...(user.photos ?? [])],
      });
    }
    setIsEditing(false);
    Animated.timing(editAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const saveProfile = async () => {
    if (!draft.firstName?.trim()) {
      Alert.alert("Required", "First name cannot be empty.");
      return;
    }
    setIsSaving(true);
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateUser({ ...draft });
    setIsSaving(false);
    setIsEditing(false);
    Animated.timing(editAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  };

  const setField = <K extends keyof User>(key: K, value: User[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (i: string) => {
    const current = draft.interests ?? [];
    setDraft((prev) => ({
      ...prev,
      interests: current.includes(i) ? current.filter((x) => x !== i) : [...current, i],
    }));
  };

  const toggleLookingFor = (id: string) => {
    const current = draft.lookingFor ?? [];
    setDraft((prev) => ({
      ...prev,
      lookingFor: current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    }));
  };

  // Photo picker
  const applyPhoto = async (uri: string) => {
    const newPhotos = [uri, ...(draft.photos?.slice(0, 5) ?? [])];
    setDraft((prev) => ({ ...prev, photos: newPhotos }));
    // Persist immediately so it shows everywhere (no need to press Save)
    await updateUser({ photos: newPhotos });
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photo library.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: Platform.OS === "web",
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri =
        Platform.OS === "web" && asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
      await applyPhoto(uri);
    }
  };

  const takeSellfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      cameraType: ImagePicker.CameraType.front,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: Platform.OS === "web",
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri =
        Platform.OS === "web" && asset.base64
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;
      await applyPhoto(uri);
    }
  };

  const handlePhotoPress = () => {
    if (!isEditing) return;
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Take Selfie", "Choose from Gallery"],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) takeSellfie();
          if (idx === 2) pickFromGallery();
        }
      );
    } else {
      Alert.alert("Change Photo", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Selfie", onPress: takeSellfie },
        { text: "Choose from Gallery", onPress: pickFromGallery },
      ]);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/onboarding");
        },
      },
    ]);
  };

  const displayUser = isEditing ? draft : user;
  const profilePhoto = displayUser?.photos?.[0];
  const initials = `${displayUser?.firstName?.[0] ?? "Q"}${displayUser?.lastName?.[0] ?? ""}`;

  const stats = [
    { label: "Connections", value: "24", icon: "people" as const },
    { label: "Chats", value: "8", icon: "chatbubbles" as const },
    { label: "Calls", value: "12", icon: "call" as const },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: Platform.OS === "web" ? 40 : insets.bottom + 110,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ─── Gradient Header ─────────────────────────────────────────── */}
        <LinearGradient
          colors={[QColors.primaryDark, QColors.primary, QColors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: topPadding + 8 }]}
        >
          {/* Top bar */}
          <View style={styles.headerTopBar}>
            <Text style={styles.headerTitle}>My Profile</Text>
            {!isEditing ? (
              <TouchableOpacity style={styles.editBtn} onPress={startEditing}>
                <Ionicons name="create-outline" size={16} color={QColors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.cancelBtn} onPress={cancelEditing}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Avatar */}
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handlePhotoPress}
            activeOpacity={isEditing ? 0.8 : 1}
          >
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatarImg} />
            ) : (
              <LinearGradient
                colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]}
                style={styles.avatarPlaceholder}
              >
                <Text style={styles.avatarText}>{initials}</Text>
              </LinearGradient>
            )}

            {/* Online indicator */}
            <View
              style={[
                styles.onlineIndicator,
                { backgroundColor: isOnline ? "#10B981" : "#6B7280" },
              ]}
            />

            {/* Camera overlay (edit mode) */}
            {isEditing && (
              <View style={styles.cameraOverlay}>
                <Ionicons name="camera" size={22} color="#fff" />
                <Text style={styles.cameraOverlayText}>Change</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name (editable inline in edit mode) */}
          {isEditing ? (
            <View style={styles.nameEditRow}>
              <TextInput
                style={styles.nameInput}
                value={draft.firstName ?? ""}
                onChangeText={(t) => setField("firstName", t)}
                placeholder="First name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="words"
              />
              <TextInput
                style={styles.nameInput}
                value={draft.lastName ?? ""}
                onChangeText={(t) => setField("lastName", t)}
                placeholder="Last name"
                placeholderTextColor="rgba(255,255,255,0.5)"
                autoCapitalize="words"
              />
            </View>
          ) : (
            <Text style={styles.name}>
              {displayUser?.firstName ?? "QRomian"} {displayUser?.lastName ?? ""}
            </Text>
          )}

          <Text style={styles.locationDisplay}>
            {[displayUser?.city, displayUser?.country].filter(Boolean).join(", ") || "Location not set"}
          </Text>

          {/* Coin balance */}
          <View style={styles.coinRow}>
            <Ionicons name="flash" size={16} color={QColors.gold} />
            <Text style={styles.coinText}>{user?.coinBalance ?? 100} coins</Text>
            <TouchableOpacity style={styles.addCoins}>
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.addCoinsText}>Add</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ─── Stats ─────────────────────────────────────────────────────── */}
        <View
          style={[
            styles.statsRow,
            { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" },
          ]}
        >
          {stats.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statItem,
                i < stats.length - 1 && {
                  borderRightWidth: StyleSheet.hairlineWidth,
                  borderRightColor: isDark ? colors.border : "#E5E7EB",
                },
              ]}
            >
              <Ionicons name={s.icon} size={20} color={QColors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ─── Edit Form / View ─────────────────────────────────────────── */}
        {isEditing ? (
          <View style={styles.editForm}>

            {/* Basic Info */}
            <SectionHeader title="Basic Info" />
            <View style={styles.formCard}>
              <FormRow label="Age">
                <TextInput
                  style={styles.formInput}
                  value={String(draft.age ?? "")}
                  onChangeText={(t) => setField("age", parseInt(t) || 0)}
                  keyboardType="numeric"
                  maxLength={2}
                  placeholder="25"
                  placeholderTextColor="#C4B5FD"
                />
              </FormRow>
              <Divider />
              <FormRow label="Gender">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.pillRowInline}>
                    {GENDER_OPTIONS.map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.pill, draft.gender === g && styles.pillActive]}
                        onPress={() => setField("gender", g)}
                      >
                        <Text style={[styles.pillText, draft.gender === g && styles.pillTextActive]}>
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </FormRow>
              <Divider />
              <FormRow label="Phone">
                <TextInput
                  style={styles.formInput}
                  value={draft.phone ?? ""}
                  onChangeText={(t) => setField("phone", t)}
                  keyboardType="phone-pad"
                  placeholder="+1 555 000 0000"
                  placeholderTextColor="#C4B5FD"
                />
              </FormRow>
            </View>

            {/* Location */}
            <SectionHeader title="Location" />
            <View style={styles.formCard}>
              <FormRow label="Country">
                <TextInput
                  style={styles.formInput}
                  value={draft.country ?? ""}
                  onChangeText={(t) => setField("country", t)}
                  placeholder="Spain"
                  placeholderTextColor="#C4B5FD"
                  autoCapitalize="words"
                />
              </FormRow>
              <Divider />
              <FormRow label="City / State">
                <TextInput
                  style={styles.formInput}
                  value={draft.city ?? ""}
                  onChangeText={(t) => setField("city", t)}
                  placeholder="Barcelona"
                  placeholderTextColor="#C4B5FD"
                  autoCapitalize="words"
                />
              </FormRow>
            </View>

            {/* About */}
            <SectionHeader title="About Me" />
            <View style={[styles.formCard, { padding: 14 }]}>
              <Text style={styles.fieldLabel}>Bio</Text>
              <TextInput
                style={styles.bioInput}
                value={draft.bio ?? ""}
                onChangeText={(t) => setField("bio", t)}
                multiline
                numberOfLines={4}
                placeholder="Write something about yourself..."
                placeholderTextColor="#C4B5FD"
                textAlignVertical="top"
              />
            </View>

            {/* Profession */}
            <SectionHeader title="Profession" />
            <View style={styles.formCard}>
              <FormRow label="Occupation">
                <TextInput
                  style={styles.formInput}
                  value={draft.occupation ?? ""}
                  onChangeText={(t) => setField("occupation", t)}
                  placeholder="e.g. Software Engineer"
                  placeholderTextColor="#C4B5FD"
                />
              </FormRow>
              <Divider />
              <FormRow label="Education">
                <TextInput
                  style={styles.formInput}
                  value={draft.education ?? ""}
                  onChangeText={(t) => setField("education", t)}
                  placeholder="e.g. B.Tech, IIT"
                  placeholderTextColor="#C4B5FD"
                />
              </FormRow>
            </View>

            {/* Interests */}
            <SectionHeader title="Interests" />
            <View style={[styles.formCard, { padding: 14 }]}>
              <View style={styles.chipsWrap}>
                {INTERESTS_ALL.map((interest) => {
                  const active = (draft.interests ?? []).includes(interest);
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

            {/* Looking For */}
            <SectionHeader title="Looking For" />
            <View style={[styles.formCard, { padding: 14 }]}>
              <View style={styles.lookingGrid}>
                {LOOKING_FOR_ALL.map((l) => {
                  const active = (draft.lookingFor ?? []).includes(l.id);
                  return (
                    <TouchableOpacity
                      key={l.id}
                      onPress={() => toggleLookingFor(l.id)}
                      style={[styles.lookingCard, active && styles.lookingCardActive]}
                    >
                      <Ionicons
                        name={l.icon}
                        size={22}
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

            {/* Personality & Style */}
            <SectionHeader title="Personality" />
            <View style={styles.formCard}>
              <FormRow label="Type">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.pillRowInline}>
                    {PERSONALITY_OPTIONS.map((p) => (
                      <TouchableOpacity
                        key={p}
                        style={[styles.pill, draft.personalityType === p.toLowerCase() && styles.pillActive]}
                        onPress={() => setField("personalityType", p.toLowerCase())}
                      >
                        <Text style={[styles.pillText, draft.personalityType === p.toLowerCase() && styles.pillTextActive]}>
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </FormRow>
              <Divider />
              <FormRow label="Style">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.pillRowInline}>
                    {RELATIONSHIP_OPTIONS.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[styles.pill, draft.relationshipStyle === r.toLowerCase() && styles.pillActive]}
                        onPress={() => setField("relationshipStyle", r.toLowerCase())}
                      >
                        <Text style={[styles.pillText, draft.relationshipStyle === r.toLowerCase() && styles.pillTextActive]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </FormRow>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
              onPress={saveProfile}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[QColors.primary, QColors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
              />
              <Ionicons name={isSaving ? "hourglass-outline" : "checkmark-circle"} size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{isSaving ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>

          </View>
        ) : (
          /* ─── View Mode ───────────────────────────────────────────────── */
          <View>
            {/* Photos grid */}
            {(user?.photos?.length ?? 0) > 1 && (
              <View style={[styles.infoCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>PHOTOS</Text>
                <View style={styles.viewPhotoGrid}>
                  {user!.photos.map((uri, i) => (
                    <View key={i} style={styles.viewPhotoSlot}>
                      <Image source={{ uri }} style={styles.viewPhotoImg} />
                      {i === 0 && (
                        <View style={styles.viewPhotoMainBadge}>
                          <Text style={styles.viewPhotoMainBadgeText}>Main</Text>
                        </View>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity style={[styles.viewPhotoSlot, styles.viewPhotoAdd]} onPress={startEditing}>
                    <Ionicons name="add" size={24} color={QColors.primary + "80"} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Bio */}
            {user?.bio ? (
              <View style={[styles.infoCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>ABOUT</Text>
                <Text style={[styles.bioText, { color: colors.text }]}>{user.bio}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.infoCard, styles.emptyCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}
                onPress={startEditing}
              >
                <Ionicons name="add-circle-outline" size={18} color={QColors.primary} />
                <Text style={{ color: QColors.primary, fontFamily: "Inter_500Medium", fontSize: 13 }}>
                  Add a bio
                </Text>
              </TouchableOpacity>
            )}

            {/* Details row */}
            <View style={[styles.infoCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>DETAILS</Text>
              <View style={styles.detailsList}>
                {user?.age && <DetailRow icon="calendar-outline" value={`${user.age} years old`} colors={colors} />}
                {user?.gender && <DetailRow icon="person-outline" value={user.gender} colors={colors} />}
                {user?.occupation && <DetailRow icon="briefcase-outline" value={user.occupation} colors={colors} />}
                {user?.education && <DetailRow icon="school-outline" value={user.education} colors={colors} />}
                {user?.phone && <DetailRow icon="call-outline" value={user.phone} colors={colors} />}
                {user?.personalityType && <DetailRow icon="sparkles-outline" value={user.personalityType} colors={colors} />}
                {user?.relationshipStyle && <DetailRow icon="heart-outline" value={user.relationshipStyle} colors={colors} />}
              </View>
            </View>

            {/* Interests */}
            {(user?.interests?.length ?? 0) > 0 && (
              <View style={[styles.infoCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>INTERESTS</Text>
                <View style={styles.chipsWrap}>
                  {user!.interests.map((i) => (
                    <View key={i} style={[styles.interestChip, styles.interestChipActive]}>
                      <Text style={styles.interestChipTextActive}>{i}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Looking for */}
            {(user?.lookingFor?.length ?? 0) > 0 && (
              <View style={[styles.infoCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                <Text style={[styles.cardTitle, { color: colors.textSecondary }]}>LOOKING FOR</Text>
                <View style={styles.chipsWrap}>
                  {user!.lookingFor.map((id) => {
                    const item = LOOKING_FOR_ALL.find((l) => l.id === id);
                    return item ? (
                      <View key={id} style={[styles.interestChip, styles.interestChipActive]}>
                        <Ionicons name={item.icon} size={12} color={QColors.primary} />
                        <Text style={styles.interestChipTextActive}>{item.label}</Text>
                      </View>
                    ) : null;
                  })}
                </View>
              </View>
            )}

            {/* Settings */}
            <View style={styles.settingsSection}>
              <Text style={[styles.cardTitle, { color: colors.textSecondary, marginLeft: 4 }]}>
                PREFERENCES
              </Text>
              <View style={[styles.settingsCard, { backgroundColor: isDark ? colors.backgroundSecondary : "#F9FAFB" }]}>
                <SettingsRow
                  icon={isDark ? "moon" : "sunny-outline"}
                  label="Dark Mode"
                  toggle
                  value={isDark}
                  onToggle={() => toggleTheme()}
                  colors={colors}
                />
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? colors.border : "#E5E7EB" }} />
                <SettingsRow
                  icon="notifications-outline"
                  label="Notifications"
                  toggle
                  value={notifEnabled}
                  onToggle={setNotifEnabled}
                  colors={colors}
                />
                <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: isDark ? colors.border : "#E5E7EB" }} />
                <SettingsRow
                  icon="radio-button-on-outline"
                  label="Online Status"
                  toggle
                  value={isOnline}
                  onToggle={(v) => { setIsOnline(v); updateUser({ isOnline: v }); }}
                  colors={colors}
                />
              </View>
            </View>

            {/* Sign Out */}
            <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.signOutBtn]}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={18} color={QColors.error} />
                <Text style={[styles.signOutText, { color: QColors.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.version, { color: colors.textTertiary }]}>
              QRomes v1.0.0 · Connecting the Roaming Souls
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sH.text}>{title}</Text>
  );
}
const sH = StyleSheet.create({
  text: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: "#9CA3AF",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
});

function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: "#E5E7EB", marginLeft: 14 }} />;
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fR.row}>
      <Text style={fR.label}>{label}</Text>
      <View style={fR.value}>{children}</View>
    </View>
  );
}
const fR = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 52,
  },
  label: {
    width: 90,
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  value: {
    flex: 1,
  },
});

function DetailRow({ icon, value, colors }: { icon: any; value: string; colors: any }) {
  return (
    <View style={dR.row}>
      <View style={dR.iconBox}>
        <Ionicons name={icon} size={14} color={QColors.primary} />
      </View>
      <Text style={[dR.text, { color: colors.text }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}
const dR = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 5 },
  iconBox: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: QColors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  text: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
});

function SettingsRow({
  icon, label, toggle, value, onToggle, colors,
}: {
  icon: any; label: string; toggle?: boolean; value?: boolean;
  onToggle?: (v: boolean) => void; colors: any;
}) {
  return (
    <View style={sR.row}>
      <View style={sR.iconBox}>
        <Ionicons name={icon} size={16} color={QColors.primary} />
      </View>
      <Text style={[sR.label, { color: colors.text }]}>{label}</Text>
      {toggle && (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: "#E5E7EB", true: QColors.primary }}
          thumbColor="#fff"
        />
      )}
    </View>
  );
}
const sR = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13, gap: 12,
  },
  iconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: QColors.primaryLight,
    alignItems: "center", justifyContent: "center",
  },
  label: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
});

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  headerGradient: {
    alignItems: "center",
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: QColors.primary,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: "#fff",
  },

  // Avatar
  avatarContainer: {
    position: "relative",
    marginTop: 4,
    marginBottom: 8,
  },
  avatarImg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2.5,
    borderColor: "#fff",
  },
  cameraOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: 48,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  cameraOverlayText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  // Name
  nameEditRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginBottom: 4,
  },
  nameInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textAlign: "center",
    borderBottomWidth: 1.5,
    borderBottomColor: "rgba(255,255,255,0.5)",
    paddingVertical: 4,
  },
  name: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    marginBottom: 2,
  },
  locationDisplay: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: "rgba(255,255,255,0.75)",
    marginBottom: 4,
  },

  // Coins
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  coinText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  addCoins: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  addCoinsText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: -16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  // View mode cards
  infoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  emptyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    borderStyle: "dashed",
    backgroundColor: QColors.primaryLight,
  },
  cardTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  bioText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  detailsList: {
    gap: 2,
  },

  // Edit form
  editForm: {
    paddingBottom: 16,
  },
  formCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: "#F5F3FF",
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    overflow: "hidden",
  },
  formInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    flex: 1,
    paddingVertical: 4,
    textAlign: "right",
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: "#6B7280",
    marginBottom: 8,
  },
  bioInput: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#111827",
    minHeight: 100,
    lineHeight: 20,
  },
  pillRowInline: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DDD6FE",
    backgroundColor: "#fff",
  },
  pillActive: {
    borderColor: QColors.primary,
    backgroundColor: QColors.primaryLight,
  },
  pillText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  pillTextActive: {
    color: QColors.primary,
  },

  // Chips / Interests
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  interestChipActive: {
    backgroundColor: QColors.primaryLight,
    borderColor: QColors.primary,
  },
  interestChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#6B7280",
  },
  interestChipTextActive: {
    color: QColors.primary,
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },

  // Looking for
  lookingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  lookingCard: {
    width: "47%",
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
  lookingLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: "#9CA3AF",
  },
  lookingLabelActive: {
    color: QColors.primary,
  },

  // Save
  saveBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },

  // Settings
  settingsSection: {
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  settingsCard: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 4,
  },

  // Sign out
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
  },
  signOutText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  version: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 20,
    marginBottom: 8,
  },
  viewPhotoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  viewPhotoSlot: {
    width: "31%",
    aspectRatio: 4 / 5,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  viewPhotoImg: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  viewPhotoMainBadge: {
    position: "absolute",
    bottom: 5,
    left: 5,
    backgroundColor: QColors.primary,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  viewPhotoMainBadgeText: {
    fontSize: 9,
    color: "#fff",
    fontFamily: "Inter_600SemiBold",
  },
  viewPhotoAdd: {
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
});
