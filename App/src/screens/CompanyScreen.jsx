import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createCompany } from '../services/api';

function CompanyForm({ navigation }) {
  const [formData, setFormData] = useState({
    fssaiNumber: '',
    gstNumber: '',
    phoneNumber: '',
    alternateNumber: '',
    ownerName: '',
    email: '',
    logo: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    match: false,
  });

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  useEffect(() => {
    const { password, confirmPassword } = formData;
    setPasswordRequirements({
      length: password.length >= 6,
      match: password === confirmPassword && confirmPassword,
    });
  }, [formData.password, formData.confirmPassword]);

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.ownerName.trim()) errors.ownerName = 'Owner name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email';
      }
      if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    } else if (step === 2) {
      if (!formData.fssaiNumber.trim()) errors.fssaiNumber = 'FSSAI number is required';
    } else if (step === 3) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (!passwordRequirements.length) {
        errors.password = 'Password must be at least 6 characters';
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (!passwordRequirements.match) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    if (!validateStep(3)) return;

    try {
      const payload = { ...formData };
      delete payload.confirmPassword;
      const registerRes = await createCompany(payload);
      if (registerRes) {
        setLoading(false);
        navigation.navigate('Login');
      }
    } catch (err) {
      setError('Failed to create company. Please try again.');
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Basic details' },
    { number: 2, title: 'Business Info', description: 'Company details' },
    { number: 3, title: 'Security', description: 'Create password' }
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.maxWidthContainer}>
        <View style={styles.textCenter}>
          <View style={styles.logoContainer}>
            <Ionicons name="business" size={32} color="white" />
          </View>
          <Text style={styles.heading}>Create Your Company</Text>
        </View>

        <View style={styles.stepsContainer}>
          <View style={styles.stepsHeader}>
            {steps.map((step, index) => (
              <View key={step.number} style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  currentStep >= step.number ? styles.activeStepCircle : styles.inactiveStepCircle
                ]}>
                  {currentStep > step.number ? (
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  ) : (
                    <Text style={currentStep >= step.number ? styles.activeStepText : styles.inactiveStepText}>
                      {step.number}
                    </Text>
                  )}
                </View>
                {index < steps.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    currentStep > step.number ? styles.activeStepLine : styles.inactiveStepLine
                  ]} />
                )}
              </View>
            ))}
          </View>
          <View style={styles.stepInfo}>
            <Text style={styles.stepTitle}>{steps[currentStep - 1].title}</Text>
            <Text style={styles.stepDescription}>{steps[currentStep - 1].description}</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="person" size={16} color="#6b7280" /> Owner Name</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.ownerName ? styles.errorInput : styles.validInput
                  ]}
                  placeholder="Enter full name"
                  value={formData.ownerName}
                  onChangeText={text => handleChange('ownerName', text)}
                />
                {validationErrors.ownerName && (
                  <Text style={styles.errorMessage}>{validationErrors.ownerName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="mail" size={16} color="#6b7280" /> Email Address</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.email ? styles.errorInput : styles.validInput
                  ]}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChangeText={text => handleChange('email', text)}
                />
                {validationErrors.email && (
                  <Text style={styles.errorMessage}>{validationErrors.email}</Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}><Ionicons name="call" size={16} color="#6b7280" /> Phone Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.phoneNumber ? styles.errorInput : styles.validInput
                    ]}
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChangeText={text => handleChange('phoneNumber', text)}
                  />
                  {validationErrors.phoneNumber && (
                    <Text style={styles.errorMessage}>{validationErrors.phoneNumber}</Text>
                  )}
                </View>

                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.label}><Ionicons name="call" size={16} color="#6b7280" /> Alternate Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter alternate number (optional)"
                    value={formData.alternateNumber}
                    onChangeText={text => handleChange('alternateNumber', text)}
                  />
                </View>
              </View>
            </View>
          )}

          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="document-text" size={16} color="#6b7280" /> FSSAI Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.fssaiNumber ? styles.errorInput : styles.validInput
                  ]}
                  placeholder="Enter FSSAI registration number"
                  value={formData.fssaiNumber}
                  onChangeText={text => handleChange('fssaiNumber', text)}
                />
                {validationErrors.fssaiNumber && (
                  <Text style={styles.errorMessage}>{validationErrors.fssaiNumber}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="barcode" size={16} color="#6b7280" /> GST Number</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationErrors.gstNumber ? styles.errorInput : styles.validInput
                  ]}
                  placeholder="Enter GST identification number"
                  value={formData.gstNumber}
                  onChangeText={text => handleChange('gstNumber', text)}
                />
                {validationErrors.gstNumber && (
                  <Text style={styles.errorMessage}>{validationErrors.gstNumber}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="cloud-upload" size={16} color="#6b7280" /> Company Logo URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter logo URL (optional)"
                  value={formData.logo}
                  onChangeText={text => handleChange('logo', text)}
                />
              </View>
            </View>
          )}

          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="lock-closed" size={16} color="#6b7280" /> Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.password ? styles.errorInput : styles.validInput
                    ]}
                    placeholder="Create a strong password"
                    secureTextEntry={!showPassword}
                    value={formData.password}
                    onChangeText={text => handleChange('password', text)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
                {validationErrors.password && (
                  <Text style={styles.errorMessage}>{validationErrors.password}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}><Ionicons name="lock-closed" size={16} color="#6b7280" /> Confirm Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[
                      styles.input,
                      validationErrors.confirmPassword ? styles.errorInput : styles.validInput
                    ]}
                    placeholder="Confirm your password"
                    secureTextEntry={!showConfirmPassword}
                    value={formData.confirmPassword}
                    onChangeText={text => handleChange('confirmPassword', text)}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
                {validationErrors.confirmPassword && (
                  <Text style={styles.errorMessage}>{validationErrors.confirmPassword}</Text>
                )}
              </View>

              <View style={styles.passwordRequirements}>
                <Text style={styles.passwordRequirementsTitle}>Password Requirements:</Text>
                <View>
                  <Text style={[styles.passwordRequirement, passwordRequirements.length ? styles.passwordRequirementMet : null]}>
                    {passwordRequirements.length ? '✓' : '✗'} At least 6 characters long
                  </Text>
                  <Text style={[styles.passwordRequirement, passwordRequirements.match ? styles.passwordRequirementMet : null]}>
                    {passwordRequirements.match ? '✓' : '✗'} Passwords match
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={[
            styles.buttonContainer,
            currentStep === 1 ? styles.justifyEnd : styles.justifyBetween
          ]}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.button}
                onPress={prevStep}
              >
                <Text style={styles.buttonText}>Previous</Text>
              </TouchableOpacity>
            )}

            {currentStep < 3 ? (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={nextStep}
              >
                <Text style={styles.nextButtonText}>Next Step</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>{loading ? 'Loading...' : 'Create Account'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 16,
  },
  maxWidthContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  textCenter: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepsContainer: {
    marginBottom: 32,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStepCircle: {
    backgroundColor: '#3b82f6',
  },
  inactiveStepCircle: {
    backgroundColor: '#e5e7eb',
  },
  activeStepText: {
    color: 'white',
    fontWeight: 'bold',
  },
  inactiveStepText: {
    color: '#6b7280',
  },
  stepLine: {
    height: 4,
    flex: 1,
  },
  activeStepLine: {
    backgroundColor: '#3b82f6',
  },
  inactiveStepLine: {
    backgroundColor: '#e5e7eb',
  },
  stepInfo: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'semibold',
    color: '#1f2937',
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    borderColor: '#e5e7eb',
    borderWidth: 1,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  stepContent: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
  },
  validInput: {
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  passwordInputContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 16,
  },
  passwordRequirements: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  passwordRequirementsTitle: {
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  passwordRequirement: {
    color: '#6b7280',
    marginBottom: 4,
  },
  passwordRequirementMet: {
    color: '#166534',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 32,
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  button: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#374151',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default CompanyForm;
