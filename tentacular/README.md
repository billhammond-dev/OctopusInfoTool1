# tentacular

> Getting more useful information from your Octopus

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

TODO:

Need to sort out how to pull api on click of selection but not on slection click (does it matter?)


Figure out how to fix issue with autocomplete selection messing with background

WHen selected project then populate release step dropdown

When release step selected then run query for data pane




HOW TO GET ALL STEPS??

First for a project get all release IDs via api/projects/{id}/releases data.items is an array each item will have a 'Id' key and value and a SpaceId

then for each release ID and SpaceId you would need to get 