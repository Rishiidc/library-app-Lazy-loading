import React from 'react';
import { Text, View,  FlatList, TouchableOpacity } from 'react-native';
import db from '../config'
import {ScrollView, TextInput} from 'react-native-gesture-handler'

export default class Searchscreen extends React.Component {
  constructor(props){
    super (props)
    this.state = {alltransactions:[],lastdocument:null,input:''}
  }
  componentDidMount = async () => {
    const query = await db.collection("Transaction").get()
    query.docs.map(search =>{
      this.setState({
        alltransactions:[...this.state.alltransactions,search.data()],
        lastdocument:search
      })
    })
  }
  fetchmore = async () => {
    const query = await db.collection("Transaction").startAfter(this.state.lastdocument).limit(5).get()
    query.docs.map(search =>{
      this.setState({
        alltransactions:[...this.state.alltransactions,search.data()],
        lastdocument:search
      })
    })
  }
    render() {
      return (
        <View>
        <TextInput placeholder = "Enter BookID or StudentID" onChangeText = {t=>{this.setState({input:t})}}>

        </TextInput>
        <TouchableOpacity style = {{backgroundColor:"blue"}}> 
          <Text>
            search
          </Text>
        </TouchableOpacity>
       <FlatList 
       data = {this.state.alltransactions}
       renderItem = {
         ({item})=>(
           <View>
             <Text>
               {"bookID:"+item.bookID}
             </Text>
             <Text>
               {"studentID:"+item.studentID}
             </Text>
             <Text>
               {"date:"+item.date}
             </Text>
             <Text>
               {"type:"+item.type}
             </Text>
           </View>
         )
       }
       onEndReached = {this.fetchmore}
       onEndReachedThreshold = {0.7}>

       </FlatList></View>
      );
    }
  }