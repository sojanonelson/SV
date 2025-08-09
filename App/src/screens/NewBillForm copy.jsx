import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getParties, getProducts, createInvoice, createParty } from '../services/api';
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
      setSelectedProducts([])
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
      const product = products.find(p => p._id === item.productId);
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
      quantity: 1,
      discount: 0
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
      <Text style={styles.heading}>🧾 Create New Bill</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {success && <Text style={styles.successText}>{success}</Text>}

      <View style={styles.radioGroup}>
        <TouchableOpacity style={styles.radioButton} onPress={() => setUseExistingParty(true)}>
          <Ionicons name={useExistingParty ? 'radio-button-on' : 'radio-button-off'} size={18} color="#2563eb" />
          <Text style={styles.radioText}>Use Existing Party</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.radioButton} onPress={() => setUseExistingParty(false)}>
          <Ionicons name={!useExistingParty ? 'radio-button-on' : 'radio-button-off'} size={18} color="#2563eb" />
          <Text style={styles.radioText}>New Party</Text>
        </TouchableOpacity>
      </View>

      {useExistingParty ? (
        <Picker
          selectedValue={formData.partyId}
          onValueChange={(val) => setFormData({ ...formData, partyId: val })}
          style={styles.input}
        >
          <Picker.Item label="-- Select a party --" value="" />
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
        <Text style={styles.productsTitle}>🛒 Products</Text>
        <TouchableOpacity onPress={handleAddProduct} style={styles.addButton}>
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {selectedProducts.map((product, index) => (
        <View key={index} style={styles.productItem}>
          <Picker
            selectedValue={product.productId}
            onValueChange={(val) => handleProductChange(index, 'productId', val)}
            style={styles.input}
          >
            <Picker.Item label="-- Select Product --" value="" />
            {products.map(p => (
              <Picker.Item key={p._id} label={`${p.name} - ₹${p.price}`} value={p._id} />
            ))}
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Qty"
            keyboardType="numeric"
            value={product.quantity.toString()}
            onChangeText={(val) => handleProductChange(index, 'quantity', parseInt(val) || 0)}
          />
          <TextInput
            style={styles.input}
            placeholder="Discount"
            keyboardType="numeric"
            value={product.discount.toString()}
            onChangeText={(val) => handleProductChange(index, 'discount', parseFloat(val) || 0)}
          />
          <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
            <Ionicons name="trash" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      ))}

      {/* <TextInput
        style={styles.input}
        placeholder="Tax ₹"
        keyboardType="numeric"
        value={formData.tax.toString()}
        onChangeText={(val) => setFormData({ ...formData, tax: val })}
      /> */}

      <Text style={styles.totalText}>Total: ₹{calculateTotal().toFixed(2)}</Text>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Create Invoice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9fafb' },
  heading: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1f2937' },
  input: { backgroundColor: '#fff', borderColor: '#d1d5db', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: '500', color: '#374151' },
  radioGroup: { flexDirection: 'row', marginBottom: 16 },
  radioButton: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  radioText: { marginLeft: 6, fontSize: 16, color: '#1f2937' },
  productsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  productsTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  addButton: { flexDirection: 'row', backgroundColor: '#2563eb', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#fff', marginLeft: 6 },
  productItem: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 12, borderRadius: 8, marginBottom: 12 },
  totalText: { textAlign: 'right', fontSize: 18, fontWeight: '600', marginTop: 12, color: '#111827' },
  submitButton: { backgroundColor: '#10b981', padding: 16, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#dc2626', textAlign: 'center', marginBottom: 12 },
  successText: { color: '#16a34a', textAlign: 'center', marginBottom: 12 }
});

export default NewBillForm;