import axios from 'axios';
import API from "./axiosInstance";
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = Constants.expoConfig.extra.API_URL;

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// AsyncStorage wrapper functions
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem('token', token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const setUserId = async (userId) => {
  try {
    await AsyncStorage.setItem('userId', userId);
  } catch (error) {
    console.error('Error storing user ID:', error);
  }
};

// Auth services
export const checkCompany = async () => {
  const response = await axios.get(`${API_URL}/auth/check-company`);
  return response.data;
};

export const createCompany = async (companyData) => {
  console.log("C:", companyData);
  const response = await axios.post(`${API_URL}/auth/register`, companyData, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  await setToken(response.data.token);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  setAuthToken(response.data.token);
  await setToken(response.data.token);
  await setUserId(response.data.company._id);
  return response.data;
};

export const logout = async () => {
  setAuthToken(null);
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('userId');
   
  } catch (error) {
    console.error('Error during logout:', error);
  }
};

// Company services
export const getCompany = async () => {
  console.log("COmpany api called")
  const response = await axios.get(`${API_URL}/company`);
  return response.data;
};

export const updateCompany = async (companyData, id) => {
  const response = await axios.put(`${API_URL}/company/${id}`, companyData);
  return response.data;
};

// Product services
export const getProducts = async () => {
  const response = await axios.get(`${API_URL}/products`);
  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/products/getById/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  console.log("called P")
  const response = await axios.post(`${API_URL}/products`, productData);
  console.log("P:::", response.data)
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(`${API_URL}/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(`${API_URL}/products/${id}`);
  return response.data;
};

// Party services
export const getParties = async () => {
  const response = await axios.get(`${API_URL}/parties`);
  return response.data;
};

export const getParty = async () => {
  const response = await axios.get(`${API_URL}/parties`);
  return response.data;
};

export const createParty = async (partyData) => {
  const response = await axios.post(`${API_URL}/parties`, partyData);
  return response.data;
};

export const updateParty = async (id, partyData) => {
  const response = await axios.put(`${API_URL}/parties/${id}`, partyData);
  return response.data;
};

export const deleteParty = async (id) => {
  const response = await axios.delete(`${API_URL}/parties/${id}`);
  return response.data;
};

// Invoice services
export const getInvoices = async () => {
  console.log("Get Invoice")
  const response = await axios.get(`${API_URL}/invoices`);
  return response.data;
};

export const getInvoice = async (id) => {
  // console.log("API Called")
  const response = await API.get(`${API_URL}/invoices/${id}`);
  // console.log("Res:", response.data)
  return response.data;
};

export const getInvoicesByPartyId = async (partyId) => {
  const response = await axios.get(`${API_URL}/invoices/party/${partyId}`);
  return response.data;
};

export const createInvoice = async (invoiceData) => {
  const response = await axios.post(`${API_URL}/invoices`, invoiceData);
  return response.data;
};

export const updateInvoicePayment = async (id, paymentData) => {
  console.log(paymentData);
  const response = await axios.put(`${API_URL}/invoices/${id}/payment`, {
    paymentStatus: paymentData,
  });
  return response.data;
};

export const deleteInvoice = async (id) => {
  const response = await axios.delete(`${API_URL}/invoices/${id}`);
  return response.data;
};
