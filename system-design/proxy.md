# PROXY PATTERN
 - a proxy is basically a wrapper around another object
 - abstracts a direct call to a third party service and proxies request w/ wrapper
 - example proxy wrapper around Axios library for HTTP Requests
 - enables easy modularity for later scaling, and easier testing while swapping out service types
 - avoids later refactoring during growth, better customization and readability for code and code practices
 - could create a full proxy file meant for third party integrations so that structure is kept incredibly simple

### PROXY
```js
import axios from 'axios';

class HTTPService {
     async get(url) {
          // const {data} = await axios.get(url);
          const response = await fetch(url);
          const data = await response.json();
          return data;
     }

     async post(url, body) {
          // const {data} = await axios.post(url, body);
          const response = await fetch(url, {
               method: "POST",
               body: JSON.stringify(body),
               headers: {
                    "Content-Type": "application/json"
               }
          });
          const data = await response.json();
          return data;
     }
}

export default new HTTPService()
```
### COMPONENT
```js
import HTTPService from './HTTPService';

function reqComponent() {
     const [data, setData] = useState([]);

     useEffect(() => {
          HTTPService.get('https://jsonplaceholder.com').then(data => setData(data))
     }, [])

     return (
          <div> {data.title} </div>
     )
}
```