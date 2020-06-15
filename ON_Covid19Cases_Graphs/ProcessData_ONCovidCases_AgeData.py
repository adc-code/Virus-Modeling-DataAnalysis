import pandas as pd
import matplotlib.pyplot as plt


DataFile = 'ONTCovidCases.csv'
df_ONTCovidCases = pd.read_csv (DataFile)


# get the various catagorical types
ageGroups    = df_ONTCovidCases['Age_Group'].unique()
outcomeTypes = df_ONTCovidCases['Outcome1'].unique()
genderTypes  = df_ONTCovidCases['Client_Gender'].unique()

# Initialize the dictionary
ageCaseData = {}
for grp in ageGroups:
    ageCaseData[grp] = []

# Make the index names...
indexTypes = ['TotalCases']
indexTypes.extend (outcomeTypes);
indexTypes.append (genderTypes[0]);
indexTypes.append (genderTypes[1]);
indexTypes.append ('Other')

# Get all the values for each the age group 
for grp in ageGroups:    
    grpDF = df_ONTCovidCases [df_ONTCovidCases['Age_Group'] == grp]
    ageCaseData[grp].append (grpDF.shape[0])
    
    for outcome in outcomeTypes:
        tmpDF = grpDF[grpDF['Outcome1'] == outcome]
        ageCaseData[grp].append (tmpDF.shape[0])

    ageCaseData[grp].append (grpDF[grpDF['Client_Gender'] == genderTypes[0]].shape[0]);
    ageCaseData[grp].append (grpDF[grpDF['Client_Gender'] == genderTypes[1]].shape[0]);
    
    cond1 = grpDF['Client_Gender'] != genderTypes[0];
    cond2 = grpDF['Client_Gender'] != genderTypes[1];
    
    ageCaseData[grp].append (grpDF[cond1 & cond2].shape[0])
    
# Uncomment for debugging    
# print (ageCaseData)
# print (indexTypes)
  
# Output to a file...
dfObj = pd.DataFrame(ageCaseData, index=indexTypes)  
dfObj.to_csv ('ONCovidCases_AgeData.csv')


