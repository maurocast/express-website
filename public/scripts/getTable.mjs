/***/
export async function getTableIni(j) {                          // Inizializzazione     
    j.data = j.files
    j.rowDisplay = 5                                                    // display rows
    j.dataLength = j.data.length                                        // data length
    j.elementRow = Object.keys(j.data[0])                                // Element header
    j.elementCount = j.elementRow.length                                 // Element count          
    j.inizio = 0                                                         // start index
    j.fine = j.inizio + j.rowDisplay                                     // end index
    j.elementTable = j.fine - j.inizio                                   // Element table

    j.fn = await getTable(j)
    await j.fn.create(j)                                         // table
    await j.fn.slice(j)                                          // slice
    await j.fn.header(j)                                         // header
    await j.fn.tr(j)                                             // rows
    if (j.rowDisplay < j.dataLength) {                         // data length
        await j.fn.span(j)
    } else if (j.span) {
        j.span.innerHTML = ''
    }
    return j.idTable
}
async function getTable(j) {                                                // create table
    return {
        create: async (j) => {
            j.idTable =objAss('table', {                                    // idTable
                id: 'idTable',className: 'TidTable'})
        },
        slice: async (j) => {
            j.dataSlice = j.data.slice(j.inizio, j.fine)                    // selezionati
        },
        header: async (j) => {
            j.header = objAss('tr', {className: 'Theader'})                 // header                                                              
            j.idTable.append(j.header)
            for (let el of j.elementRow) {
                j.th = objAss('th', {className: 'Tth',innerText : el})
                j.header.append(j.th)
            }
        },
        tr: async (j) => {
            j.tbody = objAss('tbody', {className: 'Ttbody'})               // tbody
            j.ctr = 0
            while (j.ctr < j.elementTable) {                                // rows
                j.tr = objAss('tr', {
                    id: 'tr' ,
                    className:'tTr', 
                    'onclick': async (e) => {                                   // click
                    }
                })
                j.tbody.append(j.tr)
                j.ctd = 0
                const rowData = j.dataSlice[j.ctr];
                if (rowData) {
                    const rowValues = Object.values(rowData);
                    while (j.ctd < j.elementCount) {
                        j.td = objAss('td', {
                            id: 'td' + j.ctd,
                            innerText: rowValues[j.ctd] ?? '',
                            className: 'Ttd'
                        })
                        j.ctd++
                        j.tr.append(j.td)
                    }
                }
                j.ctr++
            }
            while (j.ctr < j.rowDisplay) {                                  // fill empty rows      
                j.tr = objAss('tr', {id: 'tr' + j.ctr,className: 'TtrHidden'})
                j.tbody.append(j.tr)
                j.ctd = 0
                while (j.ctd < j.elementCount) {
                    j.td = objAss('td', {
                        id: 'td' + j.ctd,
                        innerText: '-',
                        className: 'TtdHidden'
                    })
                    j.ctd++
                    j.tr.append(j.td)
                }
                j.ctr++
            }
            j.trSpan = objAss('tr', {id: 'tr' + 'Span',className: 'Ttr'})
            j.tdSpan = objAss('td', {
                id: 'td' + 'Span',
                innerText: '',
                className: 'Ttd'
            })
            j.tdSpan.colSpan = j.elementCount
            j.trSpan.append(j.tdSpan)
            j.tbody.append(j.trSpan)

            j.idTable.append(j.tbody)
        },
        span: async (j) => {
            j.tdSpan.innerHTML = ''
            j.span = objAss('span', {id: 'span',className: 'Tspan'})
            j.span.append(
                objAss('span', {
                    id: 'spanl',innerText: ' << ',j: j,
                    className: 'Tspanl',
                    onclick: async function (e) {
                        if (j.inizio != 0) {

                            j.inizio = e.target.j.inizio - e.target.j.rowDisplay
                            j.inizio == j.dataLength
                                ? j.inizio = j.dataLength - 1
                                : ''
                            j.fine = j.inizio + j.rowDisplay
                            j.fine > j.dataLength
                                ? j.fine = j.dataLength
                                : ''
                            j.elementTable = j.fine - j.inizio

                            await j.fn.reBody(j)
                        }
                        else {
                            document.getElementById('spanerror').innerText = 'Non ci sono più righe da visualizzare'
                        }
                    }
                }),
                objAss('span', {
                    innerText: (j.inizio + 1) + ' / ' + j.fine,
                    className: 'TspanLegenda'
                }),
                objAss('span', {
                    id: 'spanr',innerText: ' >> ',j:j,
                    className: 'Tspanr',
                    onclick: async function (e) {
                        if (j.fine != j.dataLength) {

                            j.inizio = e.target.j.inizio + e.target.j.rowDisplay
                            j.inizio == j.dataLength
                                ? j.inizio = j.dataLength - 1
                                : ''
                            j.fine += e.target.j.rowDisplay
                            j.fine > j.dataLength
                                ? j.fine = j.dataLength
                                : ''
                            j.elementTable = j.fine - j.inizio

                            await j.fn.reBody(j)
                        }
                        else {
                            document.getElementById('spanerror').innerText = 'Non ci sono più righe da visualizzare'
                        }
                    }
                }),
                objAss('br'),
                objAss('span', {
                    id: 'spanerror',innerText: '',
                    className: 'Tspanerror'})
            )
            j.tdSpan.append(j.span)
        },
        reBody: async (j) => {
            j.tbody.innerHTML = ''
            await j.fn.slice(j)                                          // slice
            await j.fn.tr(j)                                             // rows
            if (j.rowDisplay < j.dataLength) {                          // data length
                await j.fn.span(j)
            } else if (j.span) {
                j.span.innerHTML = ''
            }
        }
    }
}
function objAss(htmlElement, assignment) {
        return Object.assign(document.createElement(htmlElement), assignment)
    }