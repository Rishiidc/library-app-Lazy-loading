import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, KeyboardAvoidingView, ToastAndroid } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase'
import db from '../config'
import { unstable_renderSubtreeIntoContainer } from 'react-dom';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    handletransaction = async () => {
      var TransactionType = await this.checkbookavailability()
      console.log("transactiontype"+TransactionType)
      if (!TransactionType){
        alert("The book is not in the library")
      }
      else if (TransactionType === "issue"){
        var StudentEligible = await this.StudentIssueEligibility()
        if (StudentEligible){
          this.issue()
          alert("Book is issued")
        }
      }
      else {var StudentEligible = await this.studentReturnEligibility()
         if (StudentEligible){
           this.return()
           alert("Book is returned")
         }
      }
      /*await db.collection("Books").doc(this.state.scannedBookId).get()
      .then(doc=>{
        var book = doc.data()
        if (book.availability === true){
          this.issue()
        }
        else {
          this.return()
        }
      })
      alert("Transaction is taking place")*/
      //ToastAndroid.show("Transaction is taking place.",ToastAndroid.SHORT)
    }
    checkbookavailability = async () => {
      const bookref = await db.collection("books").where("bookID","==",this.state.scannedBookId).get()
      var transactiontype = ""
      if (bookref.docs.length == 0){
        transactiontype = false
        console.log(bookref.docs.length)
      }
      else {
        bookref.docs.map(doc=>{
          var book = doc.data()
          if (book.availability === true){
            transactiontype = "issue"
          }
          else {transactiontype = "return"}
        })
      }
     return transactiontype
    }
    studentIssueEligibility = async () => {
      const transref = await db.collection("Transaction").where("bookID","==",this.state.scannedBookId).limit(1).get()
      var StudentEligible = ''
      
       transref.docs.map(doc=>{
          var Transaction = doc.data()
          if (Transaction.studentID === this.state.scannedStudentId){
            StudentEligible = true
          }
          else {StudentEligible = false;
          alert("This student did not book")}
          this.setState({
          scannedStudentId:'', 
          scannedBookId:''
          })
        })
      
     return StudentEligible
    }
     StudentReturnEligibility = async () => {
      const studentref = await db.collection("students").where("studentID","==",this.state.scannedStudentId).get()
      var StudentEligible = ''
      if (studentref.docs.length == 0){
        StudentEligible = false
        console.log(studentref.docs.length)
        alert("This student is not in the database")
      }
      else {
       studentref.docs.map(doc=>{
          var student = doc.data()
          if (student.booksissued < 2){
            StudentEligible = true
          }
          else {StudentEligible = false;
          alert("This student has already taken two books")}
          this.setState({
          scannedStudentId:'', 
          scannedBookId:''
          })
        })
      }
     return StudentEligible
    }
    issue = async () => {
      db.collection("Transaction").add({
        studentID: this.state.scannedStudentId,
        bookID: this.state.scannedBookId,
        date: firebase.firestore.Timestamp.now().toDate(),
        type: "issue"
      })
      db.collection("Books").doc(this.state.scannedBookId).update({
        availability: false
      })
      db.collection("Students").doc(this.state.scannedStudentId).update({
        booksissued: firebase.firestore.FieldValue.increment(1)
      })
      alert("Issued")
      this.setState({scannedStudentId:'',scannedBookId:''})
    }
    return = async () => {
      db.collection("Transaction").add({
        studentID: this.state.scannedStudentId,
        bookID: this.state.scannedBookId,
        date: firebase.firestore.Timestamp.now().toDate(),
        type: "issue"
      })
      db.collection("Books").doc(this.state.scannedBookId).update({
        availability: true
      })
      db.collection("Students").doc(this.state.scannedStudentId).update({
        booksissued: firebase.firestore.FieldValue.increment(-1)
      })
      alert("Returned")
      this.setState({scannedStudentId:'',scannedBookId:''})
    }

    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;
      
      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <KeyboardAvoidingView behavior = "padding" enabled style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Whiley</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Book Id"
              onChangeText={text =>{this.setState({scannedBookId:text})}}
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id"
              onChangeText={text =>{this.setState({scannedStudentId:text})}}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style = {styles.scanButton} 
            onPress={async()=>{
              this.handletransaction()
            }}>
              <Text>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    }
  });