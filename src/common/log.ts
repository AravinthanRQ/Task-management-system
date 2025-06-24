import { logT } from "./logT.enum";

const log = (logType: logT, logMessage: string) => {
    if (logType === logT.Log) console.log(`[${logType} 💬]: ${logMessage}`);
    if (logType === logT.Seed) console.log(`[${logType} 🌱]: ${logMessage}`);
    if (logType === logT.Job) console.log(`[${logType} 👜]: ${logMessage}`);
    if (logType === logT.Error) console.log(`[${logType} ❌]: ${logMessage}`);
};

export default log;
