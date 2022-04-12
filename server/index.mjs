import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import {BotService} from "./models/BotService_LowDbImpl.mjs";
let botServiceInstance;

const app = express();

//// Enable ALL CORS request
app.use(cors())
////

const port = 3001

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true })) 

app.get('/v2/bots/', (req, res)=>{
	try{
		let myArrayOfbots;
		if( undefined == (myArrayOfbots = botServiceInstance.getbots() )){
			throw new Error("No bots to get");
		}
		res.status(200).json(myArrayOfbots);
	}
	catch(err){
		console.log(`Error ${err} thrown... stack is : ${err.stack}`);
		res.status(404).send('NOT FOUND');
	}
});

//End point to get a bot
app.get('/v2/bots/:idddd', (req, res)=>{
	let id = req.params.idddd;
	if(!isInt(id)) {
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	}else{
		try{
			let mybot = botServiceInstance.getbot(id);
			res.status(200).json(mybot);
		}
		catch(err){
			console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			res.status(404).send('NOT FOUND');
		}
	}
});

app.delete('/v2/bots/:id',(req,res)=>{
	let id = req.params.id;
	if(!isInt(id)) { //Should I propagate a bad parameter to the model?
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	}else{
		botServiceInstance
			.removebot(id)
			.then((returnString)=>{
				console.log(returnString);
				res.status(201).send('All is OK');
			})
			.catch((err)=>{
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				res.status(400).send('BAD REQUEST');
			});	
	}	
});


//create a new bot (POST HTTP method)
app.post('/v2/bots/',(req,res)=>{
	let thebotToAdd = req.body;
	botServiceInstance
		.addbot(thebotToAdd) 
		.then((returnString)=>{
			console.log(returnString);
			res.status(201).send('All is OK');
		})
		.catch((err)=>{
			console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			res.status(400).send('BAD REQUEST');
		});	
});

app.patch('/v2/bots/:id',(req,res)=>{
	let id = req.params.id;
	if(!isInt(id)) { //Should I propagate a bad parameter to the model?
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	}else{
		let newValues = req.body; //the client is responsible for formating its request with proper syntax.
		botServiceInstance
			.updatebot(id, newValues)
			.then((returnString)=>{
				console.log(returnString);
				res.status(201).send('All is OK');
			})
			.catch((err)=>{
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				res.status(400).send('BAD REQUEST');
			});	
	}	
});


let id = Math.floor(Math.random() * Math.floor(100000)) ;
let abot ={ //UGLY
	'id':id,
};

BotService.create(personServiceAccessPoint).then(ts=>{
	botServiceInstance=ts;
	botServiceInstance
		.addbot(abot)
		.catch((err)=>{console.log(err);});
	app.listen(port, () => {
  		console.log(`Example app listening at http://localhost:${port}`)
	});
});

//HELPER

function isInt(value) {
  let x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}


