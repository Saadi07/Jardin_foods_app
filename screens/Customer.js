import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import SearchBar from "react-native-dynamic-search-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { openDatabase } from "react-native-sqlite-storage";
const db = openDatabase({ name: "cartDatabase" });

const Home = ({ navigation }) => {
  const [isLoading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredDataSource, setFilteredDataSource] = useState([]);
  const [masterDataSource, setMasterDataSource] = useState([]);
  const [isOffline, setOfflineStatus] = useState(false);

  const viewdata = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        "SELECT * FROM Customer",
        [],
        (tx, results) => {
          var temp = [];
          //console.log(results.rows.item(0));
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

  useEffect(() => {
    viewdata();
  }, []);

  const searchFilterFunction = (text) => {
    // Check if searched text is not blank
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        const name = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const customerNo = item.customer_no
          ? item.customer_no.toUpperCase()
          : "".toUpperCase();
        const textData = text.toUpperCase();
        return name.indexOf(textData) > -1 || customerNo.indexOf(textData) > -1;
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

  //Storing Customer data in async storage
  const storeCustomerData = async (cust) => {
    try {
      // console.log("Hello", cust);
      const jsonValue = JSON.stringify(cust);
      await AsyncStorage.setItem("custDetails", jsonValue);
      const getit = await AsyncStorage.getItem("custDetails");
      //console.log(cust);
      // Remember to remove customer from async storage after invoice creation
      navigation.navigate("ProductScreen", { data: "yes" });
    } catch (e) {
      // saving error

      console.log("Error", e);
    }
  };
  return (
    <View style={styles.container}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View>
          <View style={styles.searchview}>
            <SearchBar
              placeholder="Search here"
              onChangeText={(text) => searchFilterFunction(text)}
              value={search}
              onClearPress={onClearfunc}
            />
          </View>
          <View style={styles.cusview}>
            <FlatList
              data={filteredDataSource}
              keyExtractor={({ id }, index) => id}
              renderItem={({ item }) => (
                <>
                  <TouchableOpacity
                    //onPress={() => actionOnRow(item)}
                    onPress={() => storeCustomerData(item)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        padding: 10,
                        marginBottom: 10,
                        borderRadius: 10,
                        backgroundColor: "white",
                      }}
                    >
                      <Image
                        source={require("../assets/customer2.png")}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 60,
                          marginRight: 20 / 2,
                        }}
                      />
                      <View>
                        <View>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "700",
                              color: "black",
                            }}
                          >
                            {item.name}
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: 16,
                              opacity: 0.7,
                              color: "black",
                            }}
                          >
                            ({item.customer_no})
                          </Text>
                        </View>
                        <View>
                          <Text
                            style={{
                              fontSize: 14,
                              opacity: 0.8,
                              color: "#3c8",
                            }}
                          >
                            {item.street}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default Home;
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
