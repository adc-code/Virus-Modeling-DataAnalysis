function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_NotResolvedAgePHUs.csv';

    var dataset, xScale, yScale, xAxis, yAxis;


    var colours = [ '#b31212', '#b37d12', '#7db312', '#12b312', '#12b37d', '#127db3', '#1212b3', '#7d12b3', '#b3127d' ]; 

    var DayTotals  = [ ];
    var BarLabels  = [ '< 20', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s' ];
    var ActiveData = [   true,  true,  true,  true,  true,  true,  true,  true,  true ];
    var DataIndex  = [      1,     3,     5,     7,     9,    11,    13,    15,    17 ];
 
    var TotalText = '<strong> Total </strong> <hr>';

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  30,
            bottom: 85,
            left:   40
    };

    var width  = 550 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;

    var updateDuration = 500;


    //
    // MakeTTHtml... make tool tip html... format the PHU data,
    // age group info, and date for the tool tip.
    //
    var MakeTTHtml = function (Date, AgeGroup, PHUData, Total)
    {
        var outputStr = '';               

        var PHUInfo = PHUData.split (';');

        outputStr += '<table width="100%"><tr>';
        outputStr += '<td>Age Group: <strong>' + AgeGroup + '</strong></td>';
        outputStr += '<td align="right">Date: <strong>' + Date.toDateString() + '</strong></td>';
        outputStr += '</tr></table>';
        outputStr += '<hr>';
        outputStr += '<table width="100%">';

        for (var i = 0; i < PHUInfo.length; i+=2)
        {
            outputStr += '<tr>';
            outputStr += '<td>' + PHUInfo[i]   + '</td>'
            outputStr += '<td align="right">' + PHUInfo[i+1] + '</td>'
            outputStr += '</tr>';
        }

        outputStr += '</table>'; 

        outputStr += '<hr>';

        outputStr += '<table width="100%">';
        outputStr += '<tr><td>Total:</td><td align="right">' + Total + '</td></tr>';
        outputStr += '</table>'; 

        // console.log (outputStr);

        return (outputStr);
    };


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);
        var timeZoneAdjustment = 1000*60*60*5; // in millisecs...

        return [  new Date (new Date (d['Date']).getTime() + timeZoneAdjustment), //  0
                  parseInt (d['<20']), d['<20PHUs'],                              //  1  2
                  parseInt (d['20s']), d['20sPHUs'],                              //  3  4
                  parseInt (d['30s']), d['30sPHUs'],                              //  5  6
                  parseInt (d['40s']), d['40sPHUs'],                              //  7  8
                  parseInt (d['50s']), d['50sPHUs'],                              //  9 10 
                  parseInt (d['60s']), d['60sPHUs'],                              // 11 12
                  parseInt (d['70s']), d['70sPHUs'],                              // 13 14
                  parseInt (d['80s']), d['80sPHUs'],                              // 15 16
                  parseInt (d['90+']), d['90+PHUs']                               // 17 18
        ];  
    }


    //
    // Used to compute the totals for each day
    // 
    var ComputeTotals = function ()
    {
        DayTotals = []; 

        for (var i = 0; i < dataset.length; i++)
        {
            var dayTotal = 0;

            for (var j = 0; j < 9; j++)
            {
                if (ActiveData[j] == true)
                    dayTotal += dataset[i][ DataIndex[j] ];
            }

            DayTotals.push (dayTotal);
        }
    };


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        console.log (data);            
        dataset = data;

        ComputeTotals ();          
        console.log (DayTotals);
        console.log (d3.max (DayTotals));

        for (var i = 0; i < 9; i++)
        {
            d3.select ('#btnID_' + i).style ('background-color', colours[i]);
            d3.select ('#btnID_' + i).style ('color', '#fff');
        }

        // Make the SVG
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, 14 ] )
                   .range ( [ 0, width ] );
                
        //var barWidth = xScale (dataset[1][0]) - xScale (dataset[0][0]);
        var barWidth = xScale (1) - xScale (0);

        // Define the scales to convert our data to screen coordinates
        yScale = d3.scaleLinear ()
                   .domain ( [ 0, d3.max(DayTotals) ])
                   .range ( [ height, 0 ] ); 

        var tickValues = [];
        for (var i = 0; i < dataset.length; i++)
            tickValues.push (i);
 
        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .tickValues ( tickValues )
                  .tickFormat ( function (d, i) { return dataset[i][0].toDateString(); });

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        // Create x axis..
        svg.append ('g')
           .attr ('class', 'axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis)
           .selectAll ('text')  
           .style ('text-anchor', 'start')
           .attr ('dx', '0.5em' )
           .attr ('dy', '-2.2em' ) 
           .attr ('transform', 'rotate(90)');

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space = 3;

        //for (var day = 0; day < dataset.length; i++)
        for (var day = 0; day < dataset.length; day++)
        {
            var yPos1 = 0;
            var yPos2 = 0;

            for (var i = 0; i < 9; i++)
            {
                var outputStr = MakeTTHtml (dataset[day][ 0 ], 
                                            BarLabels[i],
                                            dataset[day][ DataIndex[i]+1 ],
                                            dataset[day][ DataIndex[i] ] );
                           
                yPos1 += dataset[day][ DataIndex[i] ];

                svg.append ('rect')
                   .attr ('x', xScale (day) + space )
                   .attr ('y', yScale (yPos1) )
                   .attr ('width',  barWidth - 2*space )
                   .attr ('height', yScale(yPos2) - yScale (yPos1) )
                   .attr ('fill', colours[i] )
                   .attr ('id', 'rect_' + day + '_' + i)
                   .attr ('tt_text', outputStr)
                   .on ('mousemove', function(d)
                       {
                           var xPosition = d3.event.pageX; 
                           var yPosition = d3.mouse(this)[1] +20;

                           outputStr += d3.select(this).attr ('tt_text');
                           outputStr += '<hr>';

                           d3.select ('#tooltip')
                             .style ('left', xPosition + 'px')
                             .style ('top', yPosition + 'px')
                             .select ('#label').html ( d3.select(this).attr ('tt_text') ); 

                           d3.select ('#tooltip').classed ('hidden', false);
                       } )
                   .on ('mouseout', function(d) 
                       { 
                           // Remove the tooltip
                           d3.select ('#tooltip').classed ('hidden', true);
                       } ); 

                yPos2 += dataset[day][ DataIndex[i] ];
            }

            svg.append ('text')
               .attr ('x', xScale(day + 0.5) )
               .attr ('y', yScale (yPos1) - 4)
               .text ( DayTotals[day] )
               .attr ('font-family', 'sans-serif')
               .attr ('font-size', '11px')
               .attr ('fill', 'black')
               .attr ('text-anchor', 'middle')
               .attr ('id', 'label_' + day);
        }



        //
        // Callback to deal with the age group buttons
        //
        d3.selectAll ('.datatype').on ('click', function ()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            // deal with the UI first
            if (ActiveData[selBtnID] == true)
            {
                d3.select(this).style ('background-color', '#ccc');
                d3.select(this).style ('color', '#000');
            }
            else
            {
                d3.select(this).style ('background-color', colours[selBtnID]);
                d3.select(this).style ('color', '#fff');
            }
            ActiveData[selBtnID] = !ActiveData[selBtnID];

            // based on what age groups are selected compute the totals 
            // of each day
            ComputeTotals ();

            // adjust the y-axis scale
            var maxTotal = d3.max (DayTotals);
            if (maxTotal == 0)
                maxTotal = 1;

            yScale.domain ( [ 0, maxTotal ]);
            svg.select ('.y.axis')
               .transition ()
               .duration (updateDuration)
               .call (yAxis);

            // Finally adjust the size of each rectangle for each day and
            // and the label...
            for (var day = 0; day < 14; day++)
            {
                var yPos1 = 0;
                var yPos2 = 0;

                for (var i = 0; i < 9; i++)
                {
                    if (ActiveData[i] == true)
                        yPos1 += dataset[day][ DataIndex[i] ];

                    d3.select ('#rect_' + day + '_' + i)
                      .transition ()
                      .duration (updateDuration)
                      .attr ('y', yScale (yPos1) )
                      .attr ('height', yScale(yPos2) - yScale (yPos1) );

                    if (ActiveData[i] == true)
                        yPos2 += dataset[day][ DataIndex[i] ];
                }

                d3.select ('#label_' + day)
                  .transition ()
                  .duration (updateDuration)
                  .attr ('y', yScale (DayTotals[day]) - 4)
                  .text ( DayTotals[day] );
            }

        } );

    } )

}



