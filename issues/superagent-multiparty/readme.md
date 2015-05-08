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