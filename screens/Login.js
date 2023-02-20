import React, { useState, useEffect } from "react";

import { StatusBar, StyleSheet, View, Image } from "react-native";
import { TextInput } from "react-native-paper";
import { Button } from "react-native-paper";
import Loader from "../components/Loader";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";
import { openDatabase } from "react-native-sqlite-storage";
import AwesomeAlert from "react-native-awesome-alerts";

const db = openDatabase({ name: "cartDatabase" });

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [website, setWebsite] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleLogin = async () => {
    deleteTableSequence();
    createTableSequence();
    try {
      // Show loader
      setLoading(true);
      await fetch("https://smtksa.com/web/session/authenticate", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          params: {
            db: website,
            login: email,
            password: password,
          },
        }),
      }).then(async (response) => {
        const data = await response.json();
        if (data.error) {
          const error = data.error;
          const errorMessage = error.data;
          return Promise.reject(errorMessage.message);
        } else {
          //console.log("response:", data);
          storeSalesPersonData(data.result);
          storeInvoiceSequence(data.result.next_invoice_number);
          const session = response.headers.get("set-cookie");
          console.log(session);
          storeSessionId(session);
          //const sessionId = JSON.stringify(session);

          //CookieManager.setFromResponse("https://smtksa.com/web", session).then(
          // (success) => {
          //   console.log("CookieManager.setFromResponse =>", success);
          // }
          //);
          navigation.navigate("BeginScreen");
        }
      });
    } catch (error) {
      console.error("Error", error);
      setShowAlert(true);
      setAlertMessage(error);
      CookieManager.clearAll().then((success) => {
        console.log("CookieManager.clearAll =>", success);
      });
    } finally {
      setLoading(false);
    }
  };

  const storeInvoiceSequence = async (result) => {
    db.transaction(async (txn) => {
      await txn.executeSql(
        `INSERT INTO InvoiceSequence(invoice_sequence) VALUES (?)`,
        [JSON.stringify(result)],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected >= 1)
            console.log("Sequence added", resultSet);
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  const createTableSequence = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS InvoiceSequence(id INTEGER PRIMARY KEY AUTOINCREMENT, invoice_sequence INTEGER)"
      );
    });
    console.log("created");
  };

  const deleteTableSequence = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql("DROP TABLE InvoiceSequence");
    });
    console.log("deleted");
  };

  const storeSessionId = async (session) => {
    try {
      //console.log("Hello", cust);
      const sessionId = JSON.stringify(session);
      await AsyncStorage.setItem("sessionId", sessionId);
    } catch (e) {
      console.log("Error", e);
    }
  };

  const storeSalesPersonData = async (salesperson) => {
    try {
      //console.log("Hello", cust);
      const jsonValue = JSON.stringify(salesperson);
      await AsyncStorage.setItem("salesPerson", jsonValue);
    } catch (e) {
      console.log("Error", e);
    }
  };

  return (
    <View style={styles.container}>
      <Loader loading={loading} />
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title="Request Failed"
        message={alertMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="Okay"
        confirmButtonColor="#3c8"
        onConfirmPressed={() => {
          setShowAlert(false);
        }}
      />
      <Image
        source={require("../assets/logo.png")}
        style={{
          width: 240,
          height: 160,
          borderRadius: 60,
          alignSelf: "center",
          marginRight: 20 / 2,
        }}
      />
      <StatusBar backgroundColor="#3c8" hidden={false} />
      <TextInput
        style={styles.input}
        label="Database"
        left={<TextInput.Icon name="database" color={"#3c8"} />}
        keyboardType="email-address"
        //selectionColor="red"
        activeUnderlineColor="green"
        underlineColor="green"
        mode="outlined"
        theme={{ colors: { primary: "#3c8" } }}
        onChangeText={(e) => setWebsite(e)}
      />
      <TextInput
        style={styles.input}
        label="Email"
        left={<TextInput.Icon name="email" color={"#3c8"} />}
        keyboardType="email-address"
        //selectionColor="red"
        activeUnderlineColor="green"
        underlineColor="green"
        mode="outlined"
        theme={{ colors: { primary: "#3c8" } }}
        onChangeText={(e) => setEmail(e)}
      />
      <TextInput
        style={styles.input}
        label="Password"
        left={<TextInput.Icon name="lock" color={"#3c8"} />}
        secureTextEntry={passwordVisible}
        right={
          <TextInput.Icon
            name={passwordVisible ? "eye" : "eye-off"}
            onPress={() => setPasswordVisible(!passwordVisible)}
          />
        }
        keyboardType="password"
        underlineColor="red"
        theme={{ colors: { primary: "#3c8" } }}
        mode="outlined"
        onChangeText={(e) => setPassword(e)}
      />
      <View style={{ marginTop: 25 }}>
        <Button
          mode="contained"
          color="#3c8"
          disabled={!(email && password && website)}
          labelStyle={{ color: "white" }}
          onPress={() => handleLogin()}
        >
          Login
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    marginLeft: 15,
    marginRight: 15,
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
