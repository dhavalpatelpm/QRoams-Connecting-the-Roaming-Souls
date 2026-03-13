# QROME — Full-Stack App Build Prompt
### For Replit AI / Agent | Written by Senior PM + Senior Product Designer

---

## ROLE & CONTEXT

You are a senior full-stack engineer building **Qrome** — a global social connection app for people suffering from loneliness and boredom. Think of it as the intersection of Tinder's swipe mechanics, Omegle's spontaneity, and a purposeful coin-based connection economy. The app must be production-ready, visually world-class, and engineered for global scale from day one.

You will build this as a **React Native (Expo)** mobile app with a **Node.js + Express** backend, **PostgreSQL** database, **Redis** cache, and **Firebase** push notifications. The frontend must work flawlessly on both iOS and Android.

---

## DESIGN SYSTEM — NON-NEGOTIABLE

> Every single screen must follow these rules without exception. Consistency IS the product.

### Typography
```
Font Family:      Inter (import from Google Fonts)
H1:               28px, weight 700, line-height 1.2
H2:               22px, weight 700, line-height 1.3
H3:               18px, weight 600, line-height 1.4
Body Large:       16px, weight 400, line-height 1.6
Body Small:       14px, weight 400, line-height 1.5
Caption:          12px, weight 400, line-height 1.4
Label / Badge:    11px, weight 600, letter-spacing 0.4px, UPPERCASE
```

### Color Palette
```
Primary Purple:         #7C3AED
Primary Purple Light:   #EDE9FE
Primary Purple Dark:    #5B21B6

Accent Pink:            #EC4899
Accent Pink Light:      #FCE7F3

Coin Gold:              #F59E0B
Coin Gold Light:        #FEF3C7

Success Green:          #10B981
Success Light:          #D1FAE5

Error Red:              #EF4444
Error Light:            #FEE2E2

Text Primary:           #111827
Text Secondary:         #6B7280
Text Tertiary:          #9CA3AF
Text Inverse:           #FFFFFF

Background Primary:     #FFFFFF
Background Secondary:   #F9FAFB
Background Tertiary:    #F3F4F6

Border Default:         #E5E7EB
Border Focus:           #7C3AED
```

### Spacing Scale (use ONLY these values)
```
xs:   4px
sm:   8px
md:   12px
lg:   16px
xl:   24px
2xl:  32px
3xl:  48px
4xl:  64px
```

### Border Radius
```
sm:   6px   (tags, badges, inputs)
md:   12px  (buttons, cards inner)
lg:   20px  (profile cards, modals)
xl:   28px  (bottom sheets, phone frames)
full: 9999px (pills, avatars, toggle)
```

### Elevation / Shadows
```
card:    0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)
modal:   0 20px 60px rgba(0,0,0,0.15)
button:  0 4px 14px rgba(124,58,237,0.3)
```

### Component Rules
- All primary buttons: background #7C3AED, text white, height 52px, border-radius 12px, font-size 16px weight 600
- All secondary buttons: background transparent, border 1.5px solid #7C3AED, text #7C3AED, same dimensions
- All text inputs: height 52px, background #F9FAFB, border 1px solid #E5E7EB, border-radius 10px, padding horizontal 16px, font-size 16px. On focus: border-color #7C3AED, background white
- All cards: background white, border-radius 20px, shadow: card shadow above, padding 16px
- Screen padding: 20px horizontal on all screens
- Safe area: always respect top/bottom safe area insets (notch + home indicator)
- Status bar: always light content (white icons) on purple/dark headers, dark content on white headers

---

## TECH STACK

### Frontend
```
Framework:        React Native (Expo SDK 50+)
Navigation:       React Navigation v6 (Stack + Bottom Tabs)
State:            Zustand
Animations:       React Native Reanimated 3 + Gesture Handler
HTTP Client:      Axios with interceptors
Image:            Expo Image + expo-image-picker + expo-camera
Maps/Geo:         expo-location + react-native-maps
Payments:         react-native-razorpay (India) + expo-in-app-purchases
Push Notifs:      Expo Notifications + Firebase Cloud Messaging
Real-time:        Socket.io-client
Video/Audio:      Daily.co React Native SDK (WebRTC)
Storage:          expo-secure-store (tokens) + AsyncStorage (prefs)
```

### Backend
```
Runtime:          Node.js 20 LTS
Framework:        Express.js
Database:         PostgreSQL 15 (Supabase or Railway)
Cache:            Redis (Upstash)
ORM:              Prisma
Auth:             JWT (access 15min + refresh 7days)
File Storage:     AWS S3 or Cloudflare R2
SMS/OTP:          Twilio
Real-time:        Socket.io
AI Coach:         Anthropic Claude API (claude-sonnet-4-6)
Email:            Resend
Queue:            BullMQ + Redis
```

