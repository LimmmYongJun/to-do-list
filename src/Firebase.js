import firebase from 'firebase';

const firebaseConfig = {
    apiKey: "AIzaSyADgWH_vWjeDTI0AlkKSV_KGeyLlRdlf_0",
    authDomain: "to-do-list-223f6.firebaseapp.com",
    projectId: "to-do-list-223f6",
    storageBucket: "to-do-list-223f6.firebasestorage.app",
    messagingSenderId: "671901902157",
    appId: "1:671901902157:web:471cb686052ec6f1324304"
  };

  const firebaseApp = firebase.initializeApp(firebaseConfig);
const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth };