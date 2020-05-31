
import axios from 'axios'
import https from 'https'
// Here for security reasons we should probably find a way to exit the fn gracefully if somehow the calls to this endpoint arent to an allowed list
// as this is a proxy for http requests that just does what it is asked
// so if any headers are missing from req exit
// if oct url isnt one of alowed then exit
export default {
  path: '/api',
  handler (req, res) {
    const allowedUrls = [
      "api/serverstatus",
      "api/tasks",
      "api/deployments",
      "api/projects",
      "api/deploymentprocesses"
    ]
    if (!req.headers['octurl'] || !req.headers['x-nuget-apikey']) {
      console.log('missing header')
      res.end(JSON.stringify({data: '', status: '403 Forbidden - Header Check Fails Security'}))
    } else if (!allowedUrls.some(el => req.headers['octurl'].includes(el))) {
      console.log('url not allowed')
      res.end(JSON.stringify({data: '', status: '403 Forbidden - Url Check Fails Security'}))
    }
    //const stuff = JSON.stringify(req.headers)
    var verifySSL = (req.headers['verifyssl'] === 'true')
    const agent = new https.Agent({  
      rejectUnauthorized: verifySSL
     });
    const config = {
      headers: {
        Accept: 'application/json',
        'X-NuGet-ApiKey': req.headers['x-nuget-apikey']
      },
      httpsAgent: agent
    }
    // this was very tricky, seems it works because the res.end must wait for its data
  axios.get(req.headers['octurl'], config)
    .then(function (response) {
      // handle success
      res.end(JSON.stringify({data: response['data'], status: response.status + ' ' + response.statusText}))
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data)
        console.log(error.response.status)
        console.log(error.response.headers)
        res.end(JSON.stringify({data: '', status: error.response.status + ' ' + error.response.data.ErrorMessage}))
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('Request Error')
        console.log(error)
        res.end(JSON.stringify({data: '', status: 'Request ' + error}))
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Config Error')
        console.log(error.message)
        res.end(JSON.stringify({data: '', status: 'Error ' + error.message}))
      }
    })
  }
}

/* error keys for axios
[                                                                                                             07:51:48
  'code',
  'config',
  'request',
  'response',
  'isAxiosError',
  'toJSON'
]

Request Error                                                                                                 07:53:23
[                                                                                                             07:53:23
  '_writableState',
  'writable',
  '_events',
  '_eventsCount',
  '_maxListeners',
  '_options',
  '_redirectCount',
  '_redirects',
  '_requestBodyLength',
  '_requestBodyBuffers',
  '_onNativeResponse',
  '_currentRequest',
  '_currentUrl'
]
*/