import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseApp = initializeApp({
    apiKey: "AIzaSyAiMdsfVbNs4VOxOnfwYZfzMSPx-LgZxJc",
    authDomain: "kakeibo-qcli.firebaseapp.com",
    projectId: "kakeibo-qcli",
    storageBucket: "kakeibo-qcli.appspot.com",
    messagingSenderId: "140248038071",
    appId: "1:140248038071:web:f1673f2f4a53c9296feb32"
})

const auth = getAuth(firebaseApp)

const db = getFirestore(firebaseApp)

export { auth, db }