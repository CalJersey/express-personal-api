// require express and other modules
var express = require('express'),
    app = express();

// parse incoming urlencoded form data
// and populate the req.body object
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// allow cross origin requests (optional)
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

/************
 * DATABASE *
 ************/

var db = require('./models');

/**********
 * ROUTES *
 **********/

// Serve static files from the `/public` directory:
// i.e. `/images`, `/scripts`, `/styles`
app.use(express.static('public'));

/*
 * HTML Endpoints
 */

app.get('/', function homepage(req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


/*
 * JSON API Endpoints
 */

app.get('/api', function apiIndex(req, res) {
  // TODO: Document all your api endpoints below as a simple hardcoded JSON object.
  // It would be seriously overkill to save any of this to your database.
  // But you should change almost every line of this response.
  res.json({
    message: "API for information about vacations people have taken.",
    documentationUrl: "https://github.com/caljersey/express-personal-api/README.md",
    baseUrl: "http://secret-hamlet-82924.herokuapp.com",
    endpoints: [
      {method: "GET", path: "/api", description: "Describes all available endpoints"},
      {method: "GET", path: "/api/profile", description: "Data about me"},
      {method: "GET", path: "/api/vacation",
        description: "List of all vacations. Can limit results with 'limit=x' in query string"},
      {method: "GET", path: "/api/vacation/search",
        description: "Search for vacations by place, and vacationer fields. Use 'q=string' in query string"},
      {method: "GET", path: "/api/vacation/:Id", description: "Return 1 specific vacation"},
      {method: "POST", path: "/api/vacation", description: "Add new vacation to db"},
      {method: "PUT", path: "/api/vacation/:id", description: "Update a vacation"},
      {method: "DELETE", path: "/api/vacation/:id", description: "Delete a vacation"}
    ]
  })
});

app.get('/api/profile', function apiProfile(req, res){
  let bday = new Date(1976,9,1);
  let now = new Date();
  let diffDate = now - bday;
  let awake = true;
  let arTime = now.toTimeString().split(":");
  let hour = parseInt(arTime[0]);
  let min = parseInt(arTime[1]);

  if (hour<8){
    awake = false;
  }
  else if (hour === 22 && min > 0) {
    awake = false;
  }
  else if (hour > 22){
    awake = false;
  }

  diffDate = Math.floor(diffDate/86400000);


  res.json({
    name: "Dan Lombardino",
    gitHubUserName: "calJersey",
    gitHubLink: "https://github.com/caljersey",
    gitHubProfileImage: "https://avatars3.githubusercontent.com/u/14287505?v=4&s=460",
    personalWebSites: ["http://secret-hamlet-82924.herokuapp.com","http://www.vitad.com"],
    currentCity: "Oakland, CA",
    daysSinceIWasBorn: diffDate,
    IAmAwake: awake,
    familyMembers: [
      {name:"Angela", relationship:"Mom", age: 70},
      {name:"Ronin", relationship:"Son", age:14},
      {name:"Abbey", relationship:"Daughter", age:6},
    ]
  })
});

app.get('/api/vacation', function(req, res){
  let limit = parseInt(req.query.limit) || 0;

  db.Vacation.find({}).limit(limit).exec(function(err,vacations){
    if (err){
      console.log(`error: ${err}`);
      res.status(500).json({error:err.message});
    }
    else {
      res.json(vacations);
    }
  });
});

app.get('/api/vacation/search', function(req, res){
  let search = req.query.q || "";
  let objName = {};
  let objPlace = {}
  if (search.length){
    objName.vacationerName = search;
    objPlace.place = search;
  }

  db.Vacation.find({$or: [objName,objPlace]})
    .collation({ locale: 'en_US', strength: 2 })
    .exec(function(err,vacations){
    if (err){
      console.log(`error: ${err}`);
      res.status(500).json({error:err.message});
    }
    else {
      res.json(vacations);
    }
  });
});

app.get('/api/vacation/:vacationId', function(req, res){
  db.Vacation.findById(req.params.vacationId,function(err,vacation){
    if (err){
      console.log(`error: ${err}`);
      res.status(500).json({error:err.message});
    }
    else {
      res.json(vacation);
    }
  });
});

app.post('/api/vacation', function(req, res){
  db.Vacation.create(req.body, function(err,newVacation){
    if (err){
      res.status(500).json({error:err.message});
    }
    else {
      res.json(newVacation);
    }
  });
});

app.put('/api/vacation/:vacationId', function(req, res){
  db.Vacation.findById(req.params.vacationId, function(err,vacation){
    if (err) {
      res.status(500).json({error: err.message});
    }
    else {
      vacation.vacationerName = req.body.vacationerName;
      vacation.country = req.body.country;
      vacation.place = req.body.place;
      vacation.year = req.body.year;
      vacation.daysStayed = req.body.daysStayed;
      vacation.review = req.body.review;
      vacation.save(function(err,savedVacation){
        if (err){
          res.status(500).json({error:err.message});
        }
        else {
          res.json(savedVacation);
        }
      });
    }
  });
})

app.delete('/api/vacation/:vacationId', function(req, res){
  db.Vacation.findOneAndRemove({_id: req.params.vacationId}, function(err,vacation){
    if (err){
      res.status(500).json({error: err.message});
    }
    else{
      res.json(vacation);
    }
  });
})

/**********
 * SERVER *
 **********/

// listen on the port that Heroku prescribes (process.env.PORT) OR port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express server is up and running on http://localhost:3000/');
});
