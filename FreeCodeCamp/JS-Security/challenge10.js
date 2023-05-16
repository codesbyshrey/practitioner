app.post('/generate-pwd-reset-url', async function (req, res) {

     // ask if the customer exists
     const customer = await customerdb.findOne(req.body.email);

     const resetToken = await genPwdResetToken(customer._id);

     // normally in control of the attacker in this case since it's based on input
     // const resetPwdUrl = `${req.header('host')}/passwordReset?token=${resetToken}&id=${customer._id}`;
     const resetPwdUrl = `${process.env.HOST_URL}/passwordReset?token=${resetToken}&id=${customer._id}`;
     // string interpolation, sent back as a JSON object

     return res.json({ resetPwdUrl : resetPwdUrl})
})

// takes in post reqests at pwd link
// generate password reset for a user for a web application

// VULNRABLE --=> host header injection attack
// host header is a parameter to the URL

// instead of looking at host header for request, we jsut look at a preset URL in our environment variables