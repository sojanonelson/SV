import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getParties, deleteParty } from '../../services/api';

function PartyList() {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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
    Alert.alert(
      'Delete Party',
      'Are you sure you want to delete this party?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchParties();
  };

  const Header = () => (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.nameHeader]}>Name</Text>
      <Text style={[styles.headerCell, styles.phoneHeader]}>Phone</Text>
      <Text style={[styles.headerCell, styles.placeHeader]}>Place</Text>
      <Text style={styles.headerCell}>Actions</Text>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <Text>Loading parties...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Party Form')}
        >
          <Ionicons name="add" size={18} color="white" />
          <Text style={styles.buttonText}>Add New Party</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={parties}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={Header}
        ListEmptyComponent={<Text style={styles.empty}>No parties found.</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.cellContainer}>
              <Text style={[styles.cell, styles.nameCell]}>{item.name}</Text>
              <Text style={[styles.cell, styles.phoneCell]}>{item.phoneNumber}</Text>
              <Text style={[styles.cell, styles.placeCell]}>{item.place}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.billButton}
                onPress={() => navigation.navigate('Single Party Invoices', { partyId: item._id })}
              >
                <Ionicons name="document-text" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditParty', { id: item._id })}
              >
                <Ionicons name="create" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item._id)}
              >
                <Ionicons name="trash" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,
    backgroundColor: '#fff',
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
    padding: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E40AF',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
  headerRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  nameHeader: {
    marginLeft: 4,
  },
  phoneHeader: {
    marginLeft: 4,
  },
  placeHeader: {
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cellContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  cell: {
    fontSize: 16,
    flex: 1,
    textAlign: 'center',
  },
  nameCell: {
    marginLeft: 4,
  },
  phoneCell: {
    marginLeft: 4,
  },
  placeCell: {
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  billButton: {
    backgroundColor: '#3B82F6',
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: '#F59E0B',
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  empty: {
    textAlign: 'center',
    padding: 16,
    color: '#6B7280',
  },
  error: {
    color: 'red',
  },
});

export default PartyList;
