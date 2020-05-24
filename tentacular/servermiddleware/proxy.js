
import axios from 'axios'
import https from 'https'
export default {
  path: '/api',
  async handler (req, res) {
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
    const getResult = await axios.get(req.headers['octurl'], config)
    res.end(JSON.stringify(getResult['data']))
  }
  
}