# OctopusInfoTool1
TODO:

Need to sort out how to pull api on click of selection but not on slection click (does it matter?)


Figure out how to fix issue with autocomplete selection messing with background

WHen selected project then populate release step dropdown

When release step selected then run query for data pane

https://github.com/OctopusDeploy/OctopusDeploy-Api/wiki

Thinking best way to do this might be a live display based on a store item linked to selected project/step

HOW TO GET ALL STEPS??

First for a project get all release IDs via api/projects/{id}/releases data.items is an array each item will have a 'Id' key and value and a SpaceId

then for each release ID and SpaceId you would need to get deployments from api/releases/{id}/deployments
and then the deployment tasks from there, 
and then into 
Can get list if steps and deployment processes listing w/ versions from /api/deploymentprocesses

Where is the history?

Maybe this can be done after project selection??

Grab the latest deployment for a project and the details of that deployment process, to get the STEPS listed out.

THEN - need to pull all this crap to the store and give a spinning wheel or something on the page to allow for a wait

OK grab all tasks for a given project, sort out the pagination as well and just save the Task IDs. Then for every single Task ID you will need to pull the entire details log out into the data store, hopefully tossing everything you dont want from the task log, i.e. keep the ID, name, ended time, success for each Step in the task. THEN You can save all this to a store object like:
{TaskID1: {stepName: {data}}, TaskId2: {stepName: {data}}} which will be in order of latest to last by default
Then on step selection you could loop over this store showing only entries from the selected STEP

_1. When project is selected also grab ALL taks IDs for that project and store in store
1. Get Latest Deployments for a Project
2. List out tasks and subtasks in Order for the dropdown
3. Then when step is selected:
  a. For each task in task ID store for given project pull entire task log and save in store list as above which will also be in historicval order anyway
  b. Display then based on selected step matching exactly data in the store

So here when you make a subtask the primary task no longer matters and only the subtask is counted.

