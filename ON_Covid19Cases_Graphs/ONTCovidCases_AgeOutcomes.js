function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_AgeData.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    var selected = 1;
    var selectedRange = 1;

    var tmp = d3.schemePaired;
    var colours = [];
    for (var i = 1; i < 12; i+=2)
        colours.push (d3.schemePaired[i]);

    colours.push ('#cccccc');
    colours.push ('#cccccc');
    colours.push ('#b30086');

    var barLabels = [ '< 20', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s' ];
 
    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  30,
            bottom: 20,
            left:   40
    };

    var width  = 550 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var updateDuration = 500;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [
            parseInt (d['<20']), parseInt (d['20s']), parseInt (d['30s']), 
            parseInt (d['40s']), parseInt (d['50s']), parseInt (d['60s']),
            parseInt (d['70s']), parseInt (d['80s']), parseInt (d['90s'])
        ];  
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        console.log (data);            
        dataset = data;

        // Find various Max values
        var maxValues = [];
        var rowSums   = [];
        for (var i = 0; i < dataset.length; i++)
        {
            maxValues.push (d3.max (dataset[i]));
            rowSums.push (d3.sum (dataset[i]));
        }

        console.log (maxValues);
 
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

 
        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, 9 ])
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, maxValues[selected-1] ] )
                   .range ( [ height, 0 ] ); 

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10)
                  .tickFormat ( function (d, i) { return barLabels[i]; });

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        // Create axes..
        svg.append ('g')
           .attr ('class', 'axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis)
           .selectAll ('text')  
           .style ('text-anchor', 'middle')
           .attr ('dx', xScale(0.5) );
 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space    = xScale(1.05) - xScale(1);
        var barWidth = xScale(2) - xScale(1);

        console.log (dataset[selected]);

        d3.select ('#btnID_' + selected).style ('background-color', colours[selected-1]);
        d3.select ('#btnID_' + selected).style ('color', 'white');

        svg.selectAll ('rect')
           .data (dataset[selected-1])
           .enter ()
           .append ('rect')
           .attr ('x',      function(d, i) { return xScale(i) + space; })
           .attr ('y',      function(d) { return yScale(d); })
           .attr ('width',  barWidth - 2*space )
           .attr ('height', function(d) { return (yScale(0) - yScale(d)); })
           .attr ('fill', function(d, i) { return colours[selected-1]; } );

        for (var i = 0; i < dataset[selected-1].length; i++)
        {
            svg.append ('text')
               .attr ('x', xScale(i + 0.5) )
               .attr ('y', yScale (dataset[selected-1][i]) - 4)
               .text ( dataset[selected-1][i] )
               .attr ('font-family', 'sans-serif')
               .attr ('font-size', '11px')
               .attr ('fill', 'black')
               .attr ('text-anchor', 'middle')
               .attr ('id', 'label_' + i);
        }


        //
        // Used to redraw the graph
        //
        var UpdateGraph = function (selData, selRange)
        {
            var scalingFactor = 1; 
            if (selRange == 1)
                yScale.domain ( [ 0, maxValues[selData - 1] ] );
            else if (selRange == 2)
            {
                scalingFactor = 100 / rowSums[selData - 1];
                yScale.domain ( [ 0, 100 ] );
            }

            // update the y-axis
            svg.select ('.y.axis')
               .transition ()
               .duration (updateDuration)
               .call (yAxis);

            svg.selectAll ('rect')
               .data (dataset[selData - 1])
               .transition ()
               .delay ( function(d, i) { return i * 50; }) 
               .duration (updateDuration)
               .attr ('y',      function(d) { return yScale(d * scalingFactor); })
               .attr ('height', function(d) { return (yScale(0) - yScale(d)) * scalingFactor; })
               .attr ('fill',   function(d, i) { return colours[selData - 1]; } ); 

            for (var i = 0; i < dataset[selData - 1].length; i++)
            {
                var labelStr = dataset[selData - 1][i];
                if (selRange == 2)
                    labelStr = (labelStr * scalingFactor).toFixed(1) + ' %';

                d3.select ('#label_' + i)
                  .transition ()
                  .delay ( function(d, i) { return 0.5 * updateDuration + i * 50; }) 
                  .duration (updateDuration)
                  .attr ('y', yScale (dataset[selData - 1][i] * scalingFactor) - 4)
                  .text ( labelStr );
            }

        };  // update graph function


        //
        // Handle the various datatype buttons
        //
        d3.selectAll ('.datatype').on ('click', function()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selected)
            {
                        // update the UI
                        d3.selectAll ('.datatype').classed ('button_sel', false);
                        d3.selectAll ('.datatype').style ('background-color', '#cccccc');
                        d3.selectAll ('.datatype').style ('color', '#000000');
                        d3.select ('#btnID_' + selBtnID).classed ('button_sel', true); 
                        d3.select ('#btnID_' + selBtnID).style ('background-color', colours[selBtnID - 1]);
                        d3.select ('#btnID_' + selBtnID).style ('color', '#ffffff');
            }
            else 
            {
                        // do nothing...
                        return;
            } 

            if (selBtnID == 9)
            {
                // Deal with the death rate button separately
                var deathRates = [];

                for (var i = 0; i < dataset[2].length; i++)
                    deathRates.push ( dataset[2][i] / ( dataset[1][i] + dataset[2][i] ) * 100 );

                var maxDR = d3.max (deathRates) * 1.05;

                yScale.domain ( [ 0, maxDR ] );

                // update the y-axis
                svg.select ('.y.axis')
                   .transition ()
                   .duration (updateDuration)
                   .call (yAxis);

                svg.selectAll ('rect')
                   .data (deathRates)
                   .transition ()
                   .delay ( function(d, i) { return i * 50; })
                   .duration (updateDuration)
                   .attr ('y',      function(d) { return yScale(d); })
                   .attr ('height', function(d) { return (yScale(0) - yScale(d)); })
                   .attr ('fill',   function(d, i) { return colours[selBtnID - 1]; } );

                for (var i = 0; i < deathRates.length; i++)
                {
                    var labelStr = deathRates[i].toFixed(1) + '%';

                    d3.select ('#label_' + i)
                      .transition ()
                      .delay ( function(d, i) { return 0.5 * updateDuration + i * 50; })
                      .duration (updateDuration)
                      .attr ('y', yScale (deathRates[i]) - 4)
                      .text ( labelStr );
                }
            }
            else
            {
                // Update the graph...
                UpdateGraph (selBtnID, selectedRange);
            }

            selected = selBtnID;

        } );


        //
        // Handle the the absolute/percent buttons
        //
        d3.selectAll ('.datarange').on ('click', function()
        {
            // console.log ('dataRange button CB');  

            var selBtnID = +d3.select(this).node().getAttribute ('stateID');
            console.log ('selBtnID  ' + selBtnID);  

            if (selBtnID != selectedRange)
            {
                // update the UI
                d3.selectAll ('.datarange').classed ('button_sel', false);
                d3.select ('#btnID_' + (selBtnID + 6)).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            if (selected != 9)
            {
                // Update the graph...
                UpdateGraph (selected, selBtnID);
            }

            selectedRange = selBtnID;

        } ); 

    } ); // d3.csv

} // D3App

