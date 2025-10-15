from dash import Dash, dcc, html, Input, Output, State
import pandas as pd
import plotly.colors as pc
import plotly.graph_objs as go
from plotly.subplots import make_subplots
import plotly.express as px

df_states = pd.read_csv(
    "https://raw.githubusercontent.com/jasonong/List-of-US-States/master/states.csv")
df_data = pd.read_json('data.json')
df_states = df_states.drop([8], axis=0)
lista = []
list_states = []
list_abrev = []
list_year = []
list_value = []
list_info = []
for state in df_states['State']:
    for year in range(2011, 2022):
        df_new = df_states.loc[df_states['State'] == state]
        # print(df_new)
        list_states.append(state)
        a = df_new['Abbreviation'].iloc[0]
        list_abrev.append(a)
        # print(a)
        list_year.append(year)
        list_value.append(round(df_data[year][a]['value'], ndigits=1))

df = pd.DataFrame()
df['State'] = list_states
df['Year'] = list_year
df['Abbreviation'] = list_abrev
df['Value'] = list_value
print(df)


def create_choropleth(df, color_scale, showscale=True):
    fig = go.Choropleth(
        locations=df['region'],
        locationmode='country names',
        z=df['valence'],
        text=df['valence'],
        colorscale=color_scale,
        zmin=0,
        zmax=1,
        colorbar=dict(title='Valence', x=1.05) if showscale else None,
        marker_line_width=0,
        showscale=showscale
    )

    return fig


# External GeoJSON for US states (pre-defined)
us_states_geojson = "https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json"
app = Dash()
app.layout = html.Div([

    html.Div([
        dcc.Graph(id='us-map'),
        dcc.Store(id='selected-states-store', data=[])
    ])

])


def plot(df_2019, df_2020):
    color_scale = pc.sequential.Aggrnyl

    fig = make_subplots(rows=1, cols=2, subplot_titles=('2019', '2020'),
                        specs=[[{'type': 'choropleth'}, {'type': 'choropleth'}]])
    fig.add_trace(create_choropleth(df_2019[df_2019['date'] == df_2019['date'].min(
    )], color_scale, showscale=True), row=1, col=1)
    fig.add_trace(create_choropleth(df_2020[df_2020['date'] == df_2020['date'].min(
    )], color_scale, showscale=True), row=1, col=2)

    frames = create_frames(df_2019, df_2020, color_scale)

    fig.frames = frames
    # Initial traces

    slider = create_slider(
        sorted(set(df_2019['date'].unique()) | set(df_2020['date'].unique())))
    buttons = create_play_pause_buttons()

    fig.update_layout(
        sliders=[slider],
        updatemenus=[buttons],
        geo=dict(
            showframe=False,
            showcoastlines=False,
            projection_type='natural earth'
        ),
        margin=dict(l=0, r=0, b=0, t=0),
        width=1900,
        height=850
    )

    fig.update_geos(
        showframe=False,
        showcoastlines=False,
        projection_type='natural earth'
    )

    # Hide the colorbar for the second choropleth trace
    fig.data[1].update(showscale=True)

    # Make the figure take up the whole window
    fig.layout.width = None
    fig.layout.height = None

    return fig


def create_frames(df_2019, df_2020, color_scale):
    frames = []
    dates = sorted(set(df_2019['date'].unique()) |
                   set(df_2020['date'].unique()))
    for date in dates:
        frame_df_2019 = df_2019[df_2019['date'] == date]
        frame_df_2020 = df_2020[df_2020['date'] == date]
        frames.append(go.Frame(
            data=[
                create_choropleth(frame_df_2019, color_scale),
                create_choropleth(frame_df_2020, color_scale)
            ],
            name=date
        ))
    return frames


def create_slider(dates):
    return {
        'active': 0,
        'yanchor': 'top',
        'xanchor': 'left',
        'currentvalue': {
            'font': {'size': 17},
            'prefix': 'Date: ',
            'visible': True,
            'xanchor': 'right'
        },
        'transition': {'duration': 300, 'easing': 'cubic-in-out'},
        'pad': {'b': 10, 't': 50},
        'len': 0.9,
        'x': 0.1,
        'y': -0.1,
        'steps': [{
            'args': [[date], {'frame': {'duration': 300, 'redraw': True}, 'mode': 'immediate'}],
            'label': date,
            'method': 'animate'
        } for date in dates]
    }


