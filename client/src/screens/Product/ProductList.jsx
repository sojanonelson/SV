import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getProducts, deleteProduct } from '../../services/api';
import formatWeight from '../../utils/weight';

function ProductList() {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null); // To track which menu is expanded

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteProduct(id);
              setProducts(products.filter(product => product._id !== id));
            } catch (err) {
              setError(err.message || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const toggleMenu = (productId) => {
    if (expandedMenu === productId) {
      setExpandedMenu(null); // Close menu if it's already open
    } else {
      setExpandedMenu(productId); // Open menu for this product
    }
  };

  const renderHeader = () => (
    <View style={styles.headerRow}>
      <Text style={styles.headerCell}>Name</Text>
      <Text style={styles.headerCell}>SKU</Text>
      <Text style={styles.headerCell}>Price</Text>
      <Text style={styles.headerCell}>Weight</Text>
      <Text style={styles.headerCell}>Stock</Text>
      <Text style={styles.headerCell}>Actions</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.sku}</Text>
      <Text style={styles.cell}>₹{item.price.toFixed(2)}</Text>
      <Text style={styles.cell}>{formatWeight(item.weight)}</Text>
      <Text style={styles.cell}>{item.stock}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => toggleMenu(item._id)}>
          <Ionicons name="ellipsis-horizontal" size={24} color="#1f2937" />
        </TouchableOpacity>
        {expandedMenu === item._id && (
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate('Product Edit', { id: item._id })}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Product Form')}
        >
          <Ionicons name="add-circle" size={18} color="white" />
          <Text style={styles.buttonText}>Add New Product</Text>
        </TouchableOpacity>
      </View>
      {products.length === 0 ? (
        <Text style={styles.empty}>No products found.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,marginTop:12,
    padding: 10,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: '#1f2937', // Adjusted to be more readable without background
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#cbd5e0',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
    color: '#4b5563',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    position: 'absolute',
    right: 30,
    top: 30,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
  editButton: {
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6B7280',
  },
  error: {
    color: '#ef4444',
  },
});

export default ProductList;
