// Change this:
// import { Decoder } from "@garmin/fitsdk";

// To this (using a CDN like esm.sh or unpkg):
import { Decoder,Stream } from "https://esm.sh/@garmin/fitsdk";
/**
 * Creazione fileFit
 * @param {*} j 
 */

export const fetchFileFit = async (j) => {
    const response = await fetch(j.fileFit);                              // file fit
    if (!response.ok) {                                                   // errore
        throw new Error(`Errore FIT file: ${response.status}`);
    }
    else {
        const arrayBuffer = await response.arrayBuffer();                 // array buffer
        const stream = Stream.fromArrayBuffer(arrayBuffer);               // stream
        if (!Decoder.isFIT(stream)) {                                     // errore stream
            throw new Error('File non valido');
        }
        else {                                                            // stream valido
            let decoder = new Decoder(stream);                            // decoder
            if (!decoder.checkIntegrity()) {
                throw new Error('FIT file integrity errore');             // errore decoder
            }
            else {
                const { messages, errors } = decoder.read();
                return { messages, errors }                               // return messages,error
            }
        }
    }
}