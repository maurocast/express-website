import { getTableIni } from "./getTable.mjs"                                   // descrizione arrivo
import { getMarker } from "./marker.mjs"

export async function useGeoJsonData(j) {                                      // da GeoJson

    j.descriptionIcons = await getDescriptionIconsGreen(j)                     // descrizioni green

    for (const feature of j.dataJson.features) {                               // loop features
            j.feature = feature;                                  
            if (j.feature.geometry.type === 'Point') {                          // points
            j.point = await coords(j)                                           // feauture coords GeoJson 
            if (j.feature.properties.color == 'green') {                        // arrivo
                j.tableGreen = j.descriptionIcons.splice(0, 1)                  // splice elemento descrizione 
            }           
            await getMarker(j)                                                  // add point j.feature
        }

        if (j.feature.geometry.type === 'LineString') {                           // linee

            await coords(j)                                                      // feauture coords GeoJson

            switch (j.feature.properties.typeLine) {                              // decorators
                case 'H':
                    L.geoJson(j.feature, {                                         // salite contorno
                        style: {                                                // contorno nero per H
                            color: 'black',
                            weight: 10,
                        }
                    }).addTo(j.geoLayerGroup)
                    const geojsonLayer = L.geoJson(j.feature, {                  // salite 
                        style: {
                            color: j.feature.properties.colorLine,
                            weight: 6,
                        }
                    }).addTo(j.geoLayerGroup)
                    geojsonLayer.eachLayer(function (layer) {                   // decoratore hills
                        if (layer instanceof L.Polyline) {
                            L.polylineDecorator(layer, {
                                patterns: [{                                                // decorator freccia    
                                    offset: '10%',
                                    repeat: 100,
                                    symbol: L.Symbol.arrowHead({
                                        pixelSize: 6,
                                        polygon: true,
                                        pathOptions: {
                                            color: 'blue',
                                            opacity: 0.6,
                                            fillOpacity: 0.6,
                                            fillColor: 'blue',
                                            //    className: 'decorator-pattern'
                                        }
                                    })
                                }]
                            }).addTo(j.geoLayerGroup)
                        }
                    });
                    break;
                case 'L':
                    const geojsonLayerL = L.geoJson(j.feature, {                  // low lands                         // pianure
                        style: {
                            color: j.feature.properties.colorLine,
                            weight: 2,
                        }

                    }).addTo(j.geoLayerGroup)
                    geojsonLayerL.eachLayer(function (layer) {                  // decoratore lowlandslans
                        if (layer instanceof L.Polyline) {
                            L.polylineDecorator(layer, {
                                patterns: [                                     // decorator linea red
                                    {
                                        offset: 10,
                                        repeat: 25,

                                        symbol: L.Symbol.dash({
                                            pixelSize: 10,
                                            pathOptions: {
                                                color: '#f00',
                                                weight: 2
                                            }
                                        })
                                    }]
                            }).addTo(j.geoLayerGroup)
                        }
                    });
                    const centerPoint = j.feature.geometry                      // medium point
                        .coordinates[Math.round(j.feature.geometry.coordinates.length / 2)];
                    L.marker([centerPoint[1], centerPoint[0]], {
                        icon: new L.DivIcon({
                            className: 'circle-with-textblue',
                            iconSize: [40, 40],
                            html: '<span>' +
                                (-j.feature.properties.distance.distancestart
                                    + j.feature.properties.distance.distanceend).toFixed(0) +
                                '<br>' + j.feature.properties.start +
                                ' - ' + j.feature.properties.end + '</span>'
                        })
                    })//.addTo(j.geoLayerGroup);
                    break;
                default:
                    L.geoJson(j.feature, {                                // tutte                         // pianure
                        style: {
                            color: 'white',
                            weight: 2}
                    }).addTo(j.geoLayerGroup)
            }
        }
    }
}

async function getDescriptionIconsGreen(j) {

    let result = []
    const tmpLayer = j.dataJson                                  // tutte le descrizioni Green
    for (const feature of tmpLayer.features) {
        if (feature.properties.color == 'green') {
            j.files = Array(feature.properties.hill)             // property.hill
            let _ = await getTableIni(j)
            _.childNodes[1].childNodes[j.rowDisplay = j.tableFilesRecordsPage??5]                        // span con Nomin
                .childNodes[0].innerHTML = 
            result.push(_)                                       // tables
        }
    }
    return result
}

/** chatGPT */
async function coords(j) {
    const geometry = j.feature.geometry;
    const [start, end] = j.feature.properties.slice;

    const coordinates = [];

    for (const record of j.records.slice(start, end)) {
        const lon = record.positionLong * j.config.semicirclesToDegrees;
        const lat = record.positionLat * j.config.semicirclesToDegrees;

        if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
            continue;
        }

        if (geometry.type === 'Point') {
            geometry.coordinates = [lon, lat];
            return j.feature;
        }

        if (geometry.type === 'LineString') {
            coordinates.push([lon, lat]);
        }
    }

    if (geometry.type === 'LineString') {
        geometry.coordinates = coordinates;
    }

    return j.feature;
}