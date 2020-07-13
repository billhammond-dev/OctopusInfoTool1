# Octopus Release Step History Tool

Web Application with front and back end components, written in VueJs, Node, Html/Css

This was built to solve a recurring issue I kept having with deployment tickets where I would need to know exactly when
a particular step of an Octopus release had been deployed last, in an environment where the full releases were almost never
deployed at once, and cloud resources were generally always deployed by releasing a single deployment step.

It turns out that the data available from the Octopus API is structured in a way that makes it very difficult to obtain this information.

In addition a default Octopus installation on a windows server (which is the most common currently) is always going to be
restrcited by CORS settings so I wanted to make this generically useable by anyone without changing those settings.
The backend components accomplish this CORS bypass by acting as a request proxy for all the requests to the Octopus server.

This was designed to run locally as a personal tool, and for security reasons you shouldnt run this anywhere else at this time as the connection between the
web browser and backend proxy code is not yet secure.

How to run:

 - Install 'LTS' version of node with chocolately https://nodejs.org/en/download/
 - Clone this repo
 - install nuxt 'npm install nuxt'
 - cd to 'tentacular' folder in cloned repo
 - 'npm run dev' to start server on port 3000 of local machine
 - browse to http://localhost:3000/
 - Add an API key to your octopus user account https://octopus.com/docs/octopus-rest-api/how-to-create-an-api-key
 - set the connection settings in the web page and 'connect'. You should get a 'Last Response: 200 OK - api/projects/all' response. If not you may have to test ssl options/etc and your api key until the connection portion works.
 - Select a Project and then a release step and the application will pull all the data needed to create the results table.
 - On larger, multiuser Octopus systems pulling the task history data may take a while, and there is a 'stop' button to cancel in-flight requests and go with whatever data you have already pulled into the application.
 
