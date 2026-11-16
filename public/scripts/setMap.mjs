/**
 * da ChatGPT
 */
import { objAss } from './routines.mjs'
import { getTableIni } from './getTable.mjs'
import { fetchFileFit } from './fileFit.mjs'
import { setGeo } from './geoJsonFit.mjs'
import { findHills } from './hills.mjs'
import { useGeoJsonData } from './useGeoJonData.mjs'

export async function setMap(j) {

    j.geoLayerGroup = new L.layerGroup

    const methods = {

        createDiv() {
            if (!document.getElementById(j.config.mapIniziale.divMap)) {
                j.divMap = objAss('div', {
                    className: j.config.mapIniziale.divMap,
                    id: j.config.mapIniziale.divMap
                })
                document.body.append(j.divMap)
            } else {
                j.divMap = document.getElementById(
                    j.config.mapIniziale.divMap
                )
            }
        },

        createMap() {
            j.map = L.map(j.divMap, j.config.mapIniziale)
        },

        createTileLayer() {
            L.tileLayer(
                j.config.mapIniziale.tileLayer,
                {
                    attribution: j.config.mapIniziale.attribution
                }
            ).addTo(j.map)
        },

        async getFiles() {
            const response = await fetch('/api/files')
            const files = await response.json()

            j.files = files.map(file => ({ 'file.fit':file }))
        },

        async setControlLeft() {
            j.tableFilesRecordsPage=10
            j.tableFiles = await getTableIni(j)

            const ControlLeftMenu = L.Control.extend({
                onAdd: () => {
                    j.container = objAss('div', {
                        className: 'left-menu',
                        id: 'container'
                    })

                    j.container.append(j.tableFiles)

                    return j.container
                }
            })

            new ControlLeftMenu({ position: 'topleft' }).addTo(j.map)
        },

        async containerClick(e) {

            j.geoLayerGroup.clearLayers()                                       // pulizia layerGroup

            const cell = e.target.closest('td')                                 // controllo se click su nome file
            if (!cell || 
                (cell && cell.id=='tdSpan') ||                                  // no span <</>> no hidden
                (cell && cell.className=='TtdHidden')) return
            const fileName = cell.textContent.trim()

            const dataJsonString = await methods.existFileJson(                 // se esiste geojson string
                fileName
            )

            if (!dataJsonString) {
                j.fileFit = window.location.origin +
                    '/files/' + fileName

                j.messages = await fetchFileFit(j)

                await findHills(j)

                j.dataJsonString = await setGeo(j).createGeoJson(j)
            } else {
                j.dataJsonString = dataJsonString
            }

            j.dataJson = JSON.parse(j.dataJsonString)

            j.records = j.dataJson.properties.fit.recordMesgs

            methods.mapBounds()

            await useGeoJsonData(j)

            j.geoLayerGroup.addTo(j.map)
        },

        async existFileJson(fileName) {

            const url = window.location.origin +
                '/files/' + fileName.replace('fit', 'geojson')

            try {
                const response = await fetch(url)

                if (!response.ok) return null

                return await response.text()

            } catch (error) {
                console.error('Error fetching GeoJSON:', error)
                return null
            }
        },

        mapBounds() {

            const points = j.records
                .filter(el =>
                    el.positionLat != null &&
                    el.positionLong != null
                )
                .map(el => ({
                    lat: el.positionLat *
                        j.config.semicirclesToDegrees,
                    lng: el.positionLong *
                        j.config.semicirclesToDegrees
                }))

            if (points.length) {
                j.map.fitBounds(points, {
                    padding: [20, 20]
                })
            }
        }
    }

    // Inizializzazione mappa

    methods.createDiv()                                             // creazione divMap
    methods.createMap()                                             // creazione map
    methods.createTileLayer()                                       // tile

    await methods.getFiles()                                        // tabella files
    await methods.setControlLeft()                                  // control left con tabella

    // Gestione click sulla tabella

    j.container.addEventListener('click', async e => {              // click esecuzione imp file fit
        await methods.containerClick(e)                             // main on click
    })

    return j
}
