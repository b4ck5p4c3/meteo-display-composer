import mqtt from "mqtt";
import dotenv from "dotenv";
import fs from "fs";
import {getLogger} from "./logger";

dotenv.config();

const logger = getLogger();

const CA_CERTIFICATE_PATH = process.env.CA_CERTIFICATE_PATH ?? 'ca-cert.pem';
const MQTT_URL = process.env.MQTT_URL ?? 'mqtts://b4ck:b4ck@mqtt.internal.0x08.in';

const client = mqtt.connect(MQTT_URL, {
    ca: [fs.readFileSync(CA_CERTIFICATE_PATH)]
});

interface DisplayData {
    // two digits [0, 1]
    hours?: number;
    // two digits [2, 3]
    minutes?: number;
    wind?: {
        // two digits + zero [4, 5]
        heading?: number;
        // two digits [6, 7]
        speed?: number;
        // two digits [20, 21]
        maxSpeed?: number;
        // two digits [44, 45]
        maxPerpendicularSpeed?: number;
    };
    pressure?: {
        // four digits [8, 9, 10, 11]
        hPa?: number;
        // three digits, decimal point + zero [29, 30, 31]
        mmHg?: number;
    };
    clouds?: {
        // one/two digits [12]
        n?: number;
        // one/two digits [19]
        nh?: number;
        // three digits + zero [26, 27, 28]
        height?: number;
    };
    visibility?: {
        // three digits + zero [41, 42, 43]
        s?: number;
        // three digits + zero [32, 33, 34]
        l1?: number;
        // three digits + zero [35, 36, 37]
        l2?: number;
        // three digits + zero [38, 39, 40]
        l3?: number;
    };
    // three digits [13, 14, 15]
    humidity?: number;
    // two digits with sign [16, 17, 18]
    temperature?: number;
    // one sign - [22]
    hasThunder?: boolean;
    // one digit - [23]
    events?: number;
    // one sign - [24] (research more, when 1 - indicator shows nothing)
    isUrgent?: boolean;
    // one digit - [25]
    unitId?: number;
    // one sign - [46]
    hasIcing?: boolean;
}

function clampAndRound(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, Math.round(value)));
}

function getDigit(value: number, position: number): string {
    return (Math.floor(value / Math.pow(10, position)) % 10).toFixed(0);
}

function getDigitIfExists(value: number, position: number): string {
    if (value >= Math.pow(10, position)) {
        return getDigit(value, position);
    }
    return "-";
}

