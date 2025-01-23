import mqtt from "mqtt";
import dotenv from "dotenv";
import fs from "fs";
import {getLogger} from "./logger";
import {DisplayData} from "./types";
import cron from "node-cron";
import {composeDisplayString} from "./composer";
import merge from "deepmerge";

dotenv.config();

const logger = getLogger();

const CA_CERTIFICATE_PATH = process.env.CA_CERTIFICATE_PATH ?? 'ca-cert.pem';
const MQTT_URL = process.env.MQTT_URL ?? 'mqtts://b4ck:b4ck@mqtt.internal.0x08.in';

const client = mqtt.connect(MQTT_URL, {
    ca: [fs.readFileSync(CA_CERTIFICATE_PATH)]
});

async function sendDisplayData(data: DisplayData): Promise<void> {
    console.info(data);
    await client.publishAsync("bus/devices/meteo-display/data", composeDisplayString(data));
}

let currentDisplayData: DisplayData = {};

let displayUpdating = false;

function updateDisplay() {
    if (displayUpdating) {
        return;
    }
    displayUpdating = true;

    const time = new Date();

    sendDisplayData({
        ...currentDisplayData,

        hours: time.getHours(),
        minutes: time.getMinutes()
    }).catch(e => {
        logger.error(`Failed to update display: ${e}`);
    }).finally(() => {
        displayUpdating = false;
    })
}

updateDisplay();

cron.schedule("* * * * *", () => {
    updateDisplay();
});

client.on('message', (topic, payload) => {
    if (topic === 'bus/services/meteo-display/data') {
        try {
            const parsedData = JSON.parse(payload.toString("utf8")) as DisplayData;
            currentDisplayData = merge(currentDisplayData, parsedData);
        } catch (e) {
            logger.error(`Error parsing data: ${e}`);
        }
    }
});

client.on('connect', () => {
    logger.info('Connected to mqtt');
    client.subscribe('bus/services/meteo-display/data');
});

client.on('error', e => {
    logger.error(`MQTT error: ${e}`);
});
