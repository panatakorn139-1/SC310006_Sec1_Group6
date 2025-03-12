import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { View, Image } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";


// Import Tailwind CSS
import "../global.css";

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

  const [fontsLoaded] = useFonts({
    // Poppins
    "Poppins-Regular": require("../assets/fonts/Poppins/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins/Poppins-Bold.ttf"),

    // Prompt
    "Prompt-Regular": require("../assets/fonts/Prompt/Prompt-Regular.ttf"),
    "Prompt-Medium": require("../assets/fonts/Prompt/Prompt-Medium.ttf"),
    "Prompt-SemiBold": require("../assets/fonts/Prompt/Prompt-SemiBold.ttf"),
    "Prompt-Bold": require("../assets/fonts/Prompt/Prompt-Bold.ttf"),
  });

  useEffect(() => {
    async function prepare() {
      try {
        if (!fontsLoaded) return;
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    }

    prepare();
  }, [fontsLoaded]);

  if (!isAppReady || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Image
          style={{
            width: 200,
            height: 200,
          }}
          source={require("../assets/images/icon.png")}
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="classroom" />  {/* ✅ เปลี่ยนจาก classroom/[id] เป็น classroom */}
        <Stack.Screen name="classroom/checkin" />  {/* ✅ เปลี่ยนจาก classroom/[id]/checkin เป็น checkin */}
      </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
