import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCompany, updateCompany } from '../services/api';

const Settings = () => {
  const [formData, setFormData] = useState({
    fssaiNumber: '',
    gstNumber: '',
    phoneNumber: '',
    alternateNumber: '',
    ownerName: '',
    email: '',
    logo: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const companyRes = await getCompany();
        if (companyRes) {
          setFormData(companyRes);
        }
      } catch (error) {
        console.error("Failed to fetch company details:", error);
      }
    };
    fetchCompanyDetails();
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await updateCompany(formData, formData._id);
      if (response) {
        setMessage('Details updated successfully!');
      } else {
        setMessage('Failed to update details.');
      }
    } catch (error) {
      setMessage('An error occurred while updating details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Settings</Text>
        {message ? (
          <View style={message.includes('success') ? styles.successMessage : styles.errorMessage}>
            <Text>{message}</Text>
          </View>
        ) : null}
        <View style={styles.form}>
          <View style={styles.grid}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="person" size={16} color="#6B7280" />
                <Text style={styles.label}>Owner Name</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.ownerName}
                onChangeText={(text) => handleChange('ownerName', text)}
                placeholder="Owner Name"
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="mail" size={16} color="#6B7280" />
                <Text style={styles.label}>Email</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="Email"
                keyboardType="email-address"
              />
            </View>
          </View>
          <View style={styles.grid}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="call" size={16} color="#6B7280" />
                <Text style={styles.label}>Phone Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(text) => handleChange('phoneNumber', text)}
                placeholder="Phone Number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="call" size={16} color="#6B7280" />
                <Text style={styles.label}>Alternate Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.alternateNumber}
                onChangeText={(text) => handleChange('alternateNumber', text)}
                placeholder="Alternate Number"
                keyboardType="phone-pad"
              />
            </View>
          </View>
          <View style={styles.grid}>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="document-text" size={16} color="#6B7280" />
                <Text style={styles.label}>FSSAI Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.fssaiNumber}
                onChangeText={(text) => handleChange('fssaiNumber', text)}
                placeholder="FSSAI Number"
              />
            </View>
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Ionicons name="barcode" size={16} color="#6B7280" />
                <Text style={styles.label}>GST Number</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.gstNumber}
                onChangeText={(text) => handleChange('gstNumber', text)}
                placeholder="GST Number"
              />
            </View>
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="cloud-upload" size={16} color="#6B7280" />
              <Text style={styles.label}>Logo URL</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.logo}
              onChangeText={(text) => handleChange('logo', text)}
              placeholder="Logo URL"
              keyboardType="url"
            />
          </View>
          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit}
              title={loading ? 'Saving...' : 'Save Changes'}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  innerContainer: {
    maxWidth: '100%',
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  form: {
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inputGroup: {
    width: '48%',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  successMessage: {
    padding: 16,
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    marginBottom: 16,
    color: '#065F46',
  },
  errorMessage: {
    padding: 16,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 16,
    color: '#991B1B',
  },
});

export default Settings;
