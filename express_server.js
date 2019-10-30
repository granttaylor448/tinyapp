const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser')
app.use(cookieParser())


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
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
}


function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz"
  let result = ""
  for (var i = 0; i < 6; i ++ ) {
    result += chars.charAt(Math.floor(Math.random() * 36))
  }
  return result;
}
let loop = function (email) {
  let output =false
  for (let item in users){
    console.log("look", email, users[item]["email"] )
    if (email === users[item]["email"]) {
      output =true
    } else {
      // console.log(req.body.email, users[item]["email"] )
      output = output
      
    }
  } return output
}



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  
  let templateVars = { user_id : req.cookies["user_id"], user: users, urls: urlDatabase  };
  res.render("urls_new", templateVars);
  // console.log("urls_new")
});
app.get("/register", (req, res) => {
  // users[RandomID] = { id: RandomID , email: req.body.email, password: req.body.password }
  
  let templateVars = { user_id : req.cookies["user_id"], urls: urlDatabase  };

  res.render("registration", templateVars)
});

app.get("/login", (req, res) => {
  let templateVars = { user_id : req.cookies["user_id"], user: users, urls: urlDatabase  };
  // console.log(templateVars)
  // console.log(users)
  res.render("login", templateVars)
});

app.post("/register", (req, res) => {
let RandomID = generateRandomString()
let email = req.body.email;
console.log("hi", email)

if (req.body.email === "" || req.body.password ==="" || loop(email) === true ) {
  res.status(400)
  res.send("400 Error!")
} else {
  users[RandomID] = { id: RandomID , email: req.body.email, password: req.body.password }
  console.log(users)
  
  console.log(loop())
  
  res.redirect("/login")
}  
})

app.post("/urls", (req, res) => {
  // console.log(generateRandomString(), req.body.longURL);
  let short = generateRandomString()
    urlDatabase[short] = req.body.longURL
   res.redirect(`/urls/${short}`)
  // console.log(urlDatabase)
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let short = req.params.shortURL
  urlDatabase[short] = req.body.longURL
  
  res.redirect(`/urls/${short}`)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let longURL = req.params.longURL;
  let short = req.params.shortURL;
  delete urlDatabase[short];
  
  res.redirect("/urls")
});

app.post("/login", (req,res) => {
  let email = req.body.email
  let password = req.body.password
  if (loop(email) === false) {
    res.send("403 Error!")
  }
  if (loop(email) === true) {
    for (let item in users){
      if(email === users[item]["email"])
      user_id = item
    }
    if (users[user_id]["password"] !== password){
      res.send("OH NO! Your password doesnt match! go back!")
    }
    res.cookie('user_id', user_id)
    res.redirect("/urls")
  }
  
  // res.redirect("/login")
})

// app.post("/login", (req, res) => {
  // let login = req.body.username;
  // console.log(login)
  // res.cookie('username', login)
  // res.redirect("/urls")
// });
app.post("/logout", (req, res) => {
  // let login = req.body.username;
  // console.log(login)
  res.clearCookie('user_id')
  res.redirect("/urls")
});
         

app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let http = "https://"
  let longURL = urlDatabase[short];
  if (!longURL.startsWith("https://") && !longURL.startsWith("http://")) {
    longURL = http.concat(longURL) 
  } 
  res.redirect(longURL);
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase) // for urlDatabase reference
});

app.get("/urls", (req, res) => {
  
  let templateVars = { user_id : req.cookies["user_id"], user: users, urls: urlDatabase  };//ejs automatically knows to look in the views directory becuase this is express convention
  res.render("urls_index", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { user_id: req.cookies["user_id"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Snoop Dog here on port ${PORT}!`);
});