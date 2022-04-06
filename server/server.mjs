//
// Node.JS Web Server for RiveScript
//
import { Bot } from './models/Bot.mjs';

import babelpolyfill from 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import RiveScript from 'rivescript';

// Create the bot.
// var bot = new RiveScript();
// bot.loadDirectory('./brain').then(success_handler).catch(error_handler);
var testBot = new Bot({ port: 2001 });
var testBot2 = new Bot({ port: 2002 });
testBot.rive
  .loadDirectory('./brain')
  .then(success_handler(testBot))
  .catch(error_handler);
console.log(testBot);

testBot2.rive
  .loadDirectory('./brain')
  .then(success_handler(testBot2))
  .catch(error_handler);
console.log(testBot);

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
