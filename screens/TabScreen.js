import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Button } from "react-native-paper";
import Mainscreen from "./Mainscreen";

export default function Tabnav({ navigation }) {
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            height: 45,
            marginLeft: 10,
            marginRight: 10,
          },
          tabBarShowLabel: false,
          headerShown: false,
          headerTitle: false,
        }}
      >
        <Tab.Screen
          name="Invoice"
          listeners={({ navigation, route }) => ({
            tabPress: (e) => {},
          })}
          options={{
            tabBarIcon: () => (
              <Button
                mode="contained"
                icon="plus"
                color="#3c8"
                labelStyle={{ fontSize: 16, color: "white" }}
                style={{ height: 45, alignSelf: "stretch" }}
                onPress={() => navigation.navigate("CustomerScreen")}
              >
                Create New
              </Button>
            ),
          }}
        >
          {() => (
            <Stack.Navigator>
              <Stack.Screen
                name="main"
                component={Mainscreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 4,
    marginBottom: 10,
  },
});
