import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useHomeCountry } from "@/context/HomeCountryContext";

export default function Index() {
  const { homeCountry, isLoading } = useHomeCountry();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0A0A0A", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#F5C400" size="large" />
      </View>
    );
  }

  if (!homeCountry) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
