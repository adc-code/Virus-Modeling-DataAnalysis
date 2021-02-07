function D3SVGApp ()
{
    // The data...
    var dataFile = 'Covid19Testing_ON_Overview.csv';
                   
    // UI state
    var maxValues   = [];
    var rangeValues = [];
    var colGroupID  = [ -2,    // Reported Date

                         1,    // Confirmed Positive
                         1,    // Resolved
                         1,    // Deaths
                         1,    // Total Cases
                         1,    // Total tests completed in the last day
                         1,    // Under Investigation

                         2,    // Number of patients hospitalized with COVID-19
                         2,    // Number of patients in ICU with COVID-19
                         2,    // Number of patients in ICU on a ventilator with COVID-19
 
                         3,    // Total Positive LTC Resident Cases
                         3,    // Total Positive LTC HCW Cases
                         3,    // Total LTC Resident Deaths
                         3 ];  // Total LTC HCW Deaths


    var currGroup   = 1;

    var colours        = [ '#0088cc', '#cc3300', '#009900', '#cc0066', '#9900cc', '#7a7a52' ];
    var coloursFocused = [ '#006699', '#992600', '#006600', '#99004d', '#730099', '#5c5c3d' ];
    var colours     = d3.schemeCategory10;

    var d3Lines = [];


    // SVG Width, height, and some added spacing
    var w         = 550;
    var h         = 350;
    var padding   =  65;

    // Empty, for now
    var dataset, xScale, yScale;


    var updateDuration = 500;  
    var stepCurveTol   = 350;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        return {
            // Note that we need to convert to the correct timezone
            date:            new Date (new Date (d['Reported Date']).getTime() + 1000*60*60*5),
            confirmedPos:    parseInt (d['Confirmed Positive']),
            resolved:        parseInt (d['Resolved']),
            deaths:          parseInt (d['Deaths']),
            totalCases:      parseInt (d['Total Cases']),
            totalCompleted:  parseInt (d['Total tests completed in the last day']),
            underInvest:     parseInt (d['Under Investigation']),
            numHosp:         parseInt (d['Number of patients hospitalized with COVID-19']),
            numHospICU:      parseInt (d['Number of patients in ICU with COVID-19']),
            numHospICUVent:  parseInt (d['Number of patients in ICU on a ventilator with COVID-19']),
            numLTCResCases:  parseInt (d['Total Positive LTC Resident Cases']),
            numLTCHCWCases:  parseInt (d['Total Positive LTC HCW Cases']),
            numLTCResDeaths: parseInt (d['Total LTC Resident Deaths']),
            numLTCHCWDeaths: parseInt (d['Total LTC HCW Deaths'])
        };

    };
       

    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        // Print data to console as table, for verification
        // console.table (data);

        // Executed once the CSV has been read in...
        dataset = data;

        //
        // Get the Max values for each data element
        //
        maxValues_Cases = [];
        maxValues_Hosp  = [];
        maxValues_LTC   = [];

        maxValues_Cases.push ( d3.max(dataset, function(d) { return d.confirmedPos;   }) );
        maxValues_Cases.push ( d3.max(dataset, function(d) { return d.resolved;       }) );
        maxValues_Cases.push ( d3.max(dataset, function(d) { return d.deaths;         }) );
        maxValues_Cases.push ( d3.max(dataset, function(d) { return d.totalCases;     }) );
        maxValues_Cases.push ( d3.max(dataset, function(d) { return d.totalCompleted; }) );
        maxValues_Cases.push ( d3.max(dataset, function(d) { return d.underInvest;    }) );

        maxValues_Hosp.push ( d3.max(dataset, function(d) { return d.numHosp;         }) );
        maxValues_Hosp.push ( d3.max(dataset, function(d) { return d.numHospICU;      }) );
        maxValues_Hosp.push ( d3.max(dataset, function(d) { return d.numHospICUVent;  }) );

        maxValues_LTC.push ( d3.max(dataset, function(d) { return d.numLTCResCases;   }) );
        maxValues_LTC.push ( d3.max(dataset, function(d) { return d.numLTCHCWCases;   }) );
        maxValues_LTC.push ( d3.max(dataset, function(d) { return d.numLTCResDeaths;  }) );
        maxValues_LTC.push ( d3.max(dataset, function(d) { return d.numLTCHCWDeaths;  }) );

        maxValues = [ maxValues_Cases, maxValues_Hosp, maxValues_LTC ];

        // Note that the 0, 46, and 93 might seem a bit strange but they are just offsets from where
        // the data has meaning.  The first set of data starts from the beginning (hence 0 offset),
        // the second with hospitalization started being reported 46 days later, and the final set
        // related to long term care centres was reported from 93 days later.
        rangeValues = [ [ dataset[ 0].date, dataset[dataset.length - 1].date ], 
                        [ dataset[46].date, dataset[dataset.length - 1].date ], 
                        [ dataset[93].date, dataset[dataset.length - 1].date ]  ];

        // 
        // Make UI buttons from the columns...
        // 
        var groupCount = [0, 0, 0, 0];

        var colNames = dataset ['columns'];
        for (var i = 0; i < colNames.length; i++)
        {
            // console.log (colNames[i]);

            // skip cols we don't want to deal with
            if (colGroupID [i] < 0)
                continue;

            // Make a new div and add the column name to it
            var newDiv     = document.createElement ('div'); 
            var newPara    = document.createElement ('p'); 
            var newContent = document.createTextNode (colNames[i]); 
                    
            // Specify class names, attributes, styles...
            newDiv.className = 'buttons lineBtn';
            newDiv.classList.add ('linegrp_' + colGroupID [i]);
            newDiv.setAttribute ('linenum', groupCount [ colGroupID[i] ] );

            newDiv.setAttribute ('state', 1 );
            newDiv.style.backgroundColor = colours [ groupCount[colGroupID[i]] ];

            newDiv.setAttribute ('grp',  colGroupID [i]);

            newPara.appendChild (newContent);
            newDiv.appendChild (newPara);

            // Increment the group counter...
            groupCount [ colGroupID[i] ] = groupCount [ colGroupID[i] ] + 1;               

            // If it is the current group, the show it, otherwise hide the elements...
            if ( colGroupID[i] == currGroup)
            {
                newDiv.classList.add ('visible')
                var currentDiv = document.getElementById ('controls').appendChild (newDiv);
            }
            else
            {
                newDiv.classList.add ('hidden')
                var currentDiv = document.getElementById ('hiddenControls').appendChild (newDiv);
            }

        } // for i in colNames...

        //
        // Make the table below
        //
        for (var i = 0; i < colNames.length; i++)
        {
            // console.log (colNames[i]);

            if (colGroupID[i] == -1)
                continue;

            var newContDiv = document.createElement ('div'); 
            newContDiv.className = 'queryData';
            newContDiv.classList.add ('qd_grp_' + colGroupID [i]);

            var labelDiv     = document.createElement ('div'); 
            var labelContent = document.createTextNode (colNames[i] + ': '); 
            labelDiv.appendChild (labelContent);
            labelDiv.className = 'queryLabel';

            var outputDiv     = document.createElement ('div'); 
            var outputContent = document.createTextNode ('0');
            outputDiv.appendChild (outputContent);

            outputDiv.className = 'queryOutput';
            if (i == 0)
                outputDiv.id = 'OutDate';
            else
                outputDiv.id = 'Out_' + colGroupID[i] + '_' + (i-1);

            outputDiv.setAttribute ('num', i-1);

            //newLabel.setAttribute ('num', i-1);
            newContDiv.appendChild (labelDiv);
            newContDiv.appendChild (outputDiv);

            //var currentDiv = document.getElementById ('values').appendChild (newContDiv); 
            // If it is the current group, the show it, otherwise hide the elements...
            if ( colGroupID[i] == currGroup || colGroupID[i] == -2 )
            {
                newContDiv.classList.add ('visible')
                var currentDiv = document.getElementById ('values').appendChild (newContDiv);
            }
            else
            {
                newContDiv.classList.add ('hidden')
                var currentDiv = document.getElementById ('hiddenControls').appendChild (newContDiv);
            }
        }

        // Note that some things might have been disabled by default.  Remove them from the max values list
        var tmpMax = [ 0 ]; 
        d3.selectAll ('.linegrp_' + (currGroup))
          .each ( function (d, i)
          {
              if (d3.select(this).node().getAttribute ('state') == 1)
                  tmpMax.push (maxValues[currGroup-1][i]);
          } );

        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleTime ()
                   .domain ( rangeValues [currGroup-1] )
                   .range ( [padding, w - 13] );                

        yScale = d3.scaleLinear ()
                   //.domain ( [0, d3.max ( maxValues[currGroup-1] ) ] )
                   .domain ( [0, d3.max ( tmpMax ) ] )
                   .range ( [h - padding, padding/2] );

        // Define X axis
        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10)
                  .tickFormat ( d3.timeFormat ('%b %Y') );

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        // Create SVG element
        var svg = d3.select ('#graph')
                    .append ('svg')
                    .attr ('width', w - 10)   // XXX
                    .attr ('height', h - padding/2 + 20);

        svg.append ('clipPath')
           .attr ('id', 'graphArea')
           .append ('rect')
           .attr ('x', 65)
           .attr ('y', -65)
           .attr ('width', w+2)
           .attr ('height', h+2);

        // Create axes..
        svg.append ('g')
           .attr ('class', 'x axis')
           .attr ('transform', 'translate(0,' + (h - padding) + ')')
           .call (xAxis)
           .selectAll ('text')  
           .style ('text-anchor', 'end')
           .attr ('dx', '-1em')
           .attr ('dy', '-0.55em')
           .attr ('transform', 'rotate(-90)');

        svg.append ('g')
           .attr ('class', 'y axis')
           .attr ('transform', 'translate(' + padding + ',0)')
           .call (yAxis); 

        var d3Lines_Cases = [];
        var d3Lines_Hosp  = [];
        var d3Lines_LTC   = [];

        d3Lines_Cases.push (d3.line ()
                              .x (function(d) { return xScale (d.date);           })
                              .y (function(d) { return yScale (d.confirmedPos);   }) );

        d3Lines_Cases.push (d3.line ()
                              .x (function(d) { return xScale (d.date);           })
                              .y (function(d) { return yScale (d.resolved);       }) );

        d3Lines_Cases.push (d3.line ()
                              .x (function(d) { return xScale (d.date);           })
                              .y (function(d) { return yScale (d.deaths);         }) );

        d3Lines_Cases.push (d3.line ()
                              .x (function(d) { return xScale (d.date);           })
                              .y (function(d) { return yScale (d.totalCases);     }) );

        d3Lines_Cases.push (d3.line ()
                              .x (function(d) { return xScale (d.date);           })
                              .y (function(d) { return yScale (d.totalCompleted); }) );

        d3Lines_Cases.push (d3.line ()
                              .x (function(d) { return xScale (d.date);           })
                              .y (function(d) { return yScale (d.underInvest);    }) );


        d3Lines_Hosp.push (d3.line ()
                             .x (function(d) { if (d.date < rangeValues[1][0])
                                                   return xScale (rangeValues[1][0]);
                                               else 
                                                   return xScale (d.date);       })
                             .y (function(d) { if (d.date < rangeValues[1][0]) 
                                                   return yScale (0);
                                               else
                                                   return yScale (d.numHosp);    }) );

        d3Lines_Hosp.push (d3.line ()
                             .x (function(d) { if (d.date < rangeValues[1][0])
                                                   return xScale (rangeValues[1][0]); 
                                               else
                                                   return xScale (d.date);       })
                             .y (function(d) { if (d.date < rangeValues[1][0])
                                                   return yScale (0);
                                               else
                                                   return yScale (d.numHospICU); }) );

        d3Lines_Hosp.push (d3.line ()
                             .x (function(d) { if (d.date < rangeValues[1][0])
                                                   return xScale (rangeValues[1][0]);
                                               else
                                                   return xScale (d.date);       })
                             .y (function(d) { if (d.date < rangeValues[1][0])
                                                   return yScale (0);
                                               else
                                                   return yScale (d.numHospICUVent); }) );


        d3Lines_LTC.push (d3.line ()
                            .x (function(d) { if (d.date < rangeValues[2][0])
                                                  return xScale (rangeValues[2][0]);
                                              else 
                                                  return xScale (d.date);       })
                            .y (function(d) { if (d.date < rangeValues[2][0])
                                                  return yScale (0);
                                              else
                                                  return yScale (d.numLTCResCases); }) );

        d3Lines_LTC.push (d3.line ()
                            .x (function(d) { if (d.date < rangeValues[2][0])
                                                  return xScale (rangeValues[2][0]); 
                                              else
                                                  return xScale (d.date);       })
                            .y (function(d) { if (d.date < rangeValues[2][0])
                                                  return yScale (0);
                                              else
                                                  return yScale (d.numLTCHCWCases); }) );

        d3Lines_LTC.push (d3.line ()
                            .x (function(d) { if (d.date < rangeValues[2][0])
                                                  return xScale (rangeValues[2][0]); 
                                              else
                                                  return xScale (d.date);           })
                            .y (function(d) { if (d.date < rangeValues[2][0])
                                                  return yScale (0);
                                              else
                                                  return yScale (d.numLTCResDeaths);}) );

        d3Lines_LTC.push (d3.line ()
                            .x (function(d) { if (d.date < rangeValues[2][0])   
                                                  return xScale (rangeValues[2][0]);
                                              else
                                                  return xScale (d.date);           })
                            .y (function(d) { if (d.date < rangeValues[2][0])
                                                  return yScale (0);
                                              else
                                                  return yScale (d.numLTCHCWDeaths);}).curve (d3.curveStepAfter) );

        d3Lines = [ d3Lines_Cases, d3Lines_Hosp, d3Lines_LTC ];

        var queryLine = d3.line ()
                          .x (function(d) { return xScale (d.t); })
                          .y (function(d) { return d.y;          });

        var queryLineY = d3.line ()
                          .x (function(d) { return xScale (d.t); })
                          .y (function(d) { return d.y;          });


        // Make many paths...
        for (var i = 0; i < d3Lines.length; i++)
        {
            for (var j = 0; j < d3Lines[i].length; j++)
            {
                // console.log ('Adding path for line #' + j + ' of group #' + i); 

                var opacity = 0;
                if ( (i+1) == currGroup )
                    opacity = 1;

                var newPath = svg.append ('path')
                                 .datum (dataset)
                                 .attr ('class', 'line grp_' + (i+1) )
                                 .attr ('id', 'line_' + i + '_' + j )
                                 .attr ('clip-path', 'url(#graphArea)')
                                 .attr ('stroke', colours [j] )
                                 .style ('opacity', opacity )
                                 .attr ('d', d3Lines[i][j] );

                var totalLength = newPath.node().getTotalLength();
                //console.log (totalLength);

                if ( totalLength > stepCurveTol )
                    d3Lines[i][j].curve (d3.curveMonotoneX);
                else
                    d3Lines[i][j].curve (d3.curveStepAfter);
            }
        }

        // Add the query lines...
        svg.append ('path')
           .datum ( [ { t: dataset[0].date, y: h-padding }, { t: dataset[0].date, y: padding/2} ] )
           .attr ('class', 'queryLine')
           .attr ('stroke', '#333333')
           .attr ('d', queryLine);

        svg.append ('path')
           .datum ( [ { t: dataset[0].date, y: yScale(0) }, { t: dataset[dataset.length-1].date, y: yScale(0) } ] )
           .attr ('class', 'queryLineY')
           .attr ('stroke', '#333333')
           .attr ('d', queryLineY);

        // Make an empty rectangle to handle mouse move events...
        svg.append ('rect') 
           .attr ('width', w)     
           .attr ('height', h)   
           .style ('fill', 'none')                 
           .style ('pointer-events', 'all')       
           .on ('mousemove', mousemove);

        // Add the title...
        svg.append ('text')
           .attr ('x', w/2)
           .attr ('y', padding/4)
           .text ( dataset[0].date.toDateString() + ' to ' + dataset[dataset.length - 1].date.toDateString() )
           .attr ('class', 'title');


        // 
        // dataset buttons callback
        //
        d3.selectAll ('.datasetBtn').on ('click', function()
        {
            // console.log ('datasetBtn CB'); 

            var selGroup = +d3.select(this).node().getAttribute ('datagroup');
            if (selGroup != currGroup)
            {
                // Change the colour by changing the class
                d3.selectAll ('.datasetBtn').classed ('datasetBtnSel', false);
                d3.select(this).node().classList.add ('datasetBtnSel');

                // Hide/Show the line buttons
                var current = d3.selectAll ('.linegrp_' + currGroup)
                current.classed ('hidden',  true);
                current.classed ('visible', false);

                var target = d3.select ('#hiddenControls');
                current.each (function() { target.append(() => this); });

                var selected = d3.selectAll ('.linegrp_' + selGroup);
                var target = d3.select ('#controls');
                selected.each (function() { target.append(() => this); });

                selected.classed ('visible', true); 
                selected.classed ('hidden', false);

                // Hide/show the query data
                var current = d3.selectAll ('.qd_grp_' + currGroup)
                current.classed ('hidden',  true);
                current.classed ('visible', false);

                var target = d3.select ('#hiddenControls');
                current.each (function() { target.append(() => this); });

                var selected = d3.selectAll ('.qd_grp_' + selGroup);
                var target = d3.select ('#values');
                selected.each (function() { target.append(() => this); });

                selected.classed ('visible', true);
                selected.classed ('hidden', false);


                // Update line opacity and line data so it uses the new scale
                d3.selectAll ('.grp_' + currGroup)
                  .transition ()
                  .duration (updateDuration)
                  .style ('opacity', 0);

                d3.selectAll ('.grp_' + selGroup)
                  .transition ()
                  .duration (updateDuration)
                  .style ('opacity', 1);

                var tmpMax = [ 0 ];
                var vizState = [];
                d3.selectAll ('.linegrp_' + selGroup)
                  .each ( function (d, i) 
                  {
                      var state = +d3.select(this).node().getAttribute ('state');
                      vizState.push (state);

                      if (state == 1)
                          tmpMax.push (maxValues [selGroup-1][i]);
                  } ); 
                        
                // update the scales
                // xScale.domain ( rangeValues [selGroup-1] );
                yScale.domain ( [0, d3.max (tmpMax) ] );

                // Update x and y axes
                svg.select ('.x.axis')
                   .transition ()
                   .duration (updateDuration)
                   .call (xAxis)
                   .selectAll ('text')  
                   .style ('text-anchor', 'end')
                   .attr ('dx', '-1em')
                   .attr ('dy', '-0.55em')
                   .attr ('transform', 'rotate(-90)');

                svg.select ('.y.axis')
                   .transition ()
                   .duration (updateDuration)
                   .call (yAxis);

                var vizState = [];
                d3.selectAll ('.linegrp_' + selGroup)
                .each ( function (d, i) 
                {
                    vizState.push (+d3.select(this).node().getAttribute ('state'));
                } ); 
                        
                for (var i = 0; i < d3Lines[selGroup-1].length; i++)
                { 
                    if (vizState[i] == 1)
                        d3.select ('#line_' + (selGroup-1)  + '_' + i)
                          .style ('opacity', 0)
                          .attr ('d', d3Lines[selGroup - 1][i](dataset) );
                    else
                        d3.select ('#line_' + (selGroup-1)  + '_' + i)
                          .transition ()
                          .duration (updateDuration)
                          .style ('opacity', 0);
                }

                // Update the current group
                currGroup = selGroup;
            }

        } ); // datasetBtn CB function



        //
        // Hide/Show line graphs...
        //
        d3.selectAll ('div.lineBtn').on ('click', function() 
        {
            var num   = +d3.select(this).node().getAttribute ('linenum');
            var grp   = +d3.select(this).node().getAttribute ('grp') - 1;
            var state = +d3.select(this).node().getAttribute ('state'); 

            //console.log (num + '   ' + grp + '   ' + state);

            // Change the UI
            if (state == 1)
            {
                // if shown... then hide it
                d3.select(this).node().style.backgroundColor = "#cccccc"; 
                d3.select(this).node().setAttribute ('state', 0);
            }
            else
            {
                // if hiden... then show it
                d3.select(this).node().style.backgroundColor = colours[num];
                d3.select(this).node().setAttribute ('state', 1);
            }

            // Show/hide the line
            d3.select ('#line_' + grp + '_' + num)
              .transition ()
              .duration (updateDuration)
              .style ('opacity', state ? 0.0 : 1.0);

            var tmpMax = [ 0 ];
            d3.selectAll ('.linegrp_' + (grp+1))
              .each ( function (d, i) 
              {
                  if (d3.select(this).node().getAttribute ('state') == 1)
                      tmpMax.push (maxValues[grp][i]);
              } );

            // adjust the scale
            yScale.domain ( [0, d3.max (tmpMax) ] );

            // Update y-axis
            svg.select ('.y.axis')
               .transition ()
               .duration (updateDuration)
               .call (yAxis);

            for (var i = 0; i < d3Lines[currGroup-1].length; i++)
            { 
                // console.log ('Updating... line_' + (selGroup-1) + '_' + i);
                d3.select ('#line_' + (currGroup-1)  + '_' + i)
                  .transition ()
                  .duration (updateDuration)
                  .delay (updateDuration)
                  .attr ('d', d3Lines[currGroup - 1][i](dataset) );
            }


        });  // lineBtn CB function


        //
        // LookUpDate : used to find the closest index in the dataset for a particular date
        //
        function LookUpDate (value, lowerIndex, upperIndex)
        {
            var midIndex = Math.round ( (upperIndex + lowerIndex) / 2 );

            // console.log (lowerIndex, upperIndex, midIndex);

            if ( value == dataset[midIndex].date )
                return midIndex;

            if ( midIndex == lowerIndex )
                return lowerIndex;
            else if ( upperIndex - midIndex <= 1 )
                return upperIndex;

            if (value >= dataset[lowerIndex].date && value <= dataset[midIndex].date)
            {
                return LookUpDate (value, lowerIndex, midIndex);
            }
            else
            {
                return LookUpDate (value, midIndex, upperIndex);
            }
        }


        //
        // mousemove callback function used for the query line
        //
        function mousemove () 
        {  
            var selectedDate = xScale.invert (d3.mouse(this)[0]);
            var selectedY = d3.mouse(this)[1];

            //console.log (selectedDate);
            //console.log (selectedY);

            var index = LookUpDate (selectedDate, 0, dataset.length-1);
            
            //if (selectedDate > rangeValues[currGroup-1][1])
            //    selectedDate = rangeValues[currGroup-1][1];

            if ( selectedY <= yScale.range()[0] && selectedY >= yScale.range()[1] )
            {
                var locData = [ {t: xScale.domain()[0], y: selectedY }, 
                                {t: xScale.domain()[1], y: selectedY  } ];
                svg.select ('.queryLineY').attr ('d', queryLineY (locData));
            }

            if ( selectedDate >= xScale.domain()[0] && selectedDate <= xScale.domain()[1] )
            {
                var locData = [ {t: selectedDate, y: h-padding }, {t: selectedDate, y: padding/2 } ];
                svg.select ('.queryLine').attr ('d', queryLine(locData));

                d3.selectAll ('#OutDate').html (dataset[index].date.toDateString());

                var vizState = [];
                d3.selectAll ('.linegrp_' + (currGroup))
                  .each ( function (d, i)
                  {   
                      vizState.push (+d3.select(this).node().getAttribute ('state'));
                  } );

                if (currGroup == 1)
                {
                    if (vizState[0])
                        d3.selectAll ('#Out_' + currGroup + '_0').html (dataset[index].confirmedPos);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_0').html ('-');

                    if (vizState[1])
                        d3.selectAll ('#Out_' + currGroup + '_1').html (dataset[index].resolved);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_1').html ('-');

                    if (vizState[2])
                        d3.selectAll ('#Out_' + currGroup + '_2').html (dataset[index].deaths);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_2').html ('-');

                    if (vizState[3])
                        d3.selectAll ('#Out_' + currGroup + '_3').html (dataset[index].totalCases);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_3').html ('-');

                    if (vizState[4])
                        d3.selectAll ('#Out_' + currGroup + '_4').html (dataset[index].totalCompleted);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_4').html ('-');

                    if (vizState[5])
                        d3.selectAll ('#Out_' + currGroup + '_5').html (dataset[index].underInvest);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_5').html ('-');
                }
                else if (currGroup == 2)
                {
                    if (vizState[0])
                        d3.selectAll ('#Out_' + currGroup + '_6').html (dataset[index].numHosp);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_6').html ('-');

                    if (vizState[1])
                        d3.selectAll ('#Out_' + currGroup + '_7').html (dataset[index].numHospICU);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_7').html ('-');

                    if (vizState[2])
                        d3.selectAll ('#Out_' + currGroup + '_8').html (dataset[index].numHospICUVent);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_8').html ('-');
                }
                else if (currGroup == 3)
                {
                    if (vizState[0])
                        d3.selectAll ('#Out_' + currGroup + '_9').html (dataset[index].numLTCResCases);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_9').html ('-');

                    if (vizState[1])
                        d3.selectAll ('#Out_' + currGroup + '_10').html (dataset[index].numLTCHCWCases);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_10').html ('-');

                    if (vizState[2])
                        d3.selectAll ('#Out_' + currGroup + '_11').html (dataset[index].numLTCResDeaths);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_11').html ('-');

                    if (vizState[3])
                        d3.selectAll ('#Out_' + currGroup + '_12').html (dataset[index].numLTCHCWDeaths);
                    else
                        d3.selectAll ('#Out_' + currGroup + '_12').html ('-');
                }

            } // if within limits

        } // function mousemove


        //
        // callback to handle the timeRangeList
        // 
        d3.selectAll ('#timeRangeList').on ('change', function() 
        {
            // 1 - All
            // 2 - Only 2020
            // 3 - Only 2021
            // 4 - Jan 2020 - Mar 2020 
            // 5 - Apr 2020 - Jun 2020
            // 6 - Jul 2020 - Sep 2020 
            // 7 - Oct 2020 - Dec 2020 
            // 8 - Jan 2021 - Mar 2021

            // console.log (this.value);

            var selectedValue = this.value; 

            // adjust the scale
            var newDomain = [ dataset[0].date, dataset[dataset.length-1].date ];
       
            if (selectedValue == 2)
                newDomain = [ new Date (2020, 0, 1), new Date (2021, 0, 1) ];
            else if (selectedValue == 3)
                newDomain = [ new Date (2021, 0, 1), new Date (2022, 0, 1) ];
            else if (selectedValue == 4)
                newDomain = [ new Date (2020, 0, 1), new Date (2020, 3, 1) ];
            else if (selectedValue == 5)
                newDomain = [ new Date (2020, 3, 1), new Date (2020, 6, 1) ];
            else if (selectedValue == 6)
                newDomain = [ new Date (2020, 6, 1), new Date (2020, 9, 1) ];
            else if (selectedValue == 7)
                newDomain = [ new Date (2020, 9, 1), new Date (2021, 0, 1) ];
            else if (selectedValue == 8)
                newDomain = [ new Date (2021, 0, 1), new Date (2021, 3, 1) ];

            var ticks = 12;
            if (selectedValue > 3)
                ticks = 4;

            xScale.domain ( newDomain );
            xAxis.ticks (ticks);

            // redraw graphs
            for (var i = 0; i < d3Lines[currGroup-1].length; i++)
            {
                // console.log ('Updating... line_' + (selGroup-1) + '_' + i);
                d3.select ('#line_' + (currGroup-1)  + '_' + i)
                  .transition ()
                  .duration (updateDuration)
                  //.delay (updateDuration)
                  .attr ('d', d3Lines[currGroup - 1][i](dataset) );
            }

            // Update x-axis
            svg.select ('.x.axis')
               .transition ()
               .duration (updateDuration)
               .call (xAxis) 
               .selectAll ('text')  
               .style ('text-anchor', 'end')
               .attr ('dx', '-1em')
               .attr ('dy', '-0.55em')
               .attr ('transform', 'rotate(-90)');

        } ); 

    }); // CSV read

}


