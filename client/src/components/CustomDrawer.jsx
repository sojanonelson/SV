import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import logo from '../../assets/icon.png';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const appVersion = Constants.expoConfig.extra.APP_VERSION;

const CustomDrawer = (props) => {
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('userId');
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Image source={logo} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.appName}>SV Billing</Text>
            <Text style={styles.appSubtitle}>Business Management</Text>
          </View>
        </View>

        {/* New Bill Button */}
        <TouchableOpacity style={styles.newBillButton} onPress={handleNewBill}>
          <View style={styles.newBillButtonContent}>
           
            <Ionicons name="add-circle" size={22} color="#fff" style={styles.newBillIcon} />
            <Text style={styles.newBillButtonText}>Create New Bill</Text>
          </View>
        </TouchableOpacity>

        {/* Navigation Items */}
        <View style={styles.menuContainer}>
          <DrawerItemList
            {...props}
            labelStyle={styles.menuItemLabel}
            activeTintColor="#4f46e5"
            inactiveTintColor="#000000ff"
            activeBackgroundColor="#eef2ff"
            itemStyle={styles.menuItem}
          />
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
        

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutButtonContent}>
              <Feather name="log-out" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version {appVersion}</Text>
        <Text style={styles.developerText}>Developed by TechHike</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerContainer: {
    padding: 25,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000ff',
    marginBottom: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  newBillButton: {
    backgroundColor: '#4f46e5',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 25,
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  newBillButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newBillButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  menuContainer: {
    marginTop: 5,
    paddingHorizontal: 10,
  },
  menuItem: {
    borderRadius: 10,
    marginVertical: 2,
     color: '#000000ff',
    paddingLeft: 10,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: '500',
     color: '#000000ff',
    marginLeft: -10,
  },
  bottomSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  supportButton: {
    marginBottom: 15,
  },
  supportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  supportButtonText: {
    fontSize: 15,
    color: '#4b5563',
    fontWeight: '500',
    marginLeft: 12,
  },
  logoutButton: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  logoutButtonText: {
    fontSize: 15,
    color: '#ef4444',
    fontWeight: '500',
    marginLeft: 12,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  developerText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});

export { CustomDrawer as DrawerContent };