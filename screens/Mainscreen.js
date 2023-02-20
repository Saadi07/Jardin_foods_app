import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Card } from "react-native-paper";
import { Button, IconButton } from "react-native-paper";
import SearchBar from "react-native-dynamic-search-bar";
import { useIsFocused } from "@react-navigation/native";
import { openDatabase } from "react-native-sqlite-storage";
import NetInfo from "@react-native-community/netinfo";
const db = openDatabase({ name: "cartDatabase" });

export default function Mainscreen({ navigation }) {
  const [stateChange, setStateChange] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const isFocused = useIsFocused();

  const deleteFunc = (id) => {
    db.transaction(async (txn) => {
      await txn.executeSql(
        "DELETE FROM Invoice where id=?",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected >= 1) {
            console.log("deleted data");
            viewdata();
          }
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  const searchFilterFunction = (text) => {
    // Check if searched text is not blank
    if (text) {
      const newData = filteredDataSource.filter(function (item) {
        const invoiceNo = item.invoice_no
          ? item.invoice_no.toUpperCase()
          : "".toUpperCase();
        const customerName = item.customer_name
          ? item.customer_name.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return (
          invoiceNo.indexOf(textData) > -1 ||
          customerName.indexOf(textData) > -1
        );
      });
      setFilteredDataSource(() => newData);
      setSearch(text);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  const viewdata = async () => {
    // setLoading(false)
    setStateChange(false);
    db.transaction(async (tx) => {
      await tx.executeSql(
        "SELECT * FROM Invoice",
        [],
        (tx, results) => {
          var temp = [];
          for (var i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
            //console.log(results.rows.item(i))
          }
          setMasterDataSource(temp);
          setFilteredDataSource(temp);

          //setData(temp);
          setLoading(false);
        },
        (txObj, error) => {
          //console.log(error);
          setLoading(false);
        }
      );
    });
  };

  useEffect(() => {
    viewdata();
  }, [stateChange, isFocused]);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.screenView}>
          <View style={styles.searchview}>
            <SearchBar
              placeholder="Search here"
              onChangeText={(text) => searchFilterFunction(text)}
              value={search}
            />
          </View>
          <View style={styles.cusview}>
            <FlatList
              data={filteredDataSource}
              keyExtractor={({ id }, index) => id}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        marginTop: 12,
                        marginLeft: 8,
                        color: "black",
                      }}
                    >
                      {" "}
                      {item.invoice_no}
                    </Text>
                    <View style={{ flexDirection: "row-reverse" }}>
                      <IconButton
                        icon="trash-can"
                        mode={"contained-tonal"}
                        color="#cc0000"
                        style={{
                          marginLeft: 0,
                          borderWidth: 1,
                          padding: 3,
                          borderWidth: 0,
                          borderRadius: 0,
                          borderColor: "#333333",
                        }}
                        size={15}
                        onPress={() => deleteFunc(item.id)}
                      >
                        {" "}
                      </IconButton>
                      <IconButton
                        icon="eye"
                        mode={"contained"}
                        color="#8c8c8c"
                        style={{
                          borderWidth: 1,
                          padding: 3,
                          width: 25,
                          borderWidth: 0,
                          borderRadius: 0,
                          borderColor: "#333333",
                        }}
                        size={15}
                        onPress={() => {
                          navigation.navigate("InvoiceDetailScreen", {
                            data1: item,
                          });
                        }}
                      >
                        {" "}
                      </IconButton>
                    </View>
                  </View>

                  <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      padding: 0,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        marginLeft: 8,
                        marginTop: 5,
                        flexShrink: 1,
                        width: 140,
                        color: "black",
                      }}
                    >
                      {item.customer_name}{" "}
                    </Text>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        marginRight: 15,
                        marginLeft: 40,
                      }}
                    >
                      Total: ${item.total}
                    </Text>
                  </View>

                  <View
                    style={{
                      flex: 2,
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{ fontSize: 15, marginLeft: 5, marginBottom: 15 }}
                    >
                      {" "}
                      {item.invoice_date}
                    </Text>
                    <Button
                      mode="contained"
                      color={item.status == "posted" ? "#3c8" : "#cc0000"}
                      style={{
                        borderRadius: 20,
                        width: 120,
                        height: 30,
                        marginRight: 15,
                      }}
                      labelStyle={{ fontSize: 10, color: "white" }}
                    >
                      {item.status == "posted" ? "posted" : "not posted"}
                    </Button>
                  </View>
                </Card>
              )}
            />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    padding: 0,
  },
  cusview: {
    marginTop: 8,
    marginRight: 10,
    marginLeft: 10,
  },
  screenView: {
    marginBottom: 150,
  },
  searchview: {
    height: 60,
    marginBottom: 10,
    justifyContent: "flex-end",
  },
  prodview: {
    marginRight: 15,
    marginLeft: 15,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  card: {
    marginBottom: 10,
    height: 120,
    borderRadius: 8,
    padding: 0,
  },
  text: {
    marginTop: 8,
    marginBottom: 5,
    color: "#3c8",
    fontSize: 14,
    opacity: 0.8,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
  },
  vw: {
    marginLeft: 4,
    flexDirection: "row",
  },
  pr: {
    marginTop: 15,
    textAlign: "right",
  },
  vw2: {
    alignSelf: "flex-end",
    padding: 20,
  },
});
