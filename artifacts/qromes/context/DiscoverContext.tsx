import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type ProfileCard = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  city: string;
  country: string;
  bio: string;
  interests: string[];
  photos: string[];
  occupation?: string;
  education?: string;
  languages: string[];
  personalityType?: string;
  relationshipStyle?: string;
  lookingFor: string[];
  isOnline: boolean;
  distance?: number;
  coinCost: number;
};

type DiscoverState = {
  profiles: ProfileCard[];
  currentIndex: number;
  likedProfiles: string[];
  skippedProfiles: string[];
};

type DiscoverContextValue = DiscoverState & {
  swipeLeft: (id: string) => void;
  swipeRight: (id: string) => void;
  nextProfile: () => void;
  resetFeed: () => void;
};

const DiscoverContext = createContext<DiscoverContextValue | null>(null);

const MOCK_PROFILES: ProfileCard[] = [
  {
    id: "1",
    firstName: "Sofia",
    lastName: "M",
    age: 24,
    city: "Barcelona",
    country: "Spain",
    bio: "Artist by day, stargazer by night. Looking for someone who appreciates the little things in life and long walks through the city.",
    interests: ["Art", "Travel", "Photography", "Coffee", "Music"],
    photos: [],
    occupation: "Graphic Designer",
    education: "Fine Arts Degree",
    languages: ["Spanish", "English", "French"],
    personalityType: "ambivert",
    relationshipStyle: "casual",
    lookingFor: ["chat", "video"],
    isOnline: true,
    distance: 2,
    coinCost: 10,
  },
  {
    id: "2",
    firstName: "Arjun",
    lastName: "K",
    age: 27,
    city: "Mumbai",
    country: "India",
    bio: "Software engineer with a passion for hiking and discovering street food. Let's talk about anything under the sun.",
    interests: ["Tech", "Trekking", "Food", "Cricket", "Startups"],
    photos: [],
    occupation: "Software Engineer",
    education: "IIT Mumbai",
    languages: ["Hindi", "English", "Marathi"],
    personalityType: "introvert",
    relationshipStyle: "friendship",
    lookingFor: ["chat", "audio"],
    isOnline: true,
    distance: 5,
    coinCost: 10,
  },
  {
    id: "3",
    firstName: "Emma",
    lastName: "R",
    age: 22,
    city: "London",
    country: "UK",
    bio: "Bookworm who secretly loves EDM festivals. Coffee shop hopper. Fluent in sarcasm. Looking for genuine connections.",
    interests: ["Reading", "Music", "Coffee", "Dancing", "Dogs"],
    photos: [],
    occupation: "Marketing Executive",
    education: "LSE Graduate",
    languages: ["English", "French"],
    personalityType: "ambivert",
    relationshipStyle: "casual",
    lookingFor: ["chat", "video", "audio"],
    isOnline: false,
    distance: 12,
    coinCost: 15,
  },
  {
    id: "4",
    firstName: "Lucas",
    lastName: "T",
    age: 29,
    city: "São Paulo",
    country: "Brazil",
    bio: "Football fanatic. Entrepreneur. Weekend surfer. Building the next big thing while surfing the waves.",
    interests: ["Football", "Startups", "Fitness", "Travel", "Cooking"],
    photos: [],
    occupation: "Founder & CEO",
    education: "MBA FGV",
    languages: ["Portuguese", "English", "Spanish"],
    personalityType: "extrovert",
    relationshipStyle: "serious",
    lookingFor: ["video", "meet"],
    isOnline: true,
    distance: 8000,
    coinCost: 15,
  },
  {
    id: "5",
    firstName: "Yuki",
    lastName: "H",
    age: 25,
    city: "Tokyo",
    country: "Japan",
    bio: "Manga artist by day, ramen connoisseur by night. Anime nerd who loves exploring hidden gems in the city.",
    interests: ["Art", "Gaming", "Cooking", "Photography", "Cats"],
    photos: [],
    occupation: "Manga Artist",
    education: "Tokyo University of Arts",
    languages: ["Japanese", "English"],
    personalityType: "introvert",
    relationshipStyle: "friendship",
    lookingFor: ["chat", "audio"],
    isOnline: true,
    distance: 9000,
    coinCost: 10,
  },
  {
    id: "6",
    firstName: "Amara",
    lastName: "D",
    age: 26,
    city: "Nairobi",
    country: "Kenya",
    bio: "Wildlife conservationist. Yoga enthusiast. Storyteller. Believer in human connection across borders.",
    interests: ["Yoga", "Travel", "Photography", "Music", "Fitness"],
    photos: [],
    occupation: "Wildlife Conservationist",
    education: "University of Nairobi",
    languages: ["Swahili", "English", "French"],
    personalityType: "extrovert",
    relationshipStyle: "open",
    lookingFor: ["chat", "video"],
    isOnline: false,
    distance: 7500,
    coinCost: 10,
  },
];

export function DiscoverProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DiscoverState>({
    profiles: MOCK_PROFILES,
    currentIndex: 0,
    likedProfiles: [],
    skippedProfiles: [],
  });

  useEffect(() => {
    AsyncStorage.getItem("@qromes_liked").then((v) => {
      if (v)
        setState((s) => ({ ...s, likedProfiles: JSON.parse(v) }));
    });
  }, []);

  const swipeLeft = (id: string) => {
    setState((s) => {
      const skipped = [...s.skippedProfiles, id];
      return { ...s, skippedProfiles: skipped, currentIndex: s.currentIndex + 1 };
    });
  };

  const swipeRight = (id: string) => {
    setState((s) => {
      const liked = [...s.likedProfiles, id];
      AsyncStorage.setItem("@qromes_liked", JSON.stringify(liked));
      return { ...s, likedProfiles: liked, currentIndex: s.currentIndex + 1 };
    });
  };

  const nextProfile = () => {
    setState((s) => ({ ...s, currentIndex: s.currentIndex + 1 }));
  };

  const resetFeed = () => {
    setState((s) => ({ ...s, currentIndex: 0, skippedProfiles: [] }));
  };

  return (
    <DiscoverContext.Provider value={{ ...state, swipeLeft, swipeRight, nextProfile, resetFeed }}>
      {children}
    </DiscoverContext.Provider>
  );
}

export function useDiscover() {
  const ctx = useContext(DiscoverContext);
  if (!ctx) throw new Error("useDiscover must be used within DiscoverProvider");
  return ctx;
}
