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
  const date = new Date();

  if (arrayCheck == "yes") {
    salesArray = [];
    returnArray = [];
    sampleArray = [];
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
    navigation.navigate("InvoiceScreen", {
      salesArray,
      returnArray,
      sampleArray,
      data: "yes",
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

  const computeUnitPrices = async (product, linkCheck) => {
    const cust = await AsyncStorage.getItem("custDetails");
    const customer = JSON.parse(cust);
    const specialProduct = customer.special_products;
    let specialProdCheck = true;
    if (specialProduct.length !== 0) {
      for (const sProduct of specialProduct) {
        if (product.id === sProduct.product.id) {
          //console.log("Special: ", product);
          if (sProduct.type_check == "actual") {
            specialProdCheck = false;
            finalPrice = sProduct.price_unit * product.uom_ratio;
            product["lst_price"] = Math.round(finalPrice * 100) / 100;
          } else {
            let percentage = sProduct.price_unit;
            specialProdCheck = false;
            let check_price = true;
            let defaultAb = await defaultAbPriclist(product);
            let independent = await independentPriclist(product);
            // console.log("Inde", independent);
            // console.log(defaultAb);
            if (defaultAb) {
              for (i = 0; i < defaultAb.rows.length; i++) {
                let lstProduct = defaultAb.rows.item(i);
                if (
                  (date > lstProduct.date_start &&
                    date < lstProduct.date_end) ||
                  lstProduct.date_start == "0"
                ) {
                  let finalPrice =
                    (lstProduct.fixed_price -
                      (lstProduct.fixed_price * percentage) / 100) *
                    product.uom_ratio;
                  // console.log("here", finalPrice);
                  product["lst_price"] = Math.round(finalPrice * 100) / 100;
                  // if (linkCheck == 0) {
                  // productArray.push(product);
                  // }
                  check_price = false;
                }
              }
            }
            if (check_price) {
              if (independent) {
                for (let i = 0; i < independent.rows.length; i++) {
                  let lstProduct = independent.rows.item(i);
                  if (
                    (date > lstProduct.date_start &&
                      date < lstProduct.date_end) ||
                    lstProduct.date_start == "0"
                  ) {
                    let finalPrice =
                      (lstProduct.fixed_price -
                        (lstProduct.fixed_price * percentage) / 100) *
                      product.uom_ratio;
                    //console.log("independent", finalPrice);
                    product["lst_price"] = Math.round(finalPrice * 100) / 100;
                    //  if (linkCheck == 0) {
                    //  productArray.push(product);
                    // }
                    //console.log(product);
                    check_price = false;
                  }
                }
              }
            }
          }
        }
      }
    }
    let check_price = true;
    if (specialProdCheck) {
      if (customer.pricelist.contract_price && check_price) {
        if (customer.pricelist.contract_pricelist.id) {
          const result = await contractPricelist(customer, product);
          if (result) {
            //console.log("Contract.......");
            for (let i = 0; i < result.rows.length; i++) {
              let lstProduct = result.rows.item(i);
              s;
              if (
                (date > lstProduct.date_start && date < lstProduct.date_end) ||
                lstProduct.date_start == "0"
              ) {
                let finalPrice = lstProduct.fixed_price * product.uom_ratio;
                product["lst_price"] = Math.round(finalPrice * 100) / 100;
                // if (linkCheck == 0) {
                //  productArray.push(product);
                // }
                check_price = false;
              }
            }
          }
        }
      }
      if (customer.pricelist.group_special.id && check_price) {
        const result = await groupSpecialPricelist(customer, product);
        //console.log("Group1: ", result);
        if (result) {
          for (let i = 0; i < result.rows.length; i++) {
            let lstProduct = result.rows.item(i);
            //console.log(lstProduct.compute_price);
            if (lstProduct.compute_price == "percentage") {
              let percentage = lstProduct.percent_price;
              //console.log("herr", percentage);
              let check_pricelist = true;
              let defaultAb = await defaultAbPriclist(product);
              let independent = await independentPriclist(product);
              if (defaultAb) {
                for (i = 0; i < defaultAb.rows.length; i++) {
                  let lstProduct = defaultAb.rows.item(i);
                  if (
                    (date > lstProduct.date_start &&
                      date < lstProduct.date_end) ||
                    lstProduct.date_start == "0"
                  ) {
                    // console.log(percentage);
                    let finalPrice =
                      (lstProduct.fixed_price -
                        (lstProduct.fixed_price * percentage) / 100) *
                      product.uom_ratio;
                    //console.log("here", finalPrice);
                    product["lst_price"] = Math.round(finalPrice * 100) / 100;
                    console.log(product["lst_price"]);
                    // if (linkCheck == 0) {
                    // productArray.push(product);
                    // }
                    check_pricelist = false;
                  }
                }
              }
              if (check_pricelist) {
                if (independent) {
                  for (let i = 0; i < independent.rows.length; i++) {
                    let lstProduct = independent.rows.item(i);
                    if (
                      (date > lstProduct.date_start &&
                        date < lstProduct.date_end) ||
                      lstProduct.date_start == "0"
                    ) {
                      let finalPrice =
                        (lstProduct.fixed_price -
                          (lstProduct.fixed_price * percentage) / 100) *
                        product.uom_ratio;
                      //console.log("independent", finalPrice);
                      product["lst_price"] = Math.round(finalPrice * 100) / 100;
                      // if (linkCheck == 0) {
                      // productArray.push(product);
                      // }
                      check_pricelist = false;
                    }
                  }
                }
              }
              check_price = false;
            } else {
              if (
                (date > lstProduct.date_start && date < lstProduct.date_end) ||
                lstProduct.date_start == "0"
              ) {
                let finalPrice = lstProduct.fixed_price * product.uom_ratio;
                product["lst_price"] = Math.round(finalPrice * 100) / 100;
                // if (linkCheck == 0) {
                // productArray.push(product);
                // }
                check_price = false;
              }
            }
          }
        }
      }
      if (customer.pricelist.global_price.id && check_price) {
        const result = await globalPricelist(customer, product);
        if (result) {
          //console.log("Global.......");
          for (let i = 0; i < result.rows.length; i++) {
            let lstProduct = result.rows.item(i);
            if (
              (date > lstProduct.date_start && date < lstProduct.date_end) ||
              lstProduct.date_start == "0"
            ) {
              let finalPrice = lstProduct.fixed_price * product.uom_ratio;
              product["lst_price"] = Math.round(finalPrice * 100) / 100;
              //  if (linkCheck == 0) {
              //  productArray.push(product);
              // }
              check_price = false;
            }
          }
        }
      }

      if (customer.pricelist.customer_pricing_sch.id && check_price) {
        const result = await SchedulePricelist(customer, product);
        if (result) {
          //console.log("Sch Pricing");
          for (let i = 0; i < result.rows.length; i++) {
            let lstProduct = result.rows.item(i);
            if (
              (date > lstProduct.date_start && date < lstProduct.date_end) ||
              lstProduct.date_start == "0"
            ) {
              console.log(lstProduct.fixed_price);
              let finalPrice = lstProduct.fixed_price * product.uom_ratio;

              product["lst_price"] = Math.round(finalPrice * 100) / 100;
              //  if (linkCheck == 0) {
              //  productArray.push(product);
              //}
              check_price = false;
            }
          }
        }
      }
      if (customer.pricelist.customer_default.id && check_price) {
        const result = await customerDefaultPricelist(customer, product);
        //console.log("Default");
        if (result) {
          for (let i = 0; i < result.rows.length; i++) {
            let lstProduct = result.rows.item(i);
            if (
              (date > lstProduct.date_start && date < lstProduct.date_end) ||
              lstProduct.date_start == "0"
            ) {
              console.log(lstProduct.fixed_price);
              let finalPrice = lstProduct.fixed_price * product.uom_ratio;
              console.log(finalPrice);
              product["lst_price"] = Math.round(finalPrice * 100) / 100;

              //if (linkCheck == 0) {
              // productArray.push(product);
              /// }
              check_price = false;
            }
          }
        }
      }
      if (check_price) {
        //if (linkCheck == 0) {
        //productArray.push(product);
        //}
      }
    }
  };
  const computeActualPrices = async (product) => {
    const cust = await AsyncStorage.getItem("custDetails");
    const customer = JSON.parse(cust);
    let checkPrice = true;
    if (customer.pricelist.customer_pricing_sch.id && checkPrice) {
      const result = await SchedulePricelist(customer, product);
      if (result) {
        for (let i = 0; i < result.rows.length; i++) {
          let lstProduct = result.rows.item(i);
          if (
            (date > Date.parse(lstProduct.date_start) &&
              date < Date(lstProduct.date_end)) ||
            lstProduct.date_start == "0"
          ) {
            let finalPrice = lstProduct.fixed_price * product.uom_ratio;
            product["actual_price"] = Math.round(finalPrice * 100) / 100;
            checkPrice = false;
          }
        }
      }
    }
    if (customer.pricelist.customer_default.id && checkPrice) {
      const result = await customerDefaultPricelist(customer, product);
      if (result) {
        for (let i = 0; i < result.rows.length; i++) {
          let lstProduct = result.rows.item(i);
          if (
            (date > Date.parse(lstProduct.date_start) &&
              date < Date.parse(lstProduct.date_end)) ||
            lstProduct.date_start == "0"
          ) {
            let finalPrice = lstProduct.fixed_price * product.uom_ratio;
            product["actual_price"] = Math.round(finalPrice * 100) / 100;
            checkPrice = false;
          }
        }
      }
    }
  };

  const defaultAbPriclist = async (product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE preschedule=2 AND product_id=?",
          [product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  const independentPriclist = async (product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE preschedule=904 AND product_id=?",
          [product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  const contractPricelist = async (customer, product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE pricelist_id= ? AND product_id=?",
          [customer.pricelist.contract_pricelist.id, product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  const SchedulePricelist = async (customer, product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE pricelist_id= ? AND product_id=? ",
          [customer.pricelist.customer_pricing_sch.id, product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  const groupSpecialPricelist = async (customer, product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE pricelist_id= ? AND product_id=? ",
          [customer.pricelist.group_special.id, product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  const globalPricelist = async (customer, product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE pricelist_id= ? AND product_id=? ",
          [customer.pricelist.global_price.id, product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  const customerDefaultPricelist = async (customer, product) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        tx.executeSql(
          "SELECT * FROM Pricelist WHERE pricelist_id= ? AND product_id=? ",
          [customer.pricelist.customer_default.id, product.id],
          async (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results);
            } else {
              resolve(false);
            }
          }
        );
      });
    });
  };

  async function handleQuantity(qty, prod) {
    console.log("Qty:", qty);
    if (menu == 0) {
      let checkProd = salesArray.find((product) => product.id == prod.id);
      if (!checkProd) {
        prod["actual_price"] = 0;
        //prod["sale_type"] = "sales";
        prod["transaction_type"] = "S";
        prod["sale_qty"] = qty;
        if (!prod["uom_ratio"]) {
          prod["uom_ratio"] = 1;
          prod["uom_id"] = "";
        }
        console.log(prod["uom_ratio"]);
        prod["lst_price"] = prod.lst_price * prod.uom_ratio;
        //console.log(prod);
        salesArray.push(prod);
        let product = salesArray.find((product) => product.id == prod.id);
        //console.log(product);
        computeUnitPrices(product);
        computeActualPrices(product);
        if (prod.link_items) {
          for (const linkProduct of prod.link_items) {
            linkProduct.product["lst_price"] = 0;
            linkProduct.product["uom_ratio"] = 1;
            linkProduct["salelink_qty"] = linkProduct.quantity * qty;
            computeUnitPrices(linkProduct.product);
          }
        }
      }
      //console.log(salesArray);
      if (checkProd) {
        prod["sale_qty"] = qty;
        checkProd["sale_qty"] = prod.sale_qty;
        if (checkProd.link_items) {
          for (let i = 0; i < checkProd.link_items.length; i++) {
            checkProd.link_items[i]["salelink_qty"] =
              prod.sale_qty * checkProd.link_items[i]["quantity"];
          }
        }
      }
    } else if (menu == 1) {
      let checkProd = returnArray.find((product) => product.id == prod.id);
      if (!checkProd) {
        prod["actual_price"] = 0;
        //prod["sale_type"] = "Return";
        prod["transaction_type"] = "C";
        prod["return_qty"] = qty;
        if (!prod["uom_ratio"]) {
          prod["uom_ratio"] = 1;
          prod["uom_id"] = "";
        }
        prod["lst_price"] = prod.lst_price * prod.uom_ratio;
        returnArray.push(prod);
        let product = returnArray.find((product) => product.id == prod.id);
        computeUnitPrices(product);
        computeActualPrices(product);
        if (prod.link_items) {
          for (const linkProduct of prod.link_items) {
            linkProduct.product["lst_price"] = 0;
            linkProduct.product["uom_ratio"] = 1;
            linkProduct["returnlink_qty"] = linkProduct.quantity * qty;
            computeUnitPrices(linkProduct.product);
          }
        }
      }
      if (checkProd) {
        prod["return_qty"] = qty;
        checkProd["return_qty"] = prod.return_qty;
        if (checkProd.link_items) {
          for (let i = 0; i < checkProd.link_items.length; i++) {
            checkProd.link_items[i]["returnlink_qty"] =
              prod.return_qty * checkProd.link_items[i]["quantity"];
          }
        }
      }
    } else {
      let checkProd = sampleArray.find((product) => product.id == prod.id);
      if (!checkProd) {
        prod["actual_price"] = 0;
        //prod["sale_type"] = "sample";
        prod["transaction_type"] = "F";
        prod["sample_qty"] = qty;
        if (!prod["uom_ratio"]) {
          prod["uom_ratio"] = 1;
          prod["uom_id"] = "";
        }
        sampleArray.push(prod);
        let product = sampleArray.find((product) => product.id == prod.id);
        //computeUnitPrices(product);
        //computeActualPrices(product);
        if (prod.link_items) {
          for (const linkProduct of prod.link_items) {
            linkProduct.product["lst_price"] = 0;
            linkProduct["samplelink_qty"] = linkProduct.quantity * qty;
            //computeUnitPrices(linkProduct.product);
          }
        }
      }
      if (checkProd) {
        prod["sample_qty"] = qty;
        checkProd["sample_qty"] = prod.sample_qty;
        if (checkProd.link_items) {
          for (let i = 0; i < checkProd.link_items.length; i++) {
            checkProd.link_items[i]["samplelink_qty"] =
              prod.sample_qty * checkProd.link_items[i]["quantity"];
          }
        }
      }
    }
  }

  const searchFilterFunction = (text) => {
    setArrayCheck("no");
    if (text) {
      const newData = masterDataSource.filter(function (item) {
        const name = item.name ? item.name.toUpperCase() : "".toUpperCase();
        const itemNo = item.item_no
          ? item.item_no.toUpperCase()
          : "".toUpperCase();
        const barcode = item.barcodes;
        //console.log(barcode);
        if (barcode) {
          let barcodeStr = "";
          for (let i = 0; i < barcode.length; i++) {
            barcodeStr = barcodeStr + barcode[i].barcode;
            //console.log(barcodeStr);
            if (barcode[i].barcode === text) {
              // console.log("Here");
              if (barcode[i].uom_id) {
                let remainingArr = salesArray.filter(
                  (product) => product.id != item.id
                );
                salesArray = remainingArr;
                //let product = salesArray.find((product) => product.id == item.id);
                item["uom"] = "UOM: " + barcode[i].uom_name;
                item["uom_ratio"] = barcode[i].uom_ratio;
                item["uom_id"] = barcode[i].uom_id;
                item["barcode"] = barcode[i].barcode;
                //console.log(item);
              }
            }
          }
          //let barcodeStr = barcode.join("");
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
          <View style={{ height: 40 }}>
            <View
              style={{ marginLeft: 30, marginTop: 4, flexDirection: "row" }}
            >
              <ModalDropdown
                options={["Sales", "Return", "Sample"]}
                textStyle={{
                  fontSize: 20,
                  color: "#4d4d4d",
                  textDecorationLine: "underline",
                }}
                defaultValue="Sales"
                dropdownStyle={{
                  width: 200,
                  height: 250,
                }}
                dropdownTextStyle={{ fontSize: 20 }}
                onSelect={(e) => {
                  setMenu(e);
                  setArrayCheck("no");
                }}
                dropdownTextHighlightStyle={{
                  backgroundColor: "#3c8",
                  color: "white",
                }}
                showSearch={true}
              />
            </View>
          </View>
          <View style={styles.prodview}>
            <FlatList
              data={filteredDataSource}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.card}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.no}>({item.item_no})</Text>
                  <View style={styles.textContainer}>
                    {menu == 0 ? (
                      <NumericInput
                        minValue={0}
                        step={item.stock <= 0 ? 0 : 1}
                        //maxValue={item.stock <= 0 ? 0 : item.stock}
                        disable={true}
                        initValue={item.sale_qty}
                        onLimitReached={() => {
                          item["sale_qty"] = 0;
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
                        borderColor="white"
                        containerStyle={{
                          backgroundColor: "white",
                          marginTop: 8,
                        }}
                        editable={item.stock <= 0 ? false : true}
                        rightButtonBackgroundColor={
                          item.stock <= 0 ? "#a6a6a6" : "#3c8"
                        }
                        leftButtonBackgroundColor={
                          item.stock <= 0 ? "#a6a6a6" : "#3c8"
                        }
                        totalWidth={140}
                        totalHeight={35}
                        onChange={(e) => {
                          //console.log('l')

                          handleQuantity(e, item);
                        }}
                      />
                    ) : menu == 1 ? (
                      <View>
                        <View>
                          <NumericInput
                            minValue={0}
                            value={0}
                            initValue={item.return_qty}
                            onLimitReached={() => {
                              item["return_qty"] = 0;
                              let remainingArr = returnArray.filter(
                                (product) => product.id != item.id
                              );
                              returnArray = remainingArr;
                              console.log("REM: ", remainingArr);

                              console.log("return Array: ", returnArray);
                            }}
                            iconStyle={{ color: "white" }}
                            borderColor="white"
                            containerStyle={{
                              backgroundColor: "white",
                              marginTop: 8,
                            }}
                            rightButtonBackgroundColor="#3c8"
                            leftButtonBackgroundColor="#3c8"
                            totalWidth={140}
                            totalHeight={35}
                            onChange={(e) => handleQuantity(e, item)}
                          />
                        </View>
                      </View>
                    ) : (
                      <View></View>
                    )}
                    {menu == 2 ? (
                      <View style={styles.sample}>
                        <NumericInput
                          minValue={0}
                          step={item.stock <= 0 ? 0 : 1}
                          //maxValue={item.stock <= 0 ? 0 : item.stock}
                          disable={true}
                          initValue={item.sample_qty}
                          borderColor="white"
                          onLimitReached={() => {
                            item["sample_qty"] = 0;
                            let remainingArr = sampleArray.filter(
                              (product) => product.id != item.id
                            );
                            sampleArray = remainingArr;
                            console.log("REM: ", remainingArr);

                            console.log("Product Array: ", sampleArray);
                          }}
                          value={0}
                          //svalue={item.sale_qty}

                          valueType="integer"
                          iconStyle={{ color: "white" }}
                          containerStyle={{
                            backgroundColor: "white",
                            marginTop: 8,
                          }}
                          editable={item.stock <= 0 ? false : true}
                          rightButtonBackgroundColor={
                            item.stock <= 0 ? "#a6a6a6" : "#3c8"
                          }
                          leftButtonBackgroundColor={
                            item.stock <= 0 ? "#a6a6a6" : "#3c8"
                          }
                          totalWidth={140}
                          totalHeight={35}
                          onChange={(e) => {
                            //console.log('l')

                            handleQuantity(e, item);
                          }}
                        />
                      </View>
                    ) : (
                      <View></View>
                    )}
                    <Text style={styles.uom}>{item.uom}</Text>
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
    height: 95,
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
    color: "black",
  },
  no: {
    fontSize: 14,
    color: "#3c8",
  },
  uom: {
    color: "black",
    marginTop: 15,
    fontSize: 14,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sample: {
    marginRight: 200,
  },
});
