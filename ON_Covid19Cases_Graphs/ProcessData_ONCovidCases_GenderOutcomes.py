import pandas as pd
import matplotlib.pyplot as plt


DataFile    = 'ONTCovidCases.csv'


# Load the data
df_ONTCovidCases = pd.read_csv (DataFile)


# Get all the gender types...
genders = df_ONTCovidCases['Client_Gender'].unique()

# Find all of the outcomes by gender...
results = []
for genderType in genders:
    genderOutcomeDF = df_ONTCovidCases[df_ONTCovidCases['Client_Gender'] == genderType]
    
    genderOutcomes  = genderOutcomeDF['Outcome1'].value_counts()
    genderOutcomes  = genderOutcomes.rename (genderType + '_Outcome')
    
    results = results + [genderOutcomes]


# From previous investigations, add together UNKNOWN, OTHER, and TRANSGENDER
# since their total is less than 1% of the overall population

Other_Outcomes = pd.Series ()

outcomeTypes = df_ONTCovidCases['Outcome1'].unique() 
for outType in outcomeTypes:
    typeTotal = 0
    for i in range (2,5):
        if outType in results[i]:
           typeTotal = typeTotal + results[i][outType]
        
    Other_Outcomes [outType] = typeTotal;

# Uncomment for testing
# print (Other_Outcomes)    

Other_Outcomes = Other_Outcomes.rename ('Other_Outcome')

# The 'new' results list consists of the female, male, and other results 
results = [ results[0], results[1], Other_Outcomes ]

# Make it a dataframe (and get rid of any nulls) so we can further manipulate the data
resultsDF = pd.DataFrame(results)
resultsDF = resultsDF.fillna(0)

# uncomment for testing
# display (resultsDF)


# Compute the outcome percentages for each gender
resultsGenPct = (resultsDF.T / resultsDF.T.sum() * 100)

# rename the columns 
colsPct = []
for col in resultsGenPct.columns:
    colsPct.append (col + '_Pct')
resultsGenPct.columns = colsPct

# transpose the results so they are in the same orientation as
# everything else
resultsGenPct = resultsGenPct.T 

# uncomment for testing
# display (resultsGenPct)

# Compute outcomes by gender if necessary
OutcomeByGender = False
if OutcomeByGender:
    # Compute the gender percentages for each outcome
    resultsOutPct = (resultsDF / resultsDF.sum() * 100)

    # rename the columns
    colsPct = []
    for col in resultsOutPct.T.columns:
        colsPct.append (col + '_Pct2')

    # perhaps there is a better way to do this...
    resultsOutPct = resultsOutPct.T
    resultsOutPct.columns = colsPct
    resultsOutPct = resultsOutPct.T

    # uncomment for testing
    # display (resultsOutPct)

# combine and output the results...
finalDF = pd.concat([resultsDF, resultsGenPct])

# uncomment for testing
# display(finalDF)

finalDF.to_csv ('ONCovidCases_GenderOutcomes.csv')




