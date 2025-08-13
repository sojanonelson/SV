import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getProductById, updateProduct } from '../../services/api';

function ProductEdit() {
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
          const product = await getProductById(id);
          const productData = product[0];
          const weightValue = productData.weight >= 1000 ? productData.weight / 1000 : productData.weight;
          const weightUnit = productData.weight >= 1000 ? 'kg' : 'g';

          const formatDate = (isoDate) => {
            if (!isoDate) return '';
            return new Date(isoDate).toISOString().split('T')[0];
          };

          setFormData({
            name: productData.name,
            sku: productData.sku,
            price: productData.price.toString(),
            weight: weightValue.toString(),
            stock: productData.stock.toString(),
            weightUnit: weightUnit,
            manufactureDate: formatDate(productData.manufactureDate),
            expireDate: formatDate(productData.expireDate)
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
      const weightInGrams = formData.weightUnit === 'kg' ? parseFloat(formData.weight) * 1000 : parseFloat(formData.weight);
      const productData = {
        ...formData,
        weight: weightInGrams
      };
      await updateProduct(id, productData);
      setSuccess('Product updated successfully!');
      
    } catch (err) {
      setError(err.message || 'Failed to update product');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Product</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(text) => handleChange('name', text)}
          placeholder="Name"
        />
        <Text style={styles.label}>Price (₹)</Text>
        <TextInput
          style={styles.input}
          value={formData.price}
          onChangeText={(text) => handleChange('price', text)}
          placeholder="Price"
          keyboardType="numeric"
        />
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>Weight</Text>
            <TextInput
              style={styles.input}
              value={formData.weight}
              onChangeText={(text) => handleChange('weight', text)}
              placeholder="Weight"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.weightUnit}>
            <Text style={styles.label}>Unit</Text>
            <Picker
              selectedValue={formData.weightUnit}
              style={styles.picker}
              onValueChange={(itemValue) => handleChange('weightUnit', itemValue)}
            >
              <Picker.Item label="Grams (g)" value="g" />
              <Picker.Item label="Kilograms (kg)" value="kg" />
            </Picker>
          </View>
        </View>
        <Text style={styles.label}>Stock</Text>
        <TextInput
          style={styles.input}
          value={formData.stock}
          onChangeText={(text) => handleChange('stock', text)}
          placeholder="Stock"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Manufacture Date</Text>
        <TextInput
          style={styles.input}
          value={formData.manufactureDate}
          onChangeText={(text) => handleChange('manufactureDate', text)}
          placeholder="YYYY-MM-DD"
        />
        <Text style={styles.label}>Expire Date</Text>
        <TextInput
          style={styles.input}
          value={formData.expireDate}
          onChangeText={(text) => handleChange('expireDate', text)}
          placeholder="YYYY-MM-DD"
        />
        <Button
          onPress={handleSubmit}
          title="Update Product"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  form: {
    marginTop: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  weightUnit: {
    width: 120,
  },
  picker: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ProductEdit;
