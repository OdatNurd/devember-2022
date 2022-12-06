import { config } from '#core/config';

import { createLogger, format, transports } from 'winston';
import { resolve } from 'path';

import 'winston-daily-rotate-file';


// =============================================================================


/* The top level global logger; this gets instantiated lazily as needed, and
 * contains the overall log handle. We don't actually log with this, and instead
 * we create child loggers for the various subsystems so that we can separate
 * their logs out as needed. */
let globalLogger = undefined;

/* The list of child loggers; once created they are never removed; We key the
 * dictionary on the subsystem name with the values being the required child
 * logger. */
const loggers = {}

/* This specifies a log format to be used for sending logs to the console as
 * well as for sending logs to text files. */
const consoleLogFormat = format.printf(({level, message, subsystem, timestamp, stack}) => {
    return `${timestamp} [${level}] ${subsystem}: ${stack || message}`;
});


// =============================================================================


/* This creates and returns back a transport that will send its output to the
 * named text file. The log will automatically roll on a daily basis and archive
 * older logs as well.
 *
 * The filename can (and probably should) contain a %DATE% value, which will be
 * expanded out to the current date. */
function getTextFileTransport(filename) {
  const auditFile = resolve(config.get('configDir'), 'logs', 'audit.json')
  return new transports.DailyRotateFile({
    filename,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '1m',
    maxFiles: '14d',
    createSymlink: true,
    symlinkName: 'current_run.log',
    auditFile,
    format: format.combine(
      format.timestamp({ format: config.get('logging.timestamp') }),
      consoleLogFormat,
    )
  });
}


// =============================================================================


/* This creates and returns back a transport that will display data to the
 * console in a nice human readable way using the console log format above.
 *
 * This logger will configure itself to be silent if logging to the console is
 * turned off. */
function getConsoleTransport() {
  return new transports.Console({
    silent: !config.get('logging.console'),
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: config.get('logging.timestamp') }),
      consoleLogFormat,
    )
  });
}


// =============================================================================


/* Creates and returns a logging object that can be used to send output to the
 * console; this uses the configuration system to determine what the output
 * log level should be. */
function createAppLogger() {
  // Get the core log object
  const logger = createLogger({
    level: config.get('logging.level'),
    format: format.errors({ stack: true })
  });

  // If console logging is turned on, then add a console transport.
  if (config.get('logging.console') === true) {
    logger.add(getConsoleTransport());
  }

  // If there is a configured log filename, then send logs to the file too
  if (config.get('logging.file') !== '') {
    const logFile = resolve(config.get('configDir'), 'logs', config.get('logging.file'));
    logger.add(getTextFileTransport(logFile));
  }

  return logger;
}


// =============================================================================


/* Obtain the logger handle for the logger that is for logs from the provided
 * subsystem. This will lazily instantiate either the parent logger or the
 * required child logger for the subsystem as needed. */
export function logger(subsystem) {
  if (globalLogger === undefined) {
    globalLogger = createAppLogger();
  }

  if (subsystem in loggers === false) {
    loggers[subsystem] = globalLogger.child({ subsystem });
  }

  return loggers[subsystem];
}


// =============================================================================
