import pandas as pd
import matplotlib.pyplot as plt


# read the data...
DataFile    = 'ONTCovidCases.csv'
df_ONTCovidCases = pd.read_csv (DataFile)


# get the groups/categories.  We will find the results for
# all of the combinations of these categories...
PHUNames     = df_ONTCovidCases['Reporting_PHU'].unique()
OutcomeTypes = df_ONTCovidCases['Outcome1'].unique()

AgeGroups    = df_ONTCovidCases['Age_Group'].unique()
AgeGroups    = AgeGroups.tolist()
AgeGroups.remove ('UNKNOWN')

# Remove any stray commas from the PHU name... since we are outputting 
# a CSV file, they will result in badly parsed data.  Also put the
# names in alphabetical order
PHUNames = PHUNames.tolist();
PHUNames.sort()

PHUNamesClean = []
for name in PHUNames:
    
    #if ',' in name:
    cleanName = name.replace (',', '');
    cleanName = cleanName.replace ('&', 'and')

    PHUNamesClean.append (cleanName)

    #else:
    #    PHUNamesClean.append (name)


# add a total cases outcome type... Do the calculation here
# instead during the visualization 
OutcomeTypes = OutcomeTypes.tolist()
OutcomeTypes.append ('Total Cases')
    
# open our file...
f = open ('ONCovidCases_PHUAgeOutcomes.csv', 'w')

columnNamesStr = 'PHU_Name,Outcome,' + ','.join(AgeGroups) + ',MaxValue'

f.write (columnNamesStr + '\n')

# uncomment for testing...
print (columnNamesStr)

# Go through all the PHUs...
for i in range(len(PHUNames)):
    
    PHUDF = df_ONTCovidCases[df_ONTCovidCases['Reporting_PHU'] == PHUNames[i]]
    
    # and go through all the outcomes for the current PHU...
    for outcome in OutcomeTypes:
    
        outputstr = PHUNamesClean[i]
        outputstr += ',' + outcome
        
        if outcome == 'Total Cases':
            PHUOutcomeDF = PHUDF
        else:
            PHUOutcomeDF = PHUDF[PHUDF['Outcome1'] == outcome]
        
        # and go through all the age groups for the current outcome...
        values = [];
        for age in AgeGroups:
            
            PHUOutcomeAgeDF = PHUOutcomeDF[PHUOutcomeDF['Age_Group'] == age]
            PHUOutcomeAgeNumCases = PHUOutcomeAgeDF.shape[0]
            
            # keep track of the value...
            values.append (PHUOutcomeAgeNumCases)
            
            outputstr += ',' + str(PHUOutcomeAgeDF.shape[0])
            
        outputstr += ',' + str(max(values))
        
        # Uncomment for testing...   
        print (outputstr)
        
        # write data to the file
        f.write (outputstr + '\n')
        
# close the file
f.close ()



