# This script is designed to run on your local filesystem
import copy
import csv
import json

# Load all possible zipcodes into memory
with open('zipcodes.json') as json_file:
    zipcodes = json.load(json_file)
print("Zipcodes processing " + str(len(zipcodes)))

# Read all the spreadsheet data into memory
with open('data-clean.csv') as csvfile:
    sourceCSV = csv.DictReader(csvfile, delimiter=';')
    programs = []
    # This is probably overkill but I wanted to have a place to validate CSV fields
    for row in sourceCSV:
        programInZipcode = {}
        programInZipcode["name"] = row['PROGRAM NAME']
        programInZipcode["organization"] = row['ORGANIZATION']
        programInZipcode["funding"] = row['FUNDING']
        programInZipcode["eligibility"] = row['PROGRAM ELIGIBILITY']
        programInZipcode["use"] = row['USE OF FUNDS']
        programInZipcode["area"] = row['AREA']
        programInZipcode["type"] = row['TYPE OF FUND']
        programInZipcode["targeted"] = row['TARGETED APPLICANTS']
        programInZipcode["phone"] = row['PHONE']
        programInZipcode["url"] = row['PROGRAM-SPECIFIC WEB PAGE']
        programInZipcode["zipcode"] = row['ZIP CODE(S)']
        programs.append(programInZipcode)
print("Programs scanning " + str(len(programs)))

# Traverse all of the zipcodes
for z in zipcodes:
    # Create a new list to store programs found in a given zipcode
    programsByZipcode = []
    # Traverse all of the programs
    for program in programs:
        # Check to see if the zipcode appears in the program's eligible zipcodes list
        if program["zipcode"].find(z) != -1:
            # If it does, create a deep copy of the object (so we can safely delete a key)
            copiedProgram = copy.deepcopy(program)
            # Delete the zipcode key, because as it turns out, it accounts for a lot of the weight
            del copiedProgram["zipcode"]
            # Add the trimmed up program data to the new list
            programsByZipcode.append(copiedProgram)

    # At the end of checking every program for a certain zipcode, if we found viable programs, save them as a <zipcode>.json file
    if(len(programsByZipcode) > 0):
        zipcodeJSON = z + '.json'
        with open(zipcodeJSON, "w") as jsonfile:
            json.dump(programsByZipcode, jsonfile)
        print(str(len(programsByZipcode)) + " programs found in the " + z + " zipcode output to " + zipcodeJSON)
    