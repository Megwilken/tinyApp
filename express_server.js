const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  passwordChecker,
} = require("./helperFunctions");

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(
  express.urlencoded({
    extended: true,
  })
);
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

// initial route
app.get("/", (req, res) => {
// if logged in, redirect to urls page
  if (req.session.user_id) {
    res.redirect("/urls");
// if not logged in, redirect to login page
  } else {
    res.redirect("/login");
  }
});

// main url page, users can visit whether logged in or not
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_index", templateVars);
});

// create new url page
app.get("/urls/new", (req, res) => {
// if logged in
  if (req.session.user_id) {
    const templateVars = {
      user: req.session.user_id,
      id: req.params.id,
      longURL: urlDatabase[req.params.id],
    };
    res.render("urls_new", templateVars);
// if not logged in, redirect to login page
  } else {
    res.redirect("/login");
  }
});

// renders URLs show page
app.get("/urls/:id", (req, res) => {
// if user is not logged in
  if (!req.session.user_id) {
    res.status(400).send("Please login to continue!");
// if user logged in add to databse
  } else {
    if (req.session.user_id) {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user: req.session.user_id,
      };
      res.render("urls_show", templateVars);
    }
  }
});

// redirect to website when clicking short URL link
app.get("/u/:id", (req, res) => {
// if url is invalid
  if (!urlDatabase[req.params.id]) {
    res.send("URL is invalid or does not exist - try again!");
// redirect to long URL
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  }
});

// create new URL for a user that is logged in
app.post("/urls", (req, res) => {
// if user is logged in
  if (req.session.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      user_id: req.session.user_id,
    };
    res.redirect(`/urls/${id}`);
// redirect to login if user is not logged in
  } else {
    res.send("Please login or register to shorten URLs!");
  }
});

// edit url info and update database
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

// delete url
app.post("/urls/:id/delete", (req, res) => {
// if user is not logged in send error
  if (!req.session.user_id) {
    res
      .status(400)
      .send("This url does not belong to you. Please login to continue!");
// if user is logged in delete
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

// login page
app.get("/login", (req, res) => {
// if user is logged in, redirect to urls page
  if (req.session.user_id) {
    res.redirect("/urls");
// if not logged in, login page
  } else {
    const templateVars = {
      user: users,
      user_id: req.session.user_id,
      email: req.body.email,
    };
    res.render("login", templateVars);
  }
});

// login form
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
// if no email or password entered
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter your email and password to login");
// if email not in database
  } else if (!getUserByEmail(email, users)) {
    res.status(403).send("No account exists. Please register!");
// if password not in database
  } else if (!passwordChecker(password, users)) {
    res
      .status(403)
      .send("Password incorrect. Try again or register for an account!");
// successful login
  } else {
    req.session.user_id = req.body.email;
    res.redirect("/urls");
  }
});

//registration page
app.get("/register", (req, res) => {
// if already logged in redirect to urls page
  if (req.session.user_id) {
    res.redirect("/urls");
// if not logged in, render registration page
  } else {
    const templateVars = {
      user: users,
      user_id: req.session.user_id,
    };
    res.render("register", templateVars);
  }
});

// submit registration
app.post("/register", (req, res) => {
  const email = req.body.email;
// if not email or password entered give error
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter your email and password to register");
// if account already exists prompt user to login
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists. Please login!");
// submit registration and add user to database
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

//logout and clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});
