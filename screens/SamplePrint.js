import React, { useEffect, useState } from "react";

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  Alert,
  TouchableOpacity,
  View,
} from "react-native";
import {
  USBPrinter,
  NetPrinter,
  BLEPrinter,
} from "react-native-thermal-receipt-printer";
import { Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function SamplePrint({ navigation }) {
  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState();
  useEffect(() => {
    if (Platform.OS == "android") {
      BLEPrinter.init().then(() => {
        BLEPrinter.getDeviceList().then(setPrinters, (error) => alert(error));
      });
    }
    closeConnection();
  }, []);

  const _connectPrinter = async (printer) => {
    //connect printerssss
    const data = BLEPrinter.connectPrinter(printer.inner_mac_address).then(
      await AsyncStorage.setItem("bluetooth", printer.inner_mac_address),
      (error) => alert("unable to connect to this device")
    );
    console.log(currentPrinter);
  };

  const closeConnection = () => {
    //connect printer
    BLEPrinter.closeConn("");
  };

  const printTextTest = () => {
    BLEPrinter.printText(
      "Z{PRINT, STOP 950:@0,0:MF204|INVOICE# 227001|@30,2:BC39N,HIGH 10,WIDE 2|227001|@100,0:MF204|ROUTE# 22711/08/01 08:35|@150,0:MF204|Food City #3212|@175,0:MF204|1500 E Lincoln Way|@200,0:MF204|Hamilton OH|@225,0:MF204|TAX ID#A32102|@800,0:MF204|Thank You For Your Business|}{LP}"
    );
    BLEPrinter.printText(
      "{PRINT, STOP 950:@0,0:MF204|INVOICE# 227001|@150,0:MF204| Food City #3212|}"
    );
    BLEPrinter.printText("@175,0:MF204| 1500 E Lincoln Way|");
    BLEPrinter.printText(
      "[ESC]EZ{PRINT,QUANTITY2:@160,0:MF107,VMULT 3,HMULT 3|FORMAT TEST|@260,0:MF107|09/03/03 01:52 PM |@360,0:MF185|Ticket #:|@360,0:MF107| TT-123456789|@385,0:MF185|Permit:|@385,0:MF107| AB-1234567|}"
    );
  };

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 10, fontSize: 20 }}>
        {" "}
        Available devices{" "}
      </Text>
      {printers.map((printer) => (
        <TouchableOpacity
          style={{
            borderBottomWidth: 1,
            marginBottom: 8,
            backgroundColor: "#FFFFFF",
            height: 30,
            borderBottomColor: "#f8f8f8",
          }}
          onPress={() => _connectPrinter(printer)}
        >
          <Text style={{ marginTop: 3, marginLeft: 3 }}>
            {` ${printer.device_name} `}{" "}
            {currentPrinter && printer.device_name == currentPrinter.device_name
              ? "(connected)"
              : " "}{" "}
          </Text>
        </TouchableOpacity>
      ))}

      <Button
        mode="contained"
        color="#3c8"
        labelStyle={{ color: "white" }}
        style={{ marginTop: 20 }}
        onPress={() => printTextTest()}
      >
        Print sample test
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 20,
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
