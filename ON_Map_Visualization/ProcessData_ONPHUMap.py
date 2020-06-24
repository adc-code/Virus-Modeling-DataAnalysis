import pandas as pd
import numpy as np
import json
import os


# Files...
DataFile = 'ONTCovidCases.csv'
MapFile  = 'ON_PHU_Map.json'


# load the data file
df_ONTCovidCases = pd.read_csv (DataFile)


#
# Utility function to make a common name that both the json and the csv data will used
#
def MakeIDName (name):
    return name.upper().replace (',', '').split()[0]



#
# Determine the region... this is pretty manual 
# 

# Get the PHU names...
PHUNames = list (df_ONTCovidCases['Reporting_PHU'].unique())

Regions = {}
for PHU in PHUNames:
    
    RegionName = ''
    if PHU == 'Toronto Public Health':
        
        RegionName = 'TOR'
        
    elif (PHU == 'Middlesex-London Health Unit'     or \
          PHU == 'Huron Perth District Health Unit' or \
          PHU == 'Grey Bruce Health Unit'           or \
          PHU == 'Windsor-Essex County Health Unit' or \
          PHU == 'Southwestern Public Health'       or \
          PHU == 'Chatham-Kent Health Unit'         or \
          PHU == 'Lambton Public Health'):
        
        RegionName = 'SW'
        
    elif (PHU == 'York Region Public Health Services'  or \
          PHU == 'Durham Region Health Department'     or \
          PHU == 'Peel Public Health'                  or \
          PHU == 'Simcoe Muskoka District Health Unit' or \
          PHU == 'Haliburton, Kawartha, Pine Ridge District Health Unit' or \
          PHU == 'Peterborough Public Health'          ):
        
        RegionName = 'CE'
        
    elif (PHU == 'Region of Waterloo, Public Health'  or \
          PHU == 'Halton Region Health Department'    or \
          PHU == 'Hamilton Public Health Services'    or \
          PHU == 'Niagara Region Public Health Department'  or \
          PHU == 'Wellington-Dufferin-Guelph Public Health' or \
          PHU == 'Brant County Health Unit'           or \
          PHU == 'Haldimand-Norfolk Health Unit' ):
        
        RegionName = 'CW'
        
    elif (PHU == 'Ottawa Public Health'        or \
          PHU == 'Eastern Ontario Health Unit' or \
          PHU == 'Kingston, Frontenac and Lennox & Addington Public Health' or \
          PHU == 'Leeds, Grenville and Lanark District Health Unit' or \
          PHU == 'Hastings and Prince Edward Counties Health Unit'  or \
          PHU == 'Renfrew County and District Health Unit' ):
        
        RegionName = 'EA'
        
    elif (PHU == 'Sudbury & District Health Unit' or \
          PHU == 'Algoma Public Health Unit'      or \
          PHU == 'Porcupine Health Unit'          or \
          PHU == 'Timiskaming Health Unit'        or \
          PHU == 'North Bay Parry Sound District Health Unit' ):
        
        RegionName = 'NE'
        
    elif (PHU == 'Northwestern Health Unit' or \
          PHU == 'Thunder Bay District Health Unit' ):
          
        RegionName = 'NW'
        
    RegionName += '_Region'

    # add the region name to the dictionary...
    Regions[PHU] = RegionName
    

# Uncomment for testing    
# for i in Regions.keys():
#    print (i, '  ->  ', Regions[i])



#
# From the CSV data extract the City, Address, Postal Code, Latitude, and Longitude.
# Make a dictionary of key data for each PHU
#

PHUInfo = {}
    
for PHU in PHUNames:
    
    key = MakeIDName (PHU)
    
    PHUDF = df_ONTCovidCases[df_ONTCovidCases['Reporting_PHU'] == PHU]

    value = {}
    firstRow = PHUDF.iloc[0]
    value['City']       = firstRow ['Reporting_PHU_City']
    value['Address']    = firstRow ['Reporting_PHU_Address']
    value['PostalCode'] = firstRow ['Reporting_PHU_Postal_Code']
    value['Lat']        = firstRow ['Reporting_PHU_Latitude']
    value['Long']       = firstRow ['Reporting_PHU_Longitude']
    value['Region']     = Regions [PHU]

    PHUInfo[key] = value
    

# uncomment for testing...
# PHUInfo



#
# Modify the JSON/map file... 
#
with open (MapFile, 'r') as f:
    data = json.load (f)

    numFeatures = len (data ['features'])
    
    for i in range (numFeatures):
        
        key = MakeIDName (data ['features'][i]['properties']['ENGLISH_NAME'])
        
        if key not in PHUInfo.keys():
            print ('Not in Dict')
            break
            
        data ['features'][i]['properties']['city']       = PHUInfo [key]['City']
        data ['features'][i]['properties']['address']    = PHUInfo [key]['Address']
        data ['features'][i]['properties']['postalcode'] = PHUInfo [key]['PostalCode']
        data ['features'][i]['properties']['lat']        = PHUInfo [key]['Lat']
        data ['features'][i]['properties']['long']       = PHUInfo [key]['Long']
        data ['features'][i]['properties']['region']     = PHUInfo [key]['Region']
       
        # Uncomment for testing... 
        # print (data['features'][i]['properties'])


# Write out the new json file...  note that no indentation is being used.
newFile = 'Updated_' + MapFile

with open (newFile, 'w') as f:
    json.dump (data, f) 



