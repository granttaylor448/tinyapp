const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const { getUserByEmail } = require('./helpers');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["1"],

}));


const bcrypt = require('bcrypt');

const users = {};

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
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
  let templateVars = { user_id : req.session["user_id"], user: users, urls: urlDatabase  };
  res.render("urls_new", templateVars);
  
});

app.post("urls/new", (req, res) => {
  if (!req.session["user_id"]) {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  if (users[req.session["user_id"]]) {
    return res.redirect("/urls");
  }
  let templateVars = { user: users, user_id : req.session["user_id"], urls: urlDatabase  };
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  if (users[req.session["user_id"]]) {
    return res.redirect("/urls");
  }
  let templateVars = { user_id : req.session["user_id"], user: users, urls: urlDatabase  };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  let RandomID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === "" || req.body.password === "" || getUserByEmail(email, users) === true) {
    res.status(400).send("400 Error! You're either not typing in a proper email/password or you're already registered!");
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
  
  } else { 
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL;

  if (!req.session["user_id"] || req.session.user_id !== urlDatabase[short]["userID"]) {
    return res.status(403).send("<h5> 404 Forbidden you can't edit other peoples URL's! </h5>");
  }
  urlDatabase[short].longURL = req.body.longURL;
 
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let short = req.params.shortURL;
  if (!req.session["user_id"] || req.session.user_id !== urlDatabase[short]["userID"]) {
    return res.status(403).send("<h5> 404 Forbidden you can't  other peoples URL's! </h5>");
  }
  
  delete urlDatabase[short];
  res.redirect("/urls");
});

app.post("/login", (req,res) => {
  let email = req.body.email;
  let password = req.body.password;
  if (getUserByEmail(email, users) === false) {
    res.status(403).send("403 Error! you have to register");
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
    res.redirect("/urls");
  }
  
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});
         

app.get("/u/:shortURL", (req, res) => {
  
  let short = req.params.shortURL;
  let http = "https://";

  if (searchDatabase(short) === true) {
    let longURL = urlDatabase[short]["longURL"];
 
    if (!longURL.startsWith("https://") && !longURL.startsWith("http://")) {
      longURL = http.concat(longURL);
    }
    res.redirect(longURL);
  } else {
    res.status(403).send("NOT A VALID SHORT URL");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); // for urlDatabase reference
});

app.get("/urls", (req, res) => {
  let short = req.params.shortURL;
  let templateVars = {
    user_id : req.session["user_id"],
    user: users,
  };
 
  if (!req.session["user_id"]) {
    res.render("urls_index", templateVars);
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
  let short = req.params.shortURL;

  if (searchDatabase(short) === true) {

    if (!req.session["user_id"] || req.session.user_id !== urlDatabase[short]["userID"]) {
      return res.status(403).send("<h5> 403 Forbidden you can't edit or see other peoples URL's! </h5>");
    }
    let templateVars = {
      user_id: req.session["user_id"],
      user: users,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      shortURL: req.params.shortURL
    };
    res.render("urls_show", templateVars);
  } else {
    return res.status(300).send("<h5> 403 Looks like that URL doesn't exist! </h5>");
  }
});

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
const searchDatabase = function (short) {
  let bool = false;
  for (let item in urlDatabase) {
    if (short === item) {
      bool = true;
    }
  } return bool;
}