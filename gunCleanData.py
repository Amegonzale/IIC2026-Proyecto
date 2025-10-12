import pandas as pd
import json

df = pd.read_csv("data/gun_possession.csv", sep=";")
df_states = pd.read_csv("data/estados.csv", sep=",")

for col in df.columns[1:]:
    df[col] = (
        df[col]
        .astype(str)
        .str.replace(",", ".", regex=False)
        .replace({"---": 0, "": 0, "0": 0})
        .astype(float)
    )

data = {}
for _, row in df.iterrows():
    year = str(int(row["Año"]))
    data[year] = {}
    
    for state in df.columns:
        if state not in ["Año", "DC"]:
            stateShort = df_states[df_states["state"] == state]["code"].values[0]
            data[year][stateShort] = {
                "stateName": state,
                "value": row[state],
                "info": ""
            }

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Archivo data.json creado")
