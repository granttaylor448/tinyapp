let getUserByEmail = function (email, users) {
  let output =false;
  for (let item in users){
    if (email === users[item]["email"]) {
      output =true
    } else {
      output = output;
    }
  } return output;
};

module.exports = { getUserByEmail }