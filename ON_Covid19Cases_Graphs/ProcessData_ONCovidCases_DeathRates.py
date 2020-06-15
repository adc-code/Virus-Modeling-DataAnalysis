import pandas as pd
import matplotlib.pyplot as plt


DataFile = 'ONTCovidCases.csv'

df_ONTCovidCases = pd.read_csv (DataFile)


ageGroups    = df_ONTCovidCases['Age_Group'].unique()
outcomeTypes = df_ONTCovidCases['Outcome1'].unique()

ageMultiplier = {}
for age in ageGroups:
    if age[0].isnumeric():
        ageMultiplier[age] = int(age[0] + '5')
    elif age == '<20':
        ageMultiplier[age] = 10


f = open ('ONCovidCases_DeathRates.csv', 'w')
f.write ('outcome,rate\n')
        
        
for outcome in outcomeTypes:
    
    outcomeDF = df_ONTCovidCases[df_ONTCovidCases['Outcome1'] == outcome]
    
    outcomeAgeTotal = 0
    outcomeTotal    = 0
    
    for age in ageGroups:    
        
        if (age == 'Unknown'):
            continue;
            
        ageDF = outcomeDF[outcomeDF['Age_Group'] == age]
        
        outcomeAgeTotal += ageDF.shape[0] * ageMultiplier[age]
        outcomeTotal    += ageDF.shape[0]
    
    # Uncomment for testing
    # print (outcome + ',' + str(outcomeAgeTotal/outcomeTotal)
    
    f.write (outcome + ',' + str(outcomeAgeTotal/outcomeTotal) + ' \n')      
    
f.close ()



