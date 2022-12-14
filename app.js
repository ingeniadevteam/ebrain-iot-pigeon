'use strict';

const round = require('round-to');
const App = require('.');
const modbusServer = require('./modbus-server');
const pids = require('./pids');
const acUnits = require('./ac_units');

const nextRun = async (app, t) => {
    let next = 0;
    const mils = t[0] * 1000 + t[1] / 1000000;
    if (mils < app.attributes.SMAPLE_RATE) next = app.attributes.SMAPLE_RATE - mils;
    app.logger.debug(`mils ${round(mils, 1)} next ${round(next, 1)} rate ${round(mils + next, 1)}`);
    await new Promise(resolve => setTimeout(() => resolve(), next));
}

async function main () {
    // create a new App
    const app = await App();
    // init the modbus server
    modbusServer(app, '0.0.0.0', 1502);
    // init the PIDs
    await pids.init(app);
    // init the AC Units
    await acUnits.init(app);

    while (true) {
        // get the time for rate pourposes
        const t = process.hrtime();

        // run the PIDs
        await pids.run(app);
        // run the AC Units
        await acUnits.run(app);

        // setup next (accurate) run
        await nextRun(app, process.hrtime(t));
    }
};

main();
