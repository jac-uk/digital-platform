
A set of actions we can use in firebase functions and in local scripts

**Dependency Injection**
We are using dependecy injection so we can re-use this code across local node scripts, firebase functions and to help with unit tests.
Let's see if it proves useful. Or not :)

**To Do**
- [ ] Better logging. Perhaps inject our own logger
      When in Firebase Functions environment `console.log` etc are sent to stackdriver.
      We can likely improve the messages we send so they are more useful.
      Look at [Bunyan](https://github.com/trentm/node-bunyan)
