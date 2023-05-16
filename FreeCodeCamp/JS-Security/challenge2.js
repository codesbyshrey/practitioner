// return stored JSON data for a given JSON url
app.get("/api/data", async (req, res) => {

     // remedies
     const allowedURLS = ["blah1", "blah2"];

     const url = req.query.url;
     try {

          // whatever we fetch from is notin alowed
          if (!allowedURLS.includes(url)) {
               return res.status(400).json({ error: "Bad URL" });
          }

          const response = await fetch(url);
          const data = await response.json();

          res.status(200).json({ data:data });
     } catch (err) {
          console.log(err)
          res.status(500).json({ err: err.msg })
     }
})

// listening at https://example.com/api/data?url=foo
// listening at https://example.com/api/data?url=countries.json
// listening at https://example.com/api/data?url=states.json

// SSRF - server side request forgery
// Dupes server to execute some kind of query beyond attacker's permissions

// what if we have a confidential.json in the application? server has more permissions --> want to make sure only the public data is available

// this is how we prevent an SSRF attack