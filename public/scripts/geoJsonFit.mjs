/**
 * generazione formato GeoJson from Fit
 * */
export function setGeo(j) {
    const semicirclesToDegrees = 180 / Math.pow(2, 31);                                 // trasform number to lat/lng
    const getColor = (pendenza) => {                                                    // colosi salita
        pendenza < 0 ? pendenza = 0 : pendenza = pendenza
        pendenza > 15 ? pendenza = 15 : pendenza = pendenza
        return j.config.colorsArr[pendenza.toString()]
    }
    return {
        async createGeoJson(j) {
            await this.setFeatureCollection(j)                                          // collection
            return JSON.stringify(j.featureCollection)                                  // transformed json
        },
        async setFeatureCollection(j) {
            j.featureCollection = {
                type: "FeatureCollection",                                              // type
                features:
                    (await this.setInizio(j))                                           // point Iizio
                        .concat(await this.setSalite(j))                                // salite
                        .concat(await this.setlowLands(j))                              // lowlands
                    }
        },
        async setInizio(j) {
            j.features = []                                                          // features
            j.features.push(
                {
                    type: "Feature",                                                 // home point
                    geometry: {
                        type: "Point",
                        coordinates: [
                            j.messages.messages.recordMesgs[0].positionLong * semicirclesToDegrees,
                            j.messages.messages.recordMesgs[0].positionLat * semicirclesToDegrees
                        ]
                    },
                    properties: {
                        color: 'red'                                                // color
                    }
                },
            )
            return j.features                                                       // features
        },
        async setSalite(j) {
            j.features = []
            for (let el of j.hills) {                                              // milestone
                j.features.push(
                    {
                        type: "Feature",
                        geometry: {
                            type: "Point",                                          // point
                            coordinates: [
                                el.endLon * semicirclesToDegrees,
                                el.endLat * semicirclesToDegrees,
                            ]
                        },
                        properties: {
                            color: 'green',
                            hill: {
                                km: (el.distance / 1000).toFixed(1),
                                altezza: el.elevationGain.toFixed(0),
                                pend: el.averageGradient.toFixed(1),
                            }                                                       // descrizione
                        }
                    }, // arrivo
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
                            color: 'red'                                        // descrizione
                        }
                    }, // partenza 
                    {                                                              // linestring 
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates:
                                el.points.map(r => [
                                    r.positionLong * semicirclesToDegrees,
                                    r.positionLat * semicirclesToDegrees,
                                    r.distance])

                        },
                        properties: {
                            colorLine: getColor(el.averageGradient.toFixed(0)),
                            distance: el.distance,
                            typeLine: 'H'
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
                    geometry: {
                        type: "LineString",
                        coordinates:
                            el.points.map(r => [
                                r.positionLong * semicirclesToDegrees,
                                r.positionLat * semicirclesToDegrees,
                                r.distance])
                    },
                    properties: {
                        colorLine: 'white',
                        distance: el.distance,
                        typeLine: 'L'
                    }
                })
            }
            return j.features
        },
        async coords(j) {
            let _ = []
            j.messages.messages.recordMesgs
                .filter(record => record.positionLat !== undefined && record.positionLong !== undefined)
                .map(record => {
                    _.push([
                        record.positionLong * semicirclesToDegrees,
                        record.positionLat * semicirclesToDegrees,
                        record.distance
                    ])
                });
            return _
        }
    }
}