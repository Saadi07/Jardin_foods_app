import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  Dimensions,
  Platform,
  PermissionsAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, IconButton } from "react-native-paper";
import AwesomeAlert from "react-native-awesome-alerts";
import { openDatabase } from "react-native-sqlite-storage";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import RNFetchBlob from "rn-fetch-blob";
import { NativeModules } from "react-native";
//const RNFetchBlob = NativeModules.RNFetchBlob;
var ABC = NativeModules.ABC;
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

const db = openDatabase({ name: "cartDatabase" });

var InvoiceNumber = "";
var custName = "";
var custAddr = "";
var customerId = "";
var customerNo = "";
var date = "";
var warehouse = "";
var paymentTerm = "";
var sequence_no = 0;
var id;

var totalTax = 0.0;
var subTotal = 0.0;
var totalInvoice = 0.0;

export default function Invoice({ navigation, route }) {
  const [showAlert, setShowAlert] = useState(false);
  //const [warehouse, setWarehouse] = useState("");
  const [index, setIndex] = React.useState(0);
  const [isLoading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  //const [date, setDate] = useState("");
  const arrays = route.params;
  const salesData = arrays.salesArray;
  const returnData = arrays.returnArray;
  const sampleData = arrays.sampleArray;
  const [total, setTotal] = useState(0);
  const [printerId, setPrinterId] = useState("");

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <>
          <IconButton
            icon="eye"
            mode={"contained"}
            color="white"
            style={{ marginRight: 10 }}
            size={30}
            onPress={() => tableHtml(0)}
          >
            {" "}
          </IconButton>
          <IconButton
            icon="printer"
            mode={"contained"}
            color="white"
            style={{ marginRight: 10 }}
            size={30}
            onPress={() => printFunc()}
          >
            {" "}
          </IconButton>
        </>
      ),
    });
  }, [navigation]);

  const tableHtml = async (choice) => {
    generateInvoiceNumber();
    var salesArray = "";
    var returnArray = "";
    var sampleArray = "";
    var salesPrint = "";
    for (var i = 0; i < salesData.length; i++) {
      const ext = (salesData[i].lst_price * salesData[i].sale_qty).toFixed(2);
      if (i == 0) {
        salesArray =
          salesArray +
          `<tr class="item">
      <td > <p style="text-align:center">   ${salesData[i].item_no} </p> </td>
      <td > <p style="text-align:left"> ${salesData[i].name} </p> </td>
      <td > <p style="text-align:center"> ${salesData[i].sale_qty} </p></td>
      <td > <p style="text-align:center">  ${salesData[i].lst_price.toFixed(
        2
      )} </p> </td>
      <td > <p style="text-align:center">  ${ext} </p> </td>
      </tr>`;
      } else {
        salesArray =
          salesArray +
          `<tr class="item">
    <td > <p style="text-align:center">   ${salesData[i].item_no} </p> </td>
    <td > <p style="text-align:left"> ${salesData[i].name} </p> </td>
    <td > <p style="text-align:center"> ${salesData[i].sale_qty} </p></td>
    <td > <p style="text-align:center">  ${salesData[i].lst_price.toFixed(
      2
    )} </p> </td>
    <td > <p style="text-align:center">  ${ext} </p> </td>
    </tr>`;
      }

      for (var y = 0; y < salesData[i].link_items.length; y++) {
        const ext = (
          salesData[i].link_items[y].product.lst_price *
          salesData[i].link_items[y].salelink_qty
        ).toFixed(2);
        salesArray =
          salesArray +
          `<tr class="item">
         <td > <p style="text-align:center">   ${
           salesData[i].link_items[y].product.item_no
         } </p> </td>
         <td > <p style="text-align:left"> ${
           salesData[i].link_items[y].product.name
         } </p> </td>
         <td > <p style="text-align:center"> ${
           salesData[i].link_items[y].salelink_qty
         } </p></td>
         <td > <p style="text-align:center">  ${salesData[i].link_items[
           y
         ].product.lst_price.toFixed(2)} </p> </td>
         <td > <p style="text-align:center">  ${ext} </p> </td>
         </tr>`;
      }
    }
    for (var i = 0; i < returnData.length; i++) {
      const ext = (returnData[i].lst_price * returnData[i].return_qty).toFixed(
        2
      );
      if (i == 0) {
        returnArray =
          returnArray +
          `<tr> <td></td><td></td><td style='font-size: 24px;'> Credit </td> </tr>
     <tr class="item">
      <td > <p style="text-align:center">  ${returnData[i].item_no} </p> </td>
      <td > <p style="text-align:left"> ${returnData[i].name} </p> </td>
      <td > <p style="text-align:center">  -${
        returnData[i].return_qty
      } </p></td>
      <td > <p style="text-align:center">  ${returnData[i].lst_price.toFixed(
        2
      )} </p> </td>
      <td > <p style="text-align:center">  -${ext} </p> </td>
      </tr>`;
      } else {
        returnArray =
          returnArray +
          `<tr class="item">
     <td > <p style="text-align:center">   ${returnData[i].item_no} </p> </td>
     <td > <p style="text-align:left"> ${returnData[i].name} </p> </td>
     <td > <p style="text-align:center"> -${returnData[i].return_qty} </p></td>
     <td > <p style="text-align:center">  ${returnData[i].lst_price.toFixed(
       2
     )} </p> </td>
     <td > <p style="text-align:center">   -${ext} </p> </td>
      </tr>`;
      }
      for (var y = 0; y < returnData[i].link_items.length; y++) {
        const ext = (
          returnData[i].link_items[y].product.lst_price *
          returnData[i].link_items[y].returnlink_qty
        ).toFixed(2);
        returnArray =
          returnArray +
          `<tr class="item">
         <td > <p style="text-align:center">   ${
           returnData[i].link_items[y].product.id.item_no
         } </p> </td>
         <td > <p style="text-align:left"> ${
           returnData[i].link_items[y].product.name
         } </p> </td>
         <td > <p style="text-align:center"> -${
           returnData[i].link_items[y].returnlink_qty
         } </p></td>
         <td > <p style="text-align:center">  ${returnData[i].link_items[
           y
         ].product.lst_price.toFixed(2)} </p> </td>
         <td > <p style="text-align:center">  ${ext} </p> </td>
         </tr>`;
      }
    }
    for (var i = 0; i < sampleData.length; i++) {
      if (i == 0) {
        sampleArray =
          sampleArray +
          `<tr> <td></td><td></td><td style='font-size: 24px;'> Sample </td> </tr>
     <tr class="item">
 
      <td > <p style="text-align:center">  ${sampleData[i].item_no} </p> </td>
      <td > <p style="text-align:left"> ${sampleData[i].name} </p> </td>
      <td > <p style="text-align:center">  ${sampleData[i].sample_qty} </p></td>
      <td > <p style="text-align:center">  $0.00 </p> </td>
      <td > <p style="text-align:center">  $0.00 </p> </td>
      </tr>`;
      } else {
        sampleArray =
          sampleArray +
          `<tr class="item">
     <td > <p style="text-align:center">  ${sampleData[i].item_no} </p> </td>
     <td > <p style="text-align:left"> ${sampleData[i].name} </p> </td>
     <td > <p style="text-align:center">  ${sampleData[i].sample_qty} </p></td>
     <td > <p style="text-align:center">  $0.00} </p> </td>
     <td > <p style="text-align:center">  $0.00 </p> </td>
      </tr>`;
      }
      for (var y = 0; y < sampleData[i].link_items.length; y++) {
        sampleArray =
          sampleArray +
          `<tr class="item">
         <td > <p style="text-align:center">   ${sampleData[i].link_items[y].product.item_no} </p> </td>
         <td > <p style="text-align:left"> ${sampleData[i].link_items[y].product.name} </p> </td>
         <td > <p style="text-align:center"> ${sampleData[i].link_items[y].quantity} </p></td>
         <td > <p style="text-align:center"> $0.00 </p> </td>
         <td > <p style="text-align:center"> $0.00 </p> </td>
         </tr>`;
      }
    }
    // setRet(returnArray);
    // setSale(salesArray);
    //setSample(sampleArray);
    createPDF(salesArray, returnArray, sampleArray, choice);
    //setPrint(salesPrint);
    //console.log("len" + length);
  };

  const createPDF = async (salesArray, returnArray, sampleArray, choice) => {
    let options = {
      html: `
       <!DOCTYPE html>
<html>
 <head>
     <style>
     .invoice-box {
      max-width: 100%;
      margin: auto;
      padding: 30px;
      font-size: 16px;
      line-height: 24px;
      font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
      color: #555;
  }
 
         .invoice-box table {
             width: 100%;
             line-height: inherit;
             text-align: left;
             
         }
 
         .invoice-box table td {
             padding: 5px;
             vertical-align: top;
         }
 
         .invoice-box table tr td:nth-child(2) {
          text-align: right;
         }
 
         .invoice-box table tr.top table td {
             padding-bottom: 20px;
         }
 
         .invoice-box table tr.top table td.title {
             font-size: 45px;
             line-height: 45px;
             color: #333;
         }
 
         .invoice-box table tr.information table td {
             padding-bottom: 40px;
         }
 
         .invoice-box table tr.heading td {
             background: #eee;
             border-bottom: 1px solid #ddd;
             font-weight: bold;
         }
 
         .invoice-box table tr.details td {
             padding-bottom: 20px;
         }
 
         .invoice-box table tr.item td {
             border-bottom: 1px solid #eee;
         }
 
         .invoice-box table tr.item.last td {
             border-bottom: none;
         }
 
         .invoice-box table tr.total td:nth-child(2) {
             border-top: 2px solid #eee;
             font-weight: bold;
         }
 
         @media only screen and (max-width: 600px) {
             .invoice-box table tr.top table td {
                 width: 100%;
                 display: block;
                 text-align: left;
             }
 
             .invoice-box table tr.information table td {
                 width: 100%;
                 display: block;
                 text-align: left;
             }
         }
 
         /** RTL **/
         .invoice-box.rtl {
             direction: rtl;
             font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
         }
 
         .invoice-box.rtl table {
             text-align: right;
         }
 
         .invoice-box.rtl table tr td:nth-child(2) {
             text-align: left;
         }
     </style>
 </head>
 
 <body>
                  
     <div class="invoice-box">
     <div class="col-12">
     <div style="border-bottom: 1px solid black;"/>
     <table>
     <tr>
     <td style="color:#555">
              Invoice No: ${InvoiceNumber} <br />
              Date: ${date} 
          </td>
     </tr>
     </table>
 </div>
</div>
         <table cellpadding="0" cellspacing="0">
 
             <tr class="information">
                 <td colspan="5">
                     <table ">
                         <tr>
                             <td style=" width: 50px; overflow: hidden; ">
                                 Remit To: Jardin Foods Ltd<br />
                                 9615-90th Avenue<br />
                                 PEACE RIVER AB TBS 1GB
                             </td>
 
                             <td >
                                 Branch/Route Number:${warehouse}<br />
                                 Payment Term:${paymentTerm}
                             </td>
                         </tr>
           <tr>
           <td style=" width: 30px; overflow: hidden;margin-right:130px; " >
            Bill To: ${custName} <br />
           Cust #: ${customerNo} <br />
           ${custAddr}
                           </td>
 
                             <td style=" width: 30px; overflow: hidden;margin-left:200; ">
             Bill To: ${custName}<br />
             Cust #: ${customerNo} <br />
             ${custAddr}
                             </td>
                         </tr>
                     </table>
                 </td>
             </tr>
 
 
             <tr class="heading">
                 <td> <p> ITEM NO </p> </td>
 
                 <td>  <p style="text-align:left">DESCRIPTION </p></td>
                 <td> <p> QTY </p> </td>
 
                 <td> <p style="text-align:center"> UNIT PRICE </p></td>
                 <td> <p> EXT </p></td>
 
                 
             </tr>
              ${sampleArray}
               ${returnArray}
               <tr><td></td><td></td> <td style='font-size: 24px;'> Sales </td> </tr>
               ${salesArray}
             <tr>
             <td></td>
             <td></td>
             <td></td>
             <td>
             <table cellpadding="0" cellspacing="0" style=" width : 240px; table-layout: fixed;border: 1px solid #eee;margin-top:20px">
             <tr style="">
             <td> Subtotal: </td>
             <td> $${(Math.round(subTotal * 100) / 100).toFixed(2)} </td>
             </tr>
             <tr>
             <td> Tax: </td>
             <td> $${(Math.round(totalTax * 100) / 100).toFixed(2)} </td>
             </tr>
             <tr style="background: #eee">
             <td> Total: </td>
             <td> $${(Math.round(totalInvoice * 100) / 100).toFixed(2)} </td>
             </tr>
             </Table>
              </td> 
             
             </tr>
         </table>
         
         <table>
         <tr>
         <td>x_________________________ </td>
         </tr>
         <tr>
         <td> Delivered By: Jardin Foods</td>
         </tr>
         <tr>
         <td> (780) 624 8350</td>
         </tr>
         </tr>
         </table>
     </div>
    
 </body>
</html>`,
      fileName: "test",
      directory: "docs",
      base64: true,
      // height: 1000, //changes
      // width: 620, //changes
    };
    let file = await RNHTMLtoPDF.convert(options);
    if (choice == 1) {
      if (await isPermitted()) {
        let path = RNFetchBlob.fs.dirs.DownloadDir + "/test.pdf";
        console.log(path);
        RNFetchBlob.fs.writeFile(path, file.base64, "base64").then((res) => {
          console.log(res);
          ABC.show();
          navigation.navigate("TabScreen");
        });
      }
    } else {
      navigation.navigate("PdfScreen", { url: file.filePath });
    }

    //let file = await RNHTMLtoPDF.convert(options);
    //navigation.navigate("PdfScreen", { url: file.filePath });
  };

  const isPermitted = async () => {
    if (Platform.OS === "android") {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "External Storage Write Permission",
            message: "App needs access to Storage data",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.log(err);
        alert("Write permission err", err);
        return false;
      }
    } else {
      return true;
    }
  };
  const printFunc = () => {
    setShowAlert(true);
  };

  const adddata = async () => {
    console.log("inv", InvoiceNumber);
    db.transaction(async (txn) => {
      await txn.executeSql(
        `INSERT INTO Invoice(customer_name,customer_id,user_id,warehouse_id,invoice_no,invoice_date,sales,return,sample,total,delivery,warehouse,status,customer_no,subtotal,tax,payment_term) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          custName,
          customerId,
          userId,
          warehouseId,
          InvoiceNumber,
          date,
          JSON.stringify(salesData),
          JSON.stringify(returnData),
          JSON.stringify(sampleData),
          total.toFixed(2),
          custAddr,
          warehouse,
          "notposted",
          customerNo,
          subTotal,
          totalTax,
          paymentTerm,
        ],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected >= 1)
            //console.log('added data')
            console.log(resultSet);
          //viewdata();
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  const createTable = async () => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS Invoice(id INTEGER PRIMARY KEY AUTOINCREMENT, customer_name TEXT,customer_id INTEGER,user_id INTEGER,warehouse_id INTEGER,invoice_no TEXT,invoice_date TEXT,sales TEXT,return TEXT,sample TEXT,total INTEGER,delivery TEXT,warehouse TEXT,status TEXT,customer_no TEXT, subtotal INTEGER, tax INTEGER, payment_term TEXT)"
      );
    });
  };

  //use this function to generate formated date
  const getFormatedDate = async () => {
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }

    if (mm < 10) {
      mm = "0" + mm;
    }
    today = yyyy + "-" + mm + "-" + dd;
    date = today;
    // setDate(today);
    console.log(date);
  };

  const getSalesPerson = async () => {
    const salesPerson = await AsyncStorage.getItem("salesPerson");
    const salesPersonData = JSON.parse(salesPerson);
    //setWarehouse(() => salesPersonData.default_warehouse.name);
    warehouse = salesPersonData.default_warehouse.name;
    setUserId(() => salesPersonData.uid);
    setWarehouseId(() => salesPersonData.default_warehouse.id);
    const printer = await AsyncStorage.getItem("bluetooth");
    setPrinterId(printer);
    console.log(printerId);
  };

  const generateInvoiceNumber = async () => {
    const last2 = new Date().getFullYear().toString().slice(-2);
    let seqNo = sequence_no.toString();
    if (seqNo.length == 1) {
      InvoiceNumber = "U" + warehouse.slice(-1) + last2 + "0000" + seqNo;
      console.log(InvoiceNumber);
    } else if (seqNo.length == 2) {
      InvoiceNumber = "U" + warehouse.slice(-1) + last2 + "000" + seqNo;
      console.log(InvoiceNumber);
    } else if (seqNo.length == 3) {
      InvoiceNumber = "U" + warehouse.slice(-1) + last2 + "00" + seqNo;
      console.log(InvoiceNumber);
    } else if (seqNo.length == 4) {
      InvoiceNumber = "U" + warehouse.slice(-1) + last2 + "0" + seqNo;
      console.log(InvoiceNumber);
    } else {
      InvoiceNumber = "U" + warehouse.slice(-1) + last2 + seqNo;
      console.log(InvoiceNumber);
    }
  };

  const updateInvoiceSequence = async () => {
    sequence_no = sequence_no + 1;
    console.log("seq", sequence_no);
    db.transaction(async (tx) => {
      await tx.executeSql(
        `UPDATE InvoiceSequence set invoice_sequence=? WHERE id=?`,
        [sequence_no, id],
        (tx, results) => {
          console.log("Updated!");
        },

        (txObj, error) => {
          console.log("Error!!", error);
        }
      );
    });
  };

  const getInvoiceSequence = async () => {
    db.transaction(async (tx) => {
      await tx.executeSql(
        "SELECT * FROM InvoiceSequence",
        [],
        (tx, results) => {
          console.log(results);
          console.log(results.rows.item(0));
          sequence_no = results.rows.item(0).invoice_sequence;
          id = results.rows.item(0).id;
          console.log(sequence_no);
          console.log(id);
        },
        (txObj, error) => {
          console.log("Error", error);
        }
      );
    });
  };

  const calculateTotal = async () => {
    console.log("Caller");

    const cust = await AsyncStorage.getItem("custDetails");
    const custData = JSON.parse(cust);

    if (custData) {
      custName = custData.name;
      custAddr = custData.street;
      customerId = custData.id;
      customerNo = custData.customer_no;
      paymentTerm = custData.payment_terms.name;

      let salesTotal = calculateSaleTotal(custData);
      let returnTotal = calculateReturnTotal(custData);

      console.log(returnTotal);
      console.log(salesTotal);
      subTotal = salesTotal._3.totalSale - returnTotal._3.totalReturn;
      totalTax = salesTotal._3.SaleTax - returnTotal._3.ReturnTax;
      // setSubtotal(() => salesTotal._3 - returnTotal._3);
      //totalTax = totalSaleTax - totalReturnTax;
      console.log("Subtotal", Math.round(subTotal * 100) / 100);
      console.log("Tax", Math.round(totalTax * 100) / 100);
      totalInvoice =
        Math.round(subTotal * 100) / 100 + Math.round(totalTax * 100) / 100;
      setLoading(false);
      setTotal(() => totalInvoice);
      console.log("Total Invoice:", totalInvoice);

      //generateInvoiceNumber();
      //console.log(totalInvoice);
    }
  };

  const computeSaleTax = async (product, customer) => {
    if (customer.tax_exempt == false) {
      if (product.tax.id) {
        let tax =
          (product.tax.percent / 100) * product.lst_price * product.sale_qty;
        console.log("here", tax);
        return tax;
      }
    }
    return 0;
  };

  const computeReturnTax = async (product, customer) => {
    if (customer.tax_exempt == false) {
      if (product.tax.id) {
        let tax =
          (product.tax.percent / 100) * product.lst_price * product.return_qty;
        return tax;
      }
    }
    return 0;
  };

  const computeLinkItemsTax = async (product, customer) => {
    console.log(product);
    if (customer.tax_exempt == false) {
      if (product.product.tax.id) {
        let tax =
          (product.product.tax.percent / 100) *
          product.product.lst_price *
          product.quantity;
        console.log("Tax", tax);
        return tax;
      }
    }
    return 0;
  };

  const calculateSaleTotal = async (customer) => {
    let Sales = 0;
    let totalLink = 0;
    let saleTax = 0;
    let linkTax = 0;
    salesData.filter((product) => {
      product["total_product"] = product.lst_price * product.sale_qty;
      let tax = computeSaleTax(product, customer);
      //console.log(tax);
      saleTax = saleTax + Math.round(tax._3 * 100) / 100;
      Sales = Sales + product.total_product;
      product.link_items.filter((product) => {
        product["total_link"] =
          product.product.lst_price * product.salelink_qty;
        let tax = computeLinkItemsTax(product, customer);
        linkTax = linkTax + Math.round(tax._3 * 100) / 100;
        totalLink = totalLink + product.total_link;
      });
    });
    //console.log(totalLink);
    //totalTax = totalTax + saleTax;
    var objectSale = {
      totalSale: Sales + totalLink,
      SaleTax: saleTax + linkTax,
    };
    return objectSale;
  };

  const calculateReturnTotal = async (customer) => {
    let Return = 0;
    let totalLink = 0;
    let returnTax = 0;
    let linkTax = 0;
    returnData.filter((product) => {
      product["total_product"] = product.lst_price * product.return_qty;
      let tax = computeReturnTax(product, customer);
      returnTax = returnTax + Math.round(tax._3 * 100) / 100;
      Return = Return + product.total_product;
      product.link_items.filter((product) => {
        product["total_link"] =
          product.product.lst_price * product.returnlink_qty;
        let tax = computeLinkItemsTax(product, customer);
        linkTax = linkTax + Math.round(tax._3 * 100) / 100;
        totalLink = totalLink + product.total_link;
      });
    });
    //totalTax = returnTax;
    var objectReturn = {
      totalReturn: Return + totalLink,
      ReturnTax: returnTax + linkTax,
    };
    return objectReturn;
  };

  useEffect(() => {
    getSalesPerson();
    //tableHtml();
    //generateInvoiceNumber();
    getInvoiceSequence();
    getFormatedDate();
    calculateTotal();
  }, []);

  const FirstRoute = () => (
    <FlatList
      data={salesData}
      renderItem={({ item }) => (
        <View>
          <Card style={styles.card}>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#4d4d4d",
                  color: "#262626",
                }}
              >
                {item.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 2,
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                Quantity: {item.sale_qty}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 0,
                }}
              >
                <Text style={{ color: "#262626" }}>
                  {" "}
                  ${item.actual_price.toFixed(2)}{" "}
                </Text>{" "}
                Promo Price
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 10,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "#262626" }}>
                  {" "}
                  ${(item.actual_price - item.lst_price).toFixed(2)}{" "}
                </Text>{" "}
                Discount
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 20,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {" "}
              </Text>
              <Text
                style={{ fontSize: 12, fontWeight: "500", color: "#4d4d4d" }}
              >
                <Text style={{ color: "#262626", marginRight: 40 }}>
                  {" "}
                  ${item.lst_price.toFixed(2)}{" "}
                </Text>{" "}
                Net Price
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 17,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 0,
                }}
              >
                <Text style={{ color: "#262626", marginRight: 20 }}>
                  {" "}
                  ${(item.sale_qty * item.lst_price).toFixed(2)}{" "}
                </Text>{" "}
                Extension
              </Text>
            </View>
          </Card>
          {item.link_items.length != 0 ? (
            <FlatList
              data={item.link_items}
              renderItem={({ item }) => (
                <Card style={styles.cardLink}>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "bold",
                        color: "#4d4d4d",
                      }}
                    >
                      {item.product.name} (LINK ITEM)
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 2,
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      Quantity: {item.salelink_qty}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 0,
                      }}
                    >
                      <Text style={{ color: "#262626" }}>
                        {" "}
                        ${item.product.lst_price.toFixed(2)}{" "}
                      </Text>{" "}
                      Promo Price
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 10,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: "#262626" }}>
                        {" "}
                        ${(0.0).toFixed(2)}{" "}
                      </Text>{" "}
                      Discount
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 20,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                      }}
                    >
                      <Text style={{ color: "#262626", marginRight: 40 }}>
                        {" "}
                        ${item.product.lst_price.toFixed(2)}{" "}
                      </Text>{" "}
                      Net Price
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 17,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 0,
                      }}
                    >
                      <Text style={{ color: "#262626", marginRight: 20 }}>
                        {" "}
                        $
                        {(item.salelink_qty * item.product.lst_price).toFixed(
                          2
                        )}{" "}
                      </Text>{" "}
                      Extension
                    </Text>
                  </View>
                </Card>
              )}
            />
          ) : (
            <></>
          )}
        </View>
      )}
    />
  );

  const SecondRoute = () => (
    <FlatList
      data={returnData}
      renderItem={({ item }) => (
        <View>
          <Card style={styles.card}>
            <View>
              <Text
                style={{ fontSize: 14, color: "#4d4d4d", fontWeight: "bold" }}
              >
                {item.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 2,
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                Quantity: {item.return_qty}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 0,
                }}
              >
                <Text style={{ color: "#262626" }}>
                  {" "}
                  ${item.actual_price.toFixed(2)}{" "}
                </Text>{" "}
                Promo Price
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 10,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "#262626" }}>
                  {" "}
                  ${(item.actual_price - item.lst_price).toFixed(2)}{" "}
                </Text>{" "}
                Discount
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 20,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{ fontSize: 12, fontWeight: "500", color: "#4d4d4d" }}
              >
                <Text style={{ color: "#262626", marginRight: 40 }}>
                  {" "}
                  ${item.lst_price.toFixed(2)}{" "}
                </Text>{" "}
                Net Price
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 17,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 0,
                }}
              >
                <Text style={{ color: "#262626", marginRight: 20 }}>
                  {" "}
                  ${(item.return_qty * item.lst_price).toFixed(2)}{" "}
                </Text>{" "}
                Extension
              </Text>
            </View>
          </Card>
          {item.link_items.length != 0 ? (
            <FlatList
              data={item.link_items}
              renderItem={({ item }) => (
                <Card style={styles.cardLink}>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#4d4d4d",
                        fontWeight: "bold",
                      }}
                    >
                      {item.product.name} (LINK ITEM)
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 2,
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      Quantity: {item.returnlink_qty}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 0,
                      }}
                    >
                      <Text style={{ color: "#262626" }}>
                        {" "}
                        ${item.product.lst_price.toFixed(2)}{" "}
                      </Text>{" "}
                      Promo Price
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 10,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: "#262626" }}> $0.00 </Text> Discount
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 20,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                      }}
                    >
                      <Text style={{ color: "#262626", marginRight: 40 }}>
                        {" "}
                        ${item.product.lst_price.toFixed(2)}{" "}
                      </Text>{" "}
                      Net Price
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 17,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 0,
                      }}
                    >
                      <Text style={{ color: "#262626", marginRight: 20 }}>
                        {" "}
                        $
                        {(item.returnlink_qty * item.product.lst_price).toFixed(
                          2
                        )}{" "}
                      </Text>{" "}
                      Extension
                    </Text>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text> </Text>
          )}
        </View>
      )}
    />
  );

  const ThirdRoute = () => (
    <FlatList
      data={sampleData}
      renderItem={({ item }) => (
        <View>
          <Card style={styles.card}>
            <View>
              <Text
                style={{ fontSize: 14, color: "#4d4d4d", fontWeight: "bold" }}
              >
                {item.name}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 2,
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                Quantity: {item.sample_qty}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 0,
                }}
              >
                <Text style={{ color: "#262626" }}> $0.00 </Text> Promo Price
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 10,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 10,
                }}
              >
                <Text style={{ color: "#262626" }}> $0.00 </Text> Discount
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 20,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{ fontSize: 12, fontWeight: "500", color: "#4d4d4d" }}
              >
                <Text style={{ color: "#262626", marginRight: 40 }}>
                  {" "}
                  $0.00{" "}
                </Text>{" "}
                Net Price
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginRight: 17,
                marginTop: 2,
              }}
            >
              <Text style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}>
                {""}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: "#4d4d4d",
                  marginRight: 0,
                }}
              >
                <Text style={{ color: "#262626", marginRight: 20 }}>
                  {" "}
                  $0.00{" "}
                </Text>{" "}
                Extension
              </Text>
            </View>
          </Card>
          {item.link_items.length != 0 ? (
            <FlatList
              data={item.link_items}
              renderItem={({ item }) => (
                <Card style={styles.cardLink}>
                  <View>
                    <Text
                      style={{
                        fontSize: 14,
                        color: "#4d4d4d",
                        fontWeight: "bold",
                      }}
                    >
                      {item.product.name} (LINK ITEM)
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 2,
                      marginTop: 10,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      Quantity: {item.samplelink_qty}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 0,
                      }}
                    >
                      <Text style={{ color: "#262626" }}> $0.00 </Text> Promo
                      Price
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 10,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 10,
                      }}
                    >
                      <Text style={{ color: "#262626" }}> $0.00 </Text> Discount
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 20,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                      }}
                    >
                      <Text style={{ color: "#262626", marginRight: 40 }}>
                        {" "}
                        $0.00{" "}
                      </Text>{" "}
                      Net Price
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginRight: 17,
                      marginTop: 2,
                    }}
                  >
                    <Text
                      style={{ fontSize: 14, color: "#4d4d4d", marginRight: 0 }}
                    >
                      {""}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#4d4d4d",
                        marginRight: 0,
                      }}
                    >
                      <Text style={{ color: "#262626", marginRight: 20 }}>
                        {" "}
                        $0.00{" "}
                      </Text>{" "}
                      Extension
                    </Text>
                  </View>
                </Card>
              )}
            />
          ) : (
            <Text> </Text>
          )}
        </View>
      )}
    />
  );

  const renderScene = SceneMap({
    first: FirstRoute,
    second: SecondRoute,
    third: ThirdRoute,
  });
  const [routes] = React.useState([
    { key: "first", title: "Sales" },
    { key: "second", title: "Return" },
    { key: "third", title: "Sample" },
  ]);
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#737373" }}
      style={{ backgroundColor: "white", marginBottom: 8 }}
      renderLabel={({ route }) => (
        <Text style={{ color: "#333333", margin: 8 }}>{route.title}</Text>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.screenView}>
        <View>
          <AwesomeAlert
            show={showAlert}
            showProgress={false}
            message="Do you want to post the invoice?"
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonColor="#D0342C"
            confirmButtonColor="#3c8954"
            onCancelPressed={() => {
              setShowAlert(false);
            }}
            onConfirmPressed={() => {
              generateInvoiceNumber();
              setShowAlert(false);
              createTable();
              adddata();
              tableHtml(1);
              updateInvoiceSequence();
              //navigation.navigate("TabScreen");
            }}
          />
          <View>
            {Platform.OS === "android"}

            <View
              style={{
                padding: 10,
                //marginTop: 20,
                height: "100%",
                //marginBottom: 60,
                //borderRadius: 10,
                backgroundColor: "white",
              }}
            >
              <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: Dimensions.get("window").width }}
                renderTabBar={renderTabBar}
              />
            </View>
          </View>
        </View>
        <View style={{ backgroundColor: "#3c8", height: 50 }}>
          <Text
            style={{
              color: "white",
              fontWeight: "700",
              fontSize: 24,
              textAlign: "center",
              marginTop: 6,
              marginLeft: 100,
            }}
          >
            Total: <Text> ${(Math.round(total * 100) / 100).toFixed(2)} </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    padding: 0,
  },
  screenView: {
    marginBottom: 100,
  },
  card: {
    height: 130,
    padding: 8,
    borderColor: "#666666",
    borderBottomWidth: 1,
  },
  cardLink: {
    backgroundColor: "#e6e6e6",
    height: 130,
    padding: 8,
    borderBottomWidth: 1,
    borderColor: "#666666",
  },
  prod: {
    width: 200,
    borderWidth: 2,
  },
  view: {
    flex: 1,
    flexDirection: "row",
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
  },
  vw: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
  },
});
