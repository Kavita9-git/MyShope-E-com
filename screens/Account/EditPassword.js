import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert, // Import Alert for better user feedback
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout/Layout'; // Assuming this is your main layout component
import InputBox from '../../components/Form/InputBox'; // Assuming this is a reusable input component
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from '../../redux/features/auth/userActions'; // Corrected import based on usage
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';

const EditPassword = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector(state => state.user); // Get loading and error states for better UX

  // State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState(''); // Added for confirmation

  // Handle Password Update
  const handleUpdate = () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (newPassword === oldPassword) {
      Alert.alert('Error', 'New password cannot be the same as the old password.');
      return;
    }

    // Dispatch action
    const formData = {
      oldPassword,
      newPassword,
    };
    dispatch(updatePassword(formData));
  };

  // Handle feedback from redux action
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
    if (!loading && !error && oldPassword && newPassword) {
      // Check if update was successful (and inputs were not empty before dispatch)
      Alert.alert('Success', 'Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Optionally navigate back after success
      // navigation.goBack();
    }
  }, [loading, error]); // Depend on loading and error states

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
              <View style={styles.iconContainer}>
                <AntDesign name="lock" size={40} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>Change Password</Text>
              <Text style={styles.headerSubtitle}>Update your security credentials</Text>
            </View>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Password Settings</Text>

        <View style={styles.formCard}>
          <View style={styles.inputWithIcon}>
            <LinearGradient
              colors={['#4facfe', '#00f2fe']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AntDesign name="lock" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <InputBox
                value={oldPassword}
                setValue={setOldPassword}
                placeholder={'Enter your old password'}
                autoComplete={'password'}
                secureTextEntry={true}
                keyboardType="default"
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
              <AntDesign name="key" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>New Password</Text>
              <InputBox
                value={newPassword}
                setValue={setNewPassword}
                placeholder={'Enter your new password'}
                autoComplete={'password-new'}
                secureTextEntry={true}
                keyboardType="default"
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
              <AntDesign name="checkcircle" size={18} color="#fff" />
            </LinearGradient>
            <View style={styles.inputBoxWrapper}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <InputBox
                value={confirmNewPassword}
                setValue={setConfirmNewPassword}
                placeholder={'Confirm your new password'}
                autoComplete={'password-new'}
                secureTextEntry={true}
                keyboardType="default"
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleUpdate} disabled={loading}>
            <LinearGradient
              colors={['#0075f8', '#0075f8']}
              style={styles.btnUpdate}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnUpdateText}>
                {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.securityTipsCard}>
          <View style={styles.tipHeader}>
            <Feather name="shield" size={22} color="#3182ce" />
            <Text style={styles.tipTitle}>Password Security Tips</Text>
          </View>
          <Text style={styles.tipText}>• Use at least 8 characters</Text>
          <Text style={styles.tipText}>• Include numbers and special characters</Text>
          <Text style={styles.tipText}>• Avoid using personal information</Text>
          <Text style={styles.tipText}>• Don't reuse passwords from other sites</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Security Management v1.0</Text>
        </View>
      </ScrollView>
    </Layout>
  );
};

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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 4,
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityTipsCard: {
    marginHorizontal: 15,
    backgroundColor: '#ebf8ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3182ce',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 6,
    paddingLeft: 10,
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

export default EditPassword;
