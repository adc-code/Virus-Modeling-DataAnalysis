import datetime
import pandas as pd
import numpy as np

# read the data file...
DataFile = 'ONTCovidCases.csv'
df_ONTCovidCases = pd.read_csv (DataFile)

REASONABLE_CUTOFF = 28


TestReportedDate = list (df_ONTCovidCases['Test_Reported_Date'])
CaseReportedDate = list (df_ONTCovidCases['Case_Reported_Date'])
SpecimenDate     = list (df_ONTCovidCases['Specimen_Date'])
AccurateEpisodeDate = list (df_ONTCovidCases['Accurate_Episode_Date'])


dayDiff = []
Case_DOW = [ 0, 0, 0, 0, 0, 0, 0 ]
Acc_DOW  = [ 0, 0, 0, 0, 0, 0, 0 ]
dayDiffDict = {}


# open our file...
f = open ('ONCovidCases_ReportingTimes.csv', 'w')

columnNamesStr = 'DataType,Value1,Value2'
f.write (columnNamesStr + '\n')


# find the differences...
totalOverall     = 0
totalCutOff      = 0
totalCutOffCount = 0


for i in range(len(CaseReportedDate)):

    # Skip over known bad data    
    if (AccurateEpisodeDate[i] == '2020-01-01'  or AccurateEpisodeDate[i] == '2020-01-10' or \
        AccurateEpisodeDate[i] == '12:00:00 AM' or AccurateEpisodeDate[i] != AccurateEpisodeDate[i]):
        continue
   

    # Find the delta... 
    d1 = datetime.datetime.strptime(CaseReportedDate[i], '%Y-%m-%d').date()
    d2 = datetime.datetime.strptime(AccurateEpisodeDate[i], '%Y-%m-%d').date()
    delta = abs(d1 - d2).days
    dayDiff.append (delta)

    # Keep track of the day of the week
    Case_DOW[d1.weekday()] = Case_DOW[d1.weekday()] + 1
    Acc_DOW[d2.weekday()]  = Acc_DOW[d2.weekday()]  + 1
    
    # keep track of the total so the average can be calculated
    totalOverall = totalOverall + delta

    if delta <= REASONABLE_CUTOFF:
        totalCutOff      = totalCutOff + delta
        totalCutOffCount = totalCutOffCount + 1;
     
    # count the number of days separately.   Again we are making a histogram
    if delta in dayDiffDict:   
        dayDiffDict[delta] = dayDiffDict[delta] + 1
    else:
        dayDiffDict[delta] = 1
 

# Compute the day of the week percentage for both the Case_Reported_Date and
# Accurate_Episode_Date dates...
PctCase_DOW = []
for dow in Case_DOW:
    PctCase_DOW.append (dow/len(CaseReportedDate) * 100)  

PctAcc_DOW = []
for dow in Acc_DOW:
    PctAcc_DOW.append (dow/len(CaseReportedDate) * 100)  


# Output the day difference dictionary 
for i in sorted (dayDiffDict.keys()) :
    # uncomment for testing  
    # print ('ReportedDateDiff,' + str(i) + ',' + str(dayDiffDict[i]))

    f.write ('ReportedDateDiff,' + str(i) + ',' + str(dayDiffDict[i]) + '\n')


# Output the day of the week information
# note: M = 0 T = 1 W = 2 Th = 3  F = 4  Sa = 5  Su = 6 
for i, j in enumerate (PctCase_DOW):
    #print ('CaseDoW_Pct', i, j)
    f.write ('CaseDoW_Pct,' + str(i) + ',' + str(j) + '\n')
    
for i, j in enumerate (PctAcc_DOW):
    #print ('AccDoW_Pct', i, j)
    f.write ('AccDoW_Pct,' + str(i) + ',' + str(j) + '\n')


# Output the NaN information    
# Uncomment for testing
# print ('Test_Reported_Date NaNs ', df_ONTCovidCases['Test_Reported_Date'].isnull().sum())
# print ('Case_Reported_Date NaNs ', df_ONTCovidCases['Case_Reported_Date'].isna().sum())
# print ('Specimen_Date NaNs ', df_ONTCovidCases['Specimen_Date'].isna().sum())
# print ('Accurate_Episode_Date NaNs ', df_ONTCovidCases['Accurate_Episode_Date'].isna().sum()) 

f.write ('Test_Reported_Date_NaNs,' + \
          str(df_ONTCovidCases['Test_Reported_Date'].isnull().sum()) + ',-1\n')

f.write ('Case_Reported_Date_NaNs,' + \
         str(df_ONTCovidCases['Case_Reported_Date'].isnull().sum()) + ',-1\n')

f.write ('Specimen_Date_NaNs,' + \
         str(df_ONTCovidCases['Specimen_Date'].isnull().sum()) + ',-1\n')

f.write ('Accurate_Episode_Date_NaNs,' + \
         str(df_ONTCovidCases['Accurate_Episode_Date'].isnull().sum()) + ',-1\n')


# Output the average difference information
# Uncomment for testing
# print ('Average Overall Diff ', totalOverall / len(CaseReportedDate))
# print ('Average Diff Excluded ', totalCutOff / totalCutOffCount)

f.write ('Average_Overall_Diff,' + \
         str(totalOverall / len(CaseReportedDate)) + ',-1\n')

f.write ('Average_Diff_Excluded,' + \
         str(totalCutOff / totalCutOffCount) + ',-1\n')


# close the file
f.close ()



