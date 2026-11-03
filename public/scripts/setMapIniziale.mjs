export async function setMapIniziale(j) {
    const response = await fetch('/api/files')
    if (!response.ok) {
        throw new Error(`Unable to load file list: ${response.status} ${response.statusText}`)
    }
    j.files = await response.json()

    const tableJson = (j) => {
        let html = ''
        for (const key in j.files) {
            html += '<tr><td>' + '</td><td>' + j.files[key] + '</td></tr>'
        }
        html += ''
        return html

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
            setControlLeft: (j) => {                                                       // control Menu
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
                                id: '',
                                innerHTML: tableJson(j)
                            })),
                            Object.assign(objAss('button', {
                                className: 'close-button',
                                id: 'closeButton',
                                onclick: (e) => {
                                    L.DomEvent.stopPropagation(e)
                                    //    document.body.innerHTML = ''
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
    setMap(j).createMap(j)                                                        // create map                                          
    setMap(j).createTileLayer(j)                                                  // tile
    setMap(j).setControlLeft(j)                                                   // control menu left
    

}