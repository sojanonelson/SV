import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getInvoices } from '../services/api';



const Dashboard = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoices, setInvoices] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [paidPercentage, setPaidPercentage] = useState(0);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data);

        // Calculate totals
        const totalInvoices = data.length;
        const totalAmount = data.reduce((sum, invoice) => sum + invoice.total, 0);
        const paidAmount = data
          .filter(invoice => invoice.paymentStatus === 'paid')
          .reduce((sum, invoice) => sum + invoice.total, 0);
        const pendingAmount = totalAmount - paidAmount;
        const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

        setTotalInvoices(totalInvoices);
        setTotalAmount(totalAmount);
        setPaidAmount(paidAmount);
        setPendingAmount(pendingAmount);
        setPaidPercentage(paidPercentage);

        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load invoices');
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error</Text>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Total Invoices</Text>
          <Text style={styles.summaryCardValue}>{totalInvoices}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Total Amount</Text>
          <Text style={styles.summaryCardValue}>₹{totalAmount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Paid Amount</Text>
          <Text style={[styles.summaryCardValue, { color: 'green' }]}>₹{paidAmount}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryCardLabel}>Pending Amount</Text>
          <Text style={[styles.summaryCardValue, { color: 'red' }]}>₹{pendingAmount}</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Billing History')}
        >
          <Ionicons name="document-text" size={40} color="#4F46E5" />
          <Text style={styles.cardText}>Manage Invoices</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Party List')}
        >
          <Ionicons name="people" size={40} color="#10B981" />
          <Text style={styles.cardText}>Manage Parties</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Product List')}
        >
          <Ionicons name="cube" size={40} color="#3B82F6" />
          <Text style={styles.cardText}>Manage Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('New Bill')}
        >
          <Ionicons name="add-circle" size={40} color="#EF4444" />
          <Text style={styles.cardText}>Create Invoice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontWeight: 'bold',
    color: 'red',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
    width: '48%',
    marginBottom: 16,
  },
  summaryCardLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  summaryCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    color: '#1F2937',
  },
});

export default Dashboard;
