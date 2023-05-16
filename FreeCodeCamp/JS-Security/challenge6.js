// Assume the RegEx validates correctly
// const emailRegex = \^{regexcodehere}
const validator = require('validator');


app.post('/validateEmail', (req, res) => {

     const email = req.body.email;
     // if (!email || validator.isEmail(email))
     if (!email || !emailRegex.test(email)) {
          return res.status(400).send({ error: "Invalid email" });
     }

     return req.status(200).send({ valid: true});
})

// REDOS - regular expression denial of service
// might take a really long time to validate a lot of inputs
     // input isn't within our control -- denial of service

