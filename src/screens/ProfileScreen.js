import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Button,
  Dimensions,
  FlatList,
} from "react-native";
import { Auth, DataStore } from "aws-amplify";
import { User, Post } from "../models";
import { S3Image } from "aws-amplify-react-native/dist/Storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUserContext } from "../contexts/UserContext";
import FeedPost from "../components/FeedPost";

const dummy_img =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/user.png";
const bg = "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/images/1.jpg";

const profilePictureWidth = Dimensions.get("window").width * 0.4;

const ProfileScreenHeader = () => {
  const [user, setUser] = useState(null);
  const { sub, user: dbUser } = useUserContext();

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    const fetchUser = async () => {
      if (route?.params?.id && route?.params?.id !== sub) {
        console.warn("different");
        DataStore.query(User, route.params.id).then(setUser);
      } else {
        console.warn("me");
        console.log(dbUser);
        setUser(dbUser);
      }
    };

    fetchUser();
  }, []);

  const signOut = async () => {
    await Auth.signOut();
    await DataStore.clear();
  };

  if (!user) {
    return <ActivityIndicator />;
  }
  return (
    <View style={styles.container}>
      <Image source={{ uri: bg }} style={styles.bg} />
      {user?.image ? (
        <S3Image imgKey={user.image} style={styles.image} />
      ) : (
        <Image source={{ uri: dummy_img }} style={styles.image} />
      )}

      <Text style={styles.name}>{user.name}</Text>

      {user.id === sub && (
        <>
          <View style={styles.buttonContainer}>
            <Button
              onPress={() => navigation.navigate("Update Profile")}
              title="Edit Profile"
            />
          </View>
          <Text onPress={signOut} style={styles.dangerTextButton}>
            Sign out
          </Text>
        </>
      )}
    </View>
  );
};

const ProfileScreen = () => {
  const [posts, setPosts] = useState([]);
  const route = useRoute();

  useEffect(() => {
    DataStore.query(Post, (p) => p.userID("eq", route?.params?.id)).then(
      setPosts
    );
  }, []);

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <FeedPost post={item} />}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ProfileScreenHeader}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    padding: 10,
  },
  bg: {
    width: "100%",
    height: 200,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    marginBottom: -profilePictureWidth / 2,
  },
  image: {
    width: profilePictureWidth,
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 500,
    borderWidth: 5,
    borderColor: "white",
  },
  name: {
    fontWeight: "500",
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: "auto",
    marginBottom: 10,
    alignSelf: "stretch",
  },
  dangerTextButton: {
    color: "tomato",
    fontWeight: "500",
    margin: 10,
  },
});

export default ProfileScreen;
