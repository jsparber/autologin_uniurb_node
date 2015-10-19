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

var request = require("request");
var config = require('./config');
var simbole = 0;
var TESTURL = "http://raw.githubusercontent.com/jsparber/autologin_uniurb_node/master/isonline"
var logoffUrl = "http://logout.uniurb.it"

//curl 'http://172.25.0.1:8002/' -H 'Host: 172.25.0.1:8002' -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:41.0) Gecko/20100101 Firefox/41.0' -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' -H 'Accept-Language: en,it;q=0.8,de;q=0.5,en-US;q=0.3' --compressed -H 'DNT: 1' -H 'Connection: keep-alive' --data 'user=j.sparber&auth_pass=sdfsdfdsf&Realm=stud&auth_user=j.sparber%40stud&redirurl=http%3A%2F%2Fsparber.net%2F&accept=LOGIN'

doLogin(simbole % 4);
setInterval(function() {
  doLogin(simbole % 4);
  simbole++;
}, 5000);

function doLogin(i) {
  request.get(TESTURL, function (err, res) {
    if(!err && !res.body.match(/true/gi)) {
      var portalAction = res.body.split("portal_action=")[1].split("&")[0];
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
          if(res.statusCode == 200) {
            var msg = res.body.split("message=")[1].split('"')[0];
            console.log("Error: " + msg);
          }
          else
            console.log("Successfull login!");
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
    }
  });

}

process.on('SIGINT', function() {
  console.log("Logoff!");
  request(logoffUrl, function (err, res) {
    process.exit(0);
  });
});
