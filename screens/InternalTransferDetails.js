import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  StyleSheet,
} from "react-native";

import { openDatabase } from "react-native-sqlite-storage";
const db = openDatabase({ name: "cartDatabase" });

const InternalTransferDetails = ({ navigation, route }) => {
  var data = route.params;
  const dataArray = data.data1;
  const transferData = JSON.parse(dataArray.products);
  //console.log(arrays);

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
              TO:{" "}
              <Text style={{ fontWeight: "normal" }}>{dataArray.to_name} </Text>
              {"        "}
              From:{" "}
              <Text style={{ fontWeight: "normal" }}>
                {dataArray.from_name}{" "}
              </Text>
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

export default InternalTransferDetails;

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
