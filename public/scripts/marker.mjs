import { setNomin, saveFile } from "./routines.mjs"
import { getTableIni } from "./getTable.mjs"

export async function getMarker(j) {

    const locationLabel = j.feature.properties.color === 'green' ? 'Arrivo' : 'Partenza';         // label
    const locationAddress = j.feature.properties.address ?? '';                                   // indirizzo
    const m = L.marker(j.feature.geometry.coordinates.slice().reverse(), {                          // marker 
        icon: new L.DivIcon({
            iconSize: null,
            className: 'circle-with-text' + j.feature.properties.color,   // style 
            html: `<span>${locationLabel}
            <img class="position-icon" src="./assets/icons/position.svg" alt="position">
            <img class="position-save" src="./assets/icons/SaveAS.png" alt="save">
            <input value="${locationAddress.replace(/"/g, '&quot;')}" 
            class="position-name" type="text" size="1" style="font-size:08px;"> 
            </span>`
        })
    });
    m.setOpacity(0.5)                                                                        // nascosto
    m.j = j
    m.on('add', () => {
        const mEl = m.getElement();
        const positionIcon = mEl.querySelector('.position-icon');
        const positionSave = mEl.querySelector('.position-save');
        const positionName = mEl.querySelector('.position-name');
        positionName.addEventListener('input', () => {
            positionName.size = Math.max(positionName.value.length, 1);
        });
        positionIcon.addEventListener('click', async (event) => {
            event.stopPropagation();
            j.latlng = m._latlng
            const name = await setNomin(j);                                                 // location
            if (name) {
                j.tableNoHeader = 'S'
                j.files = Object.entries(name)
                    .map(([key, value]) => ({ key, value }))
                    .filter(el => !el.key.startsWith('ISO') && !el.key.startsWith('high'));
                j.tableFiles = await getTableIni(j)
                positionName.parentElement.append(j.tableFiles)
                j.tableFiles.addEventListener('click', (event) => {
                    const cell = event.target.closest('td.Ttd');
                    if (cell) {
                        event.stopPropagation();
                        positionName.value += cell.innerText + ',';
                        positionName.size = Math.max(positionName.value.length, 1);
                    }
                });
                positionName.size = Math.max(positionName.value.length, 1);
            }
        });

        positionSave.addEventListener('click', async (event) => {
            event.stopPropagation();
            for (let feat of j.featureCollection
                .filter(el => el.properties.id == j.feature.properties.id)) {
                feat.properties.address = positionName.value,
                    j.tableFiles.innerHTML = ''
            }
            
            saveFile(j)                                                         // salvataggio
        });

    });
    m.addTo(j.geoLayerGroup)                                                        // add to group
        .on('click', function (e) { e.target.setOpacity(1) });                      // opacity
}