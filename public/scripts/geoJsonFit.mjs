import { getColor } from "./routines.mjs";
/**
 * generazione formato GeoJson from Fit
 * */
export function setGeo(j) {
    
    return {
        async createGeoJson(j) {
            await this.setFeatureCollection(j)                                          // file fit

            const sourceFilename = new URL(j.fileFit, window.location.href)
                .pathname.split('/').pop();
            if (!sourceFilename || !/\.fit$/i.test(sourceFilename)) {
                throw new Error('Could not determine the source FIT filename.');
            }

            const geoJsonFilename = sourceFilename.replace(/\.fit$/i, '.geojson');
            const form = new FormData();
            form.append(
                'file',
                new Blob([JSON.stringify(j.featureCollection)], { type: 'application/geo+json' }),
                geoJsonFilename
            );

            const response = await fetch('/api/files', {
                method: 'POST',
                body: form
            });
            if (!response.ok) {
                throw new Error(`Could not save GeoJSON file: ${response.status}`);
            }

            // collection
            return JSON.stringify(j.featureCollection)                                  // transformed json
        },
        async setFeatureCollection(j) {
            j.featureCollection = {
                type: "FeatureCollection",                                              // type
                features:
                    (await this.setInizio(j))                                           // point Iizio
                        .concat(await this.setSalite(j))                                // salite
                        .concat(await this.setlowLands(j))                              // lowLands
                    ,
                properties:{
                    fit:j.messages.messages                                             // file fit
                }
            }                                                   
        },
        async setInizio(j) {
            j.features = []                                                          // features
            j.features.push(
                {
                    type: "Feature",                                                 // home point
                    geometry: {type: "Point"},
                    properties: {color: 'red',slice:[0,1]},
                    
                },
            )
            return j.features                                                       // features
        },
        async setSalite(j) {
            j.features = []
            for (let el of j.hills) {                                              // milestone
                j.pendenza=el.averageGradient.toFixed(0)
                j.features.push(
                    {
                        type: "Feature",
                        geometry: {type: "Point"},
                        properties: {
                            color: 'green',
                            hill: {
                                km: (el.distance / 1000).toFixed(1),
                                altezza: el.elevationGain.toFixed(0),
                                pend: el.averageGradient.toFixed(1),
                            },
                            slice:[el.end,el.end+1]
                        }
                    }, // arrivo
                    {
                        type: "Feature",
                        geometry: {type: "Point"},
                        properties: {
                            color: 'red',                                        // descrizione
                            slice:[el.start,el.start+1]                        
                        }
                    }, // partenza 
                    {                                                              // linestring 
                        type: "Feature",
                        geometry: {type: "LineString"},
                        properties: {
                            colorLine: getColor(j),
                            distance: el.distance,
                            typeLine: 'H',
                            slice:[el.start,el.end]                        
                        }
                    }
                )
            }
            return j.features
        },
        async setlowLands(j) {
            j.features = []
            for (let el of j.lowLands) {
                j.features.push({
                    type: "Feature",
                    geometry: {type: "LineString"},
                    properties: {
                        colorLine: 'blue',
                        distance: el.distance,
                        typeLine: 'L',
                        slice:[el.start,el.end]
                    }
                })
            }
            return j.features
        }
        }
}