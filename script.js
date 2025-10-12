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
                    colorscale: "Viridis",
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
            colorscale: "Viridis",
            colorbar: { title: "Valor" },
            zmin: 0,
            zmax: zmaxGlobal
        }];

        const layout = {
            title: { text: 'How endangered is your child at school?<br><sup>Number of public school students who brought firearms to or possessed firearms at school per 100,000 students enrolled</sup>' },
            geo: {
                scope: "usa",
            },
            updatemenus: [{
                x: 0.1,
                y: 0.05,
                yanchor: "top",
                xanchor: "left",
                showactive: true,
                direction: "left",
                type: "buttons",
                pad: { t: 30, r: 10 },
                buttons: [
                {
                    label: "▶️",
                    method: "animate",
                    args: [null, {
                    fromcurrent: true,
                    frame: { duration: 1000, redraw: true },
                    transition: { duration: 500, easing: "linear" }
                    }]
                },
                {
                    label: "⏸️",
                    method: "animate",
                    args: [[null], { mode: "immediate", frame: { duration: 0 }, transition: { duration: 0 } }]
                }
                ]
            }],
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