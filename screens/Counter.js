import React,{useEffect} from "react";

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { IconButton } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "./screens/Login.js";
import Tabnav from "./screens/Tabnav.js";
import Product from "./screens/Product";
import Home from "./screens/Home";
import Invoice from "./screens/Invoice.js";
import { openDatabase } from 'react-native-sqlite-storage';
import NetInfo from "@react-native-community/netinfo";
import PdfScreen from './screens/PdfScreen';
import Counter from './screens/Counter';
import Begin from './screens/Begin';
import InvoiceDetails from "./screens/InvoiceDetails.js";
import Mainscreen from "./screens/Mainscreen";
const db = openDatabase({ name: 'cartDatabase' });
export default function App({ navigation }) {
 
  const Stack = createNativeStackNavigator();
  return (
    <View style={styles.container}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="LoginScreen">
          <Stack.Screen
            name="LoginScreen"
            options={{ headerShown: false }}
            component={Login}
          />
          <Stack.Screen
            name="CounterScreen"
            options={{ headerShown: false }}
            component={Counter}
          />
          <Stack.Screen
            name="Tab"
            options={{
              headerStyle: { backgroundColor: "#3c8", height: 70 },
              headerBackVisible: false,
              title: "Invoice",
              headerShown: true,
              headerTintColor:'white'
            }}
            component={Tabnav}
          />
          <Stack.Screen
            name="CustomerScreen"
            options={{
              headerStyle: { backgroundColor: "#3c8", height: 70 },
              title: "Customers",
              headerTintColor:'white'
            }}
            component={Home}
          />
           <Stack.Screen
            name="invoiceDetails"
            options={{
              headerStyle: { backgroundColor: "#3c8", height: 70 },
              title: "Invoice Details",
              headerTintColor:'white'
            }}
            component={InvoiceDetails}
          />
          <Stack.Screen
            name="ProductScreen"
            options={{
              headerStyle: { backgroundColor: "#3c8", height: 70 },
              title: "Products",
              headerTintColor:'white'
            }}
            component={Product}
          />
          <Stack.Screen
            name="InvoiceScreen"
            options={{
              headerStyle: { backgroundColor: "#3c8", height: 70 },
              title: "Invoice",
              headerTintColor:'white'
            }}
            component={Invoice}
          />
           <Stack.Screen
            name="PdfScreen"
            options={{
              headerStyle: { backgroundColor: "#3c8", height: 70 },
              title: "PDF",
              headerTintColor:'white'
            }}
            component={PdfScreen}
          />
           <Stack.Screen
                name="main"
                component={Mainscreen}
                options={{ headerShown: false }}
              />
           <Stack.Screen
            name="begin"
            options={{ headerShown: false }}
            component={Begin}
          />
        </Stack.Navigator>
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
