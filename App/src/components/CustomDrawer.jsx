import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import logo from '../../assets/icon.png'
import AsyncStorage from '@react-native-async-storage/async-storage';
const appVersion = Constants.expoConfig.extra.APP_VERSION;

const CustomDrawer = (props) => {
 const handleLogout = async () => {
    try {
      // Remove specific items from AsyncStorage
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
      // Navigate to Login screen after clearing storage
      props.navigation.replace('Login');
    } catch (e) {
      console.error('Failed to remove items from async storage.', e);
    }
  };

  const handleNewBill = () => {
    props.navigation.navigate('New Bill');
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {/* Header Section */}
        <View style={styles.drawerHeader}>
          <View style={styles.logoContainer}>
         
<Image
  source={logo}
  style={{ width: 80, height: 80 }}
/>
          </View>
          <Text style={styles.drawerTitle}>SV Billing</Text>
          <Text style={styles.drawerSubtitle}>Billing Management System</Text>
        </View>

        {/* New Bill Button */}
        <TouchableOpacity style={styles.newBillBtn} onPress={handleNewBill}>
          <Ionicons name="add-circle" size={22} color="#fff" style={styles.newBillIcon} />
          <Text style={styles.newBillText}>Create New Bill</Text>
        </TouchableOpacity>

        {/* Navigation Items */}
        <View style={styles.drawerList}>
          <DrawerItemList
            {...props}
            labelStyle={styles.drawerItemLabel}
            activeTintColor="#3b82f6"
            inactiveTintColor="#111111ff"
            activeBackgroundColor="#eff6ff"
            itemStyle={styles.drawerItem}
          />
        </View>

        {/* Spacer to push logout button to bottom */}
        <View style={{ flex: 1 }} />

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </DrawerContentScrollView>

      {/* Bottom Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Version {appVersion}</Text>
        <Text style={styles.footerText}>Developed by TechHike</Text>
      </View>
    </View>
  );
};

export { CustomDrawer as DrawerContent };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    backgroundColor: '#ffffff',
  },
  drawerHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 16,
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    color: '#161616ff',
    textAlign: 'center',
  },
  newBillBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#22c55e',
    padding: 14,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newBillIcon: {
    marginRight: 10,
  },
  newBillText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  drawerList: {
    marginTop: 8,
    paddingHorizontal: 8,
  },
  drawerItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  drawerItemLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: -16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    backgroundColor: '#fef2f2',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
  },
});