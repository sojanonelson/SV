import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
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
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#EF4444" />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Welcome back! Here's your business overview</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.primaryCard]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="receipt-outline" size={24} color="#3B82F6" />
            <Text style={styles.summaryCardLabel}>Total Invoices</Text>
          </View>
          <Text style={styles.summaryCardValue}>{totalInvoices}</Text>
        </View>

        <View style={[styles.summaryCard, styles.secondaryCard]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="cash-outline" size={24} color="#8B5CF6" />
            <Text style={styles.summaryCardLabel}>Total Amount</Text>
          </View>
          <Text style={styles.summaryCardValue}>{formatCurrency(totalAmount)}</Text>
        </View>

        <View style={[styles.summaryCard, styles.successCard]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#10B981" />
            <Text style={styles.summaryCardLabel}>Paid Amount</Text>
          </View>
          <Text style={[styles.summaryCardValue, { color: '#10B981' }]}>
            {formatCurrency(paidAmount)}
          </Text>
          <Text style={styles.percentageText}>{paidPercentage}% of total</Text>
        </View>

        <View style={[styles.summaryCard, styles.warningCard]}>
          <View style={styles.summaryHeader}>
            <Ionicons name="time-outline" size={24} color="#F59E0B" />
            <Text style={styles.summaryCardLabel}>Pending Amount</Text>
          </View>
          <Text style={[styles.summaryCardValue, { color: '#F59E0B' }]}>
            {formatCurrency(pendingAmount)}
          </Text>
          <Text style={styles.percentageText}>{100 - paidPercentage}% remaining</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <Text style={styles.sectionSubtitle}>Manage your business efficiently</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.actionCard, styles.invoiceCard]}
          onPress={() => navigation.navigate('Billing History')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="document-text" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>Manage Invoices</Text>
          <Text style={styles.actionSubtitle}>View and edit invoices</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.partyCard]}
          onPress={() => navigation.navigate('Party List')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="people" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>Manage Parties</Text>
          <Text style={styles.actionSubtitle}>Add and edit customers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.productCard]}
          onPress={() => navigation.navigate('Product List')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="cube" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>Manage Products</Text>
          <Text style={styles.actionSubtitle}>Update inventory</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.createCard]}
          onPress={() => navigation.navigate('New Bill')}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="add-circle" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.actionTitle}>Create Invoice</Text>
          <Text style={styles.actionSubtitle}>Generate new bill</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

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
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
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
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
   
    width: '48%',
    marginBottom: 16,
  },
  primaryCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#3B82F6',
  },
  secondaryCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#8B5CF6',
  },
  successCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#10B981',
  },
  warningCard: {
    borderLeftWidth: 2,
    borderLeftColor: '#F59E0B',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryCardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 8,
  },
  summaryCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    
    padding: 20,
    marginBottom: 16,

    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  invoiceCard: {
    borderTopWidth: 4,
    borderTopColor: '#3B82F6',
  },
  partyCard: {
    borderTopWidth: 4,
    borderTopColor: '#10B981',
  },
  productCard: {
    borderTopWidth: 4,
    borderTopColor: '#8B5CF6',
  },
  createCard: {
    borderTopWidth: 4,
    borderTopColor: '#F59E0B',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});

export default Dashboard;