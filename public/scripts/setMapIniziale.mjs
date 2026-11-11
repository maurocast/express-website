
import { objAss } from './routines.mjs'
import { getTableIni } from "./getTable.mjs"
import { fetchFileFit } from "./fileFit.mjs"
import { setGeo } from "./geoJsonFit.mjs"
import { findHills } from "./hills.mjs"
import { useGeoJsonData } from "./useGeoJonData.mjs"

export async function setMapIniziale(j) {

    j.geoLayerGroup = new L.layerGroup                                          // layer da geo



    const setMap = (j) => {                                                             // j.map
        return {
            createDiv: (j) => {                                                         // create div
                if (!document.getElementById(j.config.mapIniziale.divMap)) {            // se non esiste
                    j.divMap = objAss('div', { className: 'divMap', id: 'divMap' })
                    document.body.append(j.divMap)
                    return j.divMap
                }
            },
            createMap: (j) => {                                                         // map
                j.map = L.map(j.divMap, j.config.mapIniziale);
            },
            createTileLayer: (j) => {                                                   // Tile
                L.tileLayer(j.config.mapIniziale.tileLayer,
                    { attribution: j.config.mapIniziale.attribution })
                    .addTo(j.map)
            },
            getFiles: async (j) => {                                             // lettura files da files
                const response = await fetch('/api/files')
                if (response.ok) {                                                      // se ok
                    let _ = await response.json()
                    j.files = _.map(el => {                                            // array of objects
                        return { file: el }
                    }
                    )
                }
            },
            setControlLeft: async (j) => {
                j.tableFiles = await getTableIni(j)                                     // left control
                const ControlLeftMenu = L.Control.extend({
                    onAdd: () => {
                        j.container = objAss('div', {                                   // container
                            className: 'left-menu',
                            id: 'container',
                        })
                        j.container.append(
                            j.tableFiles                                                // tabella files 
                        )
                        return j.container;
                    }
                });
                return new ControlLeftMenu({ position: 'topleft' })                     // control menu left
                    .addTo(j.map);
            },
            containerClick: async (e) => {                                          // click su tabella
                j.geoLayerGroup.clearLayers()                                       // clear map
                j={
                    config: j.config,                                               // parzializzazione j
                    map: j.map,
                    geoLayerGroup: j.geoLayerGroup
                }
                j.fileFit = window.location.origin +
                    '/files/' + e.target.textContent.trim()                             // caricamento file
                j.messages = await fetchFileFit(j)                                      // elaborazione file
                await findHills(j)                                                      // salite e lowLands
                j.dataJson = await setGeo(j).createGeoJson(j)                           // geoData
                const tempLayer = L.geoJSON(JSON.parse(j.dataJson));                    // fit map on data json
                j.map.fitBounds(tempLayer.getBounds(), {
                    padding: [20, 20]
                });
                await useGeoJsonData(j)
                j.geoLayerGroup.addTo(j.map)                                        // add to map
            }
        }
    }
    setMap(j).createDiv(j)                                                          // create div
    setMap(j).createMap(j)                                                          // create map                                          
    setMap(j).createTileLayer(j)                                                    // tile
    await setMap(j).getFiles(j)                                                     // files per map
    await getTableIni(j)                                                            // table
    await setMap(j).setControlLeft(j)                                               // left control
    j.container.addEventListener("click", async e => {                              // agginta event click
        await setMap(j).containerClick(e)
    })

    async function useGeoData(e, j) {                                           // to GeoGroup


    }
}
