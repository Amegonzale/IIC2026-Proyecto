import pandas as pd
import numpy as np
import json

df_estados = pd.read_csv("data/estados.csv")
df_poblacion = pd.read_csv("data/poblacionUSA_clean.csv")
df_shootings = pd.read_csv("data/shootings.csv")


def clean_up(df, df_shoots):
    # CLEAN-UP: code - state
    df = df.get(["code", "state"])

    df_shoots = df_shoots.get(
        ["Date", "State", "Fatalities", "Wounded"]).fillna({"Wounded": 0}).fillna({"Fatalities": 0})

    df_shoots["Date"] = df_shoots["Date"].apply(lambda x: x[-4:])
    df_shoots["Wounded"] = df_shoots["Wounded"].apply(lambda x: round(x))

    return df, df_shoots


def add_ave_population():
    # ADD-COLUMN: ave population
    ave_population = []

    for estado in (df_estados.get("state")):
        sum = 0

        for num in df_poblacion.get(estado):
            # print(num)
            # num = num.replace(",", "")
            sum = sum + int(num)

        average = sum // 35
        ave_population.append(average)

    df_estados["ave population"] = ave_population

    return ave_population


def add_total_shootings():
    # ADD-COLUMN: total shootings
    df = df_shootings.get(["State"])
    total_shootings = []
    ave_shootings = []

    # COUNT: states
    for estado in (df_estados.get("state")):
        total = int(df["State"].value_counts().get(estado, 0))
        total_shootings.append(total)
        ave_shootings.append(round((total / 35), ndigits=1))

    df_estados["total shootings"] = total_shootings
    df_estados["ave shootings"] = ave_shootings
    return total_shootings, ave_shootings


def add_average_deaths():
    # CALCULATE: deaths per year-state

    df = df_shootings.groupby(["Date", "State"], as_index=False).agg(
        total_deaths=('Fatalities', 'sum'),
        total_wounded=('Wounded', 'sum')
    )

    average_deaths = []
    total_deaths = []

    for state in (df_estados.get("state")):
        # GET: filtrar por state
        df_state = df.loc[df['State'] == state]
        df_citizens = df_poblacion.get(["Año", state])

        sum = 0
        sum_deaths = 0

        for year in (df_state.get("Date")):
            deaths = df_state.loc[df_state['Date']
                                  == year, ['total_deaths']]
            deaths = deaths.iloc[0].total_deaths

            wounded = df_state.loc[df_state['Date']
                                  == year, ['total_wounded']]
            wounded = wounded.iloc[0].total_wounded

            population = df_citizens.loc[df_citizens['Año'] == int(year), [
                state]]
            population = population.iloc[0].at[state]

            affected = int(deaths) + int (wounded)

            rate = int(affected) / int(population)

            sum += rate
            sum_deaths += deaths + wounded
            # print(state, year, deaths, population)
            # print("rate:", rate)
            # print("sum:", sum)

        average = rate / 35

        # print(f"average {state}: {average}")

        average_deaths.append(average * 1000000)
        total_deaths.append(sum_deaths)

    # print(average_deaths)

    df_estados["total deaths"] = total_deaths
    df_estados["ave deaths"] = average_deaths

    return total_deaths, average_deaths



df_estados, df_shootings = clean_up(df_estados, df_shootings)
ave_population = add_ave_population()
total_shootings, ave_shootings = add_total_shootings()
total_deaths, average_deaths = add_average_deaths()

df_estados["method2"] = (df_estados["total deaths"] / df_estados["ave population"]) * 100000

print(df_estados)

df_estados.to_json('data.json', orient='records')
df_estados.to_csv('data.csv', header=False, index=False)