---

## DATABASE SCHEMA

Create all these tables in PostgreSQL via Prisma:

```prisma
model User {
  id            String    @id @default(cuid())
  firstName     String
  lastName      String
  age           Int
  gender        String
  phone         String    @unique
  phoneVerified Boolean   @default(false)
  city          String
  state         String
  country       String
  latitude      Float?
  longitude     Float?
  coinBalance   Int       @default(0)
  isOnline      Boolean   @default(false)
  lastSeen      DateTime  @default(now())
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  profile       Profile?
  photos        Photo[]
  sessions      Session[]
  swipesGiven   Swipe[]   @relation("swiper")
  swipesReceived Swipe[]  @relation("swiped")
  transactions  CoinTransaction[]
  matches       Match[]   @relation("user1")
  matchedWith   Match[]   @relation("user2")
}

model Profile {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id])
  bio             String?
  interests       String[] // ["Music", "Travel", "Foodie"]
  lookingFor      String[] // ["chat", "audio", "video", "meet"]
  relationshipStyle String? // "casual", "serious", "friendship", "open"
  personalityType String?  // "introvert", "extrovert", "ambivert"
  lifestyle       String?  // "homebody", "adventurous", "workaholic"
  drinkingHabit   String?  // "never", "socially", "regularly"
  smokingHabit    String?  // "never", "occasionally", "regularly"
  heightCm        Int?
  occupation      String?
  education       String?
  languages       String[]
  createdAt       DateTime @default(now())
}

model Photo {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  url       String
  isProfile Boolean  @default(false)
  order     Int
  createdAt DateTime @default(now())
}

model Swipe {
  id        String   @id @default(cuid())
  swiperId  String
  swipedId  String
  type      String   // "like", "superlike", "skip"
  swiper    User     @relation("swiper", fields: [swiperId], references: [id])
  swiped    User     @relation("swiped", fields: [swipedId], references: [id])
  createdAt DateTime @default(now())
}

model Match {
  id        String   @id @default(cuid())
  user1Id   String
  user2Id   String
  user1     User     @relation("user1", fields: [user1Id], references: [id])
  user2     User     @relation("user2", fields: [user2Id], references: [id])
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
}

model Session {
  id          String   @id @default(cuid())
  userId      String
  partnerId   String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // "chat", "audio", "video", "superlike", "meet"
  duration    Int?     // seconds
  coinsSpent  Int      @default(0)
  status      String   // "active", "ended", "missed"
  startedAt   DateTime @default(now())
  endedAt     DateTime?
}

model CoinTransaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // "credit", "debit"
  amount      Int
  reason      String   // "topup", "chat", "audio_call", "video_call", "superlike"
  balanceAfter Int
  razorpayId  String?
  createdAt   DateTime @default(now())
}
```

---

## API ENDPOINTS

Build all these REST endpoints:

```
AUTH
POST   /api/auth/send-otp          Body: { phone, countryCode }
POST   /api/auth/verify-otp        Body: { phone, otp }
POST   /api/auth/refresh            Body: { refreshToken }
POST   /api/auth/logout

ONBOARDING
POST   /api/onboarding/basic       Body: user identity fields
POST   /api/onboarding/profile     Body: interests, lookingFor etc
POST   /api/onboarding/photos      Body: multipart/form-data (max 4 photos)

USERS
GET    /api/users/me
PUT    /api/users/me               Update profile
GET    /api/users/feed             Query: lat, lng, page, limit=10
GET    /api/users/:id              Public profile

SWIPES
POST   /api/swipes                 Body: { targetUserId, type: "like"|"superlike"|"skip" }

SESSIONS
GET    /api/sessions               Get user's session history
POST   /api/sessions/start         Body: { partnerId, type }
PUT    /api/sessions/:id/end

MATCHES
GET    /api/matches                Get mutual likes (Meet tab)

COINS
GET    /api/coins/balance
POST   /api/coins/topup            Body: { packId, razorpayPaymentId }
GET    /api/coins/transactions

CALLS
POST   /api/calls/token            Body: { roomId } → returns Daily.co token
POST   /api/calls/start            Body: { partnerId, type: "audio"|"video" }

AI COACH
POST   /api/ai/chat                Body: { message, conversationHistory }
```

---

## SCREEN-BY-SCREEN SPECIFICATION

