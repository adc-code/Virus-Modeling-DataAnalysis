import numpy  as np 
import pandas as pd

# load the data...
TorCaseData = pd.read_csv ('TorCovidCases.csv')

# get the features we want to obtain...
OutcomeTypes = TorCaseData['Outcome'].unique()
AgeGroups    = TorCaseData['Age Group'].unique()
NeighNames   = TorCaseData['Neighbourhood Name'].unique ()

#
# clean up the list of neighbourgoods...
#

# make a compatible list of neighbourhood names so that we can look up stuff
# on the map
NeighNames = NeighNames.tolist();
NeighNames = [x for x in NeighNames if str(x) != 'nan']

cleanNeighNames = []

NeighNames.sort ()
for name in NeighNames:
    tmp = name.replace ("'", '')
    tmp = tmp.replace ('/', '')
    tmp = tmp.replace ('.', '')
    tmp = tmp.replace (' ', '')
    
    if (tmp == 'Mimico(includesHumberBayShores)'):
        tmp = 'Mimico'
        
    if (tmp == 'MarklandWood'):
        tmp = 'MarklandWoods'
        
    if (tmp == 'CorsoItalia-Davenport'):
        tmp = 'CorsaItalia-Davenport'
        
    if (tmp == 'Dovercourt-WallaceEmerson-Junction'):
        tmp = 'Dovercourt-WallaceEmerson-Juncti'
        
    if (tmp == 'OakwoodVillage'):
        tmp = 'Oakwood-Vaughan'
        
    if (tmp == 'Caledonia-Fairbank'):
        tmp = 'Caledonia-Fairbanks'
        
    if (tmp == 'Danforth-EastYork'):
        tmp = 'DanforthVillage-EastYork'
        
    if (tmp == 'Danforth'):
        tmp = 'DanforthVillage-Toronto'
        
    if (tmp == 'Taylor-Massey'):
        tmp = 'CrescentTown'

    cleanNeighNames.append (tmp)

# uncomment for testing
# cleanNeighNames

#
# AgeGroups... drop any NaNs from the list
#
AgeGroups = AgeGroups.tolist()
AgeGroups = [x for x in AgeGroups if str(x) != 'nan']

#
# OutcomeTypes... add the total, so we don't have to compute it in JS
#
OutcomeTypes = OutcomeTypes.tolist ()
OutcomeTypes.append ('Total Cases')
  
    
# open our file...
f = open ('TorCovidCases_NeighAgeOutcomes.csv', 'w')

# write out the column names...
columnNamesStr = 'NeighNameID,Outcome,' + ','.join(AgeGroups) \
                           + ',MaxValue' + ',NeighNameFull'
f.write (columnNamesStr + '\n')

# uncomment for testing...
# print (columnNamesStr)

# Go through all the neighbourhoods...
for i in range(len(NeighNames)):
    
    NeighDF = TorCaseData[TorCaseData['Neighbourhood Name'] == NeighNames[i]]
    
    # and go through all the outcomes for the current 'hood'...
    for outcome in OutcomeTypes:
    
        outputstr = cleanNeighNames[i]
        outputstr += ',' + outcome
    
        if outcome == 'Total Cases':
            NeighOutcomeDF = NeighDF
        else:
            NeighOutcomeDF = NeighDF[NeighDF['Outcome'] == outcome] 
        
        # uncomment for debugging for testing...
        # print(NeighNames[i], outcome, NeighOutcomeDF.shape[0]) 
        
        # and go through all the age groups for the current outcome...
        values = [];
        for age in AgeGroups:
            
            NeighOutcomeAgeDF = NeighOutcomeDF[NeighOutcomeDF['Age Group'] == age]
            NeighOutcomeAgeDFCases = NeighOutcomeAgeDF.shape[0]
            
            # keep track of the value...
            values.append (NeighOutcomeAgeDFCases)
            
            outputstr += ',' + str(NeighOutcomeAgeDF.shape[0])
            
        outputstr += ',' + str(max(values))
        outputstr += ',' + NeighNames[i]
        
        # Uncomment for testing...   
        # print (outputstr)
        
        # write data to the file
        f.write (outputstr + '\n')

# close the file...
f.close ()



