
const API_URL = process.env.API_URL || 'https://3.84.198.30/api/accounts/all?ApiKey=API-ACQZWFYU0TIE0QVDW0QWH7HHVRC'

export default {
  path: '/api',
  handler (req, res) {
    res.end('OKFROMPROXY')
  }
  
}