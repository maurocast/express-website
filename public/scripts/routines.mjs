/**
 * 
 * @param {Object} parameters - parametro type, parametri 
 * @returns 
 */
export async function setXMLHttpRequest(parameters) {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState === 4) {
                if (req.status >= 200 && req.status < 300) {
                    try {
                        const response = JSON.parse(req.responseText);
                        resolve(response);
                    } catch (e) {
                        reject("Invalid JSON response");
                    }
                } else {
                    reject("HTTP Error: " + req.status);
                }
            }
        };
        req.onerror = function () {
            reject("Network error");
        };
        // Post della pagina da richiamare
        req.open("POST", '/', true);
        req.setRequestHeader("Content-Type", "application/json");
        // trasmissione config paramters
        req.send(JSON.stringify(parameters));
    });
}
export function ParametrizzazioneIniziale(e, config) {

    const container = L.DomUtil.create('div', 'left-menu-item-inside')   // container

    const l = L.DomUtil.create('label')                                 // label
    l.innerText = 'spostare la mappa per la centratura'

    const lresult = L.DomUtil.create('label')                           // label
    lresult.innerText = config.mapIniziale.center


    const l1 = L.DomUtil.create('label')                                // label
    l1.innerText = 'Attuale zoom ' + config.mapIniziale.zoom

    const i = L.DomUtil.create('input', 'left-menu-item-input')         // input
    i.type = 'text'
    i.value = config.mapIniziale.zoom                                   // value attuale

    const b = L.DomUtil.create('button')                                // button conferma
    b.innerText = 'Conferma'
    b.addEventListener("click", (e) => {
        config.type = 'updateCenterMap'
        config.center = lresult.innerText
        config.zoom = i.value
        e.target.parentNode.remove()
        setXMLHttpRequest(config)                                       // update server
        e.stopPropagation();
    });

    container.append(l, lresult, l1, i, b)                                  // add to cotainer
    e.target.appendChild(container)                                     // add item menu
}


/**  trasformazione data */
export function transformData(datain, tipo) {

    let d = new Date(datain);

    let month = '' + (d.getMonth() + 1)
    let day = '' + d.getDate()
    let year = d.getFullYear()
    if (month.length < 2) { month = '0' + month; }
    if (day.length < 2) { day = '0' + day; }
    if (tipo == "y") { return [day, month, year].join('/'); }
    if (tipo == "z") { return [year, month, day].join('-'); }

    if (!tipo in ["y", "z"]) { return d }

}
export function transformTimeHHMMSS(durata, tipo) {
    // dati in secondi,tipo = m, fino ai minuti
    let hh = Math.floor(durata / 3600)
    durata -= (hh * 3600)
    let mm = Math.floor(durata / 60)
    durata -= mm * 60;
    let ss = (100 + durata).toString().substring(1)
    mm = (100 + mm).toString().substring(1)
    if (hh == 0) {
        if (tipo != "m") { return '   ' + mm.toString() + ":" + ss.toString(); }
        else { return '   ' + mm.toString(); }
    }
    else {
        if (tipo != "m") { return hh.toString() + ":" + mm.toString() + ":" + ss.toString() }
        else { return hh.toString() + ":" + mm.toString() }
    }
}
/**  trasformazione data */
export function transformDataDMY(datain) {

    let month = datain.split('/')[1]
    let day = datain.split('/')[0]
    let year = datain.split('/')[2]
    { return [year, month, day].join('-') }

}
/**  trasformazione data */
export function transformDataYMD(datain) {

    {
        return [
            datain.split('-')[2],
            datain.split('-')[1],
            datain.split('-')[0]]
            .join('/')
    }
}




/**
 * Removes all object by types.
 */
export function removeLayers(map, type) {
    map.eachLayer(layer => {
        if (layer instanceof type) {
            map.removeLayer(layer)
        }
    })
}

/**
 * Fetch
 * @param {String}  urlToFetch 
 * @param {obj}     requestBody 
 * @param {obj}     headers
 * 
 * @resolve data 
 */
export function fncFetch(url, requestBody, headers, POSTGET) {
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: POSTGET,
            headers: headers ? headers : undefined,
            body: requestBody ? JSON.stringify(requestBody) : null
        })
            .then((response) => {
                if (!response.ok) { throw new Error(`HTTP Error: ${response.status}`); }
                return response.json();
            })
            .then((data) => { resolve(data) })
            .catch((error) => {
                console.log(error)
                reject(error)
            });
    });
}
export function objAss(htmlElement,assignment){
    return Object.assign(document.createElement(htmlElement),assignment)
}