function composeDisplayString(data: DisplayData): string {
    const displayString = [..."------------------------1----------------------"];
    if (data.hours !== undefined) {
        const hours = clampAndRound(data.hours, 0, 99);
        displayString[0] = getDigit(hours, 1);
        displayString[1] = getDigit(hours, 0);
    }
    if (data.minutes !== undefined) {
        const minutes = clampAndRound(data.minutes, 0, 99);
        displayString[2] = getDigit(minutes, 1);
        displayString[3] = getDigit(minutes, 0);
    }
    if (data.wind) {
        if (data.wind.heading !== undefined) {
            const heading = clampAndRound(data.wind.heading / 10, 0, 99) * 10;
            displayString[4] = getDigitIfExists(heading, 2);
            displayString[5] = getDigit(heading, 1);
        }
        if (data.wind.speed !== undefined) {
            const speed = clampAndRound(data.wind.speed, 0, 99);
            displayString[6] = getDigitIfExists(speed, 1);
            displayString[7] = getDigit(speed, 0);
        }
        if (data.wind.maxSpeed !== undefined) {
            const speed = clampAndRound(data.wind.maxSpeed, 0, 99);
            displayString[20] = getDigitIfExists(speed, 1);
            displayString[21] = getDigit(speed, 0);
        }
        if (data.wind.maxPerpendicularSpeed !== undefined) {
            const speed = clampAndRound(data.wind.maxPerpendicularSpeed, 0, 99);
            displayString[44] = getDigitIfExists(speed, 1);
            displayString[45] = getDigit(speed, 0);
        }
    }
    if (data.pressure) {
        if (data.pressure.hPa !== undefined) {
            const pressure = clampAndRound(data.pressure.hPa, 0, 9999);
            displayString[8] = getDigitIfExists(pressure, 3);
            displayString[9] = getDigitIfExists(pressure, 2);
            displayString[10] = getDigitIfExists(pressure, 1);
            displayString[11] = getDigit(pressure, 0);
        }
        if (data.pressure.mmHg !== undefined) {
            const pressure = clampAndRound(data.pressure.mmHg, 0, 999);
            displayString[29] = getDigitIfExists(pressure, 2);
            displayString[30] = getDigitIfExists(pressure, 1);
            displayString[31] = getDigit(pressure, 0);
        }
    }
    if (data.clouds) {
        if (data.clouds.n !== undefined) {
            displayString[12] = getDigit(data.clouds.n, 0);
        }
        if (data.clouds.nh !== undefined) {
            displayString[19] = getDigit(data.clouds.nh, 0);
        }
        if (data.clouds.height !== undefined) {
            const height = clampAndRound(data.clouds.height / 10, 0, 999) * 10;
            displayString[26] = getDigitIfExists(height, 3);
            displayString[27] = getDigitIfExists(height, 2);
            displayString[28] = getDigit(height, 1);
        }
    }
    if (data.visibility) {
        if (data.visibility.s !== undefined) {
            const visibility = clampAndRound(data.visibility.s / 10, 0, 999) * 10;
            displayString[41] = getDigitIfExists(visibility, 3);
            displayString[42] = getDigitIfExists(visibility, 2);
            displayString[43] = getDigit(visibility, 1);
        }
        if (data.visibility.l1 !== undefined) {
            const visibility = clampAndRound(data.visibility.l1 / 10, 0, 999) * 10;
            displayString[32] = getDigitIfExists(visibility, 3);
            displayString[33] = getDigitIfExists(visibility, 2);
            displayString[34] = getDigit(visibility, 1);
        }
        if (data.visibility.l2 !== undefined) {
            const visibility = clampAndRound(data.visibility.l2 / 10, 0, 999) * 10;
            displayString[35] = getDigitIfExists(visibility, 3);
            displayString[36] = getDigitIfExists(visibility, 2);
            displayString[37] = getDigit(visibility, 1);
        }
        if (data.visibility.l3 !== undefined) {
            const visibility = clampAndRound(data.visibility.l3 / 10, 0, 999) * 10;
            displayString[38] = getDigitIfExists(visibility, 3);
            displayString[39] = getDigitIfExists(visibility, 2);
            displayString[40] = getDigit(visibility, 1);
        }
    }
    if (data.humidity !== undefined) {
        const humidity = clampAndRound(data.humidity, 0, 999);
        displayString[13] = getDigitIfExists(humidity, 2);
        displayString[14] = getDigitIfExists(humidity, 1);
        displayString[15] = getDigit(humidity, 0);
    }
    if (data.temperature !== undefined) {
        const temperature = clampAndRound(data.temperature, -99, 99);
        displayString[16] = temperature >= 0 ? '-' : '1';
        displayString[17] = getDigitIfExists(Math.abs(temperature), 1);
        displayString[18] = getDigitIfExists(Math.abs(temperature), 0);
    }
    if (data.hasThunder) {
        displayString[22] = '1';
    }
    if (data.events !== undefined) {
        const events = clampAndRound(data.events, 0, 9);
        displayString[23] = getDigit(events, 0);
    }
    if (data.isUrgent) {
        displayString[24] = '0';
    }
    if (data.unitId !== undefined) {
        const unitId = clampAndRound(data.unitId, 0, 9);
        displayString[25] = getDigit(unitId, 0);
    }
    if (data.hasIcing) {
        displayString[46] = '1';
    }
    const rawDisplayString = displayString.join("");
    logger.info(`Sending '${rawDisplayString}'`);
    return rawDisplayString;
}

async function sendDisplayData(data: DisplayData): Promise<void> {
    await client.publishAsync("bus/devices/meteo-display/data", composeDisplayString(data));
}

client.on('message', (topic, payload) => {
    if (topic === 'bus/services/meteo-display/data') {
        try {
            const parsedData = JSON.parse(payload.toString("utf8")) as DisplayData;
            sendDisplayData(parsedData).then(() => logger.info("Data sent")).catch(e => logger.error(e));
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
