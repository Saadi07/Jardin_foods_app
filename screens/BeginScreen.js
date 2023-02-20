import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { Button, IconButton, ActivityIndicator } from "react-native-paper";
import AwesomeAlert from "react-native-awesome-alerts";
import { useIsFocused } from "@react-navigation/native";
import ProgressBar from "react-native-animated-progress";
import NetInfo from "@react-native-community/netinfo";
import { openDatabase } from "react-native-sqlite-storage";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CookieManager from "@react-native-cookies/cookies";

const db = openDatabase({ name: "cartDatabase" });
var sequenceNo = 0;

export default function Begin({ navigation }) {
  const isFocused = useIsFocused();
  const [showAlert3, setShowAlert3] = useState(false);
  const [showAlert1, setShowAlert1] = useState(false);
  const [showAlert2, setShowAlert2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [percentage, setPercentage] = useState(0.0);
  const [proceed, setProceed] = useState(true);
  const [downloadinText, setDownloadingText] = useState(
    "Downloading the data..."
  );
  const [textAlert, setAlerText] = useState(false);
  const date = new Date().toDateString();
  const [name, setName] = useState("");
  const [loader, setLoader] = useState(false);
  const [open, setOpen] = useState(false);
  const [open1, setOpen1] = useState(false);
  const [internetStatus, setInternetStatus] = useState(true);
  const [value, setValue] = useState("Invoice");
  const [value1, setValue1] = useState("");
  const [userId, setUserId] = useState("");
  const [items, setItems] = useState([
    { label: "Invoicing", value: "Invoice" },
    { label: "Internal Transfer", value: "Internal Transfer" },
  ]);
  const [items1, setItems1] = useState([
    {
      label: "Logout",
      value: "logout",
    },
  ]);

  const updateInvoiceNumberToOdoo = async (Sequence) => {
    let updated = await getUserInvoiceNumber();
    console.log("ss", updated);
    if (updated) {
      console.log(sequenceNo);
      try {
        await fetch("https://smtksa.com/api/update_next_invoice_number", {
          method: "POST",
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            params: {
              next_invoice_number: sequenceNo,
            },
          }),
        }).then(async (response) => {
          if (response) {
            const data = await response.json();
            console.log("sequence Updated!", data);
          }
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getUserInvoiceNumber = async () => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        await tx.executeSql(
          "SELECT * FROM InvoiceSequence",
          [],
          (tx, results) => {
            //console.log(results.rows.item(0));
            if (results.rows.length >= 1) {
              sequenceNo = results.rows.item(0).invoice_sequence;
              resolve(true);
            } else {
              resolve(true);
            }
            //updateInvoiceNumberToOdoo(sequence_no);
          },
          (txObj, error) => {
            resolve(true);
            console.log("Error!", error);
          }
        );
      });
    });
  };

  //console.log(route.name)
  const signOut = async () => {
    await updateInvoiceNumberToOdoo();
    console.log("here");
    try {
      await fetch("https://smtksa.com/web/session/destroy", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          params: {},
        }),
      }).then(async (response) => {
        if (response) {
          await AsyncStorage.removeItem("sessionId");
          navigation.navigate("LoginScreen");
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const getdataCust = async () => {
    try {
      await fetch("https://smtksa.com/api/get_customers/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then(async (response) => {
        const json = await response.json();
        const result = json.result.result;
        deleteDataCust();
        createTableCust();
        addDataCust(result);
      });
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  const addDataCust = async (result) => {
    //console.log(result);
    db.transaction(async (txn) => {
      await txn.executeSql(
        `INSERT INTO Customer(data) VALUES (?)`,
        [JSON.stringify(result)],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected >= 1) {
            console.log("Cust added", resultSet);
          }
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  const createTableCust = async () => {
    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS Customer(data TEXT)");
    });
  };

  const deleteDataCust = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql("DROP TABLE Customer");
    });
  };

  const getdataProd = async () => {
    try {
      // const cookie = await AsyncStorage.getItem('seesion_id');
      await fetch("https://smtksa.com/api/get_products/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then(async (response) => {
        const json = await response.json();
        const result = json.result.result;
        deleteDataProd();
        createTableProd();
        adddataProd(result);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const adddataProd = async (result) => {
    db.transaction(async (txn) => {
      await txn.executeSql(
        `INSERT INTO Product(data) VALUES (?)`,
        [JSON.stringify(result)],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected >= 1)
            console.log("Product added", resultSet);
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  const createTableProd = async () => {
    db.transaction((tx) => {
      tx.executeSql("CREATE TABLE IF NOT EXISTS Product(data TEXT)");
    });
  };

  const deleteDataProd = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql("DROP TABLE Product");
    });
  };

  const getdataPricelist = async () => {
    try {
      // const cookie = await AsyncStorage.getItem('seesion_id');
      const res1 = await fetch("https://smtksa.com/api/get_pricelists/", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const json = await res1.json();
      const result = json.result.result;
      //console.log(result[3]);
      var length = 0;
      for (let i = 0; i < result.length; i++) {
        length = length + result[i].product_prices.length;
        //console.log(result[i].product_prices.length);
      }
      console.log(length);
      deleteDataPricelist();
      createTablePricelist();
      adddataPricelist(result, length);
    } catch (error) {
      //setShowAlert2(true);
    } finally {
    }
  };

  const adddataPricelist = async (result, length) => {
    try {
      var percent = 0;
      //setProceed(true);
      setDownloadingText("Downloading the Data...");
      //console.log("pricelength:" + length);
      await result.forEach((e) => {
        e.product_prices.forEach((m) => {
          db.transaction(async (txn) => {
            await txn.executeSql(
              `INSERT INTO Pricelist(id,pricelist_id,preschedule,product_id ,product_name,date_start,date_end,compute_price,fixed_price,percent_price) VALUES (?,?,?,?,?,?,?,?,?,?)`,
              [
                m.id,
                m.pricelist_id,
                m.preschedule,
                m.product.id,
                m.product.name,
                m.date_start,
                m.date_end,
                m.compute_price,
                m.fixed_price,
                m.percent_price,
              ],
              (txObj, resultSet) => {
                if (resultSet.rowsAffected >= 1) console.log(resultSet);
                percent = percent + 1;
                //console.log(percent / 73173) * 100;
                setPercentage((percent / length) * 100);
                if (percent == length) {
                  setProceed(false);
                  setDownloadingText("Downloading data completed");
                }
              },
              (txObj, error) => {
                console.log("Errorpricelistadd", error);
              }
            );
          });
        });
      });
    } catch (error) {}
  };
  const createTablePricelist = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Pricelist(id INTEGER,pricelist_id INTEGER,preschedule TEXT,product_id INTEGER,product_name TEXT,date_start TEXT,date_end TEXT,compute_price TEXT,fixed_price INTEGER,percent_price INTEGER)"
      );
    });
  };

  const deleteDataPricelist = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql("DROP TABLE Pricelist");
    });
  };

  const getUpdates = async () => {
    //console.log("herer");
    try {
      // const cookie = await AsyncStorage.getItem('seesion_id');
      const res1 = await fetch(
        "https://smtksa.com/api/get_pricelist_modified",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            params: {
              user_id: userId,
            },
          }),
        }
      );
      const json = await res1.json();
      const result = json.result.result;
      const resultLength = result.length;
      //console.log(result);
      if (resultLength != 0 && textAlert == false) {
        setAlerText(true);
        setShowAlert3(true);
        //console.log("pp");
        //setUpdatedRecord(result)
      } else if (resultLength == 0 && textAlert == false) {
        setLoader(false);
        setShowAlert3(true);
        //console.log("uu");
      }

      if (textAlert == true && resultLength != 0) {
        //console.log("here1");
        setShowAlert3(false);
        setUpdatedRecord(result, resultLength);
      }
    } catch (error) {
      setShowAlert3(true);
    } finally {
      setLoader(false);
    }
  };

  const updateRecord = async (item) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        await tx.executeSql(
          `UPDATE Pricelist set pricelist_id=?, preschedule=?, product_id=?, product_name=? ,compute_price=?, fixed_price=? ,percent_price=?,date_start=? ,date_end=? WHERE id=? `,
          [
            item.pricelist_id,
            item.preschedule,
            item.product.id,
            item.product.name,
            item.compute_price,
            item.fixed_price,
            item.percent_price,
            item.date_start,
            item.date_end,
            item.id,
          ],
          (tx, results) => {
            //updatedRecordIdz.push({ id: item.id });
            if (results.rowsAffected > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (txObj, error) => {
            resolve(false);
          }
        );
      });
    });
  };

  const deleteRecord = async (item) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (tx) => {
        await tx.executeSql(
          `DELETE FROM Pricelist WHERE id=? `,
          [item.id],
          (tx, results) => {
            if (results.rowsAffected > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (txObj, error) => {
            resolve(false);
          }
        );
      });
    });
  };

  const addRecord = async (item) => {
    return new Promise((resolve, reject) => {
      db.transaction(async (txn) => {
        await txn.executeSql(
          `INSERT INTO Pricelist(id,pricelist_id,preschedule,product_id ,product_name,date_start,date_end,compute_price,fixed_price,percent_price) VALUES (?,?,?,?,?,?,?,?,?,?)`,
          [
            item.id,
            item.pricelist_id,
            item.preschedule,
            item.product.id,
            item.product.name,
            item.date_start,
            item.date_end,
            item.compute_price,
            item.fixed_price,
            item.percent_price,
          ],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected >= 1) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          (txObj, error) => {
            resolve(false);
          }
        );
      });
    });
  };

  const setUpdatedRecord = async (pricelist, total) => {
    var percent = 0;
    let updatedRecordIdz = [];
    //console.log("here2");
    //ERROR CAN OCCUR HEERE!!!!!!!!!!!
    for (const item of pricelist) {
      if (item.mode == "update") {
        let updated = await updateRecord(item);
        percent = percent + 1;
        setPercentage((percent / total) * 100);
        if (percent == total) {
          setProceed(false);
          setDownloadingText("Downloading data completed");
        }
        if (updated) {
          updatedRecordIdz.push(item.id);
        }
      } else if (item.mode == "delete") {
        let deleted = await deleteRecord(item);
        percent = percent + 1;
        setPercentage((percent / total) * 100);
        if (percent == total) {
          setProceed(false);
          setDownloadingText("Downloading data completed");
        }
        if (deleted) {
          updatedRecordIdz.push(item.id);
        }
      } else {
        let added = await addRecord(item);
        percent = percent + 1;
        setPercentage((percent / total) * 100);
        if (percent == total) {
          setProceed(false);
          setDownloadingText("Downloading data completed");
        }
        if (added) {
          updatedRecordIdz.push(item.id);
        }
      }
    }
    //console.log(updatedRecordIdz);
    updateRecordStatusToOdoo(updatedRecordIdz);
  };

  const updateRecordStatusToOdoo = async (updatedRecordIdz) => {
    //console.log(updatedRecordIdz);
    try {
      await fetch("https://smtksa.com/api/update_record_status_in_odoo", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          params: {
            user_id: userId,
            record_id: updatedRecordIdz,
          },
        }),
      }).then(async (response) => {
        const json = await response.json();
        console.log(json);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const postdata = async (data) => {
    try {
      const res1 = await fetch("https://smtksa.com/api/create_invoice", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          params: {
            invoices: data,
          },
        }),
      }).then(async (response) => {
        const data = await response.json();
        if (data.result.invoice_ids && data.result.status_code == 200) {
          console.log("response:", data);
          db.transaction(async (tx) => {
            await tx.executeSql(
              `UPDATE Invoice set status='posted' `,
              [],
              (tx, results) => {},

              (txObj, error) => {
                console.log("Error", error);
              }
            );
          });
        }
        //alert("Invoice Posted!");
      });
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const createInvoices = async () => {
    console.log("kk");
    const invoiceArray = [];
    db.transaction(async (tx) => {
      await tx.executeSql(
        "SELECT * FROM Invoice WHERE status=?",
        ["notposted"],

        (tx, results) => {
          console.log("create Invoice", results);
          if (results.rows.length >= 1) {
            for (var i = 0; i < results.rows.length; i++) {
              //console.log(results.rows.item(i).sales)
              const temp = [];
              JSON.parse(results.rows.item(i).sales).forEach((e) => {
                //console.log("sale type", e.sale_type);
                temp.push({
                  product_id: e.id,
                  quantity: e.sale_qty,
                  actual_price: e.actual_price,
                  price_unit: e.lst_price,
                  transaction_type: e.transaction_type,
                  sale_type: "sales",
                  uom_id: e.uom_id,
                  barcode: e.barcode,
                });
                //console.log("Sale object", temp);
              });
              //console.log("here1");
              //if (results.rows.item(i).return.length != 0) {
              JSON.parse(results.rows.item(i).return).forEach((e) => {
                console.log("Return", e.sale_type);
                temp.push({
                  product_id: e.id,
                  quantity: e.return_qty,
                  actual_price: e.actual_price,
                  price_unit: e.lst_price,
                  transaction_type: e.transaction_type,
                  sale_type: 0,
                  uom_id: e.uom_id,
                  barcode: e.barcode,
                });
                //console.log("Return object", temp);
              });
              // }
              //if (results.rows.item(i).sample.length != 0) {
              JSON.parse(results.rows.item(i).sample).forEach((e) => {
                console.log("Sample type", e.sale_type);
                temp.push({
                  product_id: e.id,
                  quantity: e.sample_qty,
                  actual_price: 0,
                  price_unit: 0,
                  transaction_type: e.transaction_type,
                  sale_type: "sample",
                  uom_id: e.uom_id,
                });
              });
              //  }
              var warehouseId = results.rows.item(i).warehouse_id;
              if (results.rows.item(i).warehouse_id == 0) {
                warehouseId = 1;
              }
              console.log("All Products", temp);
              // console.log("User:", results.rows.item(i).invoice_date);
              const data = {
                partner_id: results.rows.item(i).customer_id,
                name: results.rows.item(i).invoice_no,
                invoice_date: results.rows.item(i).invoice_date,
                salesperson_id: results.rows.item(i).user_id,
                warehouse_id: warehouseId,
                invoice_lines: temp,
              };
              invoiceArray.push(data);
            }
            console.log("kki");
            //setCheck(false)
            postdata(invoiceArray);
          }
          //alert("No Invoice Available");
        }
      );
    });
  };

  const getName = async () => {
    const salesPerson = await AsyncStorage.getItem("salesPerson");
    const salesPersonData = JSON.parse(salesPerson);
    setName(salesPersonData.username);
    setUserId(() => salesPersonData.uid);
  };

  const getdataRoutes = async () => {
    try {
      await fetch("https://smtksa.com/api/get_warehouses", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }).then(async (response) => {
        const json = await response.json();
        const result = json.result.result;
        //console.log(result);
        deleteDataRoutes();
        createTableRoutes();
        addDataRoutes(result);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const addDataRoutes = async (result) => {
    //console.log(result);
    await result.forEach((e) => {
      db.transaction(async (txn) => {
        await txn.executeSql(
          `INSERT INTO Routes(label,value, id) VALUES (?,?,?)`,
          [e.name, e.name, e.id],
          (txObj, resultSet) => {
            if (resultSet.rowsAffected >= 1) {
              //console.log("routes added", resultSet);
            }
          },
          (txObj, error) => {
            console.log("Error", error);
          }
        );
      });
    });
  };

  const createTableRoutes = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Routes(label TEXT, value TEXT, id INTEGER)"
      );
    });
  };

  const deleteDataRoutes = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql("DROP TABLE Routes");
    });
  };

  useEffect(() => {
    //console.log("hereererereeeere");
    const removeNetInfoSubscription = NetInfo.addEventListener((state) => {
      const offline = !(state.isConnected && state.isInternetReachable);
      const wifi = state.isWifiEnabled;
      if (!offline) {
        getName();
        setInternetStatus(true);
        getdataCust();
        getdataProd();
        getdataRoutes();
      } else {
        getName();
        setInternetStatus(false);
      }
    });

    return () => removeNetInfoSubscription();
  }, [isFocused]);

  return (
    <View>
      <View>
        <StatusBar backgroundColor="#3c8" hidden={false} />
        <View
          style={{
            backgroundColor: "#3c8",
            height: 58,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              padding: 15,
              fontSize: 20,
              color: "white",
              fontWeight: "bold",
            }}
          >
            {" "}
            Main Menu{" "}
          </Text>
          <View
            style={{
              backgroundColor: "#3c8",
              height: 58,
              flexDirection: "row",
            }}
          >
            <IconButton
              icon="download"
              mode={"contained"}
              color="white"
              style={{ marginRight: 10 }}
              size={30}
              onPress={() => setShowAlert1(true)}
            >
              {" "}
            </IconButton>
            <IconButton
              icon="upload"
              mode={"contained"}
              color="white"
              style={{ marginRight: 10 }}
              size={30}
              onPress={() => setShowAlert2(true)}
            ></IconButton>
            <IconButton
              icon="printer"
              mode={"contained"}
              color="white"
              style={{ marginRight: 10 }}
              size={30}
              onPress={() => navigation.navigate("samplePrint")}
            >
              {" "}
            </IconButton>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="account-circle"
              mode={"contained"}
              color="grey"
              size={27}
              style={{ marginTop: 15, marginLeft: 20, marginRight: 0 }}
            >
              {" "}
            </IconButton>
            <Text style={{ marginTop: 20, fontSize: 18, color: "black" }}>
              {name}{" "}
            </Text>
          </View>
          <View style={{ flexDirection: "row", marginRight: 20 }}>
            <IconButton
              icon="calendar"
              mode={"contained"}
              color="grey"
              size={20}
              style={{ height: 50 }}
            >
              {" "}
            </IconButton>
            <Text style={{ marginTop: 20, color: "black" }}>{date} </Text>
          </View>
        </View>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <DropDownPicker
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
            textStyle={{ color: "grey" }}
            style={{
              width: 320,
              alignSelf: "center",
              borderColor: "grey",
              marginTop: 78,
              height: 55,
            }}
            containerStyle={{ width: 320, marginBottom: 55 }}
            selectedItemContainerStyle={{
              backgroundColor: "#d9d9d9",
            }}
            arrowIconStyle={{
              width: 20,
              height: 20,
              color: "grey",
            }}
            tickIconStyle={{
              width: 20,
              height: 20,
              color: "white",
            }}
            onChangeValue={(value) => {
              console.log(value);
            }}
          />

          <Button
            mode="contained"
            color={"#3c8"}
            style={{ width: 240, height: 50, marginTop: 30 }}
            labelStyle={{ fontSize: 20, color: "white" }}
            onPress={() => {
              setLoader(true);
              getUpdates();
            }}
          >
            Begin Day
          </Button>
          <Button
            mode="contained"
            color={"#3c8"}
            style={{ width: 240, height: 50, marginTop: 30 }}
            labelStyle={{ fontSize: 20, color: "white" }}
            onPress={() => {
              signOut();
            }}
          >
            Logout
          </Button>
        </View>
        <AwesomeAlert
          show={showAlert1}
          showProgress={false}
          message={
            internetStatus
              ? "Do you want to download data?"
              : "No Internet Available"
          }
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={internetStatus ? true : false}
          cancelText={internetStatus ? "No" : "Okay"}
          confirmText="Yes"
          cancelButtonColor="#D0342C"
          confirmButtonColor="#3c8954"
          onCancelPressed={() => {
            setShowAlert1(false);
          }}
          onConfirmPressed={() => {
            setShowAlert1(false);
            setLoading(true);
            getdataPricelist();
          }}
        />
        <AwesomeAlert
          show={showAlert2}
          showProgress={false}
          message={
            internetStatus
              ? "Do you want to upload Invoices?"
              : "No Internet Available"
          }
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={true}
          showConfirmButton={internetStatus ? true : false}
          cancelText={internetStatus ? "No" : "Okay"}
          confirmText="Yes"
          cancelButtonColor="#D0342C"
          confirmButtonColor="#3c8954"
          onCancelPressed={() => {
            setShowAlert2(false);
          }}
          onConfirmPressed={() => {
            setShowAlert2(false);
            //setLoading(true);
            createInvoices();
            //setLoading(true);
            //getdataPricelist();
          }}
        />

        {loader ? (
          <Modal visible={loader} transparent={true} animationType={"none"}>
            <View
              style={{
                flex: 1,
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "space-around",
                backgroundColor: "#00000040",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  height: 150,
                  width: 350,
                  borderRadius: 10,
                }}
              >
                <ActivityIndicator
                  animating={true}
                  size={"medium"}
                  style={{ marginTop: 40 }}
                  color={"#3c8"}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <AwesomeAlert
            show={showAlert3}
            showProgress={false}
            message={
              textAlert
                ? "New data available for download, Do you want to download?"
                : "No new data available proceed without downloading?"
            }
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonColor="#D0342C"
            confirmButtonColor="#3c8954"
            onCancelPressed={() => {
              if (textAlert) {
                setShowAlert3(false);
                setAlerText(false);
                if (value == "Invoice") {
                  navigation.navigate("TabScreen");
                } else {
                  navigation.navigate("InternalTransferScreen");
                }
              } else {
                setShowAlert3(false);
                if (value == "Invoice") {
                  navigation.navigate("TabScreen");
                } else {
                  navigation.navigate("InternalTransferScreen");
                }
              }
            }}
            onConfirmPressed={() => {
              setShowAlert3(false);
              if (textAlert) {
                setLoading(true);
                getUpdates();
                setAlerText(false);
                if (value == "Invoice") {
                  navigation.navigate("TabScreen");
                } else {
                  navigation.navigate("InternalTransferScreen");
                }
              } else {
                if (value == "Invoice") {
                  navigation.navigate("TabScreen");
                } else {
                  navigation.navigate("InternalTransferScreen");
                }
              }
            }}
          />
        )}

        <Modal visible={loading} transparent={true}>
          <View
            style={{
              flex: 1,
              alignItems: "center",
              flexDirection: "column",
              justifyContent: "space-around",
              backgroundColor: "#00000040",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                height: 150,
                width: 350,
                borderRadius: 10,
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  marginRight: 8,
                  marginLeft: 8,
                }}
              >
                <Text style={{ marginBottom: 4, marginTop: 22 }}>
                  {" "}
                  {downloadinText}{" "}
                </Text>
                <ProgressBar
                  progress={percentage}
                  height={10}
                  backgroundColor="#3c8"
                />
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row-reverse",
                    marginTop: 8,
                  }}
                >
                  <Button
                    mode="contained"
                    labelStyle={{ color: "white", fontSize: 14 }}
                    style={{ width: 130, marginTop: 6, height: 40 }}
                    onPress={() => {
                      setLoading(false);
                      setPercentage(0.0);
                      navigation.navigate("TabScreen");
                    }}
                    disabled={proceed}
                    color="#3c8"
                    icon="chevron-right"
                    contentStyle={{ flexDirection: "row-reverse" }}
                  >
                    Continue
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    backgroundColor: "#ecf0f1",
    alignItems: "center",
    marginTop: 25,
  },
  viewName: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "left",
  },
  text1: {
    textAlign: "right",
  },
  modalBackground: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#00000040",
  },

  activityIndicatorWrapper: {
    backgroundColor: "#FFFFFF",
    height: 100,
    width: 100,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
  },
});
