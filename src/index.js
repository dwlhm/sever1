require('dotenv/config');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
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

app.get("/data/:lattitude/:longitude/:angkotId", (req, res) => {
	let lattitude = String(req.params.lattitude);
	let longitude = String(req.params.longitude);
	let angkotId = String(req.params.angkotId);

	axios.get("https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=" + String(lattitude) + "%2C" + String(longitude) + "%2C250&mode=retrieveAddresses&maxresults=1&gen=9&app_id=9fqnaB6d6rLJWxFpNASK&app_code=RoB26jtN0zFQ1BBhPdJe2A")
			.then((response) => {
			console.log(response.data.Response.View[0].Result[0].Location.Address.Street);
			var akol = String(response.data.Response.View[0].Result[0].Location.Address.Street);
			try {
				db.collection("angkotData").doc(angkotId).update({ jalan: akol })
		      	db.collection("angkot").add({
			      	angkotId: angkotId,
			        lattitude: lattitude,
			        longitude: longitude,
			        date: firebase.firestore.FieldValue.serverTimestamp()
		      	})
		      	db.collection("angkotData").doc(angkotId).get().then( doc => {
		      		res.json(doc.data());
		      	})
		  	} catch(error) {
		  		console.log(error);
		  		res.send("error");
		  	}
		})
		.catch( (error) => {
	    	console.log(error);
		})

	
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