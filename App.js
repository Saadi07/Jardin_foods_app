import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";

import { StatusBar, StyleSheet, View, Button, LogBox } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CookieManager from "@react-native-cookies/cookies";

import Product from "./screens/Product";
import Customer from "./screens/Customer";
import Invoice from "./screens/Invoice (11)";
import RootStack from "./screens/RootStack";
import Login from "./screens/Login.js";
import InvoiceDetails from "./screens/InvoiceDetails";
import BeginScreen from "./screens/BeginScreen";
import TabScreen from "./screens/TabScreen";
import PdfScreen from "./screens/PdfScreen";
import SamplePrint from "./screens/SamplePrint";
import InternalTransfer from "./screens/InternalTransfer";
import Routes from "./screens/SelectRoutes";
import InternalProduct from "./screens/InternalProduct";
import SaveRoutes from "./screens/SaveRoutes";
import InternalTransferDetails from "./screens/InternalTransferDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { openDatabase } from "react-native-sqlite-storage";
const db = openDatabase({ name: "cartDatabase" });
LogBox.ignoreAllLogs();

export default function App({ naviagtaion }) {
  const Stack = createNativeStackNavigator();
  const [sessionId, setSessionId] = useState(null);

  const getSessionInfo = async () => {
    const getSession = await AsyncStorage.getItem("sessionId");
    const sessionId = JSON.parse(getSession);
    console.log("here", sessionId);
    //CookieManager.get("https://smtksa.com").then((cookies) => {
    //console.log("idddddd", cookies.session_id);
    if (sessionId) {
      console.log("idddddd", sessionId);
      setSessionId(() => sessionId);
    }
  };

  useEffect(() => {
    //createTableSequence();
    getSessionInfo();
    //});
  }, []);

  return (
    <View style={styles.container}>
      <NavigationContainer>
        {sessionId !== null ? (
          <Stack.Navigator initialRouteName="BeginScreen">
            <Stack.Screen
              name="LoginScreen"
              options={{ headerShown: false }}
              component={Login}
            />
            <Stack.Screen
              name="BeginScreen"
              options={{ headerShown: false }}
              component={BeginScreen}
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
        ) : (
          <RootStack />
        )}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderColor: "#3c8",
  },
});
