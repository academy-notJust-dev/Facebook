import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { Auth, DataStore } from "aws-amplify";
import { User, Post } from "../models";
import { S3Image } from "aws-amplify-react-native/dist/Storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import FeedPost from "../components/FeedPost";
import {
  AntDesign,
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  Entypo,
} from "@expo/vector-icons";

const dummy_img =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/avatars/user.png";
const bg = "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/images/1.jpg";

const profilePictureWidth = Dimensions.get("window").width * 0.4;

const ProfileScreenHeader = ({ user, isMe = false }) => {
  const navigation = useNavigation();

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

      {isMe && (
        <View style={styles.buttonsContainer}>
          <Pressable style={[styles.button, { backgroundColor: "royalblue" }]}>
            <AntDesign name="pluscircle" size={16} color="white" />
            <Text style={[styles.buttonText, { color: "white" }]}>
              Add to Story
            </Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Update Profile")}
            style={styles.button}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="black" />
            <Text style={styles.buttonText}>Edit Profile</Text>
          </Pressable>
          <Pressable
            onPress={signOut}
            style={[styles.button, { flex: 0, width: 50 }]}
          >
            <MaterialIcons name="logout" size={16} color="black" />
          </Pressable>
        </View>
      )}

      <View style={styles.textLine}>
        <Entypo
          name="graduation-cap"
          size={18}
          color="gray"
          style={{ width: 25 }}
        />
        <Text>Graduated university</Text>
      </View>

      <View style={styles.textLine}>
        <Ionicons name="time" size={18} color="gray" style={{ width: 25 }} />
        <Text>Joined on October 2013</Text>
      </View>

      <View style={styles.textLine}>
        <Entypo
          name="location-pin"
          size={18}
          color="gray"
          style={{ width: 25 }}
        />
        <Text>From Tenerife</Text>
      </View>
    </View>
  );
};

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [isMe, setIsMe] = useState(false);
  const [posts, setPosts] = useState([]);
  const route = useRoute();
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      // get the authenticated user
      const userData = await Auth.currentAuthenticatedUser();
      // take the user id from the route or from the authenticated user
      const userId = route?.params?.id || userData?.attributes?.sub;
      if (!userId) {
        return;
      }

      // keep track if we are querying the data about the authenticated user
      const isMe = userId === userData?.attributes?.sub;
      setIsMe(isMe);

      // query the database user
      const dbUser = await DataStore.query(User, userId);

      if (!dbUser) {
        // if we couldn't find the user in the database
        if (isMe) {
          // and it is my profile, then redirect to Update Profile page
          navigation.navigate("Update Profile");
        } else {
          // otherwise, Alert the user
          Alert.alert("User not found!");
        }
        return;
      }
      // save the user in the state
      setUser(dbUser);

      // query his posts
      const dbPosts = await DataStore.query(Post, (p) =>
        p.postUserId("eq", userId)
      );
      setPosts(dbPosts);
    };

    fetchData();
  }, []);

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <FeedPost post={item} />}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <>
          <ProfileScreenHeader user={user} isMe={isMe} />
          <Text style={styles.sectionTitle}>Posts</Text>
        </>
      )}
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
    borderRadius: 500,
    borderWidth: 5,
    borderColor: "white",
  },
  name: {
    fontWeight: "500",
    fontSize: 16,
    marginVertical: 5,
  },
  buttonsContainer: {
    paddingVertical: 5,
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgray",
  },
  button: {
    alignSelf: "stretch",
    flexDirection: "row",
    backgroundColor: "gainsboro",
    margin: 5,
    padding: 7,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
  },
  buttonText: {
    marginHorizontal: 5,
    fontWeight: "500",
  },
  textLine: {
    alignSelf: "stretch",
    alignItems: "center",
    marginVertical: 5,
    flexDirection: "row",
  },
  sectionTitle: {
    marginLeft: 10,
    marginVertical: 5,
    fontWeight: "500",
    fontSize: 18,
  },
});

export default ProfileScreen;
