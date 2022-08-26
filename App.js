import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Navigator from "./src/navigation";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Amplify, Auth } from "aws-amplify";
import awsconfig from "./src/aws-exports";
import { withAuthenticator } from "aws-amplify-react-native";
import { useEffect, useState } from "react";

Amplify.configure({ ...awsconfig, Analytics: { disabled: true } });

function App() {
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    Auth.currentAuthenticatedUser().then(setAuthUser);
  }, []);

  console.log(authUser);

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="auto" />

      <Navigator />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c9c9c9",
  },
});

export default withAuthenticator(App);
