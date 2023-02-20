import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import SearchBar from "react-native-dynamic-search-bar";
import NumericInput from "react-native-numeric-input";
import { Card, Button, Icon, IconButton } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ModalDropdown from "react-native-modal-dropdown";

import { openDatabase } from "react-native-sqlite-storage";

const db = openDatabase({ name: "cartDatabase" });

let returnArray = [];
let sampleArray = [];
let salesArray = [];
export default function Product({ navigation, route }) {
  const [isLoading, setLoading] = useState(true);
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState(0);
  const [returnOption, setReturnOption] = useState(0);
  const [arrayCheck, setArrayCheck] = useState("");
  //const [arrayCheck, setArrayCheck] = useState("");
  const date = new Date();

  if (arrayCheck == "yes") {
    salesArray = [];
    setArrayCheck("no");
    // returnArray = [];
    // sampleArray = [];
  }

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
            onPress={() => handleProceed()}
          >
            {" "}
          </IconButton>
        </>
      ),
    });
  }, [navigation]);

  const handleProceed = async () => {
    navigation.navigate("SaveRoutesScreen", {
      salesArray,
    });
  };

  const viewdata = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        "SELECT * FROM Product",
        [],
        (tx, results) => {
          var temp = [];

          setMasterDataSource(JSON.parse(results.rows.item(0).data));
          setFilteredDataSource(JSON.parse(results.rows.item(0).data));
          setLoading(false);
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  async function handleQuantity(qty, prod) {
    console.log("Qty:", qty);
    if (menu == 0) {
      let checkProd = salesArray.find((product) => product.id == prod.id);
      if (!checkProd) {
        prod["quantity"] = qty;
        salesArray.push(prod);
      }
      if (checkProd) {
        prod["quantity"] = qty;
        checkProd["quantity"] = prod.quantity;
      }
    }
  }

  const searchFilterFunction = (text) => {
    /// setArrayCheck("no");
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        const name = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const itemNo = item.item_no
          ? item.item_no.toUpperCase()
          : "".toUpperCase();
        const barcode = item.barcodes;
        if (barcode) {
          let barcodeStr = barcode.join("");
          const textData = text.toUpperCase();
          return (
            name.indexOf(textData) > -1 ||
            itemNo.indexOf(textData) > -1 ||
            barcodeStr.indexOf(textData) > -1
          );
        }
        const textData = text.toUpperCase();
        return name.indexOf(textData) > -1 || itemNo.indexOf(textData) > -1;
      });
      setFilteredDataSource(newData);
      setSearch(text);
    } else {
      setFilteredDataSource(masterDataSource);
      setSearch(text);
    }
  };

  const onClearfunc = () => {
    setFilteredDataSource(masterDataSource);
  };

  useEffect(() => {
    const data1 = route.params;
    setArrayCheck(data1.data);
    viewdata();
  }, []);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View style={styles.paragraph}>
          <View style={styles.searchview}>
            <SearchBar
              placeholder="Search here"
              onChangeText={(text) => searchFilterFunction(text)}
              value={search}
              autoFocus={true}
              onClearPress={onClearfunc}
            />
          </View>
          <View style={styles.prodview}>
            <FlatList
              data={filteredDataSource}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.no}> ({item.item_no}) </Text>
                  <NumericInput
                    minValue={0}
                    initValue={item.sale_qty}
                    onLimitReached={() => {
                      item["quantity"] = 0;
                      let remainingArr = salesArray.filter(
                        (product) => product.id != item.id
                      );
                      salesArray = remainingArr;
                      console.log("REM: ", remainingArr);

                      console.log("Product Array: ", salesArray);
                    }}
                    value={0}
                    //svalue={item.sale_qty}

                    valueType="integer"
                    iconStyle={{ color: "white" }}
                    containerStyle={{
                      backgroundColor: "white",
                      marginTop: 8,
                    }}
                    rightButtonBackgroundColor="#3c8"
                    leftButtonBackgroundColor="#3c8"
                    totalWidth={140}
                    totalHeight={35}
                    onChange={(e) => {
                      //console.log('l')
                      handleQuantity(e, item);
                    }}
                  />
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
  searchview: {
    height: 60,
    marginBottom: 10,
    justifyContent: "flex-end",
  },
  prodview: {
    marginTop: 8,
    marginRight: 15,
    marginLeft: 15,
  },
  paragraph: {
    // marginBottom: 310,
  },
  card: {
    marginBottom: 10,
    height: 90,
    borderRadius: 10,
    padding: 4,
  },
  text: {
    marginTop: 3,
    marginBottom: 5,
    color: "#3c8",
    fontSize: 14,
    fontWeight: "600",
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
  },
  no: {
    fontSize: 14,
    color: "#3c8",
  },
});
