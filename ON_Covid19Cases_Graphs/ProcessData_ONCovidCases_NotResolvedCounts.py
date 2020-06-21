import pandas as pd
import numpy as np


# load the data file...
DataFile = 'ONTCovidCases.csv'
df_ONTCovidCases = pd.read_csv (DataFile)

# open our file...
f = open ('ONCovidCases_NotResolvedCounts.csv', 'w')
columnNamesStr = 'Date,Count'

f.write (columnNamesStr + '\n')

# get all of the not resolved cases...
NotResolvedDF = df_ONTCovidCases[df_ONTCovidCases['Outcome1'] == 'Not Resolved']

# uncomment for debugging
#print (NotResolvedDF.shape[0])


# get the required dates...
dates = list (NotResolvedDF['Accurate_Episode_Date'].unique())
dates.sort()


# iterate through the day list
for day in dates:
    
    # uncomment for testing...
    # print (day, (NotResolvedDF['Accurate_Episode_Date'] == day).sum())

    f.write (day + ',' + str((NotResolvedDF['Accurate_Episode_Date'] == day).sum()) + '\n')

    
# and close the file    
f.close ()


