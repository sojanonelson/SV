import axios from 'axios';
import API from "./axiosInstance";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = Constants.expoConfig.extra.API_URL;


export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const uploadPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', {
    uri: file.uri,
   type: 'application/pdf',
    name: file.name,
  });

  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data; // must include { url: ... }
};
