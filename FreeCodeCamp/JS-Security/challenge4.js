const SOMEOBJECT = {}

app.get("/validateToken", (req, res) => {
     if (req.header('token')) {
          const token = Buffer.from(req.header('token'), 'base64')
          // should always be false as someobject is empty right now
          if (SOMEOBJECT.hasOwnProperty(token) && token) {
               return res.send("true");
          }
     }
     return res.send("false");
})


// takes http request
// we can get it sometimes send true??

// PROTOTYPE POLLUTION --> every object has a prototype, a parent class to inherit methods from

// SOMEOBJECT["__proto__"] && "__proto__" --> inside if statement this could actually read as true
// instead of indexing token, only indexing properties
// use .hasOwnProperty function --> will never evaluate as true