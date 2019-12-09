require('dotenv/config');
const express = require('express');
const cors = require('cors');
const firebase = require('firebase');

const app = express();

firebase.initializeApp({
    apiKey: "AIzaSyCPtMTnST5JqZX0oD1cLgbhFrJSC16ST9A",
    authDomain: "angkot-24fe7.firebaseapp.com",
    databaseURL: "https://angkot-24fe7.firebaseio.com",
    projectId: "angkot-24fe7",
    storageBucket: "angkot-24fe7.appspot.com",
    messagingSenderId: "30194400328",
    appId: "1:30194400328:web:d072e4af07479c5633ec7d",
    measurementId: "G-2C30WTJ4F5"
});

let db = firebase.firestore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
var port = process.env.PORT || 3001;

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.get("/data/:lattitude/:longitude/:jalan", (req, res) => {
	let lattitude = req.params.lattitude;
	let longitude = req.params.longitude;
	let jalan = req.params.jalan;

	try {
      db.collection("angkot").add({
        lattitude: lattitude,
        longitude: longitude,
        jalan: jalan,
        date: firebase.firestore.FieldValue.serverTimestamp()
      })
      res.send("sukses");
  	} catch(error) {
  		console.log(error);
  		res.send("error");
  	}
})

app.get("/data1/:gas", (req, res) => {
	let gas = req.params.gas;

	try {
      db.collection("angkot1").add({
        gas: gas,
        date: firebase.firestore.FieldValue.serverTimestamp()
      })
      res.send("sukses");
  	} catch(error) {
  		console.log(error);
  		res.send("error");
  	}
})

app.listen(port, () => {
  console.log(`Example app on port ${port}`);
})