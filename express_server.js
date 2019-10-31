const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const { getUserByEmail } = require('./helpers');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// const cookieParser = require('cookie-parser')
// app.use(cookieParser())
let cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["1"],

}));


const bcrypt = require('bcrypt');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < 6; i ++) {
    result += chars.charAt(Math.floor(Math.random() * 36));
  }
  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user_id : req.session["user_id"], user: users, urls: urlDatabase  };
  res.render("urls_new", templateVars);
  
});

app.post("urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  // users[RandomID] = { id: RandomID , email: req.body.email, password: req.body.password }
  let templateVars = { user_id : req.session["user_id"], urls: urlDatabase  };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user_id : req.session["user_id"], user: users, urls: urlDatabase  };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  let RandomID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === "" || req.body.password === "" || getUserByEmail(email, users) === true) {
    res.status(400);
    res.send("400 Error!");
  } else {
    users[RandomID] = { id: RandomID , email: req.body.email, password: hashedPassword };
    for (let item in users) {
      if (email === users[item]["email"])
        user_id = item;
    }
    
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
 
});

app.post("/urls", (req, res) => {
  user_id = req.session["user_id"];
  if (req.session["user_id"]) {
    let short = generateRandomString();
    urlDatabase[short] = {
      longURL: req.body.longURL,
      userID: user_id };
    res.redirect(`/urls/${short}`);
  
  } else { //this code may need to go!
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL;
  console.log(urlDatabase)
  urlDatabase[short].longURL = req.body.longURL;
  console.log(urlDatabase)
  //let longURL = req.bodylongURL
  // if (urlsForUser(urlDatabase, req.cookies["user_id"].toString()) !== true ) {
  // res.redirect("/")
  // }
  
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let longURL = req.params.longURL;
  let short = req.params.shortURL;
  delete urlDatabase[short];
  // if (urlsForUser(urlDatabase, req.cookies["user_id"].toString(22124)) !== true ) {
  // res.redirect("/")
  // }
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (getUserByEmail(email, users) === false) {
    res.send("403 Error!");
  }
  if (getUserByEmail(email, users) === true) {
    for (let item in users) {
      if (email === users[item]["email"])
        user_id = item;
    }
    let hashedPassword = users[user_id]["password"];
    if (!bcrypt.compareSync(password, hashedPassword)) {
      res.send("OH NO! Your password doesnt match! go back!");
    }
    req.session.user_id = user_id;
    // res.cookie('user_id', user_id) //this might be a bug!
    res.redirect("/urls");
  }
  
  // res.redirect("/login")
});

// app.post("/login", (req, res) => {
// let login = req.body.username;
// console.log(login)
// res.cookie('username', login)
// res.redirect("/urls")
// });
app.post("/logout", (req, res) => {
  // let login = req.body.username;
  // console.log(login)
  // res.clearCookie('user_id')
  req.session = null;
  res.redirect("/urls");
});
         

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let http = "https://";
  let longURL = urlDatabase[short]["longURL"];
  if (!longURL.startsWith("https://") && !longURL.startsWith("http://")) {
    longURL = http.concat(longURL);
  }
  res.redirect(longURL);
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // for urlDatabase reference
});

app.get("/urls", (req, res) => {
  let short = req.params.shortURL;
 
  if (!req.session["user_id"]) {
    res.redirect("/login");
  } else {
    let templateVars = {
      user_id : req.session["user_id"],
      user: users,
      urls: urlsForUser(urlDatabase, req.session["user_id"].toString()),
    };
    
    res.render("urls_index", templateVars);
  }//ejs automatically knows to look in the views directory becuase this is express convention
});



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user_id: req.session["user_id"],
    user: users,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    shortURL: req.params.shortURL
  };
  res.render("urls_show", templateVars);
});

// app.post("/urls/:shortURL", (req, res) => {
  // if (req.session["user_id"]) {
    // res.redirect("/urls")
  // }


// });

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Snoop Dog here on port ${PORT}!`);
});

const urlsForUser = function(urlDatabase , user_id) {
  let newObj = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item]["userID"] === user_id) {

      newObj[item] = urlDatabase[item];

    }
  }
  return newObj;
};