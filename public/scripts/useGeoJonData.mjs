import { getTableIni } from "./getTable.mjs"                                   // descrizione arrivo

export async function useGeoJsonData(j) {                                      // da GeoJson

    j.records = JSON.parse(j.dataJson).properties.fit.recordMesgs              // record completi fit
    j.descriptionIcons = await getDescriptionIconsGreen(j)                     // descrizioni green

    for (let feature of JSON.parse(j.dataJson).features) {                     // loop features
        if (feature.geometry.type === 'Point') {                               // points
            let point = await coords(j, feature)                                // feauture coords GeoJson 
            if (feature.properties.color == 'green') {                          // arrivo
                j.tableGreen = j.descriptionIcons.splice(0, 1)                  // splice elemento descrizione 
                j.tableGreen[0].childNodes[1].childNodes[5]                     // span con Nomin
                    .childNodes[0].innerHTML = await setNomin(feature)
            }
            L.marker(point.geometry.coordinates.reverse(), {                    // marker punto arrivo
                icon: new L.DivIcon({
                    iconSize: null,
                    className: 'circle-with-text' + feature.properties.color,   // style 
                    html: feature.properties.color == 'green'                   // html per green 
                        ? j.tableGreen[0].outerHTML
                        : '<span>start ' + await setNomin(feature) + '</span>'   // html red
                })
            }).addTo(j.geoLayerGroup)                                           // add to group
        }
        if (feature.geometry.type === 'LineString') {                           // linee
            let line = await coords(j, feature)                                 // feauture coords GeoJson
            feature = line                                                      // feauture clone
            let propFeature = {                                                 // style feature
                color: feature.properties.colorLine
            }
            const centerPoint = feature.geometry.coordinates[Math.round(feature.geometry.coordinates.length / 2)];
            const patternsL = [
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
            const patternsH = [{
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
            let propFeatureBlack = {                                    // controfno per H
                color: 'black',
                weight: 10,
                fillopacity: 1
            }
            if (feature.properties.typeLine == 'H') {                   // dimensioni H,L
                propFeature.weight = 6,
                    propFeature.fillopacity = 1
            }
            if (feature.properties.typeLine == 'L') {                   // dimensioni H,L
                propFeature.weight = 2,
                    propFeature.fillopacity = 0.5
            }
            switch (feature.properties.typeLine) {                      // decorators
                case 'H':
                    L.geoJson(feature, {                                // salite contorno
                        style: function (feature) {
                            return propFeatureBlack
                        }
                    }).addTo(j.map)
                    const geojsonLayer = L.geoJson(feature, {                                // salite 
                        style: function (feature) {
                            return propFeature
                        }
                    }).addTo(j.geoLayerGroup)
                    geojsonLayer.eachLayer(function (layer) {
                        if (layer instanceof L.Polyline) {
                            L.polylineDecorator(layer, {
                                patterns: patternsH
                            }).addTo(j.geoLayerGroup)
                        }
                    });
                    break;
                case 'L':
                    L.geoJson(feature, {                                          // pianure
                        style: function (feature) {
                            return propFeature
                        }
                    }).addTo(j.geoLayerGroup)
                    const geojsonLayerL = L.geoJson(feature, {                                          // pianure
                        style: function (feature) {
                            return propFeature
                        }
                    }).addTo(j.geoLayerGroup)
                    geojsonLayerL.eachLayer(function (layer) {
                        if (layer instanceof L.Polyline) {
                            L.polylineDecorator(layer, {
                                patterns: patternsL
                            }).addTo(j.geoLayerGroup)
                        }
                    });
                    L.marker([centerPoint[1], centerPoint[0]], {
                        icon: new L.DivIcon({
                            className: 'circle-with-textblue',
                            iconSize: [40, 40],
                            html: '<span>' +
                                (-feature.properties.distance.distancestart
                                    + feature.properties.distance.distanceend).toFixed(0) +
                                '<br>' + feature.properties.start +
                                ' - ' + feature.properties.end + '</span>'
                        })
                    }).addTo(j.geoLayerGroup);
                    break
            }
        }
    }
}

async function getDescriptionIconsGreen(j) {

    let result = []
    const tmpLayer = JSON.parse(j.dataJson)                     // tutte le descrizioni Green
    for (const feature of tmpLayer.features) {
        if (feature.properties.color == 'green') {
            j.files = Array(feature.properties.hill)            // property.hill
            let _ = await getTableIni(j)
            result.push(_)                                      // tables
        }
    }
    return result
}

async function setNomin(feature) {
    return ''
    setTimeout(() => {
        console.log("Eseguito dopo 1 secondo");
    }, 2000);

    const params = new URLSearchParams({
        lat: feature.geometry.coordinates[1],
        lon: feature.geometry.coordinates[0],
        addressdetails: '1',
        format: 'jsonv2'
    });
    return fetch(`https://nominatim.openstreetmap.org/reverse?${params}`)
        .then(async response => {
            if (!response.ok) {
                throw new Error(`Nominatim request failed: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            return result.display_name.split(',').slice(0, 2)
        })
        .catch(error => {
            console.error(error);
        });
}

async function coords(j, feature) {
    const semicirclesToDegrees = 180 / Math.pow(2, 31);
    !feature.geometry.coordinates
        ? feature.geometry.coordinates = [] : ''


    for (let record of j.records
        .slice(feature.properties.slice[0], feature.properties.slice[1])) {
        if (feature.geometry.type == 'Point') {
            feature.geometry.coordinates.push(
                record.positionLong * semicirclesToDegrees,
                record.positionLat * semicirclesToDegrees
            )
        }
        if (feature.geometry.type == 'LineString' &&
            !isNaN(record.positionLong * semicirclesToDegrees)
        ) {
            feature.geometry.coordinates.push(
                [record.positionLong * semicirclesToDegrees,
                record.positionLat * semicirclesToDegrees]
            )
        }
    };
    return feature;
}