const server = require('./app/server');

const app = {
    init: function() {
        server();
    }
}

app.init();