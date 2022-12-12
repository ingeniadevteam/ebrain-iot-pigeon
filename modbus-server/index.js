"use strict";

const ModbusRTU = require('modbus-serial');

const mapping = (app, addr) => {
    switch (addr) {
        case 0:
            return parseInt(app.device.values['TEMPERATURA IZQUIERDA'] * 10);
        case 1:
            return parseInt(app.device.values['VENTILACION IZQUIERDA']);
        case 2:
            return parseInt(app.device.values['TEMPERATURA DERECHA'] * 10);
        case 3:
            return parseInt(app.device.values['VENTILACION DERECHA']);
        case 4:
            return parseInt(app.device.values['TEMPERATURA EXTERIOR'] * 10);
        case 5:
            return parseInt(app.device.values['ESTADO MAQUINA AUXILIAR 1']);
        case 6:
            return parseInt(app.device.values['ESTADO MAQUINA AUXILIAR 2']);
        case 7:
            return parseInt(app.device.values['ESTADO MAQUINA AUXILIAR 3']);
        default:
            break;
    }
}

module.exports = (app, host, port) => {
    // setup a ModbusTCP Server
    var vector = {
        getInputRegister: (addr) => {
            return mapping(app, addr);
        },
        getHoldingRegister: (addr) => {
            return mapping(app, addr);
        },
        getCoil: (addr) => {
            return (addr % 2) === 0;
        },
        setRegister: (addr, value) => {
            app.logger.debug('set register', addr, value);
            return;
        },
        setCoil: (addr, value) => {
            app.logger.debug('set coil', addr, value);
            return;
        }
    };
    // start the server
    try {
        const server = new ModbusRTU.ServerTCP(vector, {
            host: host,
            port: port
        });
        app.logger.info(`started modbus TCP server on modbus://${host}:${port}`);
    } catch (e) {
        app.logger.error(`modbus TCP server failed`);
    }
};