### SCREEN 1: SPLASH SCREEN

```
Layout: Full screen, centered vertically and horizontally
Background: Linear gradient — #7C3AED top to #EC4899 bottom
Content:
  - App logo (circular, white background, 100x100px, shadow)
  - "Qrome" text: 36px, weight 800, color white, margin-top 16px
  - Tagline: "Find your Q-Connection" — 16px, weight 400, color rgba(255,255,255,0.85), margin-top 8px
  - Loading dots animation at bottom: 3 dots, 8px each, white, pulsing
Duration: 2.5 seconds, then auto-navigate based on auth state
```

### SCREEN 2: ONBOARDING — FORM 1 (Identity)

```
Layout:
  - StatusBar: light content
  - ScrollView with keyboardAvoidingView
  - Horizontal padding: 20px

Header:
  - Progress bar at top: 3 steps, step 1 active (purple), steps 2-3 gray
  - "Let's get you started" — H2, Text Primary, margin-top 32px
  - "Tell us about yourself" — Body Large, Text Secondary, margin-top 8px

Form Fields (in order, each with 16px margin-bottom):
  1. First Name — text input, placeholder "First name"
  2. Last Name — text input, placeholder "Last name"
  3. Age — numeric input, placeholder "Your age"
  4. Gender — custom dropdown with options:
     Male / Female / Non-binary / Prefer not to say
     Style: same as input, show chevron-down icon on right
  5. Country — searchable dropdown
     On type: hit Google Places API for country suggestions
     Show flag emoji + country name in results
  6. State — searchable dropdown (filters based on selected country)
  7. City — searchable dropdown (filters based on selected state)
  8. Phone Number:
     Row layout: [Country code dropdown 90px] [Phone input flex-1]
     Country code: flag + dial code (e.g. 🇮🇳 +91)
     Phone: numeric input, placeholder "Phone number"

Send OTP Button:
  - Full-width primary button
  - Label: "Send OTP"
  - Only active when all fields are filled
  - On tap: POST /api/auth/send-otp → show OTP input below

OTP Section (appears after Send OTP):
  - 6-box OTP input, each box 48x56px, border-radius 10px
  - Auto-focus next box on input
  - Countdown timer: "Resend in 00:45" → "Resend OTP" when 0
  - "Verify & Continue" primary button

Footer:
  - "By continuing you agree to our Terms & Privacy Policy"
  - 12px, Text Tertiary, centered, margin-bottom 32px
```

### SCREEN 3: ONBOARDING — FORM 2 (Vibe & Goals)

```
Layout:
  - Progress bar: step 2 active
  - "What's your vibe?" — H2, margin-top 32px
  - "Help others know you better" — Body Large, Text Secondary

Sections:

  INTERESTS (multi-select chips):
  Label: "Your interests" — 14px weight 600, Text Primary
  Show 20 interest chips in wrap layout:
  Music, Travel, Food, Fitness, Gaming, Reading, Movies, Art,
  Photography, Dancing, Cooking, Yoga, Cricket, Football,
  Trekking, Coffee, Dogs, Cats, Startups, Tech
  Chip style: unselected = bg #F3F4F6, text Text Secondary, border transparent
  Selected = bg Primary Purple Light, text Primary Purple, border 1px Primary Purple
  Chip size: auto width, height 36px, padding 0 14px, border-radius full
  Min 3 selections required

  LOOKING FOR (multi-select chips):
  Label: "I'm looking for"
  Options: 💬 Just Chat, 📞 Audio Call, 📹 Video Call, 🤝 Meet Up
  Same chip style. Min 1 selection required.

  RELATIONSHIP STYLE (single select):
  Label: "Relationship style"
  Options in 2x2 grid cards (each 140px wide):
  Casual Vibes | Something Serious | Just Friends | Keep it Open
  Each card: icon (emoji 24px) + label (13px weight 500)
  Selected: purple border 2px + purple background light

  PERSONALITY (single select horizontal scroll):
  Label: "You are mostly..."
  Options: 😌 Introvert, 🎉 Extrovert, 🌗 Ambivert
  Same chip style

  LIFESTYLE (single select):
  Label: "Your lifestyle"
  Options: 🏠 Homebody, 🌄 Adventurous, 💼 Workaholic, ⚖️ Balanced

  HABITS (two rows):
  Drinking: Never | Socially | Regularly
  Smoking: Never | Occasionally | Regularly

  HEIGHT (optional):
  Slider: 140cm to 220cm, shows value in cm and ft/in

"Continue" button at bottom
```

