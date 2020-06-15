import pandas as pd
import matplotlib.pyplot as plt


DataFile = 'ONTCovidCases.csv'

df_ONTCovidCases = pd.read_csv (DataFile)


PHUNames     = df_ONTCovidCases['Reporting_PHU'].unique()
outcomeTypes = df_ONTCovidCases['Outcome1'].unique()

outcomeTypesClean = []
for outcomeStr in outcomeTypes:
    outcomeTypesClean.append (outcomeStr.replace (' ', '_'))
    
columnNames = ['PHUName', 'TotalCases']
columnNames.append (outcomeTypesClean[0])
columnNames.append (outcomeTypesClean[2])
columnNames.append (outcomeTypesClean[1])

    
# Make a dataframe to hold all of the results...    
ResultsDF = pd.DataFrame (columns=columnNames)


# Go through all PHUs
for PHU in PHUNames:

    newRow = pd.Series ()
    
    # clean up the name... remove commas so our csv file will not 
    # create false positives
    PHUNameClean = PHU
    if ',' in PHU:
        PHUNameClean = PHU.replace (',', '')
        
    newRow ['PHUName'] = PHUNameClean
    
    # Get the results for required PHU
    PHUDF = df_ONTCovidCases[df_ONTCovidCases['Reporting_PHU'] == PHU]
    
    # Get the total cases...
    newRow ['TotalCases'] = PHUDF.shape[0]
    
    # and all the outcomes...
    for i in range (len(outcomeTypes)):
        outcomeDF = PHUDF[PHUDF['Outcome1'] == outcomeTypes[i]]
        
        newRow [outcomeTypesClean[i]] = outcomeDF.shape[0]
    
    # add the new row...
    ResultsDF = ResultsDF.append (newRow, ignore_index=True)

    
# sort by the total cases, and write out the CSV file    
ResultsDF.sort_values(by=['TotalCases'], ascending=False, inplace=True)    
ResultsDF.to_csv ('ONCovidCases_PHUOutcomes.csv', index=False)


# uncomment for debugging
# display(ResultsDF)  
