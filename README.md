# Virus Modelling and Data Analysis

This project is for me to keep track of Covid-19 cases primarily in Ontario and the Toronto region.  Its main purpose is:
..* to analyse reported data in slightly more depth than the newspapers and major website currently do
..* to help explain certain ideas/concepts to friends and family
..* keep writing code, keep solving problems, perhaps learn some new techniques (such as with visualization with D3) 

Overall, the two main sections are: **Modelling** and **Data Analysis and Visualization**

**Note:** I am not an epidemiologist, so everything is purely for my entertainment. 


### Modelling 

The SIR and SEIR models were used since they both explain the basic behaviour of Covid 19.  Implementations were done in MatLab, Python and Javascript (using D3 for visualization).  

The Javascript and D3 model implementations can be interacted with here:
..* [SIR Model in JS+D3](http://a-d-c.ca/?p=243)
..* [SEIR Model in JS+D3](http://a-d-c.ca/?p=410)

Also, an example using the SIR model to illustrate how the basic reproduction number can be impacted is available [here](http://a-d-c.ca/?p=390).


### Data Analysis and Visualization

This repository also contains code to analyze various Covid-19 datasets from various government websites, including:
..* Ontario Government case and status data
..* Toronto Public Health Unit data
..* The Dana Lana School of Public Health at the University of Toronto

Data was processed from the various sources using a set of Python scripts which was then used with several interactive web-based visualizations (that were written in Javascript and D3).  These include:
..* [Ontario Covid Case Data](http://a-d-c.ca/?p=456)
..* [Ontario Covid Status Data](http://a-d-c.ca/?p=599)
..* [Additional Analysis of the Ontario Data](http://a-d-c.ca/?p=633)
..* [Map of Covid Status in Ontario](http://a-d-c.ca/?p=719)
..* [Another Map of Covid Status in Ontario](http://a-d-c.ca/?p=761)
..* [Toronto Covid Data](http://a-d-c.ca/?p=819)


## Future Work

Depending on work with other priorities and how long covid-19 lasts, additional projects will be added in.  This includes fitting data to various models and possibly having maps to track world and Canada case data.
