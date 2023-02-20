import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { openDatabase } from "react-native-sqlite-storage";
const db = openDatabase({ name: "cartDatabase" });

const SaveRoute = ({ navigation, route }) => {
  const [isLoading, setLoading] = useState(true);

  const [toRouteName, setToRouteName] = useState();
  const [fromRouteName, setFromRouteName] = useState();
  const [toRouteId, setToRouteId] = useState();
  const [fromRouteId, setFromRouteId] = useState();
  const date = new Date().toDateString();

  var arrays = route.params;
  const transferData = arrays.salesArray;

  var toId = 0;
  var fromId = 0;
  var toName = "";
  var fromName = "";

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon="arrow-right"
            mode={"contained"}
            color="white"
            style={{ marginRight: 10 }}
            size={25}
            onPress={() => handleSaveRoute()}
          >
            {" "}
          </IconButton>
        </>
      ),
    });
  }, [navigation]);

  const handleSaveRoute = async () => {
    //deletetable();
    createTable();
    adddata();
    navigation.navigate("InternalTransferScreen");
  };

  const getWarehouseRoutes = async () => {
    const toRoute = await AsyncStorage.getItem("toRoute");
    const toRouteData = JSON.parse(toRoute);
    toId = toRouteData.id;
    toName = toRouteData.value;
    setToRouteName(toRouteData.value);
    setToRouteId(toRouteData.id);
    const fromRoute = await AsyncStorage.getItem("fromRoute");
    const fromRouteData = JSON.parse(fromRoute);
    fromId = fromRouteData.id;
    fromName = fromRouteData.value;
    setFromRouteName(fromRouteData.value);
    setFromRouteId(fromRouteData.id);
  };

  const createTable = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Transfer(id INTEGER PRIMARY KEY AUTOINCREMENT, to_id INTEGER, from_id INTEGER, to_name TEXT, from_name TEXT, products TEXT, status TEXT, date TEXT)"
      );
    });
  };

  const deletetable = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql("DROP TABLE Transfer");
    });
  };

  const adddata = async () => {
    console.log(date);
    console.log("to", toId);
    console.log("from", fromId);
    console.log("products", JSON.stringify(transferData));
    db.transaction(async (txn) => {
      await txn.executeSql(
        `INSERT INTO Transfer(to_id,from_id,to_name,from_name, products, status, date) VALUES (?,?,?,?,?,?,?)`,
        [
          toId,
          fromId,
          toName,
          fromName,
          JSON.stringify(transferData),
          "notposted",
          date,
        ],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected >= 1)
            //console.log('added data')
            console.log(resultSet);
        },
        (txObj, error) => {
          console.log("Error1", error);
        }
      );
    });
  };

  useEffect(() => {
    getWarehouseRoutes();
  }, [transferData]);

  return (
    <View style={styles.container}>
      <View>
        <View style={styles.cusview}>
          <View>
            <Text
              style={{
                marginTop: 10,
                marginBottom: 20,
                fontSize: 15,
                fontWeight: "bold",
              }}
            >
              {" "}
              TO: <Text style={{ fontWeight: "normal" }}> {toRouteName} </Text>
              {"        "}
              From:{" "}
              <Text style={{ fontWeight: "normal" }}> {fromRouteName} </Text>
            </Text>
          </View>
          <FlatList
            data={transferData}
            keyExtractor={({ id }, index) => id}
            renderItem={({ item }) => (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 10,
                    backgroundColor: "white",
                  }}
                >
                  <View>
                    <View>
                      <Text style={{ fontSize: 16, fontWeight: "700" }}>
                        {item.name}
                      </Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: 14, opacity: 0.7 }}>
                        {item.item_no}
                      </Text>
                    </View>
                    <View>
                      <Text
                        style={{
                          fontSize: 18,
                          color: "#4d4d4d",
                          opacity: 0.7,
                          marginLeft: 235,
                        }}
                      >
                        Quantity: {item.quantity}
                      </Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          />
        </View>
      </View>
    </View>
  );
};

export default SaveRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    padding: 0,
  },
  searchview: {
    height: 60,
    marginBottom: 10,
    justifyContent: "flex-end",
  },
  cusview: {
    marginTop: 8,
    marginRight: 15,
    marginLeft: 15,
  },
});
