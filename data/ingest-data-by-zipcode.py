import boto3
import csv
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

s3 = boto3.client('s3')

# Read zipcode from S3
def load_zipcodes(bucket_name):
    zipcodeFile = s3.get_object(Bucket=bucket_name, Key='data-source/zipcodes.json')
        
    if zipcodeFile:
        print('We found a zipcode reference file!')
        zipcodes = zipcodeFile["Body"].read().decode()
        print("Zipcodes processing " + str(len(zipcodes)))
        return zipcodes
    else:
        print('Error getting zipcode reference file!')

def lambda_handler(event, context):
    print('We detected a file was uploaded!')
     
    # retrieve bucket name and file_key from the S3 event
    bucket_name = event['Records'][0]['s3']['bucket']['name']
    file_key = event['Records'][0]['s3']['object']['key']
    logger.info('Reading {} from {}'.format(file_key, bucket_name))
    
    # get the object
    csvfile = s3.get_object(Bucket=bucket_name, Key=file_key)
    logger.info(csvfile)
    
    csvcontent = csvfile['Body'].read().decode('utf-8').splitlines()
    logger.info(csvcontent)
    
    # lines = csv.reader(csvcontent)
    csv_data = csv.DictReader(csvcontent, delimiter=';')
    programs = []
    
    for row in csv_data:
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
        programs.append(programInZipcode)\
        
    print("Programs scanning " + str(len(programs)))
    
    # load JSON file with zipcode reference
    zipcodes = load_zipcodes(bucket_name)
    
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

    if(len(programsByZipcode) > 0):
        zipcodeJSON = z + '.json'
        with open(zipcodeJSON, "w") as jsonfile:
            json.dump(programsByZipcode, jsonfile)
        print(str(len(programsByZipcode)) + " programs found in the " + z + " zipcode output to " + zipcodeJSON)
        
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
