# dagelijkse-kost

Okay move along, move along people, there's nothing to see here (yet)!


# Getting, running and configuring dagelijkse-kost

## Getting dagelijkse-kost

Inside the directory where you want dagelijkse-kost to be downloaded, run:

```bash
git clone https://github.com/Koekelas/dagelijkse-kost.git
```

## Running dagelijkse-kost

Install [Node.js](http://nodejs.org/ "Node.js Homepage") and [CouchDB](https://couchdb.apache.org/ "CouchDB Homepage").

### Running in development mode

Inside the project root directory, run:

```bash
export NODE_ENV=development
npm install --global bower
npm install
npm run create-config
npm run watch
cd client
npm install
bower install
npm run create-config
npm run watch
```

### Running in production mode

Inside the project root directory, run:

```bash
export NODE_ENV=production
npm install --global bower
npm install --production
npm run create-config
npm start
cd client
npm install --production
bower install --production
npm run create-config
npm run build
```

## Configuring dagelijkse-kost

### Configuring the server

Server configuration is found in ./config.json. To generate a default config, inside the server root directory, run:

```bash
npm run create-config
```

### Configuring the client

Client configuration is found in ./client/public/config.json. To generate a default config, inside the client root directory, run:

```bash
npm run create-config
```


# Running the tests

Inside the server root directory, run:

```bash
npm test
```