### SCREEN 4: ONBOARDING — PHOTO UPLOAD

```
Progress bar: step 3 active
"Add your best photos" — H2
"Upload 4 photos. First one becomes your profile picture." — Body Small, Text Secondary

Photo Grid:
  2x2 grid, each slot 160x200px, border-radius 16px
  Slot 1: labeled "Profile Photo" with crown icon overlay
  Empty slots: dashed border 2px #E5E7EB, centered + icon and "Add Photo" label
  Filled slots: show image with X button top-right to remove
  Reorder: long press to drag and drop

On tap empty slot → ActionSheet:
  "Choose from Gallery" — opens expo-image-picker (allow crop to 3:4)
  "Take a Selfie" — opens camera with front camera default, 3:4 frame guide

Progress indicator: "3 of 4 photos added"
"Continue" button — only active when all 4 photos are uploaded

After upload: photos stored in S3 via signed URL
```

### SCREEN 5: HOME TAB

```
HEADER (custom, not native):
  Background: white, bottom border 0.5px #E5E7EB
  Height: 56px
  Left: Qrome logo (24px) + app name (16px weight 700, Text Primary)
         Below name: city, state (12px, Text Secondary) — tappable to change location
  Center: Coin balance
           🪙 icon (16px) + balance number (16px weight 700, Coin Gold)
  Right: Profile avatar (36x36 circular, border 2px Primary Purple)
         Tapping opens Profile Edit Sheet

PROFILE CARDS AREA:
  Full width minus 20px padding, height fills remaining screen
  Gesture-powered swipe card stack (top 2 cards visible, card behind is scaled 0.95)

  CARD LAYOUT:
    Total height: ~70% of screen height
    Border-radius: 24px
    Shadow: card shadow
    Background: white
    Overflow: hidden

    LEFT SIDE (75% width):
      Profile image: fills top 65% of card, object-fit cover
      Gradient overlay at bottom of image (transparent to black 60%)
      On image overlay:
        Name (20px weight 700, white)
        Age (16px weight 400, white, margin-left 8px from name)
      Below image (white section):
        Looking-for badges: horizontal scroll, small chips (12px)
          e.g. "💬 Chat" "📹 Video" in Primary Purple Light / Primary Purple
        Interests: 3 interest tags (truncated if more), 11px, Text Secondary

    RIGHT SIDE (25% width):
      Vertical column, centered, gap 16px
      Each action icon: 44x44px circle background, icon 20px

      💬 Chat        — bg #EDE9FE, icon purple  — "2 🪙/5m" (9px below)
      📞 Audio Call  — bg #FEF3C7, icon amber   — "5 🪙/5m"
      📹 Video Call  — bg #FCE7F3, icon pink    — "8 🪙/5m"
      ⭐ Superlike   — bg #FEF3C7, icon gold    — "10 🪙"
      ❤️ Like        — bg #FEE2E2, icon red     — "Free"

  SWIPE GESTURE HANDLERS (use Gesture Handler + Reanimated):
    Right swipe (velocity > 500 or translateX > 120px):
      Card flies right with rotation, then calls Video Call flow
      Show green "VIDEO CALL" stamp overlay on card during swipe

    Left swipe (velocity > 500 or translateX < -120px):
      Card flies left with rotation, then calls Audio Call flow
      Show blue "AUDIO CALL" stamp overlay during swipe

    Swipe up (translateY < -100px):
      Card flies up, loads next profile
      Show gray "SKIP" stamp

    Swipe down (translateY > 100px):
      Card drops down, opens Chat screen
      Show purple "CHAT" stamp

    Tap on photo:
      Opens Full Profile Sheet (see below)

  CARD STACK BEHAVIOR:
    Keep 3 cards loaded (current + 2 preloaded)
    After swipe, animate next card from 0.95 scale to 1.0
    When stack empty: "No more connections nearby" empty state
      CTA: "Expand your search radius" button

  FULL PROFILE SHEET (bottom sheet on photo tap):
    Height: 90% of screen, drag handle at top
    Photo carousel: full-width, 4 photos, dots indicator
    Below photos:
      Name, Age, City, State
      Bio (if filled)
      All interests as chips
      Looking for chips
      Lifestyle, Drinking, Smoking, Height info
      Personality badge
    Close button top-right
```

### SCREEN 6: SESSIONS TAB

