const { assert } = require('chai');

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
    const expectedOutput = true;
    assert.equal(user, expectedOutput)
  });
  it('should return false if a user has an invalid email', function() {
    const user = getUserByEmail("grant@example.com", testUsers)
    const expectedOutput = false;
    assert.equal(user, expectedOutput)
  });
});
