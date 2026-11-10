/***/

export async function findHills(j) {
    const records = j.messages.messages.recordMesgs
    const o = {
        minElevationGain: 15,                           // elevation
        minDistance: 10,                                 // distance
        minGradient: 1,                                 // pendenza    
        smoothingWindow: 5                              // smooting
    }
    // Smooth altitude to reduce GPS noise
    const smooth = records.map((r, i) => {
        const start = Math.max(0, i - o.smoothingWindow);
        const end = Math.min(
            records.length,
            i + o.smoothingWindow + 1
        );

        const values = records
            .slice(start, end)
            .map(x => x.altitude);

        return values.reduce((a, b) => a + b, 0) /
            values.length;
    });

    // Detect continuous uphill sections
    const hills = [];
    const lowlands = [];
    let start = null;
    let peak = null;

    for (let i = 1; i < records.length; i++) {
        const rising = smooth[i] > smooth[i - 1];

        if (rising) {
            if (start === null) start = i - 1;
            peak = i;
        } else if (start !== null) {
            const climb = calculateHill(
                records, smooth, start, peak
            );

            if (isValidHill(climb)) {
                hills.push(climb);
            }

            start = null;
            peak = null;
        }
    }

    // Handle a climb reaching the end of the activity
    if (start !== null) {
        const climb = calculateHill(
            records, smooth, start, peak
        );
    }

    function isValidHill(hill) {
        return hill &&
            hill.elevationGain >= o.minElevationGain &&
            hill.distance >= o.minDistance &&
            hill.averageGradient >= o.minGradient;
    }

    function calculateHill(records, elevations, start, end) {
        if (end <= start) return null;

        const distance =
            records[end].distance - records[start].distance;

        const gain =
            elevations[end] - elevations[start];

        return {
            startDistance: Math.round(records[start].distance),
            endDistance: Math.round(records[end].distance),
            distance: Math.round(distance),
            startElevation: +elevations[start].toFixed(1),
            endElevation: +elevations[end].toFixed(1),
            elevationGain: +gain.toFixed(1),
            averageGradient: +(
                gain / distance * 100
            ).toFixed(2),
            startLat: records[start].positionLat,
            startLon: records[start].positionLong,
            endLat: records[end].positionLat,
            endLon: records[end].positionLong,
            points: records.slice(start, end + 1)
                .map(r => ({
                    positionLong: r.positionLong,
                    positionLat: r.positionLat
                })
                ),
            start: start,
            end: end
        };
    }
    function calculateLowland(hills, records) {
        let start,end
        for (let climb of hills) {
            let next = hills[lowlands.length + 1]
            
            start=lowlands.length == 0 ? 0 : climb.end + 1
            end=next?next.start - 1:records.length - 1
            
            lowlands.push(function (start, end,records) {
                return {
                    distance: {
                        distancestart:records[start].distance,
                        distanceend:records[end].distance},
                    points: records.slice(start, end).filter(el => el.positionLat)
                        .map(r => ({
                            positionLong: r.positionLong,
                            positionLat: r.positionLat
                        }))
                }
            }(start,end,records))
        }
    }
    calculateLowland(hills, records);                                           // no salite
    return ([hills, lowlands]);
}