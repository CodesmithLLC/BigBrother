### To Start

```
git clone
npm install
npm start
```

All errors will be displayed. Currently the bugs at hand are:

* Request cannot access XHR because its within a webworker
* Superagent also cannot but it doesn't realize until the actual request happens

