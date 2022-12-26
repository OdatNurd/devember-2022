import { config } from '#core/config';
import { logger } from '#core/logger';

import jetpack from 'fs-jetpack';

import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

import { resolve, basename } from 'path';


// =============================================================================


/* Get our subsystem logger. */
const log = logger('static');


// =============================================================================


/* Given an absolute path to a static HTML file, load up that file, parse it
 * into a DOM object, then pass that object to the formatting function provided.
 * The format function should modify the DOM in any way that it desires.
 *
 * Upon return, the dom object will be serialized to disk and transmitted as
 * a response.
 *
 * If the static file presented does not exist, the errorTemplate function will
 * be called to obtain the template for the page to send. That page will be
 * sent as is and not passed through the formatter. */
export function sendStaticTemplate(req, res, file, errorTemplate, formatter) {
  log.debug(`serving: ${req.url} from ${file}`);

  // Send back the error template if the file provided does not exist.
  if (jetpack.exists(file) !== 'file') {
    return res.status(404).send(errorTemplate());
  }

  // Get the file from disk and parse it into a DOM objec.t
  const assetContent = readFileSync(file, 'utf-8');
  const dom = new JSDOM(assetContent);

  // Run the dom object through the user provided formatter to mark up the
  // template.
  formatter(dom);

  // Send the result back.
  res.send(dom.serialize());
}


// =============================================================================
