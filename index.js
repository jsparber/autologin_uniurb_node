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
var HTMLParser = require('fast-html-parser');
var config = require('./config');
var simbole = 0;

setInterval(function() {
  doLogin(simbole % 4);
  simbole++;
}, 500);

function doLogin(i) {
  //get AP ip adress, to get the challange
  request("http://sparber.net", function (err, res) {
    var body = HTMLParser.parse(res.body);
    if(!res.body.match(/sparber.net/gi)) {
      var apUrl = body.querySelector('a').attributes.href;
      request(apUrl, function (err, res) {
        var body = HTMLParser.parse(res.body);
        var chal = body.querySelector('INPUT').attributes.VALUE;
        var apIP = apUrl.split("/")[2].split(":")[0];
        url="https://radius.uniurb.it/URB/test.php?" +
          "chal=" + chal +
          "&uamip=" + apIP + 
          "&uamport=3990&userurl=&" +
          "UserName=" + config.username +
          "&Realm=" + config.realm + 
          "&Password=" + config.password +
          "&form_id=69889&login=login";
        request(url, function (err, res) {
          var body = HTMLParser.parse(res.body);
          var url = body.querySelectorAll('meta')[3].attributes.content.split("url=")[1];
          request(url, function (err, res) {
            if(!res.body.match(/Logout/gi))
              console.log("Error: not connected!");
            else
              console.log("Success: connected!");

          });
        });
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
    ///  console.log("Already connected!");
  });

}
