"use strict";

var database = require("../database");
var fs = require("fs");
var _ = require("lodash");

function load(people) {
  database.getConnection().then(function (db) {
    try {
      console.log("Saving to guests.");
      db.collection("guests").insert(people, function (err, response) {
        if (err) {
          console.log(err);
          return;
        }
        db.close();
      });
    } catch(error) {
      console.log(error);
    }
  }).fail(function (err) {
    console.log(err);
  });
}

function getData() {
  var file = fs.readFileSync('./Names.csv', 'utf8');

  var names = file.split("\r\n");
  names.sort();
  var output = _.map(names, function (item) {
    return {name: item};
  });

  console.log(output);
  return output;
}

var people = getData();
load(people);