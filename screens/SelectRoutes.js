import React, { useEffect, useState } from "react";
import { StyleSheet, Text, Image, View } from "react-native";
import { Button, IconButton } from "react-native-paper";
import DropDownPicker from "react-native-dropdown-picker";
import { openDatabase } from "react-native-sqlite-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-virtualized-view";
const db = openDatabase({ name: "cartDatabase" });
export default function Routes({ navigation }) {
  const [items, setItems] = useState([]);
  const [value, setValue] = useState();
  const [open, setOpen] = useState(false);
  const [valueTo, setValueTo] = useState("");
  const [openTo, setOpenTo] = useState(false);

  React.useLayoutEffect(() => {
    if (value && valueTo) {
      navigation.setOptions({
        headerRight: () => (
          <>
            <IconButton
              icon="arrow-right"
              mode={"contained"}
              color="white"
              style={{ marginRight: 10 }}
              size={25}
              onPress={() =>
                navigation.navigate("InternalProductScreen", { data: "yes" })
              }
            >
              {" "}
            </IconButton>
          </>
        ),
      });
    }
  }, [navigation, value, valueTo]);

  const viewdata = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        "SELECT * FROM Routes",
        [],
        (tx, results) => {
          var temp = [];
          for (var i = 0; i < results.rows.length; i++) {
            temp.push(results.rows.item(i));
          }
          setItems(temp);
          //console.log('hh')
          // setLoading(false);
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

  const setFrom = async (value) => {
    console.log(value);
    await AsyncStorage.setItem("fromRoute", JSON.stringify(value));
    //console.log(await AsyncStorage.getItem("fromRoute"))
  };
  const setTo = async (value) => {
    console.log(value);
    await AsyncStorage.setItem("toRoute", JSON.stringify(value));
    //console.log(await AsyncStorage.getItem("toRoute"))
  };
  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      <View style={styles.view}>
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
        <Text style={{ marginLeft: 30 }}> FROM:</Text>
        <DropDownPicker
          open={open}
          placeholder="Select Warehouse"
          searchPlaceholder="Search..."
          value={value}
          items={items}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setItems}
          showTickIcon={true}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
          searchable={true}
          textStyle={{ color: "grey" }}
          style={{
            width: 300,
            marginLeft: 30,
            // alignSelf: "center",
            backgroundColor: "#f2f2f2",
            borderWidth: 1,
            marginTop: 10,
            height: 60,
          }}
          dropDownContainerStyle={{ marginLeft: 30 }}
          containerStyle={{ width: 300, marginBottom: 55, padding: 0 }}
          selectedItemContainerStyle={{
            backgroundColor: "#d9d9d9",
          }}
          onSelectItem={(value) => setFrom(value)}
        />
        <Text style={{ marginLeft: 30 }}> To:</Text>
        {open == true ? (
          <Text> </Text>
        ) : (
          <DropDownPicker
            open={openTo}
            placeholder="Select Warehouse"
            searchPlaceholder="Search..."
            value={valueTo}
            items={items}
            searchable={true}
            setOpen={setOpenTo}
            setValue={setValueTo}
            istMode="SCROLLVIEW"
            setItems={setItems}
            showTickIcon={true}
            textStyle={{ color: "grey" }}
            listMode="SCROLLVIEW"
            scrollViewProps={{
              nestedScrollEnabled: true,
            }}
            style={{
              width: 300,
              marginLeft: 30,
              // alignSelf: "center",
              backgroundColor: "#f2f2f2",
              borderWidth: 1,
              marginTop: 10,
              height: 60,
            }}
            dropDownContainerStyle={{ marginLeft: 30 }}
            containerStyle={{ width: 300, marginBottom: 55, padding: 0 }}
            selectedItemContainerStyle={{
              backgroundColor: "#d9d9d9",
            }}
            onSelectItem={(value) => setTo(value)}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 20,
  },
  view: {
    marginTop: 20,
    marginBottom: 180,
  },
});
