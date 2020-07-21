
import numpy  as np 
import pandas as pd

# load the data...
TorCaseData = pd.read_csv ('TorCovidCases.csv')

# get the features we want to obtain...
OutcomeTypes = TorCaseData['Outcome'].unique()
AgeGroups    = TorCaseData['Age Group'].unique()
GenderTypes  = TorCaseData['Client Gender'].unique()

OutcomeTypes = OutcomeTypes.tolist ()
OutcomeTypes.append ('Total')

AgeGroups    = AgeGroups.tolist ()
AgeGroups    = [x for x in AgeGroups if str(x) != 'nan']
ReorderedAgeGroups = ['19 and younger', '20-29', '30-39', '40-49', \
                      '50-59', '60-69', '70-79', '80-89', '90+']
AgeGroups = ReorderedAgeGroups
#print (AgeGroups)

GenderTypes  = GenderTypes.tolist ()
GenderTypes  = ['MALE', 'FEMALE', 'BOTH']

HospTypes = ['Ever Hospitalized', 'Ever in ICU', 'Ever Intubated']
HospStr   = ['HOSP', 'ICU', 'VENT']

#print (OutcomeTypes)
#print (AgeGroups)
#print (GenderTypes)

# open our file...
f = open ('TorCovidCases_HospOutcomes.csv', 'w')

# write out the column names...
columnNamesStr = 'gender,outcome,hosp,ageGroup,amount'

f.write (columnNamesStr + '\n')

# uncomment for testing...
#print (columnNamesStr)


for gender in GenderTypes:
    
    if (gender != 'BOTH'):
        genderCasesDF = TorCaseData[TorCaseData['Client Gender'] == gender]
    else:
        MaleCases     = TorCaseData['Client Gender'] == 'MALE'
        FemaleCases   = TorCaseData['Client Gender'] == 'FEMALE'
        
        genderCasesDF = TorCaseData[MaleCases | FemaleCases]
        
        
    for outcome in OutcomeTypes:
        
        if (outcome != 'Total'):
            genderOutcomeDF = genderCasesDF[genderCasesDF['Outcome'] == outcome]
        else:
            genderOutcomeDF = genderCasesDF
         
        
        for hosp in HospTypes:
            
            HospDF = genderOutcomeDF[genderOutcomeDF[hosp] == 'Yes']
            
            HospStr = 'HOSP'
            if (hosp == 'Ever in ICU'):
                HospStr = 'ICU'
            elif (hosp == 'Ever Intubated'):
                HospStr = 'VENT'
            
            for age in AgeGroups:
                
               ageDF = HospDF[HospDF['Age Group'] == age]

               ageStr = age
               if (age == '19 and younger'):
                   ageStr = '<20'
            
               # uncomment for testing
               # print (gender, outcome, HospStr, ageStr, ageDF.shape[0])
            
               outputStr = gender + ',' + outcome + ',' + \
                           HospStr + ',' + ageStr + ',' + str(ageDF.shape[0]) + \
                           '\n'
                     
               f.write (outputStr)
            
f.close ()



