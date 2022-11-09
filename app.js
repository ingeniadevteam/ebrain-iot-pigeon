'use strict';

const App = require('.');

async function main () {
    // create a new App
    const app = await App();

    // run control loop
    while (true) {
        app.logger.info(`ATTRIBUTES ${JSON.stringify(app.attributes)}`);

        app.enabled.forEach(module => {
            if (app[module].data) {
                app.logger.info(`${module} ${JSON.stringify(app[module].data)}`);
            }
        });

        await new Promise(resolve => setTimeout(() => resolve(), 5000));
    }
};

main();