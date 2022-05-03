import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBTIdvBZQCBL9JCYs--gZpIQ8ZJJY-ezO4",
  authDomain: "sistema-c095a.firebaseapp.com",
  projectId: "sistema-c095a",
  storageBucket: "sistema-c095a.appspot.com",
  messagingSenderId: "854952024089",
  appId: "1:854952024089:web:6d8b0bfe74c48deddbb288",
  measurementId: "G-2RZ3BLVJTK",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
