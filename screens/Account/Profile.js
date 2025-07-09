import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout/Layout";
import InputBox from "../../components/Form/InputBox";
import { useDispatch, useSelector } from "react-redux";
import {
  clearMessage,
  getUserData,
  updateProfile,
} from "../../redux/features/auth/userActions";
import AntDesign from "react-native-vector-icons/AntDesign";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Toast from "react-native-toast-message";

const Profile = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, msg } = useSelector((state) => state.user);

  useEffect(() => {
    if (msg) {
      console.log("error under:", msg);
      Toast.show({
        type: "success",
        text1: "Success !",
        text2: msg,
      });
      dispatch(getUserData());
      dispatch(clearMessage());
    }
  }, [msg, dispatch]);

  const [email, setEmail] = useState(user?.email);
  const [profilePic, setProfilePic] = useState(user?.profilepic);
  const [name, setName] = useState(user?.name);
  const [address, setAddress] = useState(user?.address);
  const [city, setCity] = useState(user?.city);
  const [phone, setPhone] = useState(user?.phone);

  const handleUpdate = () => {
    if (!email || !name || !address || !city || !phone) {
      return alert("Please fill in all required fields.");
    }

    const formData = { email, name, address, city, phone };
    dispatch(updateProfile(formData));
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: profilePic }} style={styles.image} />
          <Pressable onPress={() => alert("Profile Dialogbox")}>
            <Text style={styles.updatePicText}>
              <AntDesign name="camera" size={16} color="#3498db" /> Update your
              profile pic
            </Text>
          </Pressable>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputWithIcon}>
            <View style={[styles.iconBox, { backgroundColor: "#2ecc71" }]}>
              <AntDesign name="user" size={18} color="#fff" />
            </View>
            <View style={styles.inputBoxWrapper}>
              <InputBox
                value={name}
                setValue={setName}
                placeholder={"Enter your Name"}
                autoComplete={"name"}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <View style={[styles.iconBox, { backgroundColor: "#3498db" }]}>
              <MaterialIcons name="email" size={18} color="#fff" />
            </View>
            <View style={styles.inputBoxWrapper}>
              <InputBox
                value={email}
                setValue={setEmail}
                placeholder={"Enter your Email"}
                autoComplete={"email"}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <View style={[styles.iconBox, { backgroundColor: "#e67e22" }]}>
              <MaterialIcons name="location-on" size={18} color="#fff" />
            </View>
            <View style={styles.inputBoxWrapper}>
              <InputBox
                value={address}
                setValue={setAddress}
                placeholder={"Enter your Address"}
                autoComplete={"address-line1"}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <View style={[styles.iconBox, { backgroundColor: "#9b59b6" }]}>
              <AntDesign name="enviromento" size={18} color="#fff" />
            </View>
            <View style={styles.inputBoxWrapper}>
              <InputBox
                value={city}
                setValue={setCity}
                placeholder={"Enter your City"}
                autoComplete={"country"}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <View style={[styles.iconBox, { backgroundColor: "#f39c12" }]}>
              <AntDesign name="phone" size={18} color="#fff" />
            </View>
            <View style={styles.inputBoxWrapper}>
              <InputBox
                value={phone}
                setValue={setPhone}
                placeholder={"Enter your Phone"}
                autoComplete={"tel"}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.btnUpdate} onPress={handleUpdate}>
            <Text style={styles.btnUpdateText}>UPDATE PROFILE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  updatePicText: {
    color: "#3498db",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  formCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  inputBoxWrapper: {
    flex: 1,
    marginLeft: 10,
  },
  btnUpdate: {
    backgroundColor: "#3498db",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  btnUpdateText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
