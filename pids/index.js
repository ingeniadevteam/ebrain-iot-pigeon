'use strict';

const round = require('round-to');

const init = (app) => {
    // set pid target
    app.pids.module.RIGHT.setTarget(app.attributes.CONSIGNA);
    app.pids.module.LEFT.setTarget(app.attributes.CONSIGNA);

    // set pid Interval
    app.pids.module.RIGHT.setTimeInterval(app.attributes.SMAPLE_RATE);
    app.pids.module.LEFT.setTimeInterval(app.attributes.SMAPLE_RATE);

    // set lower bound
    app.pids.module.RIGHT.setLBound(app.attributes['VENTILACION MINIMA']);
    app.pids.module.LEFT.setLBound(app.attributes['VENTILACION MINIMA']);

    // set upper bound
    app.pids.module.RIGHT.setUBound(app.attributes['VENTILACION MAXIMA']);
    app.pids.module.LEFT.setUBound(app.attributes['VENTILACION MAXIMA']);
}

const checkReconfig = (app) => {
    const currentSetpoint = app.pids.module.LEFT.target;
    const currentTi = app.pids.module.LEFT.dt;

    // check pid target
    if (currentSetpoint !== app.attributes.CONSIGNA) {
        app.pids.module.RIGHT.setTarget(app.attributes.CONSIGNA);
        app.pids.module.LEFT.setTarget(app.attributes.CONSIGNA);
        app.logger.info(`PID target changed ${currentSetpoint} => ${app.attributes.CONSIGNA}`);
    }

    // check pid Interval
    if (currentTi !== app.attributes.SMAPLE_RATE) {
        app.pids.module.RIGHT.setTimeInterval(app.attributes.SMAPLE_RATE);
        app.pids.module.LEFT.setTimeInterval(app.attributes.SMAPLE_RATE);
        app.logger.info(`PID interval changed ${currentTi} => ${app.attributes.SMAPLE_RATE}`);
    }
}

const run = (app) => {
    // check PIDs reconfiguration
    checkReconfig(app);

    // run the pid if the temperatures are aviable
    if (app.w1.data) {
        const tRight = app.w1.data['TEMPERATURA DERECHA'];
        const tLeft = app.w1.data['TEMPERATURA IZQUIERDA'];
        
        // RIGHT PID
        if (!isNaN(tRight)) {
            // set new input into the RIGHT PID
            app.pids.module.RIGHT.setInput(tRight);
            // compute the RIGHT PID
            const rightPidOutput = app.pids.module.RIGHT.compute();
            if (rightPidOutput) {
                console.log('RIGHT', tRight, round(rightPidOutput, 0));
            }
        }

        // LEFT PID
        if (!isNaN(tLeft)) {
            // set new input into the LEFT PID
            app.pids.module.LEFT.setInput(tLeft);
            // compute the LEFT PID
            const leftPidOutput = app.pids.module.LEFT.compute();
            if (leftPidOutput) {
                // console.log('LEFT ', tLeft, round(leftPidOutput, 0));
            }
        }
    }    
}


module.exports = {
    init,
    run
};