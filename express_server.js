const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { 
  generateRandomString,
  getUserByEmail,
  passwordChecker,
  urlsForUser
} = require("./helperFunctions")

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "aj48lW",
  },
};

let users = {
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

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//GOOD - main url page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user: req.session.user_id,
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// GOOD - window after new URL is created
app.get("/urls/:id", (req, res) => {
  // if user is logged it but does not own the URL with the given ID returns HTML with a relevant error message
  // const longURL = urlDatabase[req.params.id].longURL  
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: req.session.user_id,
  };
   if (!req.session.user_id) {
    res.status(400).send("Please login to continue!");
  }
  res.render("urls_show", templateVars);
});

// GOOD - redirect to website when clicking short URL link
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (urlDatabase[req.params.id].longURL) {
    res.redirect(longURL);
  } else {
    res.send("shortURL does not exist!");
  }
});

//GOOD - create new URL
app.post("/urls", (req, res) => {
  const id = generateRandomString();

  if (req.session.user_id) {
    res.redirect(`/urls/${id}`);
  } else {
    res.send("Please login or register to shorten URLs!");
  }
});

//GOOD - for edit url info - update database
app.post("/urls/:id", (req, res) => {
  // if user is logged it but does not own the URL for the given ID returns HTML with a relevant error message
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

//GOOD - delete url
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    res.status(400).send("Please login to continue!");
  } else {
  /* else {
    if (req.session.user_id) {
      if user_id does not own url, error message
  */
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users,
    user_id: req.session.user_id,
    //fix ^ does not show name on login
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter your email and password to login");
  } else if (!getUserByEmail(email, users)) {
    res.status(403).send("No account exists. Please register!");
  } else if (!passwordChecker(password, users)) {
    res
      .status(403)
      .send("Password incorrect. Try again or register for an account!");
  } else {
    req.session.user_id = users;
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users,
    user_id: req.session.user_id,
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  // const password = req.body.password;
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter your email and password to register");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists. Please login!");
  } else {
    const newUser = generateRandomString();
    users[newUser] = {
      id: Date.now().toString(),
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10),
    };
    req.session.user_id = users[newUser];
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});
