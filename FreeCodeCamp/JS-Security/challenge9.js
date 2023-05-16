// password encryption
import {encryptPassword} from "./util/passwords"

app.post('/signup', function(req, res) {
     db.users.find({
          "username": req.body.username,
     }, async (err, result) => {
          if (err) {
               return res.status(500).json({ msg: 'Error'});
          } else if (result.length === 0) {
               // insert user
               await db.users.insert(req.body);
               return res.status(200);
          } else {
               return res.status(409);
          }
     })
})

// takes post request --> inf users that match --> if we can't find, then we insert req.body as a new user

// Mass assignment attack --> user input might be able to set properties on an object that it shouldn't be able to

// We are inserting the req.body.object --> not just the username
// We are risking inserting "private" flags like (isAdmin) since it's part of the object --> someone can specify fields to insert or hack

// So instead of req.body --> { username: String(req.body.username), email: String(req.body.email), password: encryptPassword(req.body.password)}