import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Layout from "../../components/Layout/Layout";
import { UserData } from "../../data/UserData";
import InputBox from "../../components/Form/InputBox";

const Profile = ({ navigation }) => {
  //State
  const [email, setEmail] = useState(UserData.email);
  const [profilePic, setProfilePic] = useState(UserData.profilepic);
  const [password, setPassword] = useState(UserData.password);
  const [name, setName] = useState(UserData.name);
  const [address, setAddress] = useState(UserData.address);
  const [city, setCity] = useState(UserData.city);
  const [contact, setContact] = useState(UserData.contact);

  //Update Profie
  const handleUpdate = () => {
    if (
      !email ||
      !password ||
      !name ||
      !address ||
      !city ||
      !contact ||
      !profilePic
    ) {
      return alert(
        "Add Email or Password or Name or Address or City or Contact or Profilepic"
      );
    }
    alert("Profile Updated Successfully");
    navigation.navigate("account");
  };
  return (
    <Layout>
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.imageContainer}>
            <Image source={{ uri: profilePic }} style={styles.image} />
            <Pressable onPress={() => alert("Profile Dialogbox")}>
              <Text style={{ color: "red" }}>Update your profile pic</Text>
            </Pressable>
          </View>
          <InputBox
            value={name}
            setValue={setName}
            placeholder={"Enter your Name"}
            autoComplete={"name"}
          />

          <InputBox
            value={email}
            setValue={setEmail}
            placeholder={"Enter your Email"}
            autoComplete={"email"}
          />

          <InputBox
            value={password}
            setValue={setPassword}
            placeholder={"Enter your Password"}
            autoComplete={"password"}
            secureTextEntry={true}
          />

          <InputBox
            value={address}
            setValue={setAddress}
            placeholder={"Enter your Address"}
            autoComplete={"address-line1"}
          />

          <InputBox
            value={city}
            setValue={setCity}
            placeholder={"Enter your City"}
            autoComplete={"country"}
          />

          <InputBox
            value={contact}
            setValue={setContact}
            placeholder={"Enter your Contact"}
            autoComplete={"tel"}
          />

          <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate}>
            <Text style={styles.btnUpdateText}>UPDATE PROFILE</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    height: 100,
    width: "100%",
    resizeMode: "contain",
  },
  btnUpdate: {
    backgroundColor: "#000000",
    height: 40,
    borderRadius: 20,
    marginHorizontal: 30,
    justifyContent: "center",
    marginTop: 10,
  },
  btnUpdateText: {
    color: "#ffffff",
    fontSize: 18,
    textAlign: "center",
  },
});

export default Profile;
