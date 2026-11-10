
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
            j.files = []                                                        // files da inviare a tabella
            for (let el of _) {
                j.files.push({ file: el })
            }
        }
        return await getTableIni(j)                                             // table
    }

    const setMap = (j) => {                                                             // j.map
        return {
            createDiv: (j) => {                                                         // create div
                if (!document.getElementById(j.config.mapIniziale.divMap)) {            // se non esiste
                    j.divMap = objAss('div', { className: 'divMap', id: 'divMap' })
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
        }
    }
    document.body.append(
        setMap(j).createDiv(j)                                                          // divMap
    )
    j.tableFilesInnerHtml = await getFiles(j)                                           // files per map

    setMap(j).createMap(j)                                                          // create map                                          
    setMap(j).createTileLayer(j)                                                    // tile
    await setMap(j).setControlLeft(j)                                               // left
    j.container.addEventListener("click", async e => {                              // agginta event click
        const row = e.target.closest('.tTr')
        if (!row) return
        j.geoLayerGroup.clearLayers()
        await useGeoData(row, {                                                     // creazione layer
            config: j.config,
            map: j.map,
            geoLayerGroup: j.geoLayerGroup
        })
        j.geoLayerGroup.addTo(j.map)
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

function objAss(htmlElement, assignment) {
    return Object.assign(document.createElement(htmlElement), assignment)
}