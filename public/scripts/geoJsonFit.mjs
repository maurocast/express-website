import { getColor,saveFile } from "./routines.mjs";
 
/**
 * generazione formato GeoJson from Fit
 * */
export function setGeo(j) {

    return {
        async createGeoJson(j) {
            await this.setFeatureCollection(j)                                          // file fit
            return JSON.stringify(j.featureCollection)                                  // transformed json
        },
        
        async setFeatureCollection(j) {
            j.features = []                                                          // features
            j.ct=0                                                                   // counter
            await this.setInizio(j)                                                  // point Iizio
            await this.setSalite(j)                                                  // salite
            await this.setlowLands(j)                                                // lowLands

            j.featureCollection = {
                type: "FeatureCollection",                                           // type
                features:j.features,                                                 // features
                properties: {fit: j.messages.messages}                               // fit
            }
        },
        async setInizio(j) {
            j.features.push(
                {
                    type: "Feature",                                                 // home point
                    geometry: { type: "Point", coordinates: [] },
                    properties: { color: 'red', slice: [0, 1] ,id:j.ct++},
                },
                {
                    type: "Feature",                                                 // solo discese
                    geometry: { type: "LineString", coordinates: [] },
                    properties: { 
                        color: 'white', 
                        slice: [0,j.messages.messages.recordMesgs.length],            // completo   
                        id:j.ct++
                    },
                }
            )
        },
        async setSalite(j) {
            
            for (let el of j.hills) {
                j.pendenza=el.averageGradient.toFixed(0)                            // get color
                j.features.push(
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [] },
                        properties: {
                            color: 'red',                                        // descrizione
                            slice: [el.start, el.start + 1],
                             id:j.ct++
                        }
                    }, // partenza
                    {
                        type: "Feature",
                        geometry: { type: "Point", coordinates: [] },
                        properties: {
                            color: 'green',
                            hill: {
                                km: (el.distance / 1000).toFixed(1),
                                altezza: el.elevationGain.toFixed(0),
                                pend: el.averageGradient.toFixed(1),
                            },
                            slice: [el.end, el.end + 1],
                            id:j.ct++
                        }
                    }, // arrivo                 
                    {                                                              // linestring 
                        type: "Feature",
                        geometry: { type: "LineString", coordinates: [] },
                        properties: {
                            colorLine: getColor(j),
                            distance: el.distance,
                            typeLine: 'H',
                            slice: [el.start, el.end],
                             id:j.ct++
                        }
                    }
                )
            }
        },
        async setlowLands(j) {
            for (let el of j.lowLands) {
                j.features.push({
                    type: "Feature",
                    geometry: { type: "LineString", coordinates: [] },
                    properties: {
                        colorLine: 'blue',
                        distance: el.distance,
                        typeLine: 'L',
                        slice: [el.start, el.end],
                         id:j.ct++
                    }
                })
            }
            
        }
    }
}