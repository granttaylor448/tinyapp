const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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
  res.render("urls_new");
  console.log("urls_new")
  

});

app.post("/urls", (req, res) => {
  console.log(generateRandomString(), req.body.longURL);
  let short = generateRandomString()
    urlDatabase[short] = req.body.longURL
   res.redirect(`/urls/${short}`)
  console.log(urlDatabase)

         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  let short = req.params.shortURL;
  let http = "https://"
  let longURL = urlDatabase[short];
  // if (!longURL.startsWith("https://")) {
    // longURL = http.concat(longURL) 
  // } 
  res.redirect(longURL);
  
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };//ejs automatically knows to look in the views directory becuase this is express convention
  res.render("urls_index", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars)
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});