```
Header:
  "Sessions" — H2, padding-top 16px, horizontal 20px
  Filter chips row (horizontal scroll, no scroll indicator):
  All | Chats | Audio | Video | Superlikes | Meets
  Active filter: Primary Purple background, white text
  Inactive: bg transparent, border 1px Border Default, Text Secondary

Session List (FlatList):
  Each item (height: 76px, horizontal padding 20px):
    Left: Avatar (50x50 circular) with online indicator dot
          Green dot (10px, border 2px white) = online
          Gray dot = offline
    Center:
      Name — 15px weight 600, Text Primary
      Last interaction — 13px, Text Secondary
      e.g. "Video call · 8 min · 2h ago"
    Right:
      Session type icon (small, 20px)
      Coin amount if applicable: "16 🪙" in amber
      Unread badge if chat has unread

    Interaction type badge (small, left of timestamp):
      💬 Chat — purple
      📞 Audio — amber
      📹 Video — pink
      ⭐ Superlike — gold
      🤝 Meet — green

  Empty state:
    Illustration placeholder (simple SVG icon)
    "No sessions yet — start connecting!"
    Primary button: "Explore Connections"
```

### SCREEN 7: MEET TAB

```
This tab is partially gated:
  If user has 0 mutual likes: show soft lock overlay
  "Get mutual ❤️ hearts to unlock real-world meets"
  Tip: "Like someone, and if they like you back, you both appear here!"

When unlocked:
  Header: "Meet Up" — H2 + small subtitle "Real connections, real world"

  CATEGORY CARDS (horizontal scroll, card width ~260px):
    ☕ Coffee Date — bg warm cream, icon large, description "Casual meet over coffee"
    🍽 Dinner Date — bg warm pink, "Elevate the connection"
    ⚡ Meet Today — bg green, "Ready to meet right now"
    🎯 By Interest — shows relevant category based on user's interests
      e.g. "🎵 Music lovers near you" or "🏃 Fitness buddies"

  YOUR MATCHES SECTION:
    "Your Mutual Connections" heading 16px weight 600
    Grid of matched profiles (2 columns):
      Each card: photo, name, age, shared interests count
      "Propose a Meet" button at bottom of each card

  PROPOSE MEET FLOW (bottom sheet):
    Select meet type (Coffee/Dinner/Activity)
    Pick date (calendar component, next 7 days only)
    Pick time (scroll wheel time picker)
    Optional message: "Add a note..."
    "Send Proposal" button
    Partner gets push notification, can Accept or Decline
```

### SCREEN 8: COINS TAB

```
Header:
  "Coins" — H2
  Current balance card (full width, gradient bg purple to pink):
    🪙 icon (32px) + balance (32px weight 800, white)
    "Your Qrome coins" — 13px white opacity 0.85
    "Transaction History →" link at bottom right

COIN PACKS GRID (2 columns):
  6 packs displayed in 2x3 grid
  Each pack card (white bg, border 1px Border Default, border-radius 16px, padding 16px):
    🪙 coin icon (24px, gold)
    Coin amount (24px weight 700, Text Primary)
    "coins" label (12px, Text Secondary)
    Price (18px weight 700, Success Green)
    Per-coin rate (11px, Text Tertiary)

    Highlight treatment:
    Pack 3 (1000 coins): border 2px Primary Purple, "Best Value" badge (purple, top center)
    Pack 6 (8000 coins): border 2px Coin Gold, "Power User 💎" badge (gold, top center)

  Exact packs:
    200 coins   — ₹19      ₹0.095/coin
    700 coins   — ₹69      ₹0.099/coin
    1,000 coins — ₹119     ₹0.119/coin  [BEST VALUE]
    2,000 coins — ₹299     ₹0.149/coin
    5,000 coins — ₹599     ₹0.120/coin
    8,000 coins — ₹999     ₹0.125/coin  [POWER USER]

  On pack tap → Razorpay checkout sheet
    On success → POST /api/coins/topup → update balance → confetti animation

WHAT COINS GET YOU section:
  Simple icon-list:
  💬 Chat — 2 coins per 5 minutes
  📞 Audio Call — 5 coins per 5 minutes
  📹 Video Call — 8 coins per 5 minutes
  ⭐ Superlike — 10 coins one-time
  ❤️ Like — Always free

TRANSACTION HISTORY (FlatList):
  Each row: icon + description + date + ±coins in red/green
  "Paginated, load more on scroll"
```

### SCREEN 9: Q-AI TAB (Dating Coach)

