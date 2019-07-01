var connect = require('connect');
var serveStatic = require('serve-static');
const port = process.argv[2] || 8002;

connect().use(serveStatic(__dirname)).listen(port, function(){
    console.log(`Server running on ${port}...`);
});