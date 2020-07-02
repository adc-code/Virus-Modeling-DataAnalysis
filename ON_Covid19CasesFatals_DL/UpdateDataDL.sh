#!/bin/bash

echo
echo "Getting Data..."
echo

curl https://raw.githubusercontent.com/ishaberry/Covid19Canada/master/timeseries_hr/cases_timeseries_hr.csv > CANCovidData_Cases.csv
curl https://raw.githubusercontent.com/ishaberry/Covid19Canada/master/timeseries_hr/mortality_timeseries_hr.csv > CANCovidData_Fatal.csv


echo 
echo "Last 5 lines from each file..."
echo

tail -n 5 CANCovidData_Cases.csv
tail -n 5 CANCovidData_Fatal.csv


echo 
echo "Running... python ProcessData_ONCovidCases_DL.py"
echo 
python ProcessData_ONCovidCases_DL.py 


