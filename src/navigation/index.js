import { NavigationContainer } from "@react-navigation/native";
import FeedScreen from "../screens/FeedScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import UpdateProfileScreen from "../screens/UpdateProfileScreen";
import ProfileScreen from "../screens/ProfileScreen";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useUserContext } from "../contexts/UserContext";
import { ActivityIndicator } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const { user, loading } = useUserContext();

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!!user ? (
          <>
            <Stack.Screen
              name="Feed"
              component={FeedScreen}
              options={({ navigation }) => ({
                headerRight: () => (
                  <FontAwesome
                    onPress={() => navigation.navigate("Profile")}
                    name="user"
                    size={24}
                    color="gray"
                  />
                ),
              })}
            />
            <Stack.Screen name="Create Post" component={CreatePostScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="Update Profile"
              component={UpdateProfileScreen}
            />
          </>
        ) : (
          <Stack.Screen name="Update Profile" component={UpdateProfileScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
