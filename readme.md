# Big Brother Dev Setup

* `cd big-brother`
* `npm install`
* `sudo npm link` - This is necessary to make sure that its available as a global command
* `cd to/a/valid/github/repo`
* `bigbrother` - This can be changed at big-brother/package.json:bin

# Master Server Setup

* Ensure you have mongodb installed
* Start mongodb on port 27017 - this can be changed at master-server/config/default-config:db.url (Will likely change be changed to getconfig or another npm module)
* `npm start`


# What Is working:

* Master server start
* Big brother starts

# What should be working but likely is not

* Should be able to send post requests with "files" to master server, these files will be
saved into gridfs
* Should be able to retrieve files from master server
* Should be able to parse the files retrieved from master server on client
  -gitParse
  -tar-parse-To display snapshots of help requests

# Relevent issues

* https://github.com/visionmedia/superagent/issues/455#issuecomment-98847613
* https://github.com/substack/node-git-emit/pull/4
