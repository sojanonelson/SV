import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getParties, deleteParty } from '../../services/api';

function PartyList() {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchParties = async () => {
    try {
      const data = await getParties();
      setParties(data);
    } catch (err) {
      setError(err.message || 'Failed to load parties');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleDelete = async (id) => {
    setActiveMenu(null);
    Alert.alert(
      'Delete Party',
      'Are you sure you want to delete this party? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteParty(id);
              setParties(parties.filter(party => party._id !== id));
            } catch (err) {
              setError(err.message || 'Failed to delete party');
            }
          },
        },
      ]
    );
  };

  const handleMenuAction = (action, party) => {
    setActiveMenu(null);
    switch (action) {
      case 'view':
        navigation.navigate('Party Invoice', { partyId: party._id });
        break;
      case 'edit':
        navigation.navigate('EditParty', { id: party._id });
        break;
      case 'delete':
        handleDelete(party._id);
        break;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchParties();
  };

  const MenuDropdown = ({ party, visible, onClose }) => (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleMenuAction('view', party)}
          >
            <Ionicons name="eye-outline" size={20} color="#3B82F6" />
            <Text style={styles.dropdownText}>View Invoices</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => handleMenuAction('edit', party)}
          >
            <Ionicons name="create-outline" size={20} color="#F59E0B" />
            <Text style={styles.dropdownText}>Edit Party</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.dropdownItem, styles.dropdownItemLast]}
            onPress={() => handleMenuAction('delete', party)}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.dropdownText, { color: '#EF4444' }]}>Delete Party</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const PartyCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.partyName}>{item.name}</Text>
          <Text style={styles.partyPlace}>{item.place}</Text>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#64748B" />
          <Text style={styles.infoText}>{item.phoneNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#64748B" />
          <Text style={styles.infoText}>{item.place}</Text>
        </View>
      </View>

      <MenuDropdown
        party={item}
        visible={activeMenu === item._id}
        onClose={() => setActiveMenu(null)}
      />
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <View style={styles.loadingContainer}>
          <Ionicons name="people-outline" size={48} color="#E2E8F0" />
          <Text style={styles.loadingText}>Loading parties...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchParties}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Parties</Text>
          <Text style={styles.headerSubtitle}>{parties.length} total parties</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Party Form')}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.addButtonText}>Add Party</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={parties}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <PartyCard item={item} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#E2E8F0" />
            <Text style={styles.emptyTitle}>No parties found</Text>
            <Text style={styles.emptyMessage}>
              Start by adding your first party to manage your business contacts
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Party Form')}
            >
              <Ionicons name="add" size={20} color="#3B82F6" />
              <Text style={styles.emptyButtonText}>Add First Party</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

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
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
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
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardInfo: {
    flex: 1,
  },
  partyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  partyPlace: {
    fontSize: 14,
    color: '#64748B',
  },
  menuButton: {
    padding: 8,
  },
  cardBody: {
    paddingLeft: 60,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  emptyButtonText: {
    color: '#3B82F6',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PartyList;