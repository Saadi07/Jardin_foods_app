import React, { useState, useEffect } from "react";
import { StyleSheet, Text, FlatList, View, Dimensions } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Card, Button, IconButton } from "react-native-paper";
import AwesomeAlert from "react-native-awesome-alerts";
import { openDatabase } from "react-native-sqlite-storage";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import RNPrint from "react-native-print";

const db = openDatabase({ name: "cartDatabase" });
export default function InvoiceDetails({ navigation, route }) {
  const [index, setIndex] = React.useState(0);
  const [warehouse, setWarehouse] = useState("");
  const data = route.params;
  const dataArray = data.data1;
  const salesData = JSON.parse(dataArray.sales);
  const returnData = JSON.parse(dataArray.return);
  const sampleData = JSON.parse(dataArray.sample);

  const getWarehouseName = async () => {
    const salesPerson = await AsyncStorage.getItem("salesPerson");
    const salesPersonData = JSON.parse(salesPerson);
    setWarehouse(() => salesPersonData.default_warehouse.name);
    // console.log(warehouse)
  };

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
            onPress={() => tableHtml(1)}
          >
            {" "}
          </IconButton>
        </>
      ),
    });
  }, [navigation]);

  const tableHtml = async (choice) => {
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
      <td > <p style="text-align:center"> $0.00 </p> </td>
      <td > <p style="text-align:center"> $0.00 </p> </td>
      </tr>`;
      } else {
        sampleArray =
          sampleArray +
          `<tr class="item">
     <td > <p style="text-align:center">  ${sampleData[i].item_no} </p> </td>
     <td > <p style="text-align:left"> ${sampleData[i].name} </p> </td>
     <td > <p style="text-align:center">  ${sampleData[i].sample_qty} </p></td>
     <td > <p style="text-align:center"> $0.00</p> </td>
     <td > <p style="text-align:center"> $0.00 </p> </td>
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
              Invoice No: ${dataArray.invoice_no} <br />
              Date: ${dataArray.invoice_date} 
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
                                 Branch/Route Number:${
                                   dataArray.warehouse
                                 }<br />
                                 Payment Term:${dataArray.payment_term}
                             </td>
                         </tr>
           <tr>
           <td style=" width: 30px; overflow: hidden;margin-right:130px; " >
            Bill To: ${dataArray.customer_name} <br />
           Cust #: ${dataArray.customer_no} <br />
           ${dataArray.delivery}
                           </td>
 
                             <td style=" width: 30px; overflow: hidden;margin-left:200; ">
             Bill To: ${dataArray.customer_name}<br />
             Cust #: ${dataArray.customer_no} <br />
             ${dataArray.delivery}
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
             <td> $${(Math.round(dataArray.subtotal * 100) / 100).toFixed(
               2
             )}</td>
             </tr>
             <tr>
             <td> Tax: </td>
             <td> $${(Math.round(dataArray.tax * 100) / 100).toFixed(2)} </td>
             </tr>
             <tr style="background: #eee">
             <td> Total: </td>
             <td> $${(Math.round(dataArray.total * 100) / 100).toFixed(2)} </td>
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
      directory: "assets",
      height: 1000, //changes
      width: 620, //changes
    };
    let file = await RNHTMLtoPDF.convert(options);
    if (choice == 1) {
      await RNPrint.print({ filePath: file.filePath });
      navigation.navigate("TabScreen");
    } else {
      navigation.navigate("PdfScreen", { url: file.filePath });
    }

    //let file = await RNHTMLtoPDF.convert(options);
    //navigation.navigate("PdfScreen", { url: file.filePath });
  };

  useEffect(() => {
    getWarehouseName();
  });

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
            //show={showAlert}
            showProgress={false}
            message="Do you want to post the invoice?"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="No"
            confirmText="Yes"
            cancelButtonColor="#D0342C"
            confirmButtonColor="#3c8954"
            onCancelPressed={() => {
              //setShowAlert(false);
            }}
            onConfirmPressed={() => {
              //setShowAlert(false);
              //createTable();
              //adddata();
              //createPDF("print");
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
            Total:{" "}
            <Text>
              {" "}
              ${(Math.round(dataArray.total * 100) / 100).toFixed(2)}{" "}
            </Text>
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
});
