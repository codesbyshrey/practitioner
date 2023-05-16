import React from 'react';
import {BrowserRouter as Router, useLocation} from 'react-router-dom';

export default function Root() {
     return (<Router> <QueryParamsDemo /> </Router>)
}

function useQuery() {
     const {search} = useLocation();
     return React.useMemo(() => new URLSearchParams(search), [search]);
}

// https://example.com/settings?redirect=foo
// https://example.com/settings?redirect=https://example.com

// CROSS SITE SCRIPTING
// JS Protocol
     // javascript// everything now is considered javascript code

// https://example.com/settings?redirect=javascript//doSmthBad()

function QueryParamsDemo() {
     let query = useQuery();

     // new function to validate
     function validateURL(url) {
          const userSuppliedUrl = new URL(url);

          if (userSuppliedUrl.protocol = "https:") {
               return url;
          }

          return "/";
     }

     return (
          <div>
               <h2> Return Home </h2>
               <a href={validateURL(query.get("redirect"))}> Click to go home</a>
               {/* <a href={query.get("redirect")}> Click to go home</a> */}
          </div>
     )
}