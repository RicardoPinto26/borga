﻿## BORGA - BOaRd Games Application
# Running the server:

* To install the dependencies do:
```
npm install
```
* To start the server do:
```
npm start (DB)
```
DB can be INT or ES. INT will store the information in memory and it WILL be volatile. ES will run on the Elastic Search Database with the url specified in borga-config.js.
If no DB is specified, or if the DB specified isn't recognized, INT will be used.
* If you're using the Elastic Search Database, and want to initialize the database with some data, run the following command:
```
node .\borga-populate.js
```
