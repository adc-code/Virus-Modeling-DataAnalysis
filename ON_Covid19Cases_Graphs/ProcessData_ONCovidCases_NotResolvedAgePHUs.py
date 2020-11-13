import pandas as pd
import numpy as np


DataFile    = 'ONTCovidCases.csv'
df_ONTCovidCases = pd.read_csv (DataFile)

# get the age groups... note that we remove the unknown group
ageGroups = df_ONTCovidCases['Age_Group'].unique()
ageGroupList = list (ageGroups)

# remove any unwanted stuff from the age group list
ageGroupList = [x for x in ageGroupList if str(x) != 'nan']
ageGroupList.remove ('UNKNOWN')

# make a dataframe for the not resolved group
NotResolvedDF = df_ONTCovidCases[df_ONTCovidCases['Outcome1'] == 'Not Resolved']

# get the dates and sort them...
dates = list (NotResolvedDF['Accurate_Episode_Date'].unique())
dates = [x for x in dates if str(x) != 'nan']
dates.sort ()

# get the last elements
lastDates = dates [-14:]


# open our file...
f = open ('ONCovidCases_NotResolvedAgePHUs.csv', 'w')

# get the column names...
columnNamesStr = 'Date,'

for age in ageGroupList:
    columnNamesStr += age + ','
    columnNamesStr += age + 'PHUs,'

columnNamesStr = columnNamesStr[:-1]    


# uncomment for debugging
# print (columnNamesStr)

f.write (columnNamesStr + '\n')


# go through all the dates and get the age group members and the PHUs that
# they belong to...
for day in lastDates:
    dayDF = NotResolvedDF[NotResolvedDF['Accurate_Episode_Date'] == day]
    
    outputStr = day + ',';
    for age in ageGroupList:
      
        # get the members for a particular age group  
        ageDayDF = dayDF[dayDF['Age_Group'] == age]

        outputStr += str(ageDayDF.shape[0]) + ','

        # have all the PHU info for an age group in one string... then in the
        # visualization we can process this to make a tooltip out of it       
        PHUAmounts = ''

        # get all the PHUs and the counts for the current age group 
        PHUs = ageDayDF['Reporting_PHU'].value_counts()
        for PHUs in PHUs.iteritems():
            PHUName = PHUs[0]
            PHUName = PHUName.replace (',', '')
            
            PHUAmounts += PHUName + ';'
            PHUAmounts += str(PHUs[1]) + ';'
            
        # drop the last ';' 
        PHUAmounts = PHUAmounts[:-1]
        outputStr += PHUAmounts + ','
   
    # uncomment for debugging 
    # print (outputStr)

    # write this to a file...
    f.write (outputStr + '\n')
    
# close the file
f.close ()