```
Header:
  "Q-AI Coach" title (H2)
  Subtitle: "Your personal dating confidence guide" (Body Small, Text Secondary)
  Small "Powered by Claude" badge (11px, gray, top-right)

WELCOME STATE (first open, or empty history):
  Centered illustration area (placeholder: abstract purple/pink waves SVG)
  "Hey! I'm your Q-Coach 👋" — 18px weight 600
  "Ask me anything about dating, conversations, meetups, or confidence." — Body Small centered

SUGGESTED PROMPTS (chip grid, 2 columns):
  "How do I start a conversation?"
  "Tips for a great first impression"
  "What to wear on a first date?"
  "How to be more confident?"
  "Good conversation starters"
  "How to plan a perfect date?"
  Chip style: bg Primary Purple Light, text Primary Purple, border-radius 10px, padding 10px 14px

  On chip tap → auto-sends as user message

CHAT INTERFACE:
  FlatList of messages (inverted)
  User messages: right-aligned, bg Primary Purple, white text, border-radius 16px 16px 4px 16px
  AI messages: left-aligned, bg #F3F4F6, Text Primary, border-radius 16px 16px 16px 4px
  Max width: 75% of screen
  Avatar: small "Q" circle (24px, purple) left of AI messages
  Timestamp below each message group: 11px, Text Tertiary

INPUT BAR (sticky bottom):
  Background white, top border 0.5px Border Default
  TextInput: multiline, max 4 lines, placeholder "Ask your Q-Coach..."
  Send button: purple circle (40px), arrow icon, only active when text present

CONTENT SAFETY (backend-enforced):
  Anthropic system prompt must include:
  "You are Q-Coach, a dating confidence assistant inside the Qrome app.
   You ONLY answer questions about: starting conversations, approaching people,
   communication tips, date planning, dressing well, confidence building,
   and general social skills in a dating context.
   You MUST NOT engage with: explicit content, lustful language, sexual topics,
   requests for inappropriate advice, or any topic outside dating guidance.
   If a user asks something outside your scope, respond warmly:
   'That's outside what I can help with! Here are some things I'm great at:'
   Then show 3 suggested questions relevant to their situation.
   Keep all advice respectful, wholesome, and confidence-boosting."

  Show 3 suggested prompts as tap-chips after every out-of-scope refusal

TYPING INDICATOR: animated 3-dot pulse while waiting for Claude response
```

### SCREEN 10: PROFILE EDIT SHEET

```
Triggered by: tapping avatar on Home header
Type: Bottom sheet, 90% height

SECTIONS:
  Profile Photo:
    Large avatar 96x96px, circular, border 3px Primary Purple
    "Change Photo" text link below (opens camera/gallery ActionSheet)

  Basic Info:
    Edit fields: First name, Last name, Age, Bio (optional, 150 char limit)
    City, State, Country (searchable)

  Profile Photos (4-photo grid):
    Same as onboarding photo upload
    Reorder by drag, swap profile photo by moving to slot 1

  Interests (multi-select chips, same as onboarding)

  Looking For (same as onboarding)

  Profile Toggles:
    Show online status: toggle
    Discoverable: toggle (if off, won't appear in feeds)

"Save Changes" primary button (sticky bottom, inside sheet)
Show toast on save: "Profile updated!"
```

### SCREEN 11: CHAT SCREEN

```
Navigation: Push from Sessions or swipe-down gesture
Header:
  Back arrow + Partner name + online status dot + video call icon

Messages: (same style as Q-AI chat)
Input bar: same as Q-AI
  Additional: camera icon (send photo) + emoji button

Timer bar (when active session):
  Thin purple bar at top of screen
  "⏱ 3:24 remaining · 2 🪙 spent"
  At 1 min left: bar turns red with pulse animation
  At 0: "Session ended. Top up to continue?" action sheet

Session extension popup at timeout:
  "Continue for 2 more coins?" — YES / NO buttons
  YES: deduct coins, extend 5 min timer
  NO: end session gracefully
```

### SCREEN 12: AUDIO / VIDEO CALL SCREEN

```
Background: dark (near-black #111827) for immersive feel

VIDEO CALL LAYOUT:
  Full-screen: partner's video (fills screen)
  PiP (bottom right, 120x160px, border-radius 16px, border 2px white):
    User's own camera

  Controls bar (bottom, frosted effect bg):
    Mute mic toggle (circle, 56px, bg white/gray)
    End call (circle, 64px, bg #EF4444, phone icon)
    Flip camera (circle, 56px)
    Speaker toggle (circle, 56px)

AUDIO CALL LAYOUT:
  Background: gradient purple to dark
  Partner avatar (120px circular) centered with pulsing ring animation
  Partner name (H2, white) + "Audio Call" label
  Timer (16px, white opacity 0.8): "00:03:47"
  Coins meter: "24 🪙 spent"
  Controls same as video (minus flip camera, add chat icon)

CALL TIMER LOGIC (same as chat):
  5-min sessions, extendable
  At 1 min: warning overlay
  On end: session saved, coins deducted, navigate to Sessions
```

