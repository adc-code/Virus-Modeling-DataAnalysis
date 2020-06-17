import pandas as pd
import matplotlib.pyplot as plt


DataFile = 'ONTCovidCases.csv'

# load the data file...
df_ONTCovidCases = pd.read_csv (DataFile)

# Get the dates...
dates = df_ONTCovidCases['Accurate_Episode_Date'].unique()
dates = dates.tolist ()

# clean the date list... from past experience the dates may have bad
# data values and NaNs  
datesClean = []
for item in dates:
    if (item == '2020-01-01' or item == '2020-01-10' or item != item):
        continue
    else:
        datesClean.append (item)

# sort the dates...
datesClean.sort()

# uncomment for debugging
#print (datesClean)

# Open a file to write this too
f = open ('ONCovidCases_DateRange.csv', 'w')
f.write ('start_date,end_date\n')


# uncomment for debugging
# print (datesClean[0] + '   ' + datesClean[ len(datesClean) - 1 ])

f.write (datesClean[0] + ',' + datesClean[ len(datesClean) - 1 ] + '\n')


#f.close ()


