#!/bin/bash

# 
# Getting ON Covid-19 testing data...
#

curl https://data.ontario.ca/dataset/f4f86e54-872d-43f8-8a86-3892fd3cb5e6/resource/ed270bb8-340b-41f9-a7c6-e8ef587e6d11/download/covidtesting.csv > ONTCovidTesting.csv


#
# Getting ON Covid-19 status data...
#

curl https://data.ontario.ca/dataset/f4112442-bdc8-45d2-be3c-12efae72fb27/resource/455fd63b-603d-4608-8216-7d8647f43350/download/conposcovidloc.csv > ONTCovidCases.csv


echo
echo

echo "Running: ProcessData_ONCovidTesting_Overview.py..."
python ProcessData_ONCovidTesting_Overview.py

echo "Running: ProcessData_ONCovidCases_DateRange.py..."
python ProcessData_ONCovidCases_DateRange.py

echo "Running: ProcessData_ONCovidCases_AgeData.py..."
python ProcessData_ONCovidCases_AgeData.py

echo "Running: ProcessData_ONCovidCases_DeathRates.py..."
python ProcessData_ONCovidCases_DeathRates.py

echo "Running: ProcessData_ONCovidCases_GenderOutcomes.py..."
python ProcessData_ONCovidCases_GenderOutcomes.py

echo "Running: ProcessData_ONCovidCases_PHUOutcomes.py..."
python ProcessData_ONCovidCases_PHUOutcomes.py

echo "Running: ProcessData_ONCovidCases_PHUAgeOutcomes.py..."
python ProcessData_ONCovidCases_PHUAgeOutcomes.py

echo "Running: ProcessData_ONCovidCases_NotResolvedAgePHUs.py..."
python ProcessData_ONCovidCases_NotResolvedAgePHUs.py

echo "Running: ProcessData_ONCovidCases_NotResolvedCounts.py..."
python ProcessData_ONCovidCases_NotResolvedCounts.py


echo
echo

echo "Last Lines..."
tail -n 5 ONTCovidTesting.csv

echo
echo

tail -n 5 ONTCovidCases.csv

 
