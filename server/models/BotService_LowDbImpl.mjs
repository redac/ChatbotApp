import {Bot} from "./Bot.mjs";
import {Low, JSONFile} from 'lowdb';


class BotService{
	constructor(botServiceAccessPoint){ 
		this.db = {};
		this.botServiceAccessPoint = botServiceAccessPoint;  //Should Check passed Values
		this.ports = [];
		for(let k = 3002; k < 4001; k++){
			this.ports.push(k);
		}
	}

	static async create(botServiceAccessPoint){ //since I cannot return a promise in a constructor
		const service = new botService(botServiceAccessPoint);
		const adapter = new JSONFile("./model/db.json");
		service.db = new Low(adapter);
		await service.db.read();
		service.db.data = service.db.data || { bots: [] } //if db is null, create it.
		return service;
	}


	async addbot(anObject){
		let newbot;
		let portNum = this.ports.shift();
		try{
  			newbot = new Bot({ port: portNum });
			newBot.rive
			  .loadDirectory('../brain')
			  .then(success_handler(newBot))
			  .catch(error_handler);
			console.log(newBot);
		}catch(err){
			throw err; //throwing an error inside a Promise
		}
		this.db.data.bots.push(newbot);
		await this.db.write();
		return `added bot of id ${newbot.id}`;
	}


	//from PATCH
	async updatebot(id, anObject){
		let index = this.db.data.bots.findIndex(e=> e.id == id);	
		if(index >-1 ){
			//At this point, you may have a safeguard to verify if the fields of the given Object are from a bot
			for(let property in anObject){
				if(!Bot.isValidProperty(property,anObject[property])){
					throw new Error(`given property is not a valid bot property : ${anObject}`);	
				}
			}
			//At this point, we are sure that all properties are valid and that we can make the update.
			for(let property in anObject){
				(this.db.data.bots)[index][property] = anObject[property];
			}
			await this.db.write();
			return "Done UPDATING";
		}
		throw new Error(`cannot find bot of id ${id}`);
	}


	async removebot(id){
		let index = this.db.data.bots.findIndex(e=> e.id == id);
		if(index >-1 ){
			let removedBot = this.getbot(id);
			this.ports.unshift(removedBot.port);
			this.db.data.bots.splice(index,1);
			await this.db.write();
			return `removed bot of id ${id}`;
		}
		throw new Error(`cannot find bot of id ${id}`);
	}

	getbot(id){
		let index = this.db.data.bots.findIndex(e=> e.id == id);
		if(index >-1 ){
			return  (this.db.data.bots)[index];
		}
		throw new Error(`cannot find bot of id ${id}`);	
	}

	getbots(){
		return this.db.data.bots;
	}

	



}

function success_handler(bot) {
	console.log('Brain loaded!');
	bot.rive.sortReplies();
  
	// Set up the Express app.
	var app = express();
  
	// Parse application/json inputs.
	app.use(bodyParser.json());
	app.set('json spaces', 4);
  
	// Set up routes.
	//let reply = getReply(testBot)
	app.post('/reply', getReply);
	app.get('/', showUsage);
	app.get('*', showUsage);
  
	// Start listening.
	app.listen(bot.port, function () {
	  console.log(`Listening on http://localhost:${bot.port}`);
	});
}

function error_handler(loadcount, err) {
	console.log('Error loading batch #' + loadcount + ': ' + err + '\n');
}

// POST to /reply to get a RiveScript reply.
function getReply(req, res) {
	// Get data from the JSON post.
	var username = req.body.username;
	var message = req.body.message;
	var vars = req.body.vars;
  
	// Make sure username and message are included.
	if (typeof username === 'undefined' || typeof message === 'undefined') {
	  return error(res, 'username and message are required keys');
	}
  
	// Copy any user vars from the post into RiveScript.
	if (typeof vars !== 'undefined') {
	  for (var key in vars) {
		if (vars.hasOwnProperty(key)) {
		  bot.rive.setUservar(username, key, vars[key]);
		}
	  }
	}

  // Get a reply from the bot.
  bot.rive
    .reply(username, message, this)
    .then(function (reply) {
      // Get all the user's vars back out of the bot to include in the response.
      vars = bot.rive.getUservars(username);

      // Send the JSON response.
      res.json({
        status: 'ok',
        reply: reply,
        vars: vars,
      });
    })
    .catch(function (err) {
      res.json({
        status: 'error',
        error: err,
      });
    });
}

// All other routes shows the usage to test the /reply route.
function showUsage(req, res) {
	var egPayload = {
	  username: 'soandso',
	  message: 'Hello bot',
	  vars: {
		name: 'Soandso',
	  },
	};
	res.writeHead(200, { 'Content-Type': 'text/plain' });
	res.write('Usage: curl -i \\\n');
	res.write('   -H "Content-Type: application/json" \\\n');
	res.write("   -X POST -d '" + JSON.stringify(egPayload) + "' \\\n");
	res.write('   http://localhost:2001/reply');
	res.end();
}
  
  // Send a JSON error to the browser.
function error(res, message) {
	res.json({
	  status: 'error',
	  message: message,
	});
}

export {BotService}