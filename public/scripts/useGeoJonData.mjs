
import { getTableIni } from "./getTable.mjs";
import { getMarker } from "./marker.mjs";

/**
 * Elabora i dati GeoJSON e costruisce il layer Leaflet.
 */
export async function useGeoJsonData(j) {

    j.descriptionIcons = await getDescriptionIconsGreen(j);                         // descrizioni per green

    for (const feature of j.dataJson.features) {                                    // loop feature

        j.feature = feature;                                                        // j.feature

        await coords(j);                                                            // recuper coordinate

        switch (feature.geometry.type) {

            case "Point":                                                           // feature Point
                await processPoint(j);
                break;

            case "LineString":                                                      // feature Line string
                processLine(j);
                break;

            default:
                console.warn(                                                       // errore
                    "Geometria GeoJSON non supportata:",
                    feature.geometry.type
                );
        }
    }

    return j;
}

/**
 * Gestione dei punti.
 */
async function processPoint(j) {

    if (j.feature.properties.color === "green") {
        j.tableGreen = j.descriptionIcons.shift();                                  // first element                                      
    }

    await getMarker(j);                                                             // visualizza marker
}

/**
 * Gestione delle linee.
 */
function processLine(j) {

    const feature = j.feature;

    switch (feature.properties.typeLine) {

        case "H":
            addHillLine(j);                                                         // salite
            break;

        case "L":
            addLowlandLine(j);                                                      // discese
            break;

        default:
            addDefaultLine(j);                                                      // pianure
    }
}

/**
 * Linea di salita.
 */
function addHillLine(j) {

    const feature = j.feature;

    addGeoJsonLine(j, feature, {
        color: "black",
        weight: 10
    });

    const layer = addGeoJsonLine(j, feature, {
        color: feature.properties.colorLine,
        weight: 6
    });

    addArrowDecorator(j, layer);
}

/**
 * Linea di pianura.
 */
function addLowlandLine(j) {

    const feature = j.feature;

    const layer = addGeoJsonLine(j, feature, {
        color: feature.properties.colorLine,
        weight: 2
    });

    addDashDecorator(j, layer);
    addCenterMarker(j);
}

/**
 * Linea predefinita.
 */
function addDefaultLine(j) {

    addGeoJsonLine(j, j.feature, {
        color: "white",
        weight: 2
    });
}

/**
 * Crea una linea GeoJSON e la aggiunge al gruppo.
 */
function addGeoJsonLine(j, feature, style) {

    return L.geoJson(feature, {
        style
    }).addTo(j.geoLayerGroup);
}

/**
 * Decoratore frecce per le salite.
 */
function addArrowDecorator(j, geojsonLayer) {

    geojsonLayer.eachLayer(layer => {

        if (!(layer instanceof L.Polyline)) return;

        L.polylineDecorator(layer, {
            patterns: [{
                offset: "10%",
                repeat: 100,
                symbol: L.Symbol.arrowHead({
                    pixelSize: 6,
                    polygon: true,
                    pathOptions: {
                        color: "blue",
                        opacity: 0.6,
                        fillOpacity: 0.6,
                        fillColor: "blue"
                    }
                })
            }]
        }).addTo(j.geoLayerGroup);
    });
}

/**
 * Decoratore tratteggiato per le pianure.
 */
function addDashDecorator(j, geojsonLayer) {

    geojsonLayer.eachLayer(layer => {

        if (!(layer instanceof L.Polyline)) return;

        L.polylineDecorator(layer, {
            patterns: [{
                offset: 10,
                repeat: 25,
                symbol: L.Symbol.dash({
                    pixelSize: 10,
                    pathOptions: {
                        color: "#f00",
                        weight: 2
                    }
                })
            }]
        }).addTo(j.geoLayerGroup);
    });
}

/**
 * Marker informativo al centro della linea.
 */
function addCenterMarker(j) {

    const feature = j.feature;
    const coordinates = feature.geometry.coordinates;

    if (!coordinates.length) return;

    const centerPoint = coordinates[
        Math.floor((coordinates.length - 1) / 2)
    ];

    const distance = feature.properties.distance;

    const distanceValue = (
        -distance.distancestart + distance.distanceend
    ).toFixed(0);

    const html = `
        <span>
            ${distanceValue}
            <br>
            ${feature.properties.start} - ${feature.properties.end}
        </span>
    `;

    L.marker(
        [centerPoint[1], centerPoint[0]],
        {
            icon: new L.DivIcon({
                className: "circle-with-textblue",
                iconSize: [40, 40],
                html
            })
        }
    ).addTo(j.geoLayerGroup);
}

/**
 * Recupera le descrizioni associate ai punti verdi.
 */
async function getDescriptionIconsGreen(j) {

    const result = [];

    for (const feature of j.dataJson.features) {

        if (feature.properties.color !== "green") continue;

        j.files = [feature.properties.hill];

        const table = await getTableIni(j);

        j.rowDisplay = j.tableFilesRecordsPage ?? 5;

        result.push(table);
    }

    return result;
}

/**
 * Ricostruisce le coordinate GeoJSON dai records.
 */
async function coords(j) {

    const geometry = j.feature.geometry;
    const [start, end] = j.feature.properties.slice;

    const records = j.records.slice(start, end);

    const coordinates = [];

    for (const record of records) {

        const lon =
            record.positionLong * j.config.semicirclesToDegrees;

        const lat =
            record.positionLat * j.config.semicirclesToDegrees;

        if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
            continue;
        }

        coordinates.push([lon, lat]);
    }

    if (geometry.type === "Point") {

        if (coordinates.length) {
            geometry.coordinates = coordinates[0];
        }

    } else if (geometry.type === "LineString") {

        geometry.coordinates = coordinates;
    }

    return j.feature;
}
