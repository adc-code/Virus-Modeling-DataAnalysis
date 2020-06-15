import pandas as pd
import matplotlib.pyplot as plt


DataFile = 'ONTCovidCases.csv'

# load the data file...
df_ONTCovidCases = pd.read_csv (DataFile)

# Get the dates...
dates = df_ONTCovidCases['Accurate_Episode_Date']

# sort the dates...
sortedDates = dates.sort_values()

# Open a file to write this too
f = open ('ONCovidCases_DateRange.csv', 'w')
f.write ('start_date,end_date\n')

# note... the dates are slightly messed up.  The first entry (at 0) is
# after the second.  Also the first few sorted dates are either 12:00 or
# January first, which are both incorrect.  Hence the starting date was
# determined manually in pandas.
f.write (dates.iloc[1] + ',' + sortedDates.max() + '\n')

f.close ()


