from dash import Dash, dcc, html, Input, Output, State
import pandas as pd
import plotly.express as px

df_states = pd.read_csv(
    "https://raw.githubusercontent.com/jasonong/List-of-US-States/master/states.csv")

# External GeoJSON for US states (pre-defined)
us_states_geojson = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"

app = Dash()
app.layout = html.Div([
    dcc.Graph(id='us-map'),
    dcc.Store(id='selected-states-store', data=[])
])


@app.callback(
    Output('us-map', 'figure'),
    Output('selected-states-store', 'data'),
    Input('us-map', 'clickData'),
    State('selected-states-store', 'data')
)
def update_map(click_data, selected_states):
    if click_data is not None:
        clicked_state = click_data['points'][0]['location']
        print(clicked_state)

        # Toggle the clicked state in the selected_states list
        if clicked_state in selected_states:
            print(click_data)
            selected_states.remove(clicked_state)
        else:
            selected_states.append(clicked_state)

    state_colors = {state: 'white' for state in df_states['Abbreviation']}
    for state in selected_states:
        state_colors[state] = 'blue'

    fig = px.choropleth(df_states,
                        geojson=us_states_geojson,
                        locations='Abbreviation',
                        locationmode='USA-states',
                        scope='usa',
                        color=df_states['Abbreviation'].map(state_colors),
                        color_discrete_map='identity',
                        hover_name='State')

    return fig, selected_states


if __name__ == '__main__':
    app.run(debug=True)
