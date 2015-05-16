# Big Brother Dev Setup

* `cd student-monitor`
* `npm install`
* `sudo npm link` - This is necessary to make sure that its available as a global command
* `cd to/a/valid/github/repo`
* `bigbrother` - This can be changed at big-brother/package.json:bin

# Master Server Setup

* Ensure you have mongodb installed
* Start mongodb on port 27017 - this can be changed at master-server/config/default-config:db.url (Will likely change be changed to getconfig or another npm module)
* `npm start`

# Logging in
* By default there are two users created, you can see these users in the terminal
of the master-server
* `student{name:"stu",pass:"A random password"}`
* `ta{name:"ta",pass:"A random password"}`
* goto "/login" or "/" (which will redirect to "/login")
* fill out the form with either student or ta
* it will redirect to "/" which will serve either the student or ta portal

# What Is working:

* Master server start
* logging in
* Minimal UI
* Big brother starts
* Big brother sends diffs on filesystem change
* Big brother sends diffs on commit
* Big brother sends tarball on request
* Big brother can be stopped
* Big brother runs in the background

# Known issues

* ~~Big brother sends fs add events on start~~
* ~~Busboy hangs when a file is empty or invalid~~ No longer using busboy
* None of the ui is working (though routing and psuedo code is practically complete)
* Streaming on the Browser is near impossible currently without creating our own wrapper

# Known Refactoring necessary
* Abstract/mongooseRouter - remove anonymous functions, create a context object
* Abstract/mongooseRouter#17 - Expensive operation for the sake of pretty urls
* Abstract/mongooseRouter#123 - Peice out use cases
* */Models/* - Permissions should not be with the model


# What should be working but likely is not

* Should be able to send post requests with "files" to master server, these files will be
saved into gridfs
* Should be able to retrieve files from master server
* Should be able to parse the files retrieved from master server on client
  -gitParse
  -tar-parse-To display snapshots of help requests

# Relevent issues

* https://github.com/mscdex/busboy/issues/73
* https://github.com/mscdex/dicer/issues/2
* https://github.com/visionmedia/superagent/issues/455#issuecomment-98847613
* https://github.com/visionmedia/superagent/issues/546
* https://github.com/substack/node-git-emit/pull/4
* https://github.com/felixge/node-form-data/issues/108
* https://github.com/andrewrk/node-multiparty/issues/108
