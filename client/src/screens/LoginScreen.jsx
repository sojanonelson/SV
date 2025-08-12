import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { checkCompany, login } from '../services/api';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [companyExists, setCompanyExists] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const loadSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('savedEmail');
        const savedPassword = await AsyncStorage.getItem('savedPassword');
        const rememberMeValue = await AsyncStorage.getItem('rememberMe');
        
        if (savedEmail && savedPassword && rememberMeValue === 'true') {
          setFormData({
            email: savedEmail,
            password: savedPassword
          });
          setRememberMe(true);
        }
      } catch (err) {
        console.error('Error loading saved credentials:', err);
      } finally {
        setInitialLoad(false);
      }
    };

    loadSavedCredentials();
  }, []);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        const company = await checkCompany();
        console.log("Company check response:", company);
        setCompanyExists(company.exists);
        if (!company.exists) {
          navigation.navigate('Company');
        }
      } catch (err) {
        console.error('Error checking company:', err);
        Alert.alert('Error', 'Failed to check company status');
      }
    };
    init();
  }, [navigation]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await login(formData);
      console.log("Res:", response);
      console.log("Company:", response.company);

      await AsyncStorage.setItem('token', response.token);

      if (response.company) {
        await AsyncStorage.setItem('user', JSON.stringify(response.company));
      } else {
        console.error('Company data is undefined or null');
        setError('Company data is invalid');
        setLoading(false);
        return;
      }

      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        await AsyncStorage.setItem('savedEmail', formData.email);
        await AsyncStorage.setItem('savedPassword', formData.password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        await AsyncStorage.removeItem('savedEmail');
        await AsyncStorage.removeItem('savedPassword');
        await AsyncStorage.setItem('rememberMe', 'false');
      }

      await AsyncStorage.setItem('loginTime', Date.now().toString());
      setLoading(false);
      navigation.navigate('Main');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      setLoading(false);
    }
  };

  if (initialLoad) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Admin Login</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => handleChange('password', text)}
              />
              <TouchableOpacity onPress={togglePasswordVisibility} style={styles.toggleButton}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Remember Me Section */}
          <View style={styles.rememberMeContainer}>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: "#767577", true: "#4f46e5" }}
              thumbColor={rememberMe ? "#f5dd4b" : "#f4f3f4"}
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          {!companyExists && (
            <Text style={styles.createCompanyText}>Create Company</Text>
          )}
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
 
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4f46e5',
    textAlign: 'center',
    marginBottom: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color:'#000'
  },
  toggleButton: {
    padding: 10,
  },
  button: {
    backgroundColor: '#4f46e5',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  createCompanyText: {
    color: '#4f46e5',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
  }, rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMeText: {
    marginLeft: 10,
    color: '#374151',
  },
});

export default LoginForm;
