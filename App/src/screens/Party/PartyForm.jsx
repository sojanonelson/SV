import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createParty } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const CreatePartyScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    place: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phoneNumber || !formData.place) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      await createParty(formData);
      navigation.goBack()
      
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create party');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={28} color="#000" />
  </TouchableOpacity>
</View>

      <Text style={styles.title}>Add New Party</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Party Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter party name"
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone number"
          value={formData.phoneNumber}
          onChangeText={(text) => handleChange('phoneNumber', text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Place</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter place"
          value={formData.place}
          onChangeText={(text) => handleChange('place', text)}
        />
      </View>

      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitButtonText}>
          {loading ? 'Creating...' : 'Create Party'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({header: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 20,
}
,
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 30,
    color: '#000',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#000',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default CreatePartyScreen;