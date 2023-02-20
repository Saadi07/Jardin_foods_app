import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "./Login.js";
import TabScreen from "./TabScreen";
import Product from "./Product";
import Customer from "./Customer";
import Invoice from "./Invoice (11)";
import Begin from "./BeginScreen";
import InvoiceDetails from "./InvoiceDetails";
import PdfScreen from "./PdfScreen.js";
import SamplePrint from "./SamplePrint.js";
import InternalTransfer from "./InternalTransfer";
import Routes from "./SelectRoutes";
import InternalProduct from "./InternalProduct";
import SaveRoutes from "./SaveRoutes";
import InternalTransferDetails from "./InternalTransferDetails.js";

const Stack = createNativeStackNavigator();

const RootStackScreen = ({ navigation }) => (
  <Stack.Navigator initialRouteName="LoginScreen">
    <Stack.Screen
      name="LoginScreen"
      options={{ headerShown: false }}
      component={Login}
    />
    <Stack.Screen
      name="BeginScreen"
      options={{ headerShown: false }}
      component={Begin}
    />
    <Stack.Screen
      name="TabScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        //headerBackVisible: false,
        title: "Invoice",
        headerShown: true,
        headerTintColor: "white",
      }}
      component={TabScreen}
    />
    <Stack.Screen
      name="CustomerScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        title: "Customers",
        headerTintColor: "white",
      }}
      component={Customer}
    />
    <Stack.Screen
      name="ProductScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        title: "Products",
        headerTintColor: "white",
      }}
      component={Product}
    />
    <Stack.Screen
      name="InvoiceScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        title: "Invoice",
        headerTintColor: "white",
      }}
      component={Invoice}
    />
    <Stack.Screen
      name="PdfScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        title: "PDF",
        headerTintColor: "white",
      }}
      component={PdfScreen}
    />
    <Stack.Screen
      name="InvoiceDetailScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        title: "Invoice Details",
        headerTintColor: "white",
      }}
      component={InvoiceDetails}
    />
    <Stack.Screen
      name="samplePrint"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        title: "Test Print",
        headerTintColor: "white",
      }}
      component={SamplePrint}
    />
    <Stack.Screen
      name="InternalTransferScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        headerBackVisible: true,
        title: "Internal Transfer",
        headerShown: true,
        headerTintColor: "white",
      }}
      component={InternalTransfer}
    />
    <Stack.Screen
      name="routes"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        headerBackVisible: true,
        title: "Warehouses",
        headerShown: true,
        headerTintColor: "white",
      }}
      component={Routes}
    />
    <Stack.Screen
      name="InternalProductScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        headerBackVisible: true,
        title: "Products",
        headerShown: true,
        headerTintColor: "white",
      }}
      component={InternalProduct}
    />
    <Stack.Screen
      name="SaveRoutesScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        headerBackVisible: true,
        title: "Save Routes",
        headerShown: true,
        headerTintColor: "white",
      }}
      component={SaveRoutes}
    />
    <Stack.Screen
      name="InternalTransferDetailScreen"
      options={{
        headerStyle: { backgroundColor: "#3c8", height: 70 },
        headerBackVisible: true,
        title: "Save Routes",
        headerShown: true,
        headerTintColor: "white",
      }}
      component={InternalTransferDetails}
    />
  </Stack.Navigator>
);

export default RootStackScreen;