---

## SOCKET.IO EVENTS

```javascript
// Client emits
socket.emit('join', { userId })
socket.emit('typing', { toUserId })
socket.emit('message', { toUserId, content, sessionId })
socket.emit('call:initiate', { toUserId, type, roomId })
socket.emit('call:accept', { fromUserId, roomId })
socket.emit('call:reject', { fromUserId })
socket.emit('call:end', { sessionId })
socket.emit('status:update', { isOnline: true })

// Server emits
socket.emit('message:received', { message })
socket.emit('call:incoming', { fromUser, type, roomId })
socket.emit('call:accepted', { roomId })
socket.emit('call:rejected')
socket.emit('coins:updated', { newBalance })
socket.emit('match:new', { matchedUser })
```

---

## COIN DEDUCTION LOGIC (Backend Middleware)

```javascript
// Middleware to check and deduct coins before any paid action
async function deductCoins(userId, action) {
  const costs = {
    chat_per_5min:    2,
    audio_per_5min:   5,
    video_per_5min:   8,
    superlike:        10
  };

  const cost = costs[action];
  const user = await prisma.user.findUnique({ where: { id: userId }});

  if (user.coinBalance < cost) {
    throw new Error('INSUFFICIENT_COINS');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { coinBalance: { decrement: cost }}
  });

  await prisma.coinTransaction.create({
    data: {
      userId,
      type: 'debit',
      amount: cost,
      reason: action,
      balanceAfter: updated.coinBalance
    }
  });

  return updated.coinBalance;
}
```

---

## MATCHING & FEED ALGORITHM

```javascript
// Feed algorithm — returns profiles for home screen
async function getUserFeed(currentUser, page = 0, limit = 10) {
  const offset = page * limit;

  // Haversine distance filter (within 50km by default)
  // Exclude already swiped profiles
  // Exclude own profile
  // Sort by: distance ASC, isOnline DESC, createdAt DESC
  // Future: add interest overlap score

  const query = `
    SELECT u.*, p.*,
      (6371 * acos(
        cos(radians($1)) * cos(radians(u.latitude))
        * cos(radians(u.longitude) - radians($2))
        + sin(radians($1)) * sin(radians(u.latitude))
      )) AS distance_km
    FROM users u
    JOIN profiles p ON p."userId" = u.id
    WHERE u.id != $3
      AND u."isActive" = true
      AND u.id NOT IN (
        SELECT "swipedId" FROM swipes WHERE "swiperId" = $3
      )
    ORDER BY u."isOnline" DESC, distance_km ASC
    LIMIT $4 OFFSET $5
  `;

  return db.query(query, [
    currentUser.latitude, currentUser.longitude,
    currentUser.id, limit, offset
  ]);
}
```

---

## ANIMATIONS SPECIFICATION

Use React Native Reanimated 3 for all animations.

```
App Launch:       Logo scale 0.5→1.0 with spring (stiffness 100, damping 15)
Screen transition: Slide from right, 280ms, ease-in-out
Card swipe:       Follow finger 1:1, rotation = translateX / 15 degrees
Card stamp:       Opacity 0→1 when |translateX| > 60 or |translateY| > 60
Card dismiss:     Spring throw, 400ms, then remove from stack
Next card reveal: Scale 0.95→1.0 spring when top card dismissed
Coin deducted:    Count-up animation (lodash animate, 400ms)
Like match:       Confetti burst (react-native-confetti-cannon)
Call connecting:  Ripple rings (3 rings, scale 1→2, opacity 1→0, staggered)
Online dot:       Pulse scale 1→1.3→1, infinite, 2s loop
Bottom sheet:     Spring from bottom, damping 20
Toast messages:   Slide down from top, auto-dismiss 3s
```

---

## PUSH NOTIFICATION TRIGGERS

```
New match:         "❤️ {name} liked you back! You're connected!"
Incoming call:     "📞 {name} wants to {audio/video} call you"
New chat message:  "💬 {name}: {message preview}"
Superlike:         "⭐ {name} sent you a superlike!"
Meet proposal:     "🤝 {name} wants to meet for {Coffee/Dinner}!"
Meet accepted:     "🎉 {name} accepted your meetup proposal!"
Low coins:         "🪙 Running low on coins! Top up to keep connecting."
Coins received:    "✅ {amount} coins added to your account"
Session expiring:  "⏱ Your session with {name} ends in 1 minute"
```

