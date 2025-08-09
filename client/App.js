import React from "react";
import { StatusBar, View } from "react-native";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from "react-native-safe-area-context";

import LoginScreen from "./src/screens/LoginScreen";
import BillingHistoryScreen from "./src/screens/BillingHistoryScreen";
import CompanyForm from "./src/screens/CompanyScreen";
import NewBillForm from "./src/screens/NewBillForm";
import ProfessionalInvoice from "./src/screens/InvoicePrint";
import { DrawerContent } from "./src/components/CustomDrawer";
import PartyForm from "./src/screens/Party/PartyForm";
import PartyList from "./src/screens/Party/PartyList";
import Settings from "./src/screens/Settings";
import Dashboard from "./src/screens/Dashboard";
import ProductList from "./src/screens/Product/ProductList";
import ProductEdit from "./src/screens/Product/ProductEdit";
import ProductForm from "./src/screens/Product/ProductForm";
import PartyInvoices from "./src/screens/Party/SinglePartyInvoice";
import PartyEdit from "./src/screens/Party/PartyEdit";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

// Optional: Dark theme for NavigationContainer
const MyDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#121212",
    card: "#1e1e1e",
    text: "#ffffff",
    border: "#333",
  },
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#1e1e1e",
        drawerInactiveTintColor: "#1e1e1e",
        drawerStyle: {
          backgroundColor: "#1e1e1e",
        },
      }}
    >
      <Drawer.Screen name="Home" component={Dashboard} />
      <Drawer.Screen name="New Bill" component={NewBillForm} />
      <Drawer.Screen name="Billing History" component={BillingHistoryScreen} />
      <Drawer.Screen name="Party List" component={PartyList} />
      <Drawer.Screen name="Product List" component={ProductList} />
      <Drawer.Screen name="Settings" component={Settings} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      {/* 🌑 StatusBar Dark Theme */}
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* 🌑 Navigation with Dark Theme */}
      <NavigationContainer theme={MyDarkTheme}>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#121212" },
          }}
        >
          <Stack.Screen name="Company" component={CompanyForm} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Main" component={DrawerNavigator} />
          <Stack.Screen name="InvoiceDetail" component={ProfessionalInvoice} />
          <Stack.Screen name="Party Form" component={PartyForm} />
          <Stack.Screen name="Product Edit" component={ProductEdit} />
            <Stack.Screen name="EditParty" component={PartyEdit} />
          <Stack.Screen name="Product Form" component={ProductForm} />
           <Stack.Screen name="Party Invoice" component={PartyInvoices} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
