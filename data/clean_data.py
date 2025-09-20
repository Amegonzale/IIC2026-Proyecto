import csv
import re

# Archivos
input_file = "poblacionUSA.csv"     # tu CSV original
output_file = "poblacionUSA_clean.csv"  # el CSV limpio

with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", newline="", encoding="utf-8") as outfile:
    reader = infile.readlines()
    writer = csv.writer(outfile)

    for i, line in enumerate(reader):
        new = []
        if i==0:
            new = [
                "Year","Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","DC",
                "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine",
                "Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
                "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon",
                "Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
                "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
                ]
        else:
            # 1. Quitar comillas sobrantes
            clean_line = line.replace('""', '"')

            # 2. Separar la fila por comas (aquí sí mantenemos columnas)
            row = clean_line.strip().split('"')

            # 3. Limpiar cada celda quitando comas de miles (solo dentro de números)
            cleaned_row = [cell.replace(",", "") for cell in row]

            for cell in cleaned_row:
                if cell != "":
                    new.append(cell)

        writer.writerow(new)

print(f"✅ Archivo limpio guardado como: {output_file}")
