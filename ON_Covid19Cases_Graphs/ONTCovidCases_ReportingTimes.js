function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_ReportingTimes.csv';

    var dataset, xScale, yScale, xAxis, yAxis;

    var colours = [ '#002db3', '#ccff33' ];

    var TotalText = '<strong> Total </strong> <hr>';

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  10,
            bottom: 20,
            left:   40
    };

    var width  = 600 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;

    var updateDuration     = 400;
    var yAxisScalingFactor = 1.1;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        //console.log (d);

        return [
            d['DataType'], parseFloat (d['Value1']), parseFloat (d['Value2'])
        ];  
    }

    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        //console.log (data);            
        dataset = data;

        var RepDiffStr = 'ReportedDateDiff';

        var maxValue  = 0;
        var maxBinNum = 0;
        var total     = 0;
        var diffValues = [];

        for (var i = 0; i < dataset.length; i++)
        {
            if (dataset[i][0] == RepDiffStr)
            {
                diffValues.push ( [ dataset[i][1], dataset[i][2] ] );
                total += dataset[i][2];

                if ( dataset[i][1] > maxBinNum )
                    maxBinNum = dataset[i][1];

                if ( dataset[i][2] > maxValue )
                    maxValue = dataset[i][2];
            }
            else  break; 
        }

        // Compute cutoff
        var cutoff = 0.001 * maxValue;
        var cutoffBin = 0;
        for (var i = 0; i < maxBinNum; i++)
        {   
            if ( dataset[i][2] < cutoff )
            {   
                cutoffBin = i;
                break;
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
                   .domain ( [ 0, cutoffBin ] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, maxValue ] )
                   .range ( [ height, 0 ] ); 

        xAxis = d3.axisBottom ()
                  .scale (xScale)
                  .ticks (10);

        // Define Y axis
        yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .ticks (10);

        svg.append ('g')
           .attr ('class', 'axis')
           .attr ('transform', 'translate(0,' + (height) + ')')
           .call (xAxis);

        // and y axis... 
        svg.append ('g')
           .attr ('class', 'y axis')
           .call (yAxis); 

        var space    = 0.1;
        var barWidth = Math.abs (xScale(1) - xScale(2));

        //console.log (diffValues);

        svg.selectAll ('rect')
           .data ( diffValues )
           .enter ()
           .append ('rect') 
           .attr ('x',      function(d, i) { return xScale ( d[0] ) + space; })
           .attr ('y',      function(d, i) { return yScale ( d[1] ); })
           .attr ('width',  barWidth - space )
           .attr ('height', function(d, i) { return (yScale (0) - yScale ( d[1] ) ); })
           .attr ('fill', colours[0] )
           .on ('mouseover', function(d, i)
               {
                   d3.select(this)
                     .transition ()
                     .duration (updateDuration)
                     .attr ('fill', colours[1] ); 

                   var xPosition = parseFloat (d3.select(this).attr('x')) + (xScale(1) - xScale(0)) / 2;
                   var yPosition = parseFloat (d3.select(this).attr('y')) + Math.abs(yScale(0) - yScale(d)) / 2;

                   xPosition = d3.event.pageX + barWidth; 
                   yPosition = d3.event.pageY; 

                   d3.select ('#tooltip')
                     .style ('left', xPosition + 'px')
                     .style ('top', yPosition + 'px')
                     .select ('#label').html ( function (d) 
                         {
                             var outputStr = '';
                             outputStr += '<strong>' + 'Number of Days:  ' + '</strong>' + diffValues [i][0]; 
                             outputStr += '<hr>';
                             outputStr += '<strong>' + 'Count:  ' + '</strong>' + diffValues [i][1]; 
                             outputStr += '<br>';
                             outputStr += '<strong>' + 'Percent:  ' + '</strong>' + (diffValues [i][1] / total * 100).toFixed(1) + '%';
                             return outputStr;
                         } );

                   d3.select ('#tooltip').classed ('hidden', false);
               } )
           .on ('mouseout', function(d) 
               { 
                   // change the colour back
                   d3.select(this)
                     .transition ()
                     .duration (updateDuration)
                     .attr ('fill', colours[0] );

                   // Remove the tooltip
                   d3.select ('#tooltip')
                     .classed ('hidden', true);
               } );

    } )

}


