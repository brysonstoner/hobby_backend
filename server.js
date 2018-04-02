const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
var pg = require('pg');

require('dotenv').config();

app.use(express.static('public'));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

var conString = process.env.ELEPHANTSQL_URL || "postgres://postgres:5432@localhost/postgres";

var client = new pg.Client(conString);
client.connect((err) => {
  if (err) {
    return console.error(err);
  } else {
    console.log('successfully connected to postgres');
    app.listen(5000, function () {
      console.log("Listening on 5000");
    });
  }
});

app.post('/createAccount', (req, res) => {
  client.query(`insert into users (username) values ('${req.body.username}') returning *`, (err, result) => {
    if (err) {
      res.json(err);
      console.error(err);
    }
    var user = result.rows[0];
    client.query(`insert into hobbies (name, skill_level, userid) values ('${req.body.hobby1Name}', '${req.body.hobby1Skill}', ${user.id})`, (err, result) => {
      if (err) {
        res.json(err);
        console.error(err);
      }
      client.query(`insert into hobbies (name, skill_level, userid ) values ('${req.body.hobby2Name}', '${req.body.hobby2Skill}', ${user.id})`, (err, result) => {
        if (err) {
          res.json(err);
          console.error('error running query', err);
        } else {
          res.json('succesfully inserted user');
        }
      });
    });
  });
});

app.post("/signIn", (req, res) => {
  client.query(`select * from users where username='${req.body.username}'`, (err, result) => {
    if (err) {
      res.json(err);
      console.error('error running query', err);
    } else {
      res.json(result.rows[0]);
    }
  });
});

app.post("/getHobbies", (req, res) => {
  client.query(`select * from hobbies where userid='${req.body.userId}'`, (err, result) => {
    if (err) {
      res.json(err);
      console.error('error running query', err);
    } else {
      res.json(result.rows[0]);
    }
  });
});
