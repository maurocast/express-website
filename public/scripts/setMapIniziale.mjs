
import { getTableIni } from "./getTable.mjs"
import { fetchFileFit } from "./fileFit.mjs"
import { setGeo } from "./geoJsonFit.mjs"
import { findHills } from "./hills.mjs"
export async function setMapIniziale(j) {

    j.geoLayerGroup = new L.layerGroup                                                // layer da geo

    const getFiles = async (j) => {                                                 // lettura files da files
        const response = await fetch('/api/files')
        if (response.ok) {                                                      // se ok
            let _ = await response.json()
            j.files = []                                                        // files da inviare a tabella
            for (let el of _) {
                j.files.push({ file: el })
            }
        }
        return await getTableIni(j)                                             // tableInnerHtml
    }

    const setMap = (j) => {                                                         // j.map
        return {
            createDiv: (j) => {                                                     // create div
                if (!document.getElementById(j.config.mapIniziale.divMap)) {
                    j.divMap = objAss('div', { className: 'divMap', id: 'divMap' })
                    return j.divMap
                }
            },
            createMap: (j) => {                                                     // map
                j.map = L.map(j.divMap, j.config.mapIniziale);
            },
            createTileLayer: (j) => {                                               // Tile
                L.tileLayer(j.config.mapIniziale.tileLayer,
                    { attribution: j.config.mapIniziale.attribution })
                    .addTo(j.map)
            },
            setControlLeft: async (j) => {
                j.tableFiles = await getTableIni(j)                                     // left control
                const ControlLeftMenu = L.Control.extend({
                    onAdd: () => {
                        j.container = objAss('div', {                               // container
                            className: 'left-menu',
                            id: 'container',
                        })
                        j.container.append(
                            j.tableFiles,
                            objAss('button', {                                      // button
                                id: 'btnVisualize',
                                innerText: 'Visualizza',
                            })
                        )
                        return j.container;
                    }
                });
                return new ControlLeftMenu({ position: 'topleft' }).addTo(j.map);  // control menu left
            },
        }
    }

    function objAss(htmlElement, assignment) {
        return Object.assign(document.createElement(htmlElement), assignment)
    }

    document.body.append(
        setMap(j).createDiv(j)                                                      // divMap
    )
    j.tableFilesInnerHtml = await getFiles(j)                                         // files per map

    setMap(j).createMap(j)                                                          // create map                                          
    setMap(j).createTileLayer(j)                                                    // tile
    await setMap(j).setControlLeft(j)                                               // left
    j.container.addEventListener("click", async e => {
        const row = e.target.closest('.tTr')
        if (!row) return

        j.geoLayerGroup.clearLayers()
        await useGeoData(row, {
            config: j.config,
            map: j.map,
            geoLayerGroup: j.geoLayerGroup
        })
        j.geoLayerGroup.addTo(j.map)
    })

    async function useGeoData(e, j) {

        j.file = await loadFile(j)
        j.hills = await findHills(j)
        j.dataJson = await setGeo(j).createGeoJson(j)                         // geoData
        await fitMap(j)
        j.descriptionIcons = await getDescriptionIconsGreen(j)
        await useGeoJsonData(j)
        async function loadFile(j) {
            j.file = e.cells[0].textContent.trim()
            j.fileFit = window.location.origin + '/files/' + j.file             // da elaborare
            j.messages = await fetchFileFit(j)                                  // elaborazione
        }
        async function fitMap(j) {
            const tempLayer = L.geoJSON(JSON.parse(j.dataJson));                      // center
            j.map.fitBounds(tempLayer.getBounds(), {
                padding: [20, 20]
            });
        }
        async function getDescriptionIconsGreen(j) {
            let result = []
            const tmpLayer = JSON.parse(j.dataJson)
            for (const feature of tmpLayer.features) {
                if (feature.properties.color == 'green') {
                    j.files = Array(feature.properties.hill)
                    let _ = await getTableIni(j)
                    result.push(_)
                }
            }
            return result
        }
        async function useGeoJsonData(j) {
            let ct = 0
            for (const feature of JSON.parse(j.dataJson).features) {
                L.geoJson(feature, {
                    filter: function (feature) {
                        return feature.geometry.type === 'Point';
                    },
                    style: function (feature) {
                        return {
                            color: feature.properties.color
                        };
                    }
                });
                if (feature.properties.color == 'green') {


                    L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                        icon: new L.DivIcon({
                            className: 'circle-with-text' + feature.properties.color,
                            iconSize: null,
                            html: '<span >' + '<span>' + j.descriptionIcons[ct].outerHTML + '</span>' +
                                await setNomin(feature) + '</span>'
                        })
                    }).addTo(j.geoLayerGroup);
                    ct++
                }
                if (feature.properties.color == 'red') {

                    L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                        icon: new L.DivIcon({
                            className: 'circle-with-text' + feature.properties.color,
                            iconSize: null,
                            html: '<span >' + 'start ' + await setNomin(feature) + '</span>'
                        })
                    }).addTo(j.geoLayerGroup);
                }
            }
            for (const feature of JSON.parse(j.dataJson).features) {
                L.geoJson(feature, {
                    filter: function (feature) {
                        return feature.geometry.type === 'LineString';
                    },
                    style: function (feature) {
                        return {
                            color: feature.properties.colorLine,
                            weight: 6,
                            fillopacity: 0.75
                        };
                    }
                }).addTo(j.geoLayerGroup);

                if (feature.geometry.type === 'LineString') {
                    let _ = L.polyline(feature.geometry.coordinates.map(el => el.reverse()), {})
                    {
                        j.decorator = L.polylineDecorator(
                            _,
                            {
                                patterns: [
                                    {
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
                            }
                        ).addTo(j.geoLayerGroup)
                    }
                }
                if (feature.properties.colorLine == 'white') {

                    var latLngs = feature.geometry.coordinates.map(el => el.reverse())
                    var middleIndex = Math.round(latLngs.length / 2);
                    var centerPoint = latLngs[middleIndex];

                
                    L.marker([centerPoint[1],centerPoint[0]], {
                        icon: new L.DivIcon({
                            className: 'circle-with-text' + feature.properties.colorLine,
                            iconSize: [40,40],
                            html: '<span >' + '<span>' + 
                            feature.geometry.coordinates[feature.geometry.coordinates.length-1][2] 
                            + '</span>' + '</span>'
                        })
                    }).addTo(j.geoLayerGroup);
                }

            }
        }
        return j.geoLayerGroup
    }
}
async function setNomin(feature) {
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