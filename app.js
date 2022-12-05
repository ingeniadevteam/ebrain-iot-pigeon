'use strict';

const App = require('.');
const pids = require('./pids');

async function main () {
    // create a new App
    const app = await App();

    app.logger.info(`ATTRIBUTES ${JSON.stringify(app.attributes)}`);

    // init the PIDs
    pids.init(app);

    while (true) {
        // run the PIDs
        pids.run(app);


        await new Promise(resolve => setTimeout(() => resolve(), app.attributes.SMAPLE_RATE));
    }
};

main();
