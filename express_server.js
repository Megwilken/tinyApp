const express = require ("express");
const cookieParser = require('cookie-parser')
const morgan = require("morgan");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//good - helper function
function generateRandomString() {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
     result += chars.charAt(Math.floor(Math.random() * chars.length));
  };
  return result;
};

//good - initial route
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//good
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//good - main url page
app.get("/urls", (req,res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"]
   };
  res.render("urls_index", templateVars);
});

//good - create new URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

// good - window after new URL is created
app.get("/urls/:id", (req, res) => {
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
    username: req.cookies["username"]
   }
  res.render("urls_show", templateVars);
});

// good - redirect to website when clicking short URL link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

//good - create new URL 
app.post("/urls", (req, res) => {
  const id = generateRandomString(); //good
  urlDatabase[id] = { longURL: req.body.longURL };
  res.redirect(`/urls/${id}`);
});

//good - delete url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//good - for edit url info - update database
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
   urlDatabase[id] = req.body.newURL;
   res.redirect('/urls');
 });

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
   };
   res.render("login", templateVars)
  });
  

app.get("/register", (req, res) => {
const templateVars = { 
  username: req.cookies["username"]
 };
 res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  const newID = generateRandomString();
  users[newID] = {
      id: newID,
      email: req.body.email,
      password: req.body.password
    },
  res.cookie("username");
  res.redirect("/urls");
});


  app.post("/login", (req, res) => {
    const newID = generateRandomString();
    users[newID] = {
        id: newID,
        email: req.body.email,
        password: req.body.password
      },
    res.cookie("username");
    res.redirect("/urls");
  });

//good
app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});
