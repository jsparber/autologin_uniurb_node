/*
#	Copyright 2015 Julian Sparber
#
#	This program is free software; you can redistribute it and/or modify
#	it under the terms of the GNU General Public License as published by
#	the Free Software Foundation; either version 3, or (at your option)
#	any later version.
#
#	This program is distributed in the hope that it will be useful,
#	but WITHOUT ANY WARRANTY; without even the implied warranty of
#	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#	GNU General Public License for more details.
#
#	You should have received a copy of the GNU General Public License
#	along with this program; if not, write to the Free Software
#	Foundation, 51 Franklin Street - Fifth Floor, Boston,
#	MA 02110-1301, USA.  */

var simbole = 0;
var TESTURL = "http://juliansparber.com/autologin_uniurb_node/isonline"
var logoffUrl = "http://logout.uniurb.it"
var request = require("request");
var config = {};
try {
  config = require('./config');
  doLogin(simbole % 4);
} catch (e) {
  console.log("Create config:");
  var fs = require('fs');
  var readline = require('readline');

  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question("What is your username (with realm)? ", function(username) {
    config.username = username.split("@")[0];
    config.realm = "@" + username.split("@")[1];
    rl.question("What is your password? ", function(password) {
      config.password = password;
      console.log(config);
      rl.question("Do you want to save this credentials? [Y/n] ", function(answer) {
        if (answer == "Y" || answer == "y" || answer == "") {
          console.log("The credentials will be saved!");
          fs.open('./config', 'w', function (err, fd) {
            if (err)
              throw err;
            fs.write(fd, "module.exports =" + JSON.stringify(config), function (err) {
              if (err)
                throw err;
              fs.close(fd, function (err) {
                if (err)
                  throw err;
              });
            });
          });
        }
        else
          console.log("The credentials won't be saved!");

        rl.close();
        doLogin(simbole % 4);
      });
    });
  });
}

//curl 'http://172.25.0.1:8002/' -H 'Host: 172.25.0.1:8002' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,it;q=0.8,de;q=0.5,en-US;q=0.3' --compressed -H 'DNT: 1' -H 'Connection: keep-alive' --data 'user=j.sparber&auth_pass=sdfsdfdsf&Realm=stud&auth_user=j.sparber%40stud&redirurl=http%3A%2F%2Fsparber.net%2F&accept=LOGIN'


function doLogin(i) {
  request.get({url : TESTURL, followRedirect : false}, function (err, res) {
    if(!err && res.body != "true\n") {
      console.log("Do login...");
      if(res.statusCode == 200) {
        var portalAction = res.body.split("portal_action=")[1].split("&")[0];
      }
      else {
        console.log(res.headers.location);
        var portalAction = res.headers.location;
      }

      var formData = {
        user : config.username,
        auth_pass : config.password,
        Realm : config.realm.slice(1),
        auth_user : config.username + config.realm,
        redirurl : TESTURL,
        accept : "LOGIN"
      };
      request.post({url: portalAction, form: formData}, function(err, res, body){ 
        if(!err) {
          //console.log(res.statusCode);
          console.log(res.body);
          if(res.statusCode == 200 && res.body.match(/Click the button below to disconnect/gi) == null) {
            try {
              var msg = res.body.split("message=")[1].split('"')[0];
              console.log("Error: " + msg);
              console.log("Try to remove the config file.");
            }
            catch (e) {
            }
          }
          else {
            console.log("Successful login!");
            console.log("Will keep you logged in...");
            doLogin(simbole % 4);
          }
        }

      });
    }
    else {
      switch (i) {
        case 0: 
          process.stdout.write("/\r");
          break;
        case 1: 
          process.stdout.write("-\r");
          break;
        case 2: 
          process.stdout.write("\\\r");
          break;
        case 3: 
          process.stdout.write("|\r");
          break;
      }
      setTimeout(function() {
        doLogin(simbole % 4);
        simbole++;
      }, 5000);
    }
  });

}

process.on('SIGINT', function() {
  console.log("Do logout...");
  request(logoffUrl, function (err, res) {
    console.log("Succesful logout!");
    process.exit(0);
  });
});
