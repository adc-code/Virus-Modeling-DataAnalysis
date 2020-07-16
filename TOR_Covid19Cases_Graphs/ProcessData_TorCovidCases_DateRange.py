import numpy  as np 
import pandas as pd

# load the data...
TorCaseData = pd.read_csv ('TorCovidCases.csv')

f = open ('TorCovidCases_DateRange.csv', 'w')
f.write ('start_date,end_date\n')

# uncomment for debugging
# print (min(TorCaseData['Episode Date']), '   ', max(TorCaseData['Episode Date']))

f.write (min(TorCaseData['Episode Date']) + ',' + max(TorCaseData['Episode Date']) + '\n')
f.close ()


