const { assert } = require('chai');
const bcrypt = require("bcryptjs");

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assertEqual(user, expectedUserID)
  });
  it ("should throw an error when an email does not exist in the database", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    assertEqual(user, error)
  });
});