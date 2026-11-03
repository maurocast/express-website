/**
 * generazione formato GeoJson from Fit
 * */
export function setGeo(j) {

    const semicirclesToDegrees=180 / Math.pow(2, 31);                               // trasform number to lat/lng
    const getColor = (pendenza) => {
        pendenza<0?pendenza=0:pendenza=pendenza
        pendenza>15?pendenza=15:pendenza=pendenza
    return j.config.colorsArr[pendenza.toString()]
    }    
    
    return {
        async createGeoJson(j) {
            await this.createJ(j)                                                       // create j
            await this.setFeatureCollection(j)                                          // collection
            return JSON.stringify(j.featureCollection)                                  // transformed json
        },
        async createJ(j) {
        },
        async setFeatureCollection(j) {                                                 
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
                    type: "Feature",                                                 // feature
                    properties: {
                    },
                    geometry: {                                                      // lng,lat,altezza
                        type: "LineString",                                          // type
                        coordinates: await setGeo(j).coords(j)                       // coord
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
                                el.endLon * semicirclesToDegrees,
                                el.endLat * semicirclesToDegrees,
                            ]
                        },
                        properties: {
                            color: 'green',
                            hill: {
                                km: (el.distance/1000).toFixed(1),
                                altezza: el.elevationGain.toFixed(0),
                                pend: el.averageGradient.toFixed(1),
                            }                                                 // descrizione
                        }
                    },
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [
                                el.startLon * semicirclesToDegrees,
                                el.startLat * semicirclesToDegrees,
                            ]
                        },
                        properties: {
                            color: 'red',
                            hill: {
                                distance: el.distance,
                                elevationGain: el.elevationGain,
                                averageGradient: el.averageGradient,
                            }                                                    // descrizione
                        }
                    },
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: 
                                el.points.map(r => [
                                    r.positionLong * semicirclesToDegrees, 
                                    r.positionLat * semicirclesToDegrees])
                            
                        },
                        properties: {
                            colorLine: getColor(el.averageGradient.toFixed(0))
                        }
                    }    
                )
            }
            return j.features
        },
        async coords(j) {
        let _ = []
        j.records
            .filter(record => record.positionLat !== undefined && record.positionLong !== undefined)
            .map(record => {
                _.push([
                    record.positionLong * semicirclesToDegrees,
                    record.positionLat * semicirclesToDegrees
                ])
            });
        return _
        }
    }
}