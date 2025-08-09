import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getInvoicesByPartyId } from '../../services/api';

const InvoiceStatus = ({ isPaid }) => (
  <View style={isPaid ? styles.invoiceStatusPaid : styles.invoiceStatusUnpaid}>
    <Ionicons name={isPaid ? "checkmark-circle" : "time"} size={16} color={isPaid ? "green" : "orange"} />
    <Text style={styles.invoiceStatusText}>{isPaid ? 'Paid' : 'Unpaid'}</Text>
  </View>
);

const InvoiceItem = ({ item, navigation }) => (
  <View style={styles.invoiceCard}>
    <View style={styles.invoiceHeader}>
      <View style={styles.invoiceInfo}>
        <Ionicons name="document-text" size={18} color="#3b82f6" />
        <Text style={styles.invoiceNumber}>Invoice: {item.invoiceNumber}</Text>
      </View>
      <View style={styles.invoiceInfo}>
        <Ionicons name="calendar" size={18} color="#6b7280" />
        <Text style={styles.invoiceDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
      </View>
    </View>
    <View style={styles.invoiceItems}>
      {item.items.map((item, index) => (
        <Text key={index} style={styles.invoiceItemText}>
          {item.quantity} × {item.name}
          {item.discount > 0 && <Text style={styles.invoiceDiscount}> (-₹{item.discount})</Text>}
        </Text>
      ))}
    </View>
    <View style={styles.invoiceFooter}>
      <View style={styles.invoiceInfo}>
        <Ionicons name="cash" size={18} color="#6b7280" />
        <Text style={styles.invoiceAmount}>₹{item.total.toFixed(2)}</Text>
      </View>
      <InvoiceStatus isPaid={item.paymentStatus === 'paid'} />
      <TouchableOpacity
        style={styles.invoiceAction}
        onPress={() => navigation.navigate('InvoiceDetail', { id: item._id })}
      >
        <Text style={styles.invoiceActionText}>View Details</Text>
        <Ionicons name="arrow-forward" size={16} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  </View>
);

const PartyInvoices = () => {
  const route = useRoute();
  const { partyId } = route.params;
  const navigation = useNavigation();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await getInvoicesByPartyId(partyId);
        setInvoices(data);
      } catch (err) {
        setError('Failed to fetch invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [partyId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (invoices.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noInvoicesText}>No Invoices Found</Text>
        <Text style={styles.noInvoicesSubText}>This party doesn't have any invoices yet.</Text>
      </SafeAreaView>
    );
  }

  const party = invoices[0].partyId;
  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <View style={styles.header}>
          <Text style={styles.partyName}>{party.name}'s Invoices</Text>
          <Text style={styles.partyDetails}>{party.phoneNumber} • {party.place}</Text>
          <Text style={styles.totalInvoices}>Total Invoices: {invoices.length}</Text>
        </View>
      </View>
      <FlatList
        data={invoices}
        renderItem={({ item }) => <InvoiceItem item={item} navigation={navigation} />}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Showing {invoices.length} invoices</Text>
        <Text style={styles.footerText}>Total Amount: ₹{totalAmount}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'column',
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 16,
    marginLeft: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 16,
  },
  noInvoicesText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  noInvoicesSubText: {
    color: '#6b7280',
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  partyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  partyDetails: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  totalInvoices: {
    fontSize: 16,
    color: '#6b7280',
  },
  listContent: {
    paddingBottom: 16,
  },
  invoiceCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  invoiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceNumber: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  invoiceDate: {
    marginLeft: 8,
    color: '#6b7280',
  },
  invoiceItems: {
    marginBottom: 8,
  },
  invoiceItemText: {
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 4,
  },
  invoiceDiscount: {
    color: 'red',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceAmount: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  invoiceStatusPaid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  invoiceStatusUnpaid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef9c3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  invoiceStatusText: {
    marginLeft: 4,
    color: '#1f2937',
  },
  invoiceAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  invoiceActionText: {
    marginRight: 4,
    color: '#3b82f6',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 16,
  },
  footerText: {
    color: '#6b7280',
    fontSize: 16,
  },
});

export default PartyInvoices;
