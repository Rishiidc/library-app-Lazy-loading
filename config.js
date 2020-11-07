import firebase from "firebase"

var firebaseConfig = {
    apiKey: "AIzaSyBzUc0kNQOuGbYMnnePGgtHp3Ei3-alLhs",
    authDomain: "library-app-d1c90.firebaseapp.com",
    databaseURL: "https://library-app-d1c90.firebaseio.com",
    projectId: "library-app-d1c90",
    storageBucket: "library-app-d1c90.appspot.com",
    messagingSenderId: "702862402603",
    appId: "1:702862402603:web:dae103dc2e70fa7082366e"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()