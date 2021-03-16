function D3App ()
{
    // The data...
    var dataFile = 'TorCovidCases_NeighOutcomes.csv';

    var dataset, xScale, yScale;
    var xAxis;

    var dataRange;
    var maxValues;

    var selectedData      = 0;
    var selectedRange     = 0;
    var selectedRangeType = 0;

    var sortColumn = 0;

    var rangeButtonLabels;

    var yScale = 1.10;

    var colours_Outcomes = [ '#008000', '#e68a00', '#595959' ];
    var labels_Outcomes = [ 'Resolved', 'Not Resolved', 'Fatal' ];

    // SVG Width, height, and some added spacing
    var margin = {
            top:    5,
            right:  50,
            bottom: 175,
            left:   40
    };

    var width  = 500 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var updateDuration = 500;

            
    d3.select ('#btnID_5').style ('background-color', '#4d4d4d');
    d3.select ('#btnID_5').style ('color', '#fff');

    d3.select ('#btnID_7').classed ('button_sel', true);


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [
            d['NeighNames'], 
            parseInt (d['Total']),
            parseInt (d['RESOLVED']), 
            parseInt (d['ACTIVE']),
            parseInt (d['FATAL'])
        ];  
    }


    function UpdateButtonLabels ()
    {
        for (var i = 0; i < rangeButtonLabels[selectedRangeType].length; i++)
            d3.select ('#btnID_' + (7+i)).html (rangeButtonLabels[selectedRangeType][i]);
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        console.log (data);            
        dataset = data;

        dataRange = [ ];
        for (var i = 0; i < 140; i+=14)
            dataRange.push ( [i, i+13] );

        console.log (dataRange);

        // Find various Max values
        maxValues = [ 0, 0, 0, 0 ];

        for (var i = 0; i < dataset.length; i++)
        {
            for (var j = 1; j <= 4; j++)
            {
                if (yScale * dataset[i][j] > maxValues[j-1])
                    maxValues[j-1] = yScale * dataset[i][j];
            }
        }

        console.log (maxValues);

        // Update Buttons...
        var buttonLabelsAlpha = [];
        var buttonLabelsNum   = [];
        for (var i = 0; i < dataRange.length; i++)
        {
            buttonLabelsAlpha.push (dataset[dataRange[i][0]][0].substr(0,4) + '... - ' + dataset[dataRange[i][1]][0].substr(0,4) + '...');
            buttonLabelsNum.push ( (dataRange[i][0]+1) + ' - ' + (dataRange[i][1]+1) );
        }

        rangeButtonLabels = [];
        rangeButtonLabels.push (buttonLabelsAlpha);
        rangeButtonLabels.push (buttonLabelsNum);

        UpdateButtonLabels ();

        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append ('clipPath')
           .attr ('id', 'graphArea')
           .append ('rect')
           .attr ('x', -1)
           .attr ('y', -1)
           .attr ('width', width + 31) // + (margin.left - margin.right) + 1)
           .attr ('height', height + margin.top + margin.bottom);

        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( dataRange[selectedRange] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [0, maxValues[selectedData]] )
                   .range ( [ height, 0 ] ); 

        var tickValues = [];
        for (var i = 0; i < dataset.length; i++)
            tickValues.push (i);

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .tickValues ( tickValues )
                  .tickFormat ( function (d, i) { return dataset[i][0]; });

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        // Create x axis..
        svg.append ('g')
           .attr ('class', 'x axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis)
           .attr ('clip-path', 'url(#graphArea)')
           .selectAll ('text')  
           .style ('text-anchor', 'start')
           .attr ('dx', '0.5em' )
           .attr ('dy', '-2.2em' )
           .attr ('transform', 'rotate(90)'); 

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space    = 1;
        var barWidth = xScale(2) - xScale(1);

        for (var i = 0; i < dataset.length; i++)
        {
            var yPos1 = 0;
            var yPos2 = 0;

            for (var j = 2; j <= 4; j++)
            {
                yPos1 += dataset[i][j];

                svg.append ('rect')
                   .attr ('x', xScale (i) + space)
                   .attr ('y', yScale (yPos1))
                   .attr ('width', barWidth - 2*space)
                   .attr ('height', yScale (yPos2) - yScale (yPos1) + 1)
                   .attr ('id', 'rect_' + i + (j-2) )
                   .attr ('fill', colours_Outcomes[j-2])
                   .attr ('clip-path', 'url(#graphArea)')
                   .attr ('barLabel', labels_Outcomes[j-2]) 
                   .attr ('barValue', dataset[i][j]);

                yPos2 += dataset[i][j]; 

            } // for j

            svg.append ('text')
               .attr ('x', xScale(i+0.5) )
               .attr ('y', yScale(dataset[i][1]) - 2)
               .text (dataset[i][1])
               .attr ('clip-path', 'url(#graphArea)')
               .attr ('text-anchor', 'middle')
               .attr ('class', 'textOutput')
               .attr ('id', 'output_' + i);  
        }

              
        //
        // callback for the range buttons... the ones on the side
        // 
        d3.selectAll ('.viewrange').on ('click', function()
        {
            console.log ('viewrange button CB');

            var selBtnID = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedRange)
            {
                // update the UI
                d3.selectAll ('.viewrange').classed ('button_sel', false);
                d3.select ('#btnID_' + (selBtnID + 7)).classed ('button_sel', true);
            }
            else
            {
                // do nothing...
                return;
            }
 
            xScale.domain ( dataRange[selBtnID] );
                  
            for (var i = 0; i < dataset.length; i++)
            {
                for (var j = 2; j <= 4; j++)
                {
                    //yPos1 += dataset[i][j];

                    d3.select ('#rect_' + i + (j-2))
                      .transition ()
                      .duration (updateDuration)
                      .attr ('x', xScale (i) + space);

                } // for j

                d3.select ('#output_' + i)
                          .transition ()
                          .duration (updateDuration)
                          .attr ('x', xScale(i+0.5) )
                          .attr ('y', yScale(dataset[i][selectedData+1]) - 2);
            }

            d3.select ('.x.axis')
              .transition ()
              .duration (updateDuration)
              .call (xAxis);

            selectedRange = selBtnID; 

        });


        //
        // CB for data range buttons... the buttons on the top
        // 
        d3.selectAll ('.datarange').on ('click', function()
        {
            console.log ('dataRange button CB');  

            var selBtnID  = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedData)
            {
                // update the UI
                d3.selectAll ('.datarange').classed ('button_sel', false);
                d3.select ('#btnID_' + (selBtnID + 1)).classed ('button_sel', true); 
            }
            else 
            {
                // do nothing...
                return;
            } 

            console.log ('New max = ' +  maxValues[selBtnID] );

            // update the range
            yScale.domain ( [ 0, maxValues[selBtnID] ] );

            sortColumn = 0;
            if (selectedRangeType == 1)
                sortColumn = selBtnID+1;
            dataset.sort (sortFunction);

            for (var i = 0; i < dataset.length; i++)
            {  
                var yPos1 = 0;
                var yPos2 = 0;
 
                for (var j = 2; j <= 4; j++)
                {   
                    if (selBtnID+1 == j || selBtnID == 0)
                        yPos1 += dataset[i][j];
                        
                    var height = yScale (yPos2) - yScale (yPos1);
                    if (selBtnID+1 == j || selBtnID == 0)
                        height += 1;
    
                    d3.select ('#rect_' + i + (j-2))
                      .transition ()
                      .duration (updateDuration)
                      .attr ('y', yScale (yPos1))
                      .attr ('height', height);
                        
                    if (selBtnID+1 == j || selBtnID == 0)
                        yPos2 += dataset[i][j];
 
                } // for j

                var index = 1;
                var value = dataset[i][1];
                if (selBtnID != 0)
                {
                    index = selBtnID+1;
                    value = dataset[i][selBtnID+1];
                }
    
                d3.select ('#output_' + i)
                  .transition ()
                  .duration (updateDuration)
                  .attr ('x', xScale(i+0.5) )
                  .attr ('y', yScale(dataset[i][index]) - 2)
                  .text (value);
            }

            d3.select ('.y.axis')
              .transition ()
              .duration (updateDuration)
              .call (yAxis);

            xAxis.tickFormat ( function (d, i) { return dataset[i][0]; });
            d3.select ('.x.axis')
              .transition ()
              .duration (updateDuration)
              .call (xAxis);

            selectedData = selBtnID;

        } );


        function sortFunction (a, b)
        {
            if (a[sortColumn] === b[sortColumn])
            {
                return (a[0] < b[0]) ? -1 : 1;
                //return 0;
            }
            else
            {
                return (a[sortColumn] < b[sortColumn]) ? -1 : 1;
            }
        }


        //
        //
        //
        d3.selectAll ('.button2').on ('click', function ()
        {
            console.log ('button2');

            var selBtnID  = +d3.select(this).node().getAttribute ('stateID');

            if (selBtnID != selectedRangeType)
            {
                // update the UI
                d3.selectAll ('.button2').style ('background-color', '#ccc');
                d3.selectAll ('.button2').style ('color', '#000');
                d3.select ('#btnID_' + (selBtnID + 5)).style ('background-color', '#4d4d4d');
                d3.select ('#btnID_' + (selBtnID + 5)).style ('color', '#fff');
            }
            else 
            {
                // do nothing...
                return;
            } 

            // look at the selectedData
            if (selBtnID == 0)
                sortColumn = 0;
            else if (selBtnID == 1)
                sortColumn = selectedData+1;

            console.log ('sorting column: ', sortColumn);

            dataset.sort (sortFunction);

            for (var i = 0; i < dataset.length; i++)
            {
                var yPos1 = 0;
                var yPos2 = 0;

                for (var j = 2; j <= 4; j++)
                {
                    if (j == selectedData+1 || selectedData == 0)
                        yPos1 += dataset[i][j];
                            
                    var height = yScale (yPos2) - yScale (yPos1);
                    if (j == selectedData+1 || selectedData == 0)
                        height += 1;
  
                    d3.select ('#rect_' + i + (j-2))
                      .transition ()
                      .duration (updateDuration)
                      .attr ('y', yScale (yPos1))
                      .attr ('height', height);

                    if (j == selectedData+1 || selectedData == 0)
                        yPos2 += dataset[i][j]; 

                } // for j

                d3.select ('#output_' + i)
                  .transition ()
                  .duration (updateDuration)
                  .attr ('y', yScale(dataset[i][selectedData+1]) - 2)
                  .text ( dataset[i][selectedData+1] );   
            }

            xAxis.tickFormat ( function (d, i) { return dataset[i][0]; });
            d3.select ('.x.axis')
              .transition ()
              .duration (updateDuration)
              .call (xAxis);

            selectedRangeType = selBtnID;

            UpdateButtonLabels ();

        });

    } );

}