---

## FOLDER STRUCTURE

```
qrome/
├── app/                          (React Native Expo)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           (Button, Input, Avatar, Badge, Toast)
│   │   │   ├── cards/            (ProfileCard, SessionCard, CoinPack)
│   │   │   ├── sheets/           (ProfileSheet, ProposeSheet)
│   │   │   └── call/             (CallControls, TimerBar)
│   │   ├── screens/
│   │   │   ├── auth/             (Splash, Onboarding1, Onboarding2, Photos)
│   │   │   ├── home/             (HomeScreen, FullProfile)
│   │   │   ├── sessions/         (SessionsScreen, ChatScreen)
│   │   │   ├── meet/             (MeetScreen, ProposeScreen)
│   │   │   ├── coins/            (CoinsScreen, TransactionHistory)
│   │   │   └── ai/               (AICoachScreen)
│   │   ├── navigation/           (AppNavigator, TabNavigator, AuthNavigator)
│   │   ├── store/                (auth.store, user.store, coins.store)
│   │   ├── services/             (api.service, socket.service, call.service)
│   │   ├── hooks/                (useCoins, useSocket, useLocation, useSwipe)
│   │   ├── utils/                (formatters, validators, constants)
│   │   └── theme/                (colors, typography, spacing, shadows)
│   └── assets/                   (icons, images, animations)
│
└── server/                       (Node.js + Express)
    ├── src/
    │   ├── routes/               (auth, users, swipes, sessions, coins, ai)
    │   ├── middleware/           (auth, coinCheck, rateLimiter, errorHandler)
    │   ├── services/             (twilio, razorpay, s3, anthropic, daily)
    │   ├── socket/               (handlers, events, rooms)
    │   ├── jobs/                 (sessionExpiry, notifications, cleanup)
    │   └── utils/                (haversine, jwt, validators)
    └── prisma/                   (schema.prisma, migrations, seeds)
```

---

## ENVIRONMENT VARIABLES

```env
# Backend (.env)
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
AWS_ACCESS_KEY=
AWS_SECRET_KEY=
AWS_BUCKET=
AWS_REGION=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
ANTHROPIC_API_KEY=
DAILY_API_KEY=
FIREBASE_SERVICE_ACCOUNT=
PORT=3000

# Frontend (.env)
EXPO_PUBLIC_API_URL=
EXPO_PUBLIC_RAZORPAY_KEY=
EXPO_PUBLIC_GOOGLE_MAPS_KEY=
EXPO_PUBLIC_DAILY_DOMAIN=
```

---

## ERROR HANDLING STANDARDS

All API responses follow this format:
```json
{
  "success": true,
  "data": {},
  "message": "Profile updated successfully"
}

{
  "success": false,
  "error": "INSUFFICIENT_COINS",
  "message": "You don't have enough coins for this action.",
  "action": "TOP_UP"
}
```

Frontend: Global Axios interceptor → on 401 refresh token → on 403 show toast → on INSUFFICIENT_COINS navigate to Coins tab with animation.

---

## PERFORMANCE REQUIREMENTS

- Home feed first load: < 1.5 seconds
- Photo upload (4 photos): < 5 seconds total
- Call connection time: < 3 seconds (Daily.co WebRTC)
- Chat message delivery: < 200ms (Socket.io)
- OTP delivery: < 10 seconds (Twilio)
- App cold start: < 2 seconds on mid-range Android
- All lists: use FlatList with keyExtractor, getItemLayout, windowSize=5
- Images: cache aggressively using Expo Image, progressive loading
- Implement pagination on all list screens (10 items per page)

---

## LAUNCH CHECKLIST

Before deploying to production, ensure:
- [ ] All screens work offline gracefully (show appropriate empty states)
- [ ] Coin balance is always synced between frontend and backend
- [ ] Call sessions auto-end after coin balance hits 0
- [ ] All images pass through NSFW content moderation before display
- [ ] Age verification enforced (minimum age 18)
- [ ] Phone number verified before any feature access
- [ ] Rate limiting on all APIs (100 req/min per user)
- [ ] GDPR-style data deletion endpoint (/api/users/me DELETE)
- [ ] App Store and Play Store screenshots match actual UI
- [ ] Firebase Analytics events tracked for: signup, first swipe, first call, first coin purchase

---

*Built with purpose. Every feature exists to fight loneliness and create real human connection.*
*Qrome — Q-Connections for Roaming People.*
