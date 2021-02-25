function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_ReportingTimes.csv';

    const ACCURATE_EPISODE_DATE = 0;
    const CASE_REPORTED_DATE    = 1;
                           
    var dataset, xScale, yScale, xAxis, yAxis;

    var CaseDoW = [ ];
    var AccDoW  = [ ];
    var DoWData = [ [], [] ];

    var DoWMapping = [ 1, 2, 3, 4, 5, 6, 0 ];

    var selected = 0;

    var colours = [ '#0099cc', '#9900cc' ];

    var TotalText = '<strong> Total </strong> <hr>';

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  10,
            bottom: 20,
            left:   40
    };

    var width  = 450 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    var updateDuration     = 400;
    var yAxisScalingFactor = 1.1;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [ d['DataType'], parseFloat (d['Value1']), parseFloat (d['Value2']) ];  
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        //console.log (data);            
        dataset = data;

        var CaseDiffStr = 'CaseDoW_Pct';
        var AccDiffStr  = 'AccDoW_Pct';

        for (var i = 0; i < dataset.length; i++)
        {
            if (dataset[i][0] == CaseDiffStr)
                DoWData [ CASE_REPORTED_DATE ][ DoWMapping[dataset[i][1]] ] = dataset[i][2];

            if (dataset[i][0] == AccDiffStr)
                DoWData [ ACCURATE_EPISODE_DATE ][ DoWMapping[dataset[i][1]] ] = dataset[i][2];
        }

        var MaxValue = d3.max ( [ d3.max (DoWData[ACCURATE_EPISODE_DATE]), 
                                  d3.max (DoWData[CASE_REPORTED_DATE])     ] );
        MaxValue = Math.round (1.3 * MaxValue);

        // Make the SVG
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');
 
        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, 7] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, MaxValue ] )
                   .range ( [ height, 0 ] ); 

        var barLabels = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (7)
                  .tickSize(15)
                  .tickFormat ( function (d, i) { return barLabels[i]; });

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        svg.append ('g')
           .attr ('class', 'axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis)
           .selectAll ('text')  
           .style ('text-anchor', 'middle')
           .attr ('dx', xScale(0.5) )
           .attr ('dy', -5 );

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space    = Math.abs (xScale(1) - xScale(1.05));
        var barWidth = Math.abs (xScale(1) - xScale(2));

        //console.log (diffValues);

        svg.selectAll ('rect')
           .data ( DoWData[selected] )
           .enter ()
           .append ('rect') 
           .attr ('x',      function(d, i) { return xScale ( i ) + space; })
           .attr ('y',      function(d, i) { return yScale ( d ); })
           .attr ('width',  barWidth - space )
           .attr ('height', function(d, i) { return (yScale (0) - yScale ( d ) ); })
           .attr ('id',  function(d,i) { return 'rect_' + i; } )
           .attr ('fill', colours[0] );

        for (var i = 0; i < DoWData[selected].length; i++)
        {
           svg.append ('text')
              .datum ( DoWData[selected][i] )
              .attr ('x', xScale ( i + 0.5 ) ) 
              .attr ('y', yScale ( DoWData[selected][i] ) - 4  )
              .text ( DoWData[selected][i].toFixed(1) + '%' )
              .attr ('font-family', 'sans-serif')
              .attr ('font-size', '11px')
              .attr ('fill', 'black')
              .attr ('text-anchor', 'middle')
              .attr ('id', 'label_' + i);
        }

                
        //
        // Callback to handle button update
        //
        d3.selectAll ('.button').on ('click', function()
        {
            // console.log ('dataRange button CB');  

            var selBtnID = +d3.select(this).node().getAttribute ('stateID');
            // console.log ('selBtnID  ' + selBtnID);  

            if (selBtnID != selected)
            {
                // update the UI
                d3.selectAll ('.button').classed ('button_sel', false);
                d3.select ('#btnID_' + selBtnID).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            for (var i = 0; i < DoWData[selBtnID].length; i++)
            {
                d3.select ('#rect_' + i)
                  .transition ()
                  .duration (updateDuration)
                  .delay (updateDuration * 0.1 * i)
                  .attr ('y',      yScale( DoWData[selBtnID][i] ) )
                  .attr ('height', yScale(0) - yScale( DoWData[selBtnID][i] ) ) 
                  .attr ('fill', colours[selBtnID] );

                d3.select ('#label_' + i)
                  .transition ()
                  .duration (updateDuration)
                  .delay (updateDuration * 0.1 * i)
                  .text ( DoWData[selBtnID][i].toFixed(1) + '%' )
                  .attr ('y', yScale ( DoWData[selBtnID][i] ) - 4 );
            }

            selected = selBtnID;

        } );  

    } )

}