def create_play_pause_buttons():
    return {
        'buttons': [
            {
                'args': [None, {'frame': {'duration': 500, 'redraw': True}, 'fromcurrent': True}],
                'label': 'Play',
                'method': 'animate'
            },
            {
                'args': [[None], {'frame': {'duration': 0, 'redraw': True}, 'mode': 'immediate', 'transition': {'duration': 0}}],
                'label': 'Pause',
                'method': 'animate'
            }
        ],
        'direction': 'left',
        'pad': {'r': 10, 't': 87},
        'showactive': True,
        'type': 'buttons',
        'x': 0.1,
        'xanchor': 'right',
        'y': 0,
        'yanchor': 'top'
    }


@app.callback(
    Output('us-map', 'figure'),
    Output('selected-states-store', 'data'),
    Input('us-map', 'clickData'),
    State('selected-states-store', 'data')
)
def update_map(click_data, selected_states):
    # if click_data is not None:
    #     clicked_state = click_data['points'][0]['location']
    #     print(clicked_state)

    #     # Toggle the clicked state in the selected_states list
    #     if clicked_state in selected_states:
    #         print(click_data)
    #         selected_states.remove(clicked_state)
    #     else:
    #         selected_states.append(clicked_state)

    # state_colors = {state: 'white' for state in df_states['Abbreviation']}
    # for state in selected_states:
    #     state_colors[state] = 'blue'
    data_2019 = {
        'year': 2019,
        'region': ['Germany', 'Denmark', 'Japan', 'France', 'Italy', 'Spain', 'Canada', 'Brazil', 'India', 'Australia',
                   'China', 'Russia', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Finland', 'Mexico',
                   'Argentina', 'Chile',
                   'Germany', 'Denmark', 'Japan', 'France', 'Italy', 'Spain', 'Canada', 'Brazil', 'India', 'Australia'],
        'date': ['01-01', '01-01', '01-01', '02-01', '02-01', '02-01', '03-01', '03-01', '03-01', '04-01',
                 '04-01', '04-01', '05-01', '05-01', '05-01', '06-01', '06-01', '06-01', '07-01', '07-01',
                 '08-01', '08-01', '08-01', '09-01', '09-01', '09-01', '10-01', '10-01', '10-01', '11-01'],
        'valence': [0.3, 0.25, 0.22, 0.21, 0.18, 0.15, 0.1, 0.12, 0.14, 0.15,
                    0.17, 0.19, 0.21, 0.23, 0.25, 0.27, 0.29, 0.31, 0.33, 0.35,
                    0.37, 0.39, 0.41, 0.43, 0.45, 0.47, 0.49, 0.51, 0.53, 0.55]
    }

    data_2020 = {
        'year': 2020,
        'region': ['Germany', 'Denmark', 'Japan', 'France', 'Italy', 'Spain', 'Canada', 'Brazil', 'India', 'Australia',
                   'China', 'Russia', 'South Korea', 'Netherlands', 'Sweden', 'Norway', 'Finland', 'Mexico',
                   'Argentina', 'Chile',
                   'Germany', 'Denmark', 'Japan', 'France', 'Italy', 'Spain', 'Canada', 'Brazil', 'India', 'Australia'],
        'date': ['01-01', '01-01', '01-01', '02-01', '02-01', '02-01', '03-01', '03-01', '03-01', '04-01',
                 '04-01', '04-01', '05-01', '05-01', '05-01', '06-01', '06-01', '06-01', '07-01', '07-01',
                 '08-01', '08-01', '08-01', '09-01', '09-01', '09-01', '10-01', '10-01', '10-01', '11-01'],
        'valence': [0.94, 0.89, 0.85, 0.71, 0.67, 0.63, 0.81, 0.79, 0.77, 0.65,
                    0.62, 0.61, 0.75, 0.72, 0.69, 0.85, 0.82, 0.79, 0.75, 0.72,
                    0.91, 0.88, 0.84, 0.81, 0.78, 0.74, 0.9, 0.87, 0.83, 0.8]
    }

    df_2019 = pd.DataFrame.from_dict(data_2019)
    df_2020 = pd.DataFrame.from_dict(data_2020)
    fig = plot(df_2019, df_2020)

    return fig, selected_states


if __name__ == '__main__':
    app.run(debug=True)
