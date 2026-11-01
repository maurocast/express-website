/**
 * generazione formato GeoJson from Fit
 * */
export function setGeo(j) {
    return {
        async createGeoJson(j) {
            await this.createJ(j)                                                       // create j
            await this.setFeatureCollection(j)                                          // collection
            await this.downloadData(j)                                                  // download se non return
            return JSON.stringify(j.featureCollection)                                  // transformed json
        },
        async createJ(j) {
            // j.records
            // j.hills
        },
        async downloadData(j) {

            const blob = new Blob([JSON.stringify(j.featureCollection)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.body.appendChild(
                Object.assign(document.createElement('a'), {
                    href: url,
                    download: "save" + j.dataAMG + ".json"
                })
            )
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },
        async setFeatureCollection(j) {                                                 // main
            j.featureCollection = {
                type: "FeatureCollection",                                              // type
                features:
                    (await this.setPercorso(j))                                         // records
                        .concat((await this.setSalite(j)))                              // points
            }
        },
        async setPercorso(j) {
            j.features = []                                                               // features
            j.features.push(
                {
                    type: "Feature",                                                // feature
                    properties: {
                    },
                    geometry: {                                                      // lng,lat,altezza
                        type: "LineString",                                          // type
                        coordinates: await coords(j)                                 // coord
                    }
                }
            )
            return j.features                                           // features
        },
        async setSalite(j) {
            j.features = []
            for (let el of j.hills) {                                                      // milestone
                j.features.push(
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                semicirclesToDegrees(el.endLon),
                                semicirclesToDegrees(el.endLat),
                            ]      // coordinates
                        },
                        properties: {
                            color: 'green',
                            hill: { distance: el.distance ,
                                elevationGain: el.elevationGain,
                                averageGradient: el.averageGradient,
                            }                                                 // descrizione
                        }
                    },
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                semicirclesToDegrees(el.startLon),
                                semicirclesToDegrees(el.startLat),
                            ]      // coordinates
                        },
                        properties: {
                            color: 'red',
                            hill: { distance: el.distance ,
                                elevationGain: el.elevationGain,
                                averageGradient: el.averageGradient,
                            }                                                    // descrizione
                        }
                    }
                )
            }
            return j.features
        }

    }
    function semicirclesToDegrees(semicircles) {
        return semicircles * (180 / Math.pow(2, 31));
    }
    async function coords(j) {
        let _ = []
        j.records
            .filter(record => record.positionLat !== undefined && record.positionLong !== undefined)
            .map(record => {
                _.push([
                    semicirclesToDegrees(record.positionLong),
                    semicirclesToDegrees(record.positionLat),
                ])
            });
        return _
    }
}