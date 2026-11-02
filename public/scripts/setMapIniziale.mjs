
export async function setMapIniziale(j) {
    
    const setMap = (j) => {
        return {
            createDiv: (j) => {                                                      // create div
                if (!document.getElementById(j.config.mapIniziale.divMap)) {
                    j.divMap = objAss('div', {className: 'divMap',id: 'divMap'})
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
        }
    }
function objAss(htmlElement,assignment){
    return Object.assign(document.createElement(htmlElement),assignment)
}    

    document.body.append(setMap(j).createDiv(j))                                  // divMap
    setMap(j).createMap(j)                                                        // create map                                          
    setMap(j).createTileLayer(j)                                                  // tile
}