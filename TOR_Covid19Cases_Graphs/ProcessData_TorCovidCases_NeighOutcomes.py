import numpy  as np 
import pandas as pd

# load the data...
TorCaseData = pd.read_csv ('TorCovidCases.csv')

OutcomeTypes = TorCaseData['Outcome'].unique()
OutcomeTypes = OutcomeTypes.tolist()

NeighNames = TorCaseData['Neighbourhood Name'].unique ()
NeighNames = NeighNames.tolist()
NeighNames = [x for x in NeighNames if str(x) != 'nan']
NeighNames.sort ()

columnNames = 'NeighNames,'
columnNames += ','.join (OutcomeTypes)
columnNames += ',Total'

# uncomment for testing
# print (columnNames)

f = open ('TorCovidCases_NeighOutcomes.csv', 'w')
f.write (columnNames + '\n')


# Go through all the neighbourhoods...
for i in range(len(NeighNames)):
    
    outputStr = NeighNames[i]
    #print (NeighNames[i])
    
    NeighDF = TorCaseData[TorCaseData['Neighbourhood Name'] == NeighNames[i]]
    
    # and go through all the outcomes for the current neighbourhood...
    total = 0
    for outcome in OutcomeTypes:
        
        NeighOutcomeDF = NeighDF[NeighDF['Outcome'] == outcome]
    
        outputStr += ',' + str(NeighOutcomeDF.shape[0])
        total     += NeighOutcomeDF.shape[0]
        
    outputStr += ',' + str(total)   
    
    # uncomment for testing
    # print (outputStr)

    f.write (outputStr + '\n')
    
f.close ()


