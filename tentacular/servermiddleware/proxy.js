
import axios from 'axios'
import https from 'https'
import { runInNewContext } from 'vm';
export default {
  path: '/api',
  handler (req, res) {
    //const stuff = JSON.stringify(req.headers)
    const agent = new https.Agent({  
      rejectUnauthorized: false
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
      // handle error
      console.log(error.response.status)
      console.log(error.response.data)
      res.end(JSON.stringify({data: '', status: error.response.status + ' ' + error.response.data.ErrorMessage}))
    })
  }
}