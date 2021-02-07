import pandas as pd

DataFile = 'ONTCovidTesting.csv'

df_ONTCovidTesting = pd.read_csv (DataFile)

allCols = df_ONTCovidTesting.columns

#print ('current columns: ', df_ONTCovidTesting.columns)

colsToKeep = [ 'Reported Date', 'Confirmed Positive', 'Resolved', 'Deaths', 'Total Cases', 'Total tests completed in the last day', \
               'Under Investigation', 'Number of patients hospitalized with COVID-19', 'Number of patients in ICU with COVID-19', \
               'Number of patients in ICU on a ventilator with COVID-19', 'Total Positive LTC Resident Cases', 'Total Positive LTC HCW Cases', \
               'Total LTC Resident Deaths', 'Total LTC HCW Deaths' ]

#print ('Number of Columns: ', len(allCols))
#print ('Number of Columns to Keep: ', len(colsToKeep))
#print ('Number of Columns to Drop: ', len(allCols) - len(colsToKeep))

for column in allCols:

    if column not in colsToKeep:
 
        print ('Dropping column: ', column)
        df_ONTCovidTesting.drop (column, axis=1, inplace=True)

#print ('current columns: ', df_ONTCovidTesting.columns)

# Convert NAs to zeros
df_ONTCovidTesting = df_ONTCovidTesting.fillna (0)

# output to CSV...
df_ONTCovidTesting.to_csv ('Covid19Testing_ON_Overview.csv', index=False)



