import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout';
import InputBox from '../../components/Form/InputBox';
import { useDispatch, useSelector } from 'react-redux';
import { clearMessage, getUserData, updateProfile } from '../../redux/features/auth/userActions';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
// import Toast from "react-native-toast-message";
import useProtectedRoute from '../../hooks/useProtectedRoute';
import Toast from '../../components/Message/Toast';
import useToast from '../../hooks/useToast';

const Profile = ({ navigation }) => {
  // Use protected route hook with skipNavigation=true
  const { user: currentUser } = useProtectedRoute();

  const dispatch = useDispatch();
  const { user, msg } = useSelector(state => state.user);
  const { toast, showSuccess, showError, hideToast } = useToast();

  useEffect(() => {
    if (msg) {
      console.log('error under:', msg);
      // Toast.show({
      //   type: "success",
      //   text1: "Success !",
      //   text2: msg,
      // });
      showSuccess(msg);
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
      return alert('Please fill in all required fields.');
    }

    const formData = { email, name, address, city, phone };
    dispatch(updateProfile(formData));
  };

  return (
    <Layout showBackButton={true}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={['#0075f8', '#0075f8']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.profileHeader}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={{
                    uri: profilePic?.startsWith('http')
                      ? profilePic
                      : `https://nodejsapp-hfpl.onrender.com${profilePic}`,
                  }}
                  style={styles.profileImage}
                />
              </View>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <Text style={styles.headerSubtitle}>Update your personal information</Text>
              <Pressable
                style={styles.changePicButton}
                onPress={() => navigation.navigate('uploadprofilepic')}
              >
                <AntDesign name="camera" size={16} color="#fff" />
                <Text style={styles.changePicText}>Update profile picture</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.formCard}>
          <View style={styles.inputWithIcon}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="user" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <InputBox
                value={name}
                setValue={setName}
                placeholder={'Enter your Name'}
                autoComplete={'name'}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <LinearGradient
              colors={['#6a11cb', '#2575fc']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="email" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <InputBox
                value={email}
                setValue={setEmail}
                placeholder={'Enter your Email'}
                autoComplete={'email'}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <LinearGradient
              colors={['#FF9966', '#FF5E62']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="location-on" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>Address</Text>
              <InputBox
                value={address}
                setValue={setAddress}
                placeholder={'Enter your Address'}
                autoComplete={'address-line1'}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <LinearGradient
              colors={['#b721ff', '#21d4fd']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="enviromento" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>City</Text>
              <InputBox
                value={city}
                setValue={setCity}
                placeholder={'Enter your City'}
                autoComplete={'country'}
              />
            </View>
          </View>

          <View style={styles.inputWithIcon}>
            <LinearGradient
              colors={['#56ab2f', '#a8e063']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="phone" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <InputBox
                value={phone}
                setValue={setPhone}
                placeholder={'Enter your Phone'}
                autoComplete={'tel'}
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleUpdate}>
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.btnUpdate}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnUpdateText}>UPDATE PROFILE</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Profile Management v1.0</Text>
        </View>
      </ScrollView>
      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onHide={hideToast}
        duration={toast.duration}
        position={toast.position}
      />
    </Layout>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    minHeight: '100%',
  },
  headerContainer: {
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileImageContainer: {
    padding: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 65,
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  changePicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 8,
  },
  changePicText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 15,
    color: '#333',
  },
  formCard: {
    marginHorizontal: 15,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 15,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconGradient: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputBoxWrapper: {
    flex: 1,
    marginLeft: 15,
  },
  inputLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  btnUpdate: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnUpdateText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0aec0',
    fontSize: 12,
  },
});
