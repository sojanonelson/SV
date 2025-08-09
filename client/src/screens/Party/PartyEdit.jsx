import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getPartyById, updateParty } from '../../services/api';

function PartyEdit() {
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = route.params;
  console.log(id)
  

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    place: '',
    address: '',
    email: '',
    gstNumber: ''
  });

  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({});

  useEffect(() => {
    fetchPartyData();
  }, [id]);

  const fetchPartyData = async () => {
    try {
      setLoading(true);
      const party = await getPartyById(id);
      console.log("party:", party)
      const partyData = {
        name: party.name || '',
        phoneNumber: party.phoneNumber || '',
        place: party.place || '',
        address: party.address || '',
        email: party.email || '',
        gstNumber: party.gstNumber || ''
      };
      setFormData(partyData);
      setOriginalData(partyData);
    } catch (err) {
      setError(err.message || 'Failed to load party data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Check if there are changes
    const hasChanged = Object.keys(newFormData).some(
      key => newFormData[key] !== originalData[key]
    );
    setHasChanges(hasChanged);

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Party name is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.place.trim()) {
      newErrors.place = 'Place is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!hasChanges) {
      Alert.alert('No Changes', 'No changes were made to save.');
      return;
    }

    setSaving(true);
    try {
      await updateParty(id, formData);
      Alert.alert(
        'Success',
        'Party updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (err) {
      setError(err.message || 'Failed to update party');
      Alert.alert('Error', err.message || 'Failed to update party');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to cancel?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading party data...</Text>
      </View>
    );
  }

  if (error && !formData.name) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.errorTitle}>Failed to load party</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchPartyData}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleCancel}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.headerTitleText}>Edit Party</Text>
          <Text style={styles.headerSubtitle}>Update party information</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Party Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Party Name <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter party name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.phoneNumber && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Enter phone number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          {/* Place */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Place <Text style={styles.required}>*</Text>
            </Text>
            <View style={[styles.inputContainer, errors.place && styles.inputError]}>
              <Ionicons name="location-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.place}
                onChangeText={(value) => handleInputChange('place', value)}
                placeholder="Enter place"
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.place && <Text style={styles.errorText}>{errors.place}</Text>}
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="home-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter full address"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter email address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* GST Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>GST Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#64748B" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={formData.gstNumber}
                onChangeText={(value) => handleInputChange('gstNumber', value.toUpperCase())}
                placeholder="Enter GST number"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={15}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancel}
          disabled={saving}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.saveButton, 
            (!hasChanges || saving) && styles.saveButtonDisabled
          ]} 
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default PartyEdit;