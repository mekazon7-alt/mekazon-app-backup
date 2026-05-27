import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useHomeCountry } from "@/context/HomeCountryContext";

const WELCOME_KEY = "@mekazon_seen_welcome";

export default function Index() {
  const { homeCountry, isLoading } = useHomeCountry();
  const [welcomeChecked, setWelcomeChecked] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then((val) => {
      setHasSeenWelcome(val === "true");
      setWelcomeChecked(true);
    });
  }, []);

  if (isLoading || !welcomeChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F7F8F2", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#4E7234" size="large" />
      </View>
    );
  }

  if (!hasSeenWelcome) {
    AsyncStorage.setItem(WELCOME_KEY, "true");
    return <Redirect href="/welcome" />;
  }

  if (!homeCountry) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
