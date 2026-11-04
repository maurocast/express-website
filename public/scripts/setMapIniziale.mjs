import { getTableIni } from "./getTable.mjs"
import { fetchFileFit } from "../scripts/fileFit.mjs"
import { setGeo } from "../scripts/geoJsonFit.mjs"
import { findHills } from "../scripts/hills.mjs"

export async function setMapIniziale(j) {

    const getFiles=async (j)=>{
    const response = await fetch('/api/files')
    if (!response.ok) {
        throw new Error(`Unable to load file list: ${response.status} ${response.statusText}`)
    }
    j.files1 = await response.json()
    j.files = []
    for (let el of j.files1) {
        j.files.push({ file: el })
    }
    }
    const setMap = (j) => {
        return {
            createDiv: (j) => {                                                      // create div
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
                let table = await getTableIni(j)                                                       // control Menu
                const ControlLeftMenu = L.Control.extend({
                    onAdd: () => {
                        j.container = objAss('div', {
                            className: 'left-menu',
                            id: 'container',
                            onclick: (e) => {
                                L.DomEvent.stopPropagation(e)
                            }
                        })

                        j.container.append(
                            Object.assign(objAss('table', {
                                className: '',
                                id: 'idTable',
                                innerHTML: table
                            })),
                            Object.assign(objAss('button', {
                                id: 'btnVisualize',
                                innerText: 'Visualizza',
                                onclick: (e) => {
                                    // Source - https://stackoverflow.com/a/22754453
                                    // Posted by jfriend00, modified by community. See post 'Timeline' for change history
                                    // Retrieved 2026-11-04, License - CC BY-SA 4.0

                                    var list = document.getElementsByClassName("Ttr");
                                    for (let item of list) {
                                        item.selected
                                            ? console.log(item.selected) : '';
                                    }

                                    j.file = _[0].file
                                    L.DomEvent.stopPropagation(e)

                                }
                            })
                            )
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
    document.body.append(setMap(j).createDiv(j))                                  // divMap
    await getFiles(j)
    setMap(j).createMap(j)                                                        // create map                                          
    setMap(j).createTileLayer(j)                                                  // tile
    await setMap(j).setControlLeft(j)
    document.querySelectorAll('tr').forEach(el => {
        el.addEventListener("click", async e => {
            j.file = e.target.childNodes[0].nodeValue
            if (j.file) {

                j.fileFit = 'https://' + window.location.host + '/files/' + j.file

                const file = await fetchFileFit(j)
                // Example
                let hills = await findHills(file.messages.recordMesgs, {
                    minElevationGain: 50,
                    minDistance: 500,
                    minGradient: 2
                })
                j.hills = hills
                j.records = file.messages.recordMesgs

                let data = await setGeo(j).createGeoJson(j)


                const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.body.appendChild(
                    Object.assign(document.createElement('a'), {
                        href: url,
                        download: "save" + ".json"
                    })
                )
                //    a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);





                function onEachFeature(feature, layer) {
                    if (feature.geometry && feature.properties.colorLine) {
                        layer.options.color = feature.properties.colorLine
                    }
                }

                const tableJson = (t) => {
                    let html = '<table>'
                    for (const key in t) {
                        html += '<tr><td>' + key + '</td><td>' + t[key] + '</td></tr>'
                    }
                    html += '</table>'
                    return html
                }
                L.geoJSON(JSON.parse(data), {
                    pointToLayer: function (feature, latlng) {
                        if (feature.properties.color == 'green') {
                            return L.marker(latlng, {
                                icon: new L.DivIcon({
                                    className: 'circle-with-text' + feature.properties.color,
                                    iconSize: null,
                                    html: '<span >' + '<span>' + tableJson(feature.properties.hill) + '</span>' + '</span>'
                                })
                            });
                        }
                        if (feature.properties.color == 'red') {
                            return L.marker(latlng, {
                                icon: new L.DivIcon({
                                    className: 'circle-with-text' + feature.properties.color,
                                    iconSize: null,
                                    html: '<span >' + 'start' + '</span>'
                                })
                            });
                        }
                    },
                    onEachFeature: onEachFeature
                }).addTo(j.map);
            }
        })
    })
}