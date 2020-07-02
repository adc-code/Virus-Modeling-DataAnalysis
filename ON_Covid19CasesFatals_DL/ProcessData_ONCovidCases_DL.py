# load CSV data...

import pandas as pd

# datafiles... downloaded separately
DataFileCases = 'CANCovidData_Cases.csv'
DataFileFatal = 'CANCovidData_Fatal.csv'

# read in the data
df_CanCovidCases = pd.read_csv (DataFileCases)
df_CanCovidFatal = pd.read_csv (DataFileFatal)

# get just the ontario cases...
df_OntCovidCases = df_CanCovidCases[df_CanCovidCases['province'] == 'Ontario']
df_OntCovidFatal = df_CanCovidFatal[df_CanCovidFatal['province'] == 'Ontario']

# uncomment for testing...
# display (df_OntCovidCases)
# display (df_OntCovidFatal)

# need to convert the date format to YYYY-MM-DD
cleanDatesCases = []
dateCaseList = list(df_OntCovidCases['date_report'].unique())
for date in dateCaseList:
    
    dateElems = date.split('-')
    dateElems.reverse()
    cleanDatesCases.append ('-'.join(dateElems))
    
dateCaseList = cleanDatesCases

cleanDatesFatal = []
dateFatalList = list(df_OntCovidFatal['date_death_report'].unique())
for date in dateFatalList:
    
    dateElems = date.split('-')
    dateElems.reverse()
    cleanDatesFatal.append ('-'.join(dateElems))
    
dateFatalList = cleanDatesFatal


# initialize dictionaries to store data... daily cases, cumulative, and the derivative
resultsCasesDay = {}
resultsCasesCum = {}
resultsCasesDer = {}

# assign the date values...
resultsCasesDay['Dates'] = dateCaseList
resultsCasesCum['Dates'] = dateCaseList
resultsCasesDer['Dates'] = dateCaseList

# get the list of health regions...
HRCasesList = df_OntCovidCases['health_region'].unique()

# go through all the health regions and either get the data or compute the derivative
for HR in HRCasesList:
    
    HR_DF = df_OntCovidCases[df_OntCovidCases['health_region'] == HR]

    caseList = list (HR_DF['cases'])
    resultsCasesDay[HR] = caseList
    
    cumCasesList = list (HR_DF['cumulative_cases'])
    resultsCasesCum[HR] = cumCasesList  
    
    # Make a copy of the cumulative case list, and pad the beginning and end with
    # appropriate copies so that the moving average can be found for each element in
    # the original list
    tmpCases = cumCasesList.copy ()
    tmpCases.insert (0, cumCasesList[0])
    tmpCases.insert (0, cumCasesList[0])
    tmpCases.append (cumCasesList[-1])
    tmpCases.append (cumCasesList[-1])

    # calculate the moving average for each element 
    MA = []
    for i in range (2, len(tmpCases) - 2):
        MA.append ( (tmpCases[i-2] + tmpCases[i-1]  \
                                   + tmpCases[i] +  \
                     tmpCases[i+1] + tmpCases[i+2] ) / 5 )
        
    # pad the moving average array so the derivative can be found for each element
    MA.insert (0, MA[0])
    MA.append (MA[-1])
   
    # finally compute the first derivative 
    firstDer = []    
    for i in range(1, len(MA)-1):
        firstDer.append ( (MA[i+1] - MA[i-1]) / 2 ) 
        
    resultsCasesDer[HR] = firstDer
    
    
# Finally make dataframes for the values just found/computed.  Note that types
# are assigned so that values can be separated during visualization.

resultsCasesCumDF = pd.DataFrame.from_dict (resultsCasesCum)
resultsCasesCumDF['Type'] = 1

resultsCasesDayDF = pd.DataFrame.from_dict (resultsCasesDay)
resultsCasesDayDF['Type'] = 2

resultsCasesDerDF = pd.DataFrame.from_dict (resultsCasesDer)
resultsCasesDerDF['Type'] = 3



#
# Deaths Data file...
#

# Initialize some dictionaries for the results...
resultsFatalDay = {}
resultsFatalCum = {}
resultsFatalDer = {}

# Assign the dates... note that these dates can be different compared to the
# case date list
resultsFatalDay['Dates'] = dateFatalList
resultsFatalCum['Dates'] = dateFatalList
resultsFatalDer['Dates'] = dateFatalList


# get the list of health regions...
HRDeathsList = df_OntCovidFatal['health_region'].unique()

# uncomment for debugging...
# print (HRDeathsList)

# In order to concatenate the dataframes later, be need to add fields for 
# items that do not exist in the case data set.  If we don't do this we will get
# NAs... which we don't like.
for HR in HRCasesList:
    if HR not in HRDeathsList:
        resultsFatalDay[HR] = 0
        resultsFatalCum[HR] = 0
        resultsFatalDer[HR] = 0
        

# go through all the health regions and either get the data or compute the derivative
for HR in HRDeathsList:
    
    HR_DF = df_OntCovidFatal[df_OntCovidFatal['health_region'] == HR]

    deathList = list(HR_DF['deaths'])
    resultsFatalDay[HR] = deathList
    
    cumDeathList = list(HR_DF['cumulative_deaths'])
    resultsFatalCum[HR] = cumDeathList
   
    # uncomment for debugging 
    # print ('cumDeathList', cumDeathList[-1])
    
    # make a copy of the cumulative deaths and then pad the front and back so that
    # the moving average can be determined for each element
    tmpCases = cumDeathList.copy ()
    tmpCases.insert (0, cumDeathList[0])
    tmpCases.insert (0, cumDeathList[0])
    tmpCases.append (cumDeathList[-1])
    tmpCases.append (cumDeathList[-1])

    # compute the moving average
    MA = []
    for i in range (2, len(tmpCases) - 2):
        MA.append ( (tmpCases[i-2] + tmpCases[i-1]  \
                                   + tmpCases[i] +  \
                     tmpCases[i+1] + tmpCases[i+2] ) / 5 )
        
    # pad the moving average array so that the first derivative can be calculated for all
    # elements in the list
    MA.insert (0, MA[0])
    MA.append (MA[-1])
   
    # finally compute the first derivative 
    firstDer = []    
    for i in range(1, len(MA)-1):
        firstDer.append ( (MA[i+1] - MA[i-1]) / 2 ) 
        
    resultsFatalDer[HR] = firstDer
    

# make dataframes of all the results, and label then with the type.
resultsFatalCumDF = pd.DataFrame.from_dict (resultsFatalCum)
resultsFatalCumDF['Type'] = 4

resultsFatalDayDF = pd.DataFrame.from_dict (resultsFatalDay)
resultsFatalDayDF['Type'] = 5

resultsFatalDerDF = pd.DataFrame.from_dict (resultsFatalDer)
resultsFatalDerDF['Type'] = 6


# combine the all the dataframes... so we have one big dataframe of all the data
frames = [resultsCasesCumDF, resultsCasesDayDF, resultsCasesDerDF, \
          resultsFatalCumDF, resultsFatalDayDF, resultsFatalDerDF ]

finalResultsDF = pd.concat (frames, sort=True)

# uncomment for testing...
# display (finalResultsDF)

# write to CSV
finalResultsDF.to_csv ('ONCovidCases_PHUDailyChanges.csv', index=False)


