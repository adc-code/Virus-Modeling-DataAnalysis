function D3App ()
{
    // The data...
    var dataFile = 'TorCovidCases_HospOutcomes.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    // Used to map state ID to a specific row in the dataset

    var selectedGender  = 0;   // 0: Male      1: Female  2: Both
    var selectedOutcome = 3;   // 0: Resolved  1: Fatal   2: Active  3: Total
    var selectedHosp    = 0;   // 0: Hosp      1: ICU     2: Vent


    var colourLevel3 = [ '40',  '80', 'C0' ];
    var colourLevel4 = [ '66', 'CD', '99', '33' ]; 

    var barLabels = [ '< 20', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s' ];

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  30,
            bottom: 20,
            left:   40
    };

    var width  = 500 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var updateDuration = 500;
    var yAxisScalingFactor = 1.1;

            
    //
    // Used to determine the offset with the specific data 
    //
    var computeDataOffset = function ()
    {
        return  (108 * selectedGender) + (27 * selectedOutcome) + (9 * selectedHosp);
    }

           
    //
    // Used to determine the colour for a specific state of selection variables...
    //
    var determineColour = function ()
    {
        return  '#' + colourLevel3[ selectedHosp ] + colourLevel4[ selectedOutcome ] + colourLevel3[ selectedGender ];
    }


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);

        return [ d['gender'], d['outcome'], d['hosp'], d['ageGroup'], parseInt (d['amount']) ];  
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        //console.log (data);            
        dataset = data;

        var offset = computeDataOffset ();
        var values = [];
        for (var i = 0; i < 9; i++)
        {
            //console.log (dataset[offset + i][3], '  ', dataset[offset + i][4]);
            values.push (dataset[offset + i][4]);
        }
        var maxValue = d3.max (values);

        // Make the SVG
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');
 
        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, 9 ])
                   .range ( [ 0, width ] ); 

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10)
                  .tickFormat ( function (d, i) { return barLabels[i]; });

        // Create x axis..
        svg.append ('g')
           .attr ('class', 'axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis)
           .selectAll ('text')  
           .style ('text-anchor', 'middle')
           .attr ('dx', xScale(0.5) );

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, maxValue ] )
                   .range ( [ height, 0 ] ); 

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space    = xScale(1.05) - xScale(1);
        var barWidth = xScale(2) - xScale(1);

        svg.selectAll ('rect')
           .data (values)
           .enter ()
           .append ('rect')
           .attr ('x',      function(d, i) { return xScale(i) + space; })
           .attr ('y',      function(d) { return yScale(d); })
           .attr ('width',  barWidth - 2*space )
           .attr ('height', function(d) { return (yScale(0) - yScale(d)); })
           .attr ('fill', function(d, i) { return determineColour(); } );

        for (var i = 0; i < values.length; i++)
        {
            svg.append ('text')
               .attr ('x', xScale(i + 0.5) )
               .attr ('y', yScale (values[i]) - 4)
               .text ( values[i] )
               .attr ('font-family', 'sans-serif')
               .attr ('font-size', '11px')
               .attr ('fill', 'black')
               .attr ('text-anchor', 'middle')
               .attr ('id', 'label_' + i);
        } 


        //
        // Used to redraw the graph
        //
        var UpdateGraph = function ()
        { 
            // First get the specific data values...
            var offset = computeDataOffset ();

            var values = [];
            for (var i = 0; i < 9; i++)
            {
                //console.log (dataset[offset + i][3], '  ', dataset[offset + i][4]);
                values.push (dataset[offset + i][4]);
            }

            // find the max... note the additional scaling to account for any number
            var maxValue = d3.max (values) * yAxisScalingFactor;

            yScale.domain ( [ 0, maxValue ] );
                    
            // update the y-axis
            svg.select ('.y.axis')
               .transition ()
               .duration (updateDuration)
               .call (yAxis);

            // reset the height of all the data bars...
            svg.selectAll ('rect')
               .data (values)
               .transition ()
               .delay ( function(d, i) { return i * 50; }) 
               .duration (updateDuration)
               .attr ('y',      function(d) { return yScale(d); })
               .attr ('height', function(d) { return (yScale(0) - yScale(d)); })
               .attr ('fill', function(d, i) { return determineColour(); } );

            // change the values of the data labels.
            for (var i = 0; i < values.length; i++)
            {
                d3.select ('#label_' + i)
                  .transition ()
                  .delay ( function(d, i) { return 0.5 * updateDuration + i * 50; }) 
                  .duration (updateDuration)
                  .attr ('y', yScale (values[i]) - 4)
                  .text ( values[i] );
            }

        };  // UpdateGraph


        //
        // Handle the various genderType buttons
        //
        d3.selectAll ('.genderType').on ('click', function()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedGender)
            {
                // update the UI
                d3.selectAll ('.genderType').classed ('button_sel', false);
                d3.select ('#genderBtnID_' + selBtnID).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            selectedGender = selBtnID;

            // Update the graph...
            UpdateGraph ();
                    
        } );


        //
        // Handle the the absolute/percent buttons
        //
        d3.selectAll ('.outcomeType').on ('click', function()
        {
            // console.log ('dataRange button CB');  

            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedOutcome)
            {
                // update the UI
                d3.selectAll ('.outcomeType').classed ('button_sel', false);
                d3.select ('#outcomeBtnID_' + selBtnID).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            selectedOutcome = selBtnID;

            // Update the graph...
            UpdateGraph ();

        } ); 


        //
        // Callback to handle public health unit selection list change
        //
        d3.selectAll ('.hospType').on ('click', function ()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedHosp)
            {
                // update the UI
                d3.selectAll ('.hospType').classed ('button_sel', false);
                d3.select ('#hospBtnID_' + selBtnID).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            selectedHosp = selBtnID; 

            // Update the graph...
            UpdateGraph ();

        } ); 

    } )

}


