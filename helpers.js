let getUserByEmail = function (email, users) {
  let output =false
  for (let item in users){
    // console.log("look", email, users[item]["email"] )
    if (email === users[item]["email"]) {
      output =true
    } else {
      // console.log(req.body.email, users[item]["email"] )
      output = output
      
    }
  } return output
}

module.exports = { getUserByEmail }