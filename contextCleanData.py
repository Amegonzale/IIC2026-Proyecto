import json

states = {"Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
          "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
          "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
          "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA",
          "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
          "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM",
          "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
          "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
          "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
          "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"}

data_states = {}
data_yearly = {}

with open("data/contextstate.csv", "r", encoding="utf-8") as f:
    for line in f.readlines()[1:]:
        parts = line.strip().split(";")
        data_states[states[parts[0]]] = parts[1]

with open("data/contextyearly.csv", "r", encoding="utf-8") as f:
    for line in f.readlines()[1:]:
        parts = line.strip().split(";")
        data_yearly[parts[0]] = parts[1]

with open("data_states.json", "w", encoding="utf-8") as f:
    json.dump(data_states, f, indent=2, ensure_ascii=False)

with open("data_yearly.json", "w", encoding="utf-8") as f:
    json.dump(data_yearly, f, indent=2, ensure_ascii=False)

print("Archivos data_states.json y data_yearly.json creados")
