export async function getTableIni(j) {                          // Inizializzazione     
    j.data=j.files
    j.rowDisplay= 5                                                    // display rows
    j.dataLength = j.data.length                                        // data length
    j.elementRow = Object.keys(j.data[0])                                // Element header
    j.elementCount = j.elementRow.length                                 // Element count          
    j.inizio = 0                                                         // start index
    j.fine = j.inizio + j.rowDisplay                                     // end index
    j.elementTable = j.fine - j.inizio                                   // Element table        

    
    return await createTable(j)

}
function getTable(j) {                                         // create table
    return {
        create: (j) => {
            j.IdTable =                                            // create table
                Object.assign(document.createElement('table'), {
                    id: 'IdTable',
                    className: 'TIdTable'
                })
        },
        slice(j) {
            j.dataSlice = j.data.slice(j.inizio, j.fine)                    // selezionati
        },
        header(j) {
            j.header = Object.assign(document.createElement('tr'),{
                className: 'Theader'
            })                                                          // header
            j.IdTable.append(j.header)
            for (let el of j.elementRow) {
                j.th = Object.assign(document.createElement('th'),{
                    className: 'Tth'
                })
                j.th.innerText = el
                j.header.append(j.th)
            }
        },
        tr: (j) => {
            j.tbody = Object.assign(document.createElement('tbody'),{
                className: 'Ttbody'
            })        // tbody
            j.ctr = 0
            while (j.ctr < j.elementTable) {                                // rows
                j.tr = Object.assign(document.createElement('tr'), {
                    id: 'tr' + j.ctr,
                    className: 'Ttr',
                })
                j.tbody.append(j.tr)
                j.ctd = 0
                while (j.ctd < j.elementCount) {
                    j.td = Object.assign(document.createElement('td'), {
                        id: 'td' + j.ctd,
                        onclick: function (e, j) { },
                        innerText: Object.values(j.dataSlice[j.ctr])[j.ctd],
                        className: 'Ttd'
                    })
                    j.ctd++
                    j.tr.append(j.td)
                }
                j.ctr++
            }
            while (j.ctr < j.rowDisplay) {                                  // fill empty rows      
                j.tr = Object.assign(document.createElement('tr'), {
                    id: 'tr' + j.ctr,
                    className: 'TtrHidden'
                })
                j.tbody.append(j.tr)
                j.ctd = 0
                while (j.ctd < j.elementCount) {
                    j.td = Object.assign(document.createElement('td'), {
                        id: 'td' + j.ctd,
                        innerText: '-',
                        className: 'TtdHidden'
                    })
                    j.ctd++
                    j.tr.append(j.td)
                }
                j.ctr++
            }
            j.IdTable.append(j.tbody)
        },
        span: (j) => {
            j.span = Object.assign(document.createElement('span'), {
                id: 'span',
                className: 'Tspan'
            })
            j.span.append(Object.assign(document.createElement('span'), {
                id: 'spanl',
                innerText: ' << ',
                j: j,
                className: 'Tspanl',
                onclick: async function (e) {
                    if (j.inizio != 0) {

                        document.getElementById('IdTable').remove()
                        document.getElementById('span').remove()

                        j.inizio = e.target.j.inizio - e.target.j.rowDisplay
                        j.inizio == j.dataLength
                            ? j.inizio = j.dataLength - 1
                            : ''
                        j.fine = j.inizio + j.rowDisplay
                        j.fine > j.dataLength
                            ? j.fine = j.dataLength
                            : ''
                        j.elementTable = j.fine - j.inizio

                        await createTable(j)
                    }
                    else {
                        document.getElementById('spanerror').innerText = 'Non ci sono più righe da visualizzare'
                    }
                }
            }))
            j.span.append(Object.assign(document.createElement('span'), {
                innerText: (j.inizio + 1) + ' / ' + j.fine,
                className: 'TspanLegenda'
            }))
            j.span.append(Object.assign(document.createElement('span'), {
                id: 'spanr',
                innerText: ' >> ',
                j: j,
                className: 'Tspanr',
                onclick: async function (e) {
                    if (j.fine != j.dataLength) {

                        document.getElementById('IdTable').remove()
                        document.getElementById('span').remove()

                        j.inizio = e.target.j.inizio + e.target.j.rowDisplay
                        j.inizio == j.dataLength
                            ? j.inizio = j.dataLength - 1
                            : ''
                        j.fine += e.target.j.rowDisplay
                        j.fine > j.dataLength
                            ? j.fine = j.dataLength
                            : ''
                        j.elementTable = j.fine - j.inizio
                        await createTable(j)
                    }
                    else {
                        document.getElementById('spanerror').innerText = 'Non ci sono più righe da visualizzare'
                    }
                }
            }))
            j.span.append(Object.assign(document.createElement('br')))
            j.span.append(Object.assign(document.createElement('span'), {
                id: 'spanerror',
                innerText: '',
                className: 'Tspanerror'
            }))
        }
    }
}
async function createTable(j) {                                // create table
    let fn = getTable(j)
    await fn.create(j)                                         // table
    await fn.slice(j)                                          // slice
    await fn.header(j)                                         // header
    await fn.tr(j)                                             // rows
    await fn.span(j)                                           // span
    document.body.append(j.IdTable, j.span)                    // append to
    let _=document.createElement('div')
    _.append(j.IdTable, j.span)    // append to
    return _.innerHTML
    
}