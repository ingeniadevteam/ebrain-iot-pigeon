'use strict';

const round = require('round-to');
const App = require('.');

async function main () {
    // create a new App
    const app = await App();

    app.logger.info(`ATTRIBUTES ${JSON.stringify(app.attributes)}`);

    // set pid target
    app.pids.module.RIGHT.setTarget(app.attributes.CONSIGNA);
    app.pids.module.LEFT.setTarget(app.attributes.CONSIGNA);

    // set pid Interval
    app.pids.module.RIGHT.setTimeInterval(app.attributes.SMAPLE_RATE);
    app.pids.module.LEFT.setTimeInterval(app.attributes.SMAPLE_RATE);


    console.log(app.pids.module);

    // run control loop
    let tRight, rightPidOutput, tLeft, leftPidOutput;

    while (true) {
        // run the pid
        if (app.w1.data) {
            tRight = app.w1.data['TEMPERATURA DERECHA'];
            tLeft = app.w1.data['TEMPERATURA IZQUIERDA'];
            
            if (!isNaN(tRight)) {
                // set new input into the RIGHT PID
                app.pids.module.RIGHT.setInput(tRight);
                // compute the RIGHT PID
                rightPidOutput = app.pids.module.RIGHT.compute();
                if (rightPidOutput) {
                    console.log('RIGHT', tRight, round(rightPidOutput, 0));
                }
            }

            if (!isNaN(tLeft)) {
                // set new input into the LEFT PID
                app.pids.module.LEFT.setInput(tLeft);
                // compute the LEFT PID
                leftPidOutput = app.pids.module.LEFT.compute();
                if (leftPidOutput) {
                    console.log('LEFT', tLeft, round(leftPidOutput, 0));
                }
            }
        }

        await new Promise(resolve => setTimeout(() => resolve(), app.attributes.SMAPLE_RATE));
    }
};

main();