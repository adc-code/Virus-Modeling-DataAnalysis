import pandas as pd
import numpy as np


DataFile = 'ONTCovidCases.csv'

# load the data file...
df_ONTCovidCases = pd.read_csv (DataFile)

FieldStr = [ 'Accurate_Episode_Date', 'Case_Reported_Date' ]


# open our file...
f = open ('ONCovidCases_ReportingTimesDates.csv', 'w')
columnNamesStr = 'DataType,Date,Value'


f.write (columnNamesStr + '\n')


for i in [0, 1]:

    # Get the dates...
    dates = []
    dates = df_ONTCovidCases[ FieldStr[i] ].unique()
    dates = dates.tolist ()

    # clean the date list... from past experience the dates may have bad
    # data values and NaNs  
    datesClean = []
    for item in dates:
        if (item == '2020-01-01' or item == '2020-01-10' or 
            item == '12:00:00 AM' or item != item):
            continue
        else:
            datesClean.append (item)

    # sort the dates...
    datesClean.sort()

    # Uncomment for testing...
    # print (FieldStr[i], len(datesClean))

    results = {}
    for day in datesClean:
        
        dayDF = df_ONTCovidCases[df_ONTCovidCases[ FieldStr[i] ] == day]
        
        # Uncomment for testing...
        # print (FieldStr[i], day, dayDF.shape[0])
        
        f.write (FieldStr[i] + ',' + str(day) + ',' + str(dayDF.shape[0]) + '\n')

        
f.close ()   



