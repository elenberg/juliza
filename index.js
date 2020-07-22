// require the discord.js module
const Discord = require('discord.js');
const config = require('./config.json');
const firebase = require('firebase');
const Markov = require('markov-strings').default
require("firebase/firestore");

// create a new Discord client
const client = new Discord.Client();
const options = {
    maxTries: 20, // Give up if I don't have a sentence after 20 tries (default is 10)
    prng: Math.random, // An external Pseudo Random Number Generator if you want to get seeded results
    filter: (result) => {
      return
        result.string.split(' ').length >= 5 && // At least 5 words
        result.string.split(' ').length <= 150            // End sentences with a dot.
    }
  }
console.log(config.firebaseProjectId)
  // Set the configuration for your app
  // TODO: Replace with your project's config object

firebase.initializeApp({
    apiKey: config.firebaseApiKey,
    authDomain: config.authDomain,
    projectId: config.firebaseProjectId
  });
var db = firebase.firestore();

// when the client is ready, run this code
// this event will only trigger one time after logging in
client.once('ready', () => {
	console.log('Ready!');
});

// login to Discord with your app's token
client.login(config.token);


client.on('message', message => {
    if(/^[a-z0-9]/i.test(message.content) && message.author.bot === false) {
        console.log(message.content);
        console.log(message.author.id);
        docRef = db.collection("users").doc(message.author.id);
        docRef.get().then(function(doc){
            if(doc.exists){
                docRef.update({
                    msg: firebase.firestore.FieldValue.arrayUnion(message.content)
                })
                .then(function(){
                    console.log("Document updated");
                })
                .catch(function(error){
                    console.log("error: ", error)
                });
            }
            else{
                db.collection("users").doc(message.author.id).set(
                   {
                       msg : [message.content]
                   }
                )
                .then(function(){               
                     console.log("Document created");
                })
                .catch(function(error){
                    console.log("error: ", error)
                })
            }
        })
        
    }
	if (message.content === '!ping') {
        // send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    }
    if (message.content === '?jq'){
        docRef = db.collection("users").doc(message.author.id);
        docRef.get().then(function(doc){
        if(doc.exists){
            console.log(doc.data()['msg']);
            var markov = new Markov(doc.data()['msg'], { stateSize: 2 })
            markov.buildCorpus()
            var result = markov.generate(options);
            console.log(result);
            message.channel.send(result.string);
        }
        else{
            message.channel.send('Not enough data.');
        }
        })
    }
});
