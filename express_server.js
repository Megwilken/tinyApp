const express = require("express");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const {
  generateRandomString,
  getUserByEmail,
  passwordChecker,
  urlsForUser,
  addUser
} = require("./helperFunctions");
const { urlDatabase, users } = require("./database/database.js")

const app = express();
const PORT = 8080;

app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: true, }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["user_id"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.session.user_id,
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = {
      user_id: req.session.user_id,
      user: users
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//renders URLs show page
app.get("/urls/:id", (req, res) => {
    if (urlDatabase[req.params.id].user_id === req.session.user_id && urlDatabase[req.params.id])   {
      const templateVars = {
        id: req.params.id,
        longURL: urlDatabase[req.params.id].longURL,
        user_id: req.session.user_id,
        user: users,
        urls: urlDatabase,
      };
      res.render("urls_show", templateVars);
    } else {
        res.status(400).send("You do not own this URL");
};
});

app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("URL is invalid or does not exist - try again!");
  } else {
    const longURL = urlDatabase[req.params.id].longURL;
        res.redirect(longURL);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      user_id: req.session.user_id,
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.status(400).send("Please login or register to shorten URLs!");
  }
});
//GOOD
app.post("/urls/:id", (req, res) => {
  if (req.body.longURL.length > 0 && req.session.user_id) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});

// delete url
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].user_id === req.session.user_id) {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
     } else {
    res.status(400).send("This url does not belong to you. Please login to continue!");;
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      user: users
    };
    res.render("login", templateVars);
  }
});
//FIX
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users)
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Please enter your email and password to login");
  } else if (!getUserByEmail(email, users)) {
    res.status(403).send("No account exists. Please register!");
  } else if (!passwordChecker(password, users)) {
    res.status(403).send("Password incorrect. Try again or register for an account!");
  } else {
    req.session.user_id = user.id;
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user_id: req.session.user_id,
      user: users,
    };
    res.render("register", templateVars);
  }
});
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = generateRandomString();
  if (!email || ![password]) {
    res.status(400).send("Please enter your email and password to register");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("An account already exists. Please login!");
  } else {
    const user_id = addUser(email, password, users);
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on Port ${PORT}!`);
});