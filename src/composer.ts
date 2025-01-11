import {DisplayData} from "./types";
import {getLogger} from "./logger";

const logger = getLogger();

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

type Thing = number | object | string | boolean;

function exists(value: Thing | null | undefined): value is Thing {
    return value !== null && value !== undefined;
}

export function composeDisplayString(data: DisplayData): string {
    const displayString = [..."------------------------1----------------------"];
    if (exists(data.hours)) {
        const hours = clampAndRound(data.hours, 0, 99);
        displayString[0] = getDigit(hours, 1);
        displayString[1] = getDigit(hours, 0);
    }
    if (exists(data.minutes)) {
        const minutes = clampAndRound(data.minutes, 0, 99);
        displayString[2] = getDigit(minutes, 1);
        displayString[3] = getDigit(minutes, 0);
    }
    if (exists(data.wind)) {
        if (exists(data.wind.heading)) {
            const heading = clampAndRound(data.wind.heading / 10, 0, 99) * 10;
            displayString[4] = getDigitIfExists(heading, 2);
            displayString[5] = getDigit(heading, 1);
        }
        if (exists(data.wind.speed)) {
            const speed = clampAndRound(data.wind.speed, 0, 99);
            displayString[6] = getDigitIfExists(speed, 1);
            displayString[7] = getDigit(speed, 0);
        }
        if (exists(data.wind.maxSpeed)) {
            const speed = clampAndRound(data.wind.maxSpeed, 0, 99);
            displayString[20] = getDigitIfExists(speed, 1);
            displayString[21] = getDigit(speed, 0);
        }
        if (exists(data.wind.maxPerpendicularSpeed)) {
            const speed = clampAndRound(data.wind.maxPerpendicularSpeed, 0, 99);
            displayString[44] = getDigitIfExists(speed, 1);
            displayString[45] = getDigit(speed, 0);
        }
    }
    if (exists(data.pressure)) {
        if (exists(data.pressure.hPa)) {
            const pressure = clampAndRound(data.pressure.hPa, 0, 9999);
            displayString[8] = getDigitIfExists(pressure, 3);
            displayString[9] = getDigitIfExists(pressure, 2);
            displayString[10] = getDigitIfExists(pressure, 1);
            displayString[11] = getDigit(pressure, 0);
        }
        if (exists(data.pressure.mmHg)) {
            const pressure = clampAndRound(data.pressure.mmHg, 0, 999);
            displayString[29] = getDigitIfExists(pressure, 2);
            displayString[30] = getDigitIfExists(pressure, 1);
            displayString[31] = getDigit(pressure, 0);
        }
    }
    if (exists(data.clouds)) {
        if (exists(data.clouds.n)) {
            displayString[12] = getDigit(data.clouds.n, 0);
        }
        if (exists(data.clouds.nh)) {
            displayString[19] = getDigit(data.clouds.nh, 0);
        }
        if (exists(data.clouds.height)) {
            const height = clampAndRound(data.clouds.height / 10, 0, 999) * 10;
            displayString[26] = getDigitIfExists(height, 3);
            displayString[27] = getDigitIfExists(height, 2);
            displayString[28] = getDigit(height, 1);
        }
    }
    if (exists(data.visibility)) {
        if (exists(data.visibility.s)) {
            const visibility = clampAndRound(data.visibility.s / 10, 0, 999) * 10;
            displayString[41] = getDigitIfExists(visibility, 3);
            displayString[42] = getDigitIfExists(visibility, 2);
            displayString[43] = getDigit(visibility, 1);
        }
        if (exists(data.visibility.l1)) {
            const visibility = clampAndRound(data.visibility.l1 / 10, 0, 999) * 10;
            displayString[32] = getDigitIfExists(visibility, 3);
            displayString[33] = getDigitIfExists(visibility, 2);
            displayString[34] = getDigit(visibility, 1);
        }
        if (exists(data.visibility.l2)) {
            const visibility = clampAndRound(data.visibility.l2 / 10, 0, 999) * 10;
            displayString[35] = getDigitIfExists(visibility, 3);
            displayString[36] = getDigitIfExists(visibility, 2);
            displayString[37] = getDigit(visibility, 1);
        }
        if (exists(data.visibility.l3)) {
            const visibility = clampAndRound(data.visibility.l3 / 10, 0, 999) * 10;
            displayString[38] = getDigitIfExists(visibility, 3);
            displayString[39] = getDigitIfExists(visibility, 2);
            displayString[40] = getDigit(visibility, 1);
        }
    }
    if (exists(data.humidity)) {
        const humidity = clampAndRound(data.humidity, 0, 999);
        displayString[13] = getDigitIfExists(humidity, 2);
        displayString[14] = getDigitIfExists(humidity, 1);
        displayString[15] = getDigit(humidity, 0);
    }
    if (exists(data.temperature)) {
        const temperature = clampAndRound(data.temperature, -99, 99);
        displayString[16] = temperature >= 0 ? '-' : '1';
        displayString[17] = getDigitIfExists(Math.abs(temperature), 1);
        displayString[18] = getDigitIfExists(Math.abs(temperature), 0);
    }
    if (exists(data.hasThunder) && data.hasThunder) {
        displayString[22] = '1';
    }
    if (exists(data.events)) {
        const events = clampAndRound(data.events, 0, 9);
        displayString[23] = getDigit(events, 0);
    }
    if (exists(data.isUrgent) && data.isUrgent) {
        displayString[24] = '0';
    }
    if (exists(data.unitId)) {
        const unitId = clampAndRound(data.unitId, 0, 9);
        displayString[25] = getDigit(unitId, 0);
    }
    if (exists(data.hasIcing)) {
        displayString[46] = '1';
    }
    const rawDisplayString = displayString.join("");
    logger.info(`Sending '${rawDisplayString}'`);
    return rawDisplayString;
}