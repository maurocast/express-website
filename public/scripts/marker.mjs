import { setNomin, saveFile } from "./routines.mjs"
import { getTableIni } from "./getTable.mjs"

export async function getMarker(j) {

    const locationLabel = j.feature.properties.color === 'green' ? 
    j.feature.properties.id +' Arrivo' 
    : j.feature.properties.id +' Partenza';                                                         // label
    const locationAddress = j.feature.properties.address ?? '';                                     // indirizzo
    const m = L.marker(j.feature.geometry.coordinates.slice().reverse(), {                          // marker 
        draggable: 'true',
        icon: new L.DivIcon({
            iconSize: null,
            className: 'circle-with-text' + j.feature.properties.color,   // style 
            html: `<span>${locationLabel}
            <img class="position-icon" src="./assets/icons/position.svg" alt="position">
            <img class="position-save" src="./assets/icons/SaveAS.png" alt="save">
            <input value="${locationAddress.replace(/"/g, '&quot;')}" 
            id=${j.feature.properties.id}
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
              positionName.size = Math.max(positionName.value.length, 1);
        
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
            m.setOpacity(1)
        });

        positionSave.addEventListener('click', async (event) => {
            event.stopPropagation();
            for (let feat of j.dataJson.features
                .filter(el => el.properties.id == event.target.id)) {
                feat.properties.address = positionName.value,
                    j.tableFiles.innerHTML = ''
            }
            
            saveFile(j)                                                         // salvataggio
        });

    });
    m.addTo(j.geoLayerGroup)                                                        // add to group
        .on('click', function (e) { e.target.setOpacity(1) });                      // opacity
}

/**
 * Marker informativo al centro della linea.
 */
export function addCenterMarker(j) {
 
    const feature = j.feature;
    const coordinates = feature.geometry.coordinates;

    if (!coordinates.length) return;

    const centerPoint = coordinates[
        Math.floor((coordinates.length - 1) / 2)
    ];

    const distance = feature.properties.distance;

    const distanceValue = (
        -distance.distancestart + distance.distanceend
    ).toFixed(0);

    const html = `
        <span>
            ${distanceValue}
            <br>
            ${feature.properties.start} - ${feature.properties.end}
        </span>
    `;

    L.marker(
        [centerPoint[1], centerPoint[0]],
        {
            icon: new L.DivIcon({
                className: "circle-with-textblue",
                iconSize: [40, 40],
                html
            })
        }
    ).addTo(j.geoLayerGroup);
}
