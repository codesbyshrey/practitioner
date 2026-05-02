// get user info from username
app.post('/user', (req, res) => {
     // assume the user is authenticated
     //...

     // avoids nosql injection attack
     if (typeof req.body.username !== 'string') {
          return res.status(400).json({ message: "Invalid Username"});
     }

     db.collection('users').find({
          "username" : req.body.username,
     }, (err, result) => {
          if (err || result) {
               return res.status(500).send({ message: "There was an error finding user" })
          } else {
               res.status(200).send(result);
          }
     })
})

// looking inside db of users, matching usernmae from inside our username post request

// NoSQL injection --> not just limited to SQL queries (same as SQL injection in some ways)
// not guaranteed rec.body.usernmae has to be a string
     // { "$ne" : null } --> not equal to null 
     // special mDB operator

// if we search with this query, we find every instance of a user that had a username --> not just finding the username, finding things by username to ALL other data --> SENSITIVE DATA

// MALFORMED QUERY --> want to make sure its just a string