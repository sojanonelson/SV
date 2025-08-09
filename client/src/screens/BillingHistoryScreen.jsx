import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { getInvoices } from '../services/api';

const BillingHistoryScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoices();
        setInvoices(data);
        setFilteredInvoices(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load invoices');
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  useEffect(() => {
    let results = [...invoices];

    if (dateRange !== 'all') {
      const days = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      results = results.filter(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= cutoffDate;
      });
    }

    if (sortConfig.key) {
      results.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    if (searchTerm) {
      results = results.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.partyPhone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      results = results.filter(invoice => invoice.paymentStatus === statusFilter);
    }

    setFilteredInvoices(results);
  }, [invoices, searchTerm, statusFilter, dateRange, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateRange('all');
    setSortConfig({ key: 'createdAt', direction: 'desc' });
  };

  const toggleInvoiceExpand = (invoiceId) => {
    setExpandedInvoice(expandedInvoice === invoiceId ? null : invoiceId);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Ionicons name="checkmark-circle" size={16} color="green" />;
      case 'unpaid':
        return <Ionicons name="alert-circle" size={16} color="red" />;
      case 'partial':
        return <Ionicons name="time" size={16} color="orange" />;
      default:
        return null;
    }
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? (
      <Ionicons name="chevron-up" size={16} />
    ) : (
      <Ionicons name="chevron-down" size={16} />
    );
  };

  const totalInvoices = filteredInvoices.length;
  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.paymentStatus === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = filteredInvoices
    .filter(inv => inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partial')
    .reduce((sum, inv) => sum + inv.total, 0);
  const paidPercentage = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search invoices..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <View style={styles.filterContainer}>
        <View style={styles.filterInputContainer}>
          <Ionicons name="filter" size={20} color="#9ca3af" style={styles.filterIcon} />
          <Picker
            selectedValue={statusFilter}
            style={styles.picker}
            onValueChange={(itemValue) => setStatusFilter(itemValue)}
          >
            <Picker.Item label="All Status" value="all" />
            <Picker.Item label="Paid" value="paid" />
            <Picker.Item label="Unpaid" value="unpaid" />
            <Picker.Item label="Partial" value="partial" />
          </Picker>
        </View>
        <View style={styles.filterInputContainer}>
          <Ionicons name="calendar" size={20} color="#9ca3af" style={styles.filterIcon} />
          <Picker
            selectedValue={dateRange}
            style={styles.picker}
            onValueChange={(itemValue) => setDateRange(itemValue)}
          >
            <Picker.Item label="All Time" value="all" />
            <Picker.Item label="Last 30 Days" value="30" />
            <Picker.Item label="Last 45 Days" value="45" />
            <Picker.Item label="Last 60 Days" value="60" />
            <Picker.Item label="Last 90 Days" value="90" />
          </Picker>
        </View>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
          <Ionicons name="refresh" size={16} color="#374151" />
          <Text>Reset</Text>
        </TouchableOpacity>
      </View>
     
    </View>
  );

const renderItem = ({ item }) => (
  <View style={styles.invoiceItem}>
    <View style={styles.invoiceRow}>
      <View style={styles.invoiceInfo}>
        <Text style={styles.invoiceNumber}>Invoice: {item.invoiceNumber}</Text>
        <Text style={styles.invoiceDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
      <View style={styles.invoicePartyInfo}>
        <Text style={styles.invoiceParty}>{item.partyName}</Text>
        <Text style={styles.invoicePhone}>{item.partyPhone}</Text>
      </View>
      <Text style={styles.invoiceAmount}>₹{item.total.toFixed(2)}</Text>
      <View style={styles.invoiceStatusContainer}>
        {getStatusIcon(item.paymentStatus)}
        <Text style={[
          styles.invoiceStatus,
          item.paymentStatus === 'paid' ? styles.invoiceStatusPaid :
          item.paymentStatus === 'unpaid' ? styles.invoiceStatusUnpaid :
          styles.invoiceStatusPartial
        ]}>
          {item.paymentStatus}
        </Text>
      </View>
      <View style={styles.invoiceActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('InvoiceDetail', { id: item._id })}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleInvoiceExpand(item._id)}>
          <Ionicons
            name={expandedInvoice === item._id ? "chevron-up" : "chevron-down"}
            size={16}
          />
        </TouchableOpacity>
      </View>
    </View>
    {expandedInvoice === item._id && (
      <View style={styles.invoiceDetails}>
        <Text style={styles.invoiceDetailsTitle}>Invoice Details</Text>
        <View style={styles.invoiceDetailsContent}>
          <View style={styles.invoiceDetailsSection}>
            <Text style={styles.invoiceDetailsSubTitle}>Party Information</Text>
            <Text>Name: {item.partyName}</Text>
            <Text>Phone: {item.partyPhone}</Text>
            <Text>Place: {item.partyId?.place}</Text>
          </View>
          <View style={styles.invoiceDetailsSection}>
            <Text style={styles.invoiceDetailsSubTitle}>Items</Text>
            {item.items.map((item, index) => (
              <Text key={index} style={styles.invoiceItemText}>
                {item.name} - {item.quantity} x ₹{item.price.toFixed(2)} = ₹{item.total.toFixed(2)}
              </Text>
            ))}
          </View>
          <View style={styles.invoiceDetailsSection}>
            <Text style={styles.invoiceDetailsSubTitle}>Payment Summary</Text>
            <Text>Subtotal: ₹{item.subtotal.toFixed(2)}</Text>
            {item.tax > 0 && <Text>Tax: ₹{item.tax.toFixed(2)}</Text>}
            {item.discount > 0 && <Text>Discount: -₹{item.discount.toFixed(2)}</Text>}
            <Text style={styles.invoiceDetailsTotal}>Total: ₹{item.total.toFixed(2)}</Text>
            <Text>Paid: ₹{item.paymentStatus === 'paid' ? item.total.toFixed(2) : '0.00'}</Text>
            <Text>Pending: ₹{item.paymentStatus !== 'paid' ? item.total.toFixed(2) : '0.00'}</Text>
          </View>
        </View>
      </View>
    )}
  </View>
);


  return (
    <View style={styles.container}>
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyList}>No invoices found matching your criteria</Text>}
        initialNumToRender={10}
        windowSize={5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 16,
  },
  errorText: {
    fontWeight: 'bold',
    color: '#b91c1c',
  },
  header: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 10,
    width: '30%',
  },
  filterIcon: {
    marginRight: 8,
  },
  picker: {
    height: 40,
    width: '100%',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#fff',
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
  summaryCardSubLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryCardBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  summaryCardBadgeText: {
    fontSize: 10,
    color: '#1e40af',
  },
  summaryCardProgressContainer: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginTop: 8,
  },
  summaryCardProgressBar: {
    height: 6,
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },  invoiceItem: {
    backgroundColor: '#fff',
    borderTopWidth:1,
    borderColor:'#1f293',
    marginBottom: 8,
  },
  invoiceRow: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  invoiceInfo: {
    flexDirection: 'column',
    width: '20%',
  },
  invoiceNumber: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  invoiceDate: {
    color: '#6b7280',
    fontSize: 12,
  },
  invoicePartyInfo: {
    width: '30%',
  },
  invoiceParty: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  invoicePhone: {
    color: '#6b7280',
    fontSize: 12,
  },
  invoiceAmount: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
  invoiceStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 4,
  },
  invoiceStatusPaid: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  invoiceStatusUnpaid: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  invoiceStatusPartial: {
    backgroundColor: '#fef9c3',
    color: '#a16207',
  },
  invoiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
  },
  invoiceDetails: {
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  invoiceDetailsTitle: {
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  invoiceDetailsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  invoiceDetailsSection: {
    width: '30%',
    marginBottom: 8,
  },
  invoiceDetailsSubTitle: {
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  invoiceItemText: {
    fontSize: 12,
    color: '#1f2937',
  },
  invoiceDetailsTotal: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyList: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 16,
  },
  viewButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default BillingHistoryScreen;
