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

function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyz"
  let result = ""
  for (var i = 0; i < 6; i ++ ) {
    result += chars.charAt(Math.floor(Math.random() * 36))
  }
  return result;
 
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
  // console.log("urls_new")
 
  

});

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

app.post("/login", (req, res) => {
  let login = req.body.username;
  console.log(login)
  res.cookie('username', login)
  res.redirect("/urls")
});
app.post("/logout", (req, res) => {
  // let login = req.body.username;
  // console.log(login)
  res.clearCookie('username')
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
  
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };//ejs automatically knows to look in the views directory becuase this is express convention
  res.render("urls_index", templateVars);
});



app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Snoop Dog here on port ${PORT}!`);
});