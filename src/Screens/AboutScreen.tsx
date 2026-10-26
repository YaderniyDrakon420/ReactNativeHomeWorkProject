import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AboutScreen () {
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <Text>About the app</Text>
      <Text>This is a book management app with login functionality.</Text>
    </SafeAreaView>
  );
};