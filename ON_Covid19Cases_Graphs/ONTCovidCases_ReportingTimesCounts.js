function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_ReportingTimesDates.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    var countValues = [ [], [] ];
    var averages = [ [], [] ];

    var colours = [ '#002db3', '#e60000' ];

    var selected = [ true, true, false ];
    var selectedBox = 1;

    var halfSize = [ 1, 2, 3, 5 ];

    var TotalText = '<strong> Total </strong> <hr>';

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  10,
            bottom: 60,
            left:   40
    };

    var width  = 600 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var updateDuration = 400;
           

    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);
        var timeZoneAdjustment = 1000*60*60*5; // in millisecs...

        return [
            d['DataType'], new Date (new Date (d['Date']).getTime() + timeZoneAdjustment), parseInt (d['Value'])
        ];  
    }


    var ComputeAverages = function (size)
    {
        for (var i = 0; i < 2; i++)
        {
            averages[i] = [ ];
            for (var j = size; j < (countValues[i].length - size); j++)
            {
                var windowSum = 0;
                for (var k = -1 * size; k <= size; k++)
                    windowSum += countValues[i][j + k][1];

                averages[i].push ( [ countValues[i][j][0], windowSum / ( 2*size + 1) ] );
            }
        }
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        //console.log (data);            
        dataset = data;

        var LabelStr1 = 'Accurate_Episode_Date'
        var LabelStr2 = 'Case_Reported_Date'

        var maxValue = 0;
        var minDate  = dataset[0][1];
        var maxDate  = dataset[0][1];

        for (var i = 0; i < dataset.length; i++)
        {
            if (dataset[i][0] == LabelStr1)
                countValues[0].push ( [ dataset[i][1], dataset[i][2] ] );
            else if (dataset[i][0] == LabelStr2)
                countValues[1].push ( [ dataset[i][1], dataset[i][2] ] );

            if (dataset[i][1] < minDate)
                minDate = dataset[i][1];

            if (dataset[i][1] > maxDate)
                maxDate = dataset[i][1];

            if (dataset[i][2] > maxValue)
                maxValue = dataset[i][2];
        }


        // console.log (countValues[0]);
        // console.log (countValues[1]);

        // console.log (minDate);
        // console.log (maxDate);
        // console.log (maxValue);

        for (var i = 0; i < 2; i++)
        {
            d3.select ('#btnID_' + i).style ('background-color', colours[i]);
            d3.select ('#btnID_' + i).style ('color', '#fff');
        }
        d3.select ('#btnID_2').classed ('button_sel', false);

        //d3.select('.boxGroup').style ('opacity', 0).style ('display', false);

        ComputeAverages (halfSize[selectedBox]);
        // console.log (averages);

        /* 
        var average1 = [ ];
        for (var i = l; i < countValues[0].length - l; i++)
        {
            var windowSum = 0;
            for (var j = -l; j <= l; j++)
                windowSum += countValues[0][i + j][1];
            average1.push ( [ countValues[0][i][0], windowSum / ( 2*l + 1) ] );
        }

        var average2 = [ ];
        for (var i = l; i < countValues[1].length - l; i++)
        {
            var windowSum = 0;
            for (var j = -l; j <= l; j++)
                windowSum += countValues[1][i + j][1];
            average2.push ( [ countValues[1][i][0], windowSum / ( 2*l + 1) ] ); 
        } */

        // Make the SVG
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');
 
        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleTime ()
                   .domain ( [ minDate, maxDate ] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, maxValue ] )
                   .range ( [ height, 0 ] ); 

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10)
                  .tickFormat ( d3.timeFormat ('%b %Y') );

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        svg.append ('g')
           .attr ('class', 'axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis)
           .selectAll ('text')
           .style ('text-anchor', 'end')
           .attr ('dx', '-1em')
           .attr ('dy', '-0.55em')
           .attr ('transform', 'rotate(-90)');

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var barWidth = Math.abs (xScale(1) - xScale(2));

        var line1_data = d3.line ()
                           .x (function(d) { return xScale (d[0]); })
                           .y (function(d) { return yScale (d[1]); })
                           .curve (d3.curveStepAfter);

        var line1_avg = d3.line ()
                          .x (function(d) { return xScale (d[0]); })
                          .y (function(d) { return yScale (d[1]); })
                          .curve (d3.curveMonotoneX);

        var line2_data = d3.line ()
                           .x (function(d) { return xScale (d[0]); })
                           .y (function(d) { return yScale (d[1]); })
                           .curve (d3.curveStepAfter);

        var line2_avg = d3.line ()
                          .x (function(d) { return xScale (d[0]); })
                          .y (function(d) { return yScale (d[1]); })
                          .curve (d3.curveMonotoneX);

        var path_line1_data = svg.append ('path')
                                 .datum (countValues[0])
                                 .attr ('class', 'dataLines')
                                 .attr ('id', 'lineData_0')
                                 .attr ('stroke', colours [0] )
                                 .attr ('fill', 'none')
                                 .attr ('stroke-width', 2)
                                 .attr ('d', line1_data);

        var path_line1_avg = svg.append ('path')
                                .datum (averages[0])
                                .attr ('class', 'movingAvgs')
                                .attr ('id', 'lineAvg_0')
                                .attr ('stroke', colours [0])
                                .attr ('fill', 'none')
                                .style ('opacity', 0 )
                                .attr ('stroke-width', 2)
                                .attr ('d', line1_avg);

        var path_line2_data = svg.append ('path')
                                 .datum (countValues[1])
                                 .attr ('class', 'dataLines')
                                 .attr ('id', 'lineData_1')
                                 .attr ('stroke', colours [1] )
                                 .attr ('fill', 'none')
                                 .attr ('stroke-width', 2)
                                 .attr ('d', line2_data);

        var path_line2_avg = svg.append ('path')
                                .datum (averages[1])
                                .attr ('class', 'movingAvgs')
                                .attr ('id', 'lineAvg_1')
                                .attr ('stroke', colours [1] )
                                .attr ('fill', 'none')
                                .attr ('stroke-width', 2)
                                .style ('opacity', 0)
                                .attr ('d', line2_avg);


        d3.selectAll ('.dataElem').on ('click', function ()
        {
            var val = +d3.select(this).node().getAttribute ('val');

            if (selected[val] == true)
            {
                d3.select ('#btnID_' + val).style ('background-color', '#ccc');
                d3.select ('#btnID_' + val).style ('color', '#000');

                d3.select ('#lineData_' + val)
                  .transition ()
                  .duration (updateDuration)
                  .style ('opacity', 0);
                         
                selected[val] = false;
            }
            else 
            {
                d3.select ('#btnID_' + val).style ('background-color', colours[val]);
                d3.select ('#btnID_' + val).style ('color', '#fff');
                         
                d3.select ('#lineData_' + val)
                  .transition ()
                  .duration (updateDuration)
                  .style ('opacity', 1);

                selected[val] = true;
            }

        } );


        //
        // CB function for Show Moving Average 
        //
        d3.select ('#btnID_2').on ('click', function ()
        {
            var val = +d3.select(this).node().getAttribute ('val');
                     
            if (selected[val] == true)
            {
                // if selected make:
                //    - the button unselected
                //    - hide the moving averages
                //    - make the data lines coloured and thick
                //    - hide the moving aver length buttons

                d3.select(this).classed ('button_sel', false);

                d3.selectAll ('.movingAvgs')
                  .transition ()
                  .duration (updateDuration)
                  .style ('opacity', 0);

                for (var i = 0; i < 2; i++)
                {
                    d3.select ('#lineData_' + i)
                      .transition ()
                      .duration (updateDuration)
                      .attr ('stroke', colours [i])
                      .attr ('stroke-width', 2);
                }

                d3.select('.boxGroup')
                  .transition ()
                  .duration (updateDuration*1.5)
                  .style ('opacity', 0)
                  .style ('display', 'none');
            }
            else 
            {
                // Otherwise:
                //    - select the button
                //    - show the moving averages
                //    - make the data lines grey and thin
                //    - show the moving aver length buttons

                d3.select(this).classed ('button_sel', true);

                d3.selectAll ('.movingAvgs')
                  .transition ()
                  .duration (updateDuration)
                  .style ('opacity', 1);

                d3.selectAll ('.dataLines')
                  .transition ()
                  .duration (updateDuration)
                  .attr ('stroke', '#aaa' )
                  .attr ('stroke-width', 1);

                d3.select('.boxGroup')
                  .style ('display', 'block')
                  .transition ()
                  .duration (updateDuration*1.5)
                  .style ('opacity', 1);
            }

            selected[val] = !selected[val];

        } );


        d3.selectAll ('.box').on ('click', function ()
        {
            var val = +d3.select(this).node().getAttribute ('val');

            if (val != selectedBox)
            {
                d3.selectAll ('.box').classed ('boxSel', false);
                d3.select (this).classed ('boxSel', true);

                ComputeAverages (halfSize[val]);

                for (var i = 0; i < 2; i++)
                {
                    d3.select ('#lineAvg_' + i)
                      .transition ()
                      .duration (updateDuration)
                      .ease (d3.easeBackOut)
                      .attr ('d', line1_avg (averages[i]) );
                }
            }

            selectedBox = val;
                     
        } );

    } )

}



