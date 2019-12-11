require('dotenv/config');
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const firebase = require('firebase');
const turf = require('@turf/turf');

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

var bigboxkey = 'cTcyTtVC0sXPCetNFmochuhH4msjdIl8';

let db = firebase.firestore();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
var port = process.env.PORT || 3001;

app.get("/", (req, res) => {
	res.send("Hello World");
});

app.get('/angkot/all', (req, res) => {

	var data = [];

	try {
		db.collection("angkotData").get().then(response => {
			if (response.empty) {
	            console.log('no data');
	            res.json('no data');
	        } else {  
	            var data = [];
	            response.forEach(doc => {
	              data.push(doc.data());
	            })
	            res.json(data);
	        }
		})
	} catch(error) {
		console.log(error);
		res.send('error');
	}
})

app.get("/data/:lattitude/:longitude/:angkotId", (req, res) => {
	let lattitude = Number(req.params.lattitude);
	let longitude = Number(req.params.longitude);
	let angkotId = String(req.params.angkotId);
	var from = turf.point([lattitude, longitude]);
  	var options = { units: 'meters'};
  	var to = null,naik = null, distance = null;
  	var data = [];

	axios.get("https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=" + String(lattitude) + "%2C" + String(longitude) + "%2C250&mode=retrieveAddresses&maxresults=1&gen=9&app_id=9fqnaB6d6rLJWxFpNASK&app_code=RoB26jtN0zFQ1BBhPdJe2A")
			.then((response) => {
			console.log(response.data.Response.View[0].Result[0].Location.Address.Street);
			var akol = String(response.data.Response.View[0].Result[0].Location.Address.Street);
			try {
				db.collection("angkotData").doc(angkotId).update({ 
					jalan: akol,
					lattitude: lattitude,
					longitude: longitude,
				})
		      	db.collection("angkot").add({
			      	angkotId: angkotId,
			        lattitude: lattitude,
			        longitude: longitude,
			        date: firebase.firestore.FieldValue.serverTimestamp()
		      	})
		 		db.collection("angkotData").doc(angkotId).get().then(doc => {
		 			db.collection("rute").where("nama", "==", String(doc.data().rute)).where("jalan", "==", akol).get().then( response => {
		 				if (response.empty) {
		 					axios({
					        method: 'post',
					        url: 'https://api.thebigbox.id/sms-notification/1.0.0/messages',
					        data: 'msisdn=082121433085&content=angkot%20id:%20'+angkotId+'%20keluar%20rute',
					        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'x-api-key': bigboxkey }
					        })
					        .then(function (response) {
					            //handle success
					            console.log(response);
					            res.send("keluar rute");
					        })
					        .catch(function (response) {
					            //handle error
					            console.log(response);
					            res.send("no data");
					        });

					        
		 					
		 				} else {
		 					db.collection("penumpang").where("jalan", "==", akol).where("angkotId", "==", angkotId).get().then(response => {
		 						if (response.empty) {
		 							db.collection("penumpang").where("jalan", "==", akol).where("status", "==", "menunggu").get().then(response => {
							      		if (response.empty) {
							      			res.send("no data1");
							      		} else {
							      			response.forEach(doc => {
							      				to = turf.point([Number(doc.data().latitude), Number(doc.data().longitude)]);
							      				distance = turf.distance(from, to, options);
									            if (distance < 2) {
									            	naik++;
									            	db.collection("penumpang").doc(String(doc.data().token)).set({
									            		angkot: angkotId
									            	})
									            } else {
									            	console.log("jauh");
									            }
							      			})
							      			db.collection("angkotData").doc(angkotId).update({ 
												naik: naik,
											}).then( () => {
												db.collection("angkotData").doc(angkotId).get().then( doc => {
													db.collection("angkotData").doc(angkotId).update({ 
														turun: 0
													})
										      		res.json(doc.data());
										      	})
											})
							      		}
							      	})
					      		} else {
					      			response.forEach(doc => {
					      				to = turf.point([Number(doc.data().latitude), Number(doc.data().longitude)]);
					      				distance = turf.distance(from, to, options);
							            if (distance < 2) {
							            	naik++;
							            } else {
							            	console.log("jauh");
							            }
					      			})
					      			db.collection("angkotData").doc(angkotId).update({ 
										naik: naik,
									}).then( () => {
										db.collection("angkotData").doc(angkotId).get().then( doc => {
											db.collection("angkotData").doc(angkotId).update({ 
												turun: 0
											})
								      		res.json(doc.data());
								      	})
									})
					      		}
		 					})
		 				}
		 			})	
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

app.get("/update/penumpang/naik/:token", (req, res) => {
	let token = String(req.params.token);
	let angkotId = String(req.params.angkotId);

	try {
		db.collection("penumpang").doc(token).update({
			status: "diangkot"
		})
		db.collection("penumpang").doc(token).get().then(doc => {
			let angkots = String(doc.data().angkot);
			console.log(angkots);
			if (angkots == undefined) {
				res.send("error undefined");
			} else {
				db.collection("angkotData").doc(angkots).get().then(doc => {
					res.json([doc.data()]);
				})
			}
		})
		
		
	} catch(error) {
		console.log(error);
		res.send("error");
	}
})

app.get("/update/penumpang/turun/:token", (req, res) => {
	let token = String(req.params.token);
	try {
		db.collection("penumpang").doc(token).update({
			status: "turun"
		})

		db.collection("penumpang").doc(token).get().then(doc => {
			let angkots = String(doc.data().angkot);
			console.log(angkots);
			if (angkots == undefined) {
				res.send("error undefined");
			} else {
				db.collection("angkotData").doc(angkots).get().then(doc => {
					let turuns = Number(doc.data().turun);
					let penumpangs = Number(doc.data().penumpang);
					turuns--;
					penumpangs++;
					db.collection("angkotData").doc(angkots).update({
						turun: turuns,
						penumpang: penumpangs
					}).then(() => {
						res.send("sukses26");
					}).catch((error) => {
						console.log(error);
						res.send("error26")
					})
				})
			}
		})
	} catch(error) {
		console.log(error);
		res.send("error");
	}
})

app.get("/penumpang/:latitude/:longitude/:nama/:token", (req, res) => {
	let latitude = Number(req.params.latitude);
	let longitude = Number(req.params.longitude);
	let token = String(req.params.token);
	let nama = String(req.params.nama);
	console.log(latitude);
	console.log(longitude);
	axios.get("https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?prox=" + String(latitude) + "%2C" + String(longitude) + "%2C250&mode=retrieveAddresses&maxresults=1&gen=9&app_id=9fqnaB6d6rLJWxFpNASK&app_code=RoB26jtN0zFQ1BBhPdJe2A")
		.then((response) => {
			console.log(response.data.Response.View[0].Result[0].Location.Address.Subdistrict);
			var akol = String(response.data.Response.View[0].Result[0].Location.Address.Subdistrict);
			try {
				db.collection("penumpang").doc(token).set({
					nama: nama,
					latitude: latitude,
					longitude: longitude,
					status: "menunggu",
					token: token,
					jalan: akol
				})
				res.send("sukses");
			} catch(error) {
				console.log(error);
				res.send("error");
			}
		})
		.catch((error) => {
			console.log(error);
			res.send("jaaringan");
		})
})

app.listen(port, () => {
  console.log(`Example app on port ${port}`);
})