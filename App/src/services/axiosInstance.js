import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;

// AsyncStorage wrapper function to get token
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

// Create an axios instance
const apiInstance = axios.create({
  baseURL: API_URL,
});

// Axios request interceptor to attach token
apiInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    // Skip setting token for check-company
    if (!config.url.includes('/auth/check-company') && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export the modified axios instance
export default apiInstance;
