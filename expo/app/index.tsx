import { useEffect, useState } from "react";
import { Text, View, Image, Button, TouchableOpacity } from "react-native";
import { useFonts } from "expo-font";

// Import Components
import { TextPoppins } from "@/components";

// Import Icons
import Icon from 'react-native-vector-icons/Octicons';
import { useRouter } from "expo-router";

export default function Index() {
  // router to navigate
  const router = useRouter();

  // Login on press
  const pressToLogin = () => {
    router.push("/(auth)/login");
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        backgroundColor: "#EFFEFF",
      }}
    >
      <Image
        style={{
          width: 300,
          height: 300,
          marginTop: 40,
          marginBottom: 40,
        }}
        source={require("../assets/images/icon.png")}
      >
      </Image>
      <TextPoppins
        text="Manage your classroom."
        weight={600}
        size={42}
        color="#1580C2"
      />
      <Text
        style={{
          padding: 20,
        }}
      >
        <TextPoppins
          text="Add your daily or weekly events to the calendar and save your time."
          weight={400}
          size={16}
          color="#1580C2"
        />
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: "#EFFEFF",
          borderColor: "#1580C2",
          borderWidth: 3,
          paddingHorizontal: 40,
          paddingVertical: 15,
          borderRadius: 40,
          marginTop: 40,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
        onPress={() => pressToLogin()}
      >
        <TextPoppins
          text="Get Started"
          weight={500}
          size={24}
          color="#1580C2"
        />
        <Icon
          name="arrow-right"
          size={24}
          color="#1580C2"
        />
      </TouchableOpacity>
    </View>
  );
}
