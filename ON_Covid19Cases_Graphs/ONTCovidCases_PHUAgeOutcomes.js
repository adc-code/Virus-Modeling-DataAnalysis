function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_PHUAgeOutcomes.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    // Used to map state ID to a specific row in the dataset
    var dataMapping = [ 3, 0, 1, 2 ];

    var selectedItem  = 0;
    var selectedRange = 1;
    var selectedPHU   = 0;

    var initialSelected = 'Toronto Public Health';

    var colours = [ '#1f78b4', '#008000', '#595959', '#e68a00' ];

    var barLabels = [ '< 20', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90+' ];

    var TotalCases     = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var RecoveredCases = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var FatalCases     = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
    var InfectedCases  = [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
 
    var TotalText = '<strong> Total </strong> <hr>';

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
    var yAxisScalingFactor = 1.1;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);

        return [
            d['PHU_Name'], d['Outcome'], parseInt (d['MaxValue']),
            parseInt (d['<20']), parseInt (d['20s']), parseInt (d['30s']), 
            parseInt (d['40s']), parseInt (d['50s']), parseInt (d['60s']),
            parseInt (d['70s']), parseInt (d['80s']), parseInt (d['90+']),
        ];  
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        console.log (data);            
        dataset = data;

        var numPHUs = dataset.length / 4;

        // Get the PHU Names...
        var requiredIndex = 0;
        var PHUSelectionList = document.getElementById ('PHU_SelList');
        for (var i = 0; i < numPHUs; i++)
        {
            var newOption   = document.createElement ('option');
            newOption.text  = dataset [ i*4 ][ 0 ];
            newOption.value = i;

            if (newOption.text == initialSelected)
                selectedPHU = i;

            PHUSelectionList.options.add (newOption, i);
        } 

        d3.select('#PHU_SelList').property('value', selectedPHU);


        // Find the total in the Province
        for (var i = 0; i < numPHUs; i++)
        {
            var PHUTotalCases = dataset [ dataMapping[0] + i*4 ].slice();
            PHUTotalCases.shift(); PHUTotalCases.shift(); PHUTotalCases.shift();

            var PHURecoveredCases = dataset [ dataMapping[1] + i*4 ].slice();
            PHURecoveredCases.shift(); PHURecoveredCases.shift(); PHURecoveredCases.shift(); 

            var PHUFatalCases = dataset [ dataMapping[2] + i*4 ].slice();
            PHUFatalCases.shift(); PHUFatalCases.shift(); PHUFatalCases.shift();

            var PHUInfectedCases  = dataset [ dataMapping[3] + i*4 ].slice();
            PHUInfectedCases.shift(); PHUInfectedCases.shift(); PHUInfectedCases.shift(); 

            for (var j = 0; j < PHUTotalCases.length; j++)
            {
                TotalCases [j]     += PHUTotalCases [j];
                RecoveredCases [j] += PHURecoveredCases [j];
                FatalCases [j]     += PHUFatalCases [j];
                InfectedCases [j]  += PHUInfectedCases [j];
            }
        }

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

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, dataset[ dataMapping[selectedItem] + 4*selectedPHU ][ 2 ] * yAxisScalingFactor ] )
                   .range ( [ height, 0 ] ); 

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10)
                  .tickFormat ( function (d, i) { return barLabels[i]; });

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
           .style ('text-anchor', 'middle')
           .attr ('dx', xScale(0.5) );

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space    = xScale(1.05) - xScale(1);
        var barWidth = xScale(2) - xScale(1);

        console.log (dataset[ dataMapping[selectedItem] ]);

        d3.select ('#btnID_' + selectedItem).style ('background-color', colours[selectedItem]);
        d3.select ('#btnID_' + selectedItem).style ('color', 'white');

        var selectedRow = dataset[ dataMapping[selectedItem] + 4*selectedPHU ].slice();
        var selectedRowName = selectedRow.shift ();
        var selectedRowOutcome = selectedRow.shift ();
        var selectedRowMaxValue = selectedRow.shift ();

        svg.selectAll ('rect')
           .data (selectedRow)
           .enter ()
           .append ('rect')
           .attr ('x',      function(d, i) { return xScale(i) + space; })
           .attr ('y',      function(d) { return yScale(d); })
           .attr ('width',  barWidth - 2*space )
           .attr ('height', function(d) { return (yScale(0) - yScale(d)); })
           .attr ('fill', function(d, i) { return colours[selectedItem]; } );

        for (var i = 0; i < selectedRow.length; i++)
        {
            svg.append ('text')
               .attr ('x', xScale(i + 0.5) )
               .attr ('y', yScale (selectedRow[i]) - 4)
               .text ( selectedRow[i] )
               .attr ('font-family', 'sans-serif')
               .attr ('font-size', '11px')
               .attr ('fill', 'black')
               .attr ('text-anchor', 'middle')
               .attr ('id', 'label_' + i);
        } 

        d3.select('#total').node().innerHTML = TotalText + d3.sum (selectedRow); 

        //
        // Used to redraw the graph
        //
        var UpdateGraph = function (selData, selRange, selPHU)
        {
            var selectedRow = dataset[ dataMapping[selData] + 4*selPHU ].slice();
            var selectedRowName = selectedRow.shift ();
            var selectedRowOutcome = selectedRow.shift ();
            var selectedRowMaxValue = selectedRow.shift ();

            var total = d3.sum (selectedRow);

            var scalingFactor = 1; 
            if (selRange == 1) 
            {
                if (selectedRowMaxValue == 0)
                    selectedRowMaxValue = 1;

                yScale.domain ( [ 0, selectedRowMaxValue ] );
            }
            else if (selRange == 2)
            {
                var rowSum = d3.sum (selectedRow);

                if (rowSum == 0)
                    scalingFactor = 1;
                else
                    scalingFactor = 100 / d3.sum (selectedRow);

                yScale.domain ( [ 0, 100 ] );
            }
            else if (selRange == 3)
            {
                var Total = TotalCases;
                if (selData == 1)
                    Total = RecoveredCases;
                else if (selData == 2) 
                    Total = FatalCases;
                else if (selData == 3) 
                    Total = InfectedCases;

                for (var i = 0; i < selectedRow.length; i++)
                { 
                    if (Total[i] == 0)
                        selectedRow[i] = 0;
                    else
                        selectedRow[i] = 100 * selectedRow[i] / Total[i]; 
                }

                yScale.domain ( [ 0, 100 ] );
            }

            // update the y-axis
            svg.select ('.y.axis')
               .transition ()
               .duration (updateDuration)
               .call (yAxis);

            svg.selectAll ('rect')
               .data (selectedRow)
               .transition ()
               .delay ( function(d, i) { return i * 50; }) 
               .duration (updateDuration)
               .attr ('y',      function(d) { return yScale(d * scalingFactor); })
               .attr ('height', function(d) { return (yScale(0) - yScale(d)) * scalingFactor; })
               .attr ('fill',   function(d, i) { return colours[selData]; } ); 

            for (var i = 0; i < selectedRow.length; i++)
            {
                var labelStr = selectedRow[i];
                if (selRange != 1)
                    labelStr = (labelStr * scalingFactor).toFixed(1) + ' %';

                d3.select ('#label_' + i)
                  .transition ()
                  .delay ( function(d, i) { return 0.5 * updateDuration + i * 50; }) 
                  .duration (updateDuration)
                  .attr ('y', yScale (selectedRow[i] * scalingFactor) - 4)
                  .text ( labelStr );
            }

            d3.select('#total').node().innerHTML = TotalText + total; 

        };  // UpdateGraph


        //
        // Handle the various datatype buttons
        //
        d3.selectAll ('.datatype').on ('click', function()
        {
            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedItem)
            {
                // update the UI
                d3.selectAll ('.datatype').classed ('button_sel', false);
                d3.selectAll ('.datatype').style ('background-color', '#cccccc');
                d3.selectAll ('.datatype').style ('color', '#000000');
                d3.select ('#btnID_' + selBtnID).classed ('button_sel', true); 
                d3.select ('#btnID_' + selBtnID).style ('background-color', colours[selBtnID]);
                d3.select ('#btnID_' + selBtnID).style ('color', '#ffffff');
            }
            else 
            {
                // do nothing...
                return;
            } 

            // Update the graph...
            UpdateGraph (selBtnID, selectedRange, selectedPHU);

            selectedItem = selBtnID;

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
                d3.select ('#btnID_' + (selBtnID + 3)).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            // Update the graph...
            UpdateGraph (selectedItem, selBtnID, selectedPHU);

            selectedRange = selBtnID;

        } ); 


        //
        // Callback to handle public health unit selection list change
        //
        d3.select ('#PHU_SelList').on ('change', function ()
        {
            // console.log ('OnChangePHU');
 
            var selValue = d3.select(this).property('value');

            // Update the graph...
            UpdateGraph (selectedItem, selectedRange, selValue);

            selectedPHU = selValue; 

        } ); 

    } ) // read CSV

}




