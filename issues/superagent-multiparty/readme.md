### Current State

We have 3 wrappers that are prodominately used and depended on for multipart handlers.

* Formidable
* Multiparty
* busboy

We have 2 wrappers that are prodominately used and depended on for http requests

* Request
* SuperAgent

However, the basic issue for me is [here](https://github.com/felixge/node-form-data/issues/90)

When providing something like a terminal output, form-data cannot handle it.


### However!

By simply providing the header `"Transfer-Encoding: chunked"` We have a working module


### To run

* npm install
* npm start
* type in the terminal one of [superagent, request, superagent-bad, request-bad]


### Bugs Found

* Busboy hangs when there is an issue
* Multiparty seems to throw an error regardless if everything is listened to
* Super agent and Request do not provide Transfer-Encoding:chunked when necessary
