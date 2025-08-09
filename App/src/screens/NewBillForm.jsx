import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getParties, getProducts, createInvoice, createParty, createProduct } from '../services/api';
import { Picker } from '@react-native-picker/picker';

function NewBillForm({ navigation }) {
  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [useExistingParty, setUseExistingParty] = useState(true);
  const [formData, setFormData] = useState({
    partyId: '',
    tax: 0,
    discount: 0,
    paymentStatus: 'unpaid',
    partyName: '',
    partyPhone: '',
    partyPlace: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setSelectedProducts([]);
      try {
        const partiesData = await getParties();
        const productsData = await getProducts();
        setParties(partiesData);
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  const calculateTotal = () => {
    let subtotal = 0;
    selectedProducts.forEach(item => {
      const product = products.find(p => p._id === item.productId) || item.newProduct;
      if (product && !isNaN(product.price)) {
        const itemTotal = item.quantity * product.price;
        subtotal += itemTotal - (item.discount || 0);
      }
    });
    return subtotal + parseFloat(formData.tax || 0);
  };

  const handleAddProduct = () => {
    setSelectedProducts([...selectedProducts, {
      productId: '',
      newProduct: null,
      useExistingProduct: true,
      quantity: 1,
      discount: 0,
      name: '',
      weight: '',
      price: '',
      productDiscount: 0
    }]);
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][field] = value;
    setSelectedProducts(updatedProducts);
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts.splice(index, 1);
    setSelectedProducts(updatedProducts);
  };

  const toggleProductType = (index) => {
    const updatedProducts = [...selectedProducts];
    const product = updatedProducts[index];
    product.useExistingProduct = !product.useExistingProduct;
    if (product.useExistingProduct) {
      product.newProduct = null;
    }
    setSelectedProducts(updatedProducts);
  };

  const handleNewProductSubmit = async (index) => {
    setError('');
    setSuccess('');

    const product = selectedProducts[index];
    if (!product.name || !product.weight || !product.price) {
      setError('Please fill in all fields for the new product.');
      return;
    }

    try {
      const newProduct = {
        name: product.name,
        weight: parseFloat(product.weight),
        price: parseFloat(product.price),
        discount: parseFloat(product.productDiscount) || 0
      };
      const response = await createProduct(newProduct);
      const updatedProducts = [...selectedProducts];
      updatedProducts[index].productId = response._id;
      updatedProducts[index].useExistingProduct = true;
      updatedProducts[index].newProduct = response;
      setProducts([...products, response]);
      setSelectedProducts(updatedProducts);
      setSuccess('New product created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create product');
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    if (useExistingParty && !formData.partyId) return setError('Select a party');
    if (!useExistingParty && (!formData.partyName || !formData.partyPhone)) return setError('Enter party details');
    if (selectedProducts.length === 0) return setError('Add at least one product');
    try {
      let partyId = formData.partyId;
      if (!useExistingParty) {
        const partyResponse = await createParty({
          name: formData.partyName,
          phoneNumber: formData.partyPhone,
          place: formData.partyPlace
        });
        partyId = partyResponse._id;
      }
      const invoiceData = {
        partyId,
        tax: formData.tax,
        paymentStatus: formData.paymentStatus,
        items: selectedProducts.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          discount: item.discount || 0
        }))
      };
      const response = await createInvoice(invoiceData);
      setSuccess('Invoice created successfully!');
      if (response._id) navigation.navigate('InvoiceDetail', { id: response._id });
    } catch (err) {
      setError(err.message || 'Failed to create invoice');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Create New Bill</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {success && <Text style={styles.successText}>{success}</Text>}
      
      <View style={styles.radioGroup}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setUseExistingParty(true)}>
          <Ionicons name={useExistingParty ? 'radio-button-on' : 'radio-button-off'} size={18} color="#000" />
          <Text style={styles.radioText}>Use Existing Party</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setUseExistingParty(false)}>
          <Ionicons name={!useExistingParty ? 'radio-button-on' : 'radio-button-off'} size={18} color="#000" />
          <Text style={styles.radioText}>New Party</Text>
        </TouchableOpacity>
      </View>
      
      {useExistingParty ? (
        <Picker
          selectedValue={formData.partyId}
          onValueChange={(val) => setFormData({ ...formData, partyId: val })}
          style={styles.input}
        >
          <Picker.Item label="Select a party" value="" />
          {parties.map(p => (
            <Picker.Item key={p._id} label={`${p.name} (${p.phoneNumber})`} value={p._id} />
          ))}
        </Picker>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Party Name"
            value={formData.partyName}
            onChangeText={(val) => setFormData({ ...formData, partyName: val })}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={formData.partyPhone}
            onChangeText={(val) => setFormData({ ...formData, partyPhone: val })}
          />
          <TextInput
            style={styles.input}
            placeholder="Place"
            value={formData.partyPlace}
            onChangeText={(val) => setFormData({ ...formData, partyPlace: val })}
          />
        </>
      )}
      
      <Text style={styles.label}>Payment Status</Text>
      <Picker
        selectedValue={formData.paymentStatus}
        onValueChange={(val) => setFormData({ ...formData, paymentStatus: val })}
        style={styles.input}
      >
        <Picker.Item label="Unpaid" value="unpaid" />
        <Picker.Item label="Paid" value="paid" />
      </Picker>

      <View style={styles.productsHeader}>
        <Text style={styles.productsTitle}>Products</Text>
        <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {selectedProducts.map((product, index) => (
        <View key={index} style={styles.productItem}>
          <TouchableOpacity 
            style={styles.switchButton} 
            onPress={() => toggleProductType(index)}
          >
            <Text>
              {product.useExistingProduct ? 'Select Existing Product' : 'Add New Product'}
            </Text>
          </TouchableOpacity>

          {product.useExistingProduct ? (
            <>
              <Picker
                selectedValue={product.productId}
                onValueChange={(val) => handleProductChange(index, 'productId', val)}
                style={styles.input}
              >
                <Picker.Item label="Select Product" value="" />
                {products.map(p => (
                  <Picker.Item key={p._id} label={`${p.name} - ₹${p.price}`} value={p._id} />
                ))}
              </Picker>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Product Name"
                value={product.name}
                onChangeText={(val) => handleProductChange(index, 'name', val)}
              />
              <TextInput
                style={styles.input}
                placeholder="Weight"
                keyboardType="numeric"
                value={product.weight}
                onChangeText={(val) => handleProductChange(index, 'weight', val)}
              />
              <TextInput
                style={styles.input}
                placeholder="Price"
                keyboardType="numeric"
                value={product.price}
                onChangeText={(val) => handleProductChange(index, 'price', val)}
              />
              <TextInput
                style={styles.input}
                placeholder="Product Discount"
                keyboardType="numeric"
                value={product.productDiscount.toString()}
                onChangeText={(val) => handleProductChange(index, 'productDiscount', parseFloat(val) || 0)}
              />
              <TouchableOpacity 
                style={styles.submitButton} 
                onPress={() => handleNewProductSubmit(index)}
              >
                <Text style={styles.submitButtonText}>Save New Product</Text>
              </TouchableOpacity>
            </>
          )}
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.quantityInput]}
              placeholder="Qty"
              keyboardType="numeric"
              value={product.quantity.toString()}
              onChangeText={(val) => handleProductChange(index, 'quantity', parseInt(val) || 0)}
            />
            <TextInput
              style={[styles.input, styles.discountInput]}
              placeholder="Discount"
              keyboardType="numeric"
              value={product.discount.toString()}
              onChangeText={(val) => handleProductChange(index, 'discount', parseFloat(val) || 0)}
            />
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleRemoveProduct(index)}
            >
              <Ionicons name="trash" size={20} color="#f00" />
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Text style={styles.totalText}>Total: ₹{calculateTotal().toFixed(2)}</Text>
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Invoice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    backgroundColor: '#fff' 
  },
  heading: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#000' 
  },
  input: { 
    backgroundColor: '#fff', 
    borderColor: '#ccc', 
    borderWidth: 1, 
    padding: 10, 
    marginBottom: 10 
  },
  label: { 
    marginBottom: 6, 
    fontWeight: '500', 
    color: '#000' 
  },
  radioGroup: { 
    flexDirection: 'row', 
    marginBottom: 16 
  },
  radioButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginRight: 16 
  },
  radioText: { 
    marginLeft: 6, 
    fontSize: 16, 
    color: '#000' 
  },
  productsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  productsTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#000' 
  },
  addButton: { 
    flexDirection: 'row', 
    backgroundColor: '#000', 
    padding: 8, 
    alignItems: 'center' 
  },
  addButtonText: { 
    color: '#fff', 
    marginLeft: 6 
  },
  productItem: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#eee', 
    padding: 10, 
    marginBottom: 12 
  },
  totalText: { 
    textAlign: 'right', 
    fontSize: 18, 
    fontWeight: '600', 
    marginTop: 12, 
    color: '#000' 
  },
  submitButton: { 
    backgroundColor: '#000', 
    padding: 12, 
    marginTop: 20, 
    alignItems: 'center' 
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  errorText: { 
    color: '#f00', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  successText: { 
    color: '#0a0', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  switchButton: { 
    backgroundColor: '#eee', 
    padding: 8, 
    marginBottom: 10, 
    alignItems: 'center' 
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  quantityInput: {
    width: '30%'
  },
  discountInput: {
    width: '30%'
  },
  deleteButton: {
    width: '30%',
    alignItems: 'center'
  }
});

export default NewBillForm;