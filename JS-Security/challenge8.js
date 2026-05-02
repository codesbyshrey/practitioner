const jwt = require('jsonwebtoken');

// secret key
// dotenv
// process.env.JWT_TOKEN
const secret = 'my-secret-key';

app.post('/login', (req, res) => {
     // assume authentication success
     // and user is returned from database
     const user = { id: 123, name: "John Doe" };

     // sign jwt with user ID and secret key
     const token = jwt.sign(user, secret);

     // Send JWT back to client
     res.json({ token });
})

// Environment variables