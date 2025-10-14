// Crear variables globales
const global_data = "data.json";



// Cargar datos y actualizar variables globales
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        const allValues = Object.values(data).flatMap(yearData =>
            Object.values(yearData).map(d => d.value)
        );
        const zmaxGlobal = Math.max(...allValues);

        const color = [
            [0, 'rgba(255, 200, 200, 1)'], [0.2, 'rgba(255, 161, 161, 1)'],
            [0.4, 'rgba(255, 125, 125, 1)'], [0.6, 'rgba(255, 86, 86, 1)'],
            [0.8, 'rgba(253, 55, 55, 1)'], [1, 'rgba(255, 21, 21, 1)']
        ];

        const years = Object.keys(data).sort();
        const frames = [];
        const locationsAll = [];
        const valuesAll = [];
        const textsAll = [];

        years.forEach(year => {
            const states = Object.keys(data[year]);
            const values = states.map(s => data[year][s].value);
            const texts = states.map(s => data[year][s].info);

            frames.push({
                name: year,
                data: [{
                    type: "choropleth",
                    locationmode: "USA-states",
                    locations: states,
                    z: values,
                    text: texts,
                    colorscale: color,
                    colorbar: { title: "Valor" },
                    zmin: 0,
                    zmax: zmaxGlobal
                }]
            });
            if (year === years[0]) {
                locationsAll.push(...states);
                valuesAll.push(...values);
                textsAll.push(...texts);
            }
        });

        const dataInit = [{
            type: "choropleth",
            locationmode: "USA-states",
            locations: locationsAll,
            z: valuesAll,
            text: textsAll,
            hoverinfo: "text",
            colorscale: color,
            colorbar: { title: "Valor" },
            zmin: 0,
            zmax: zmaxGlobal
        }];

        const layout = {
            title: { text: 'How endangered is your child at school?<br><sup>Number of public school students who brought firearms to or possessed firearms at school per 100,000 students enrolled</sup>' },
            geo: {
                scope: "usa",
            },
            sliders: [{
                active: 0,
                pad: { t: 50 },
                len: 0.9,
                x: 0.1,
                y: 0,
                currentvalue: { visible: false },
                bgcolor:" #cfcfcfff",
                steps: years.map(year => ({
                    label: year,
                    method: "animate",
                    args: [[year], {
                        mode: "immediate",
                        frame: { duration: 500, redraw: true },
                        transition: { duration: 300 }
                    }]
                }))
            }],
            images: [
                {
                    source: "usmap.png",
                    x: 0.517,
                    y: 0.45,
                    sizex: 0.92,
                    sizey: 0.92,
                    xanchor: "center",
                    yanchor: "middle",
                    layer: "above"
                }
            ]
        };

        Plotly.newPlot("map", dataInit, layout, {
            scrollZoom: false,
            displayModeBar: false,
            responsive: false
        }).then(() => {
            Plotly.addFrames("map", frames);
        });
    })