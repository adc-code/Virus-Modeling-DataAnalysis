function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_GenderOutcomes.csv'; 

    var dataset, xScale, yScale;

    var selected = 0;

    var maxAbsRow = [];
    var maxAbsCol = [];

    var colours_Outcomes = [ '#008000', '#e68a00', '#595959' ];
        
    var labels_Genders = [ 'Female', 'Male', 'Other' ];
    var labels_Outcomes = [ 'Resolved', 'Not Resolved', 'Fatal' ];
 
    var dataRange = [ 0, 3 ];

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  50,
            bottom: 5,
            left:   60
    };

    var width  = 530 - margin.left - margin.right;
    var height = 190 - margin.top - margin.bottom;

    var updateDuration = 500;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [
            d[''], parseFloat (d['Resolved']), parseFloat (d['Not Resolved']), parseFloat (d['Fatal'])
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
        var sumCol = [ 0, 0, 0 ];

        for (var i = 0; i < 3; i++)
        {
            for (var j = 0; j < 3; j++)
            {
                sumCol[i] = sumCol[i] + dataset[j][i+1];
            }
        }

        console.log (sumCol);
        var Total = d3.sum (sumCol);
        console.log (Total);

        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, Total ] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, 3] )
                   .range ( [ height, 0 ] ); 

        var space     = yScale(1) - yScale(1.05);
        var barHeight = yScale(1) - yScale(2);

        var xPos = 0;
        for (var j = 0; j < 3; j++)
        {
            svg.append ('rect')
               .attr ('x', xScale (xPos))
               .attr ('y', yScale (3) + space)
               .attr ('width', xScale (sumCol[j]) - 1)
               .attr ('height', barHeight - space)
               .attr ('id', 'cell_' + j)
               .attr ('fill', colours_Outcomes[j])
               .attr ('barLabel', labels_Outcomes[j]) 
               .attr ('barValue', sumCol[j]);

            xPos += sumCol[j];

        } // for j

        svg.append ('text')
           .attr ('x', -10)
           .attr ('y', yScale (2.5) + 5)
           .attr ('text-anchor', 'end')
           .text ('Overall')
           .attr ('class', 'textOutput');
 
        svg.append ('text')
           .attr ('x', xScale (xPos) + 5)
           .attr ('y', yScale (2.5) + 5)
           .text (Total)
           .attr ('text-anchor', 'start')
           .attr ('class', 'textOutput');

        var leftOffset = xScale (Total / 6);
        var labelWidth = xScale (Total * 2/9);

        for (var i = 0; i < 3; i++)
        {
            svg.append ('rect')
               .attr ('x', leftOffset + labelWidth * i)
               .attr ('y', yScale (1.2))
               .attr ('width', labelWidth - 1)
               .attr ('height', barHeight * 0.95)
               .attr ('fill', '#cccccc');
 
            svg.append ('text')
               .attr ('x', leftOffset + labelWidth * i + 5)
               .attr ('y', yScale (1) + 5)
               .text (labels_Outcomes[i])
               .attr ('text-anchor', 'start')
               .attr ('class', 'textOutput title'); 

            svg.append ('text')
               .attr ('x', leftOffset + labelWidth * i + 5)
               .attr ('y', yScale (0.75) + 5)
               .text ('Total: ' + sumCol[i])
               .attr ('text-anchor', 'start')
               .attr ('class', 'textOutput'); 

            svg.append ('text')
               .attr ('x', leftOffset + labelWidth * i + 5)
               .attr ('y', yScale (0.5) + 5)
               .text ('Percent: ' + (sumCol[i]/Total * 100).toFixed(1) + '%')
               .attr ('text-anchor', 'start')
               .attr ('class', 'textOutput'); 
        }

        var offset = 0;
        for (var i = 0; i < 3; i++)
        {
            var leaderLine = d3.line ()
                               .x (function(d)    {  return d.x;  })  
                               .y (function(d)    {  return d.y;  })
                               .curve (d3.curveBasis);

            var linkData = [ { x: leftOffset + (2*i + 1) * 0.5 * labelWidth, y: yScale (1.2) }, 
                             { x: leftOffset + (2*i + 1) * 0.5 * labelWidth, y: yScale (1.5) },
                             { x: xScale(offset) + 0.5 * xScale(sumCol[i]),  y: yScale (1.7) }, 
                             { x: xScale(offset) + 0.5 * xScale(sumCol[i]),  y: yScale (2.5) } ];

            offset += sumCol[i];

            svg.append ('path')
               .datum ( linkData )
               .attr ('d', leaderLine)
               .attr ('stroke', '#000000')
               .attr ('fill', 'none');

            svg.append ('circle')
               .attr ('r', 3)
               .attr ('cx', linkData[0].x )
               .attr ('cy', linkData[0].y );
 
            svg.append ('circle')
               .attr ('r', 3)
               .attr ('cx', linkData[3].x )
               .attr ('cy', linkData[3].y );
        }

    } );

}



