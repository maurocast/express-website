
import { objAss } from './routines.mjs'
import { getTableIni } from "./getTable.mjs"
import { fetchFileFit } from "./fileFit.mjs"
import { setGeo } from "./geoJsonFit.mjs"
import { findHills } from "./hills.mjs"
import { useGeoJsonData } from "./useGeoJonData.mjs"

export async function setMapIniziale(j) {

    j.geoLayerGroup = new L.layerGroup                                          // layer da geo

    const getFiles = async (j) => {                                             // lettura files da files
        const response = await fetch('/api/files')
        if (response.ok) {                                                      // se ok
            let _ = await response.json()
            j.files = _.map(el => {                                            // array of objects
                return { file: el }
            }
            );
        }
    }

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
                const row = e.target.closest('.tTr')                                // tr clicked
                if (!row) return
                j.geoLayerGroup.clearLayers()                                       // clear map
                await useGeoData(row, {                                             // creazione layers map
                    config: j.config,                                               // parzializzazione j
                    map: j.map,
                    geoLayerGroup: j.geoLayerGroup
                })
                j.geoLayerGroup.addTo(j.map)                                        // add to map
            }
        }
    }
    setMap(j).createDiv(j)                                                          // create div
    setMap(j).createMap(j)                                                          // create map                                          
    setMap(j).createTileLayer(j)                                                    // tile
    await getFiles(j)                                                               // files per map
    await getTableIni(j)                                                            // table
    await setMap(j).setControlLeft(j)                                               // left control
    j.container.addEventListener("click", async e => {                              // agginta event click
        await setMap(j).containerClick(j)
        })

    async function useGeoData(e, j) {                                           // to GeoGroup

        j.fileFit = await loadFile(j)                                           // caricamento file
        j.messages = await fetchFileFit(j)                                      // elaborazione file
        const [hills, lowLands] = await findHills(j)
        j.hills = hills                                                         // salite
        j.lowLands = lowLands                                                   // lowlands    
        j.dataJson = await setGeo(j).createGeoJson(j)                           // geoData
        await fitMap(j)                                                         // bounnd map
        await useGeoJsonData(j)

        async function loadFile(j) {                                            // file da importare
            return j.fileFit = window.location.origin +
                '/files/' + e.cells[0].textContent.trim()
        }

        async function fitMap(j) {                                              // bound
            const tempLayer = L.geoJSON(JSON.parse(j.dataJson));
            j.map.fitBounds(tempLayer.getBounds(), {
                padding: [20, 20]
            });
        }






    }
}
