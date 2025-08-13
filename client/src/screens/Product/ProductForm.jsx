import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createProduct, updateProduct } from '../../services/api';

const ProductForm = (props) => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params || {};

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '0',
    weight: '0',
    stock: '0',
    weightUnit: 'g',
    manufactureDate: '',
    expireDate: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const product = await getProducts(id);
          const weightValue = product.weight >= 1000 ? product.weight / 1000 : product.weight;
          const weightUnit = product.weight >= 1000 ? 'kg' : 'g';
          setFormData({
            name: product.name,
            sku: product.sku,
            price: product.price.toString(),
            weight: weightValue.toString(),
            stock: product.stock.toString(),
            weightUnit: weightUnit,
            manufactureDate: product.manufactureDate || '',
            expireDate: product.expireDate || ''
          });
        } catch (err) {
          setError(err.message || 'Failed to load product');
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
  setError('');
  setSuccess('');
  try {
    const weightInGrams = formData.weightUnit === 'kg'
      ? parseFloat(formData.weight) * 1000
      : parseFloat(formData.weight);
    const productData = {
      ...formData,
      weight: weightInGrams
    };
    
    if (id) {
      await updateProduct(id, productData);
      setSuccess('Product updated successfully!');
    } else {
      await createProduct(productData);
      setSuccess('Product created successfully!');
    }
    
  
  } catch (err) {
    setError(err.message || 'Failed to save product');
  }
};

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.header}>{id ? 'Edit Product' : 'Add New Product'}</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter price"
            value={formData.price}
            onChangeText={(text) => handleChange('price', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <View style={styles.inputHalfContainer}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter weight"
              value={formData.weight}
              onChangeText={(text) => handleChange('weight', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputHalfContainer, { marginLeft: 8 }]}>
            <Text style={styles.label}>Unit</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.weightUnit}
                onValueChange={(itemValue) => handleChange('weightUnit', itemValue)}
              >
                <Picker.Item label="Grams (g)" value="g" />
                <Picker.Item label="Kilograms (kg)" value="kg" />
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Stock</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter stock quantity"
            value={formData.stock}
            onChangeText={(text) => handleChange('stock', text)}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Manufacture Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.manufactureDate}
            onChangeText={(text) => handleChange('manufactureDate', text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Expire Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={formData.expireDate}
            onChangeText={(text) => handleChange('expireDate', text)}
          />
        </View>

        <Button
          title={id ? 'Update Product' : 'Add Product'}
          onPress={handleSubmit}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
   
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputHalfContainer: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pickerContainer: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default ProductForm;
