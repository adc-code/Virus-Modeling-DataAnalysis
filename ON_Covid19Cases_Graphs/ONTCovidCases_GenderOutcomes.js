function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_GenderOutcomes.csv'; 

    var dataset, xScale, yScale;

    var selected = 0;

    var maxAbsRow = [];
    var maxAbsCol = [];

    var colours_Outcomes = [ '#008000', '#e68a00', '#595959' ];
    var colours_Genders  = []
        
    var labels_Genders = [ 'Female', 'Male', 'Other' ];
    var labels_Outcomes = [ 'Resolved', 'Not Resolved', 'Fatal' ];
 
    var dataRange = [ 0, 3 ];

    // SVG Width, height, and some added spacing
    var margin = {
            top:    15,
            right:  50,
            bottom:  5,
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
        // console.log (data);            
        dataset = data;

        // Find various Max values
        var maxRow = [ 0, 0, 0 ];
        var maxCol = [ 0, 0, 0 ];

        for (var i = 0; i < 3; i++)
        {
            for (var j = 0; j < 3; j++)
            {
                maxRow[i] = maxRow[i] + dataset[i][j+1]; 
                maxCol[i] = maxCol[i] + dataset[j][i+1];
            }
        }

        maxAbsRow = [ d3.max (maxRow), 100 ]; 
        maxAbsCol = [ d3.max (maxCol), 100 ];

        //console.log (maxAbsRow + ' ' + maxAbsCol);
 
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

 
        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, maxAbsRow[0] ] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( [ 0, 3] )
                   .range ( [ height, 0 ] ); 

        var space     = yScale(1) - yScale(1.05);
        var barHeight = yScale(1) - yScale(2);

        for (var i = 0; i < 3; i++)
        {
            var xPos = 0;
            for (var j = 0; j < 3; j++)
            {
                svg.append ('rect')
                   .attr ('x', xScale (xPos))
                   .attr ('y', yScale (3 - i) + space)
                   .attr ('width', xScale (dataset[i][j+1]))
                   .attr ('height', barHeight - space)
                   .attr ('id', 'cell_' + i + j)
                   .attr ('fill', colours_Outcomes[j])
                   .attr ('barLabel', labels_Outcomes[j]) 
                   .attr ('barValue', dataset[i][j+1])
                   .on ('mousemove', function(d)
                   {
                       xPosition = d3.event.pageX; 
                       yPosition = d3.mouse(this)[1] - 26;

                       var outputStr = '';
                       outputStr += d3.select(this).attr ('barLabel');
                       outputStr += '<hr>';
                       outputStr += d3.select(this).attr ('barValue');

                       d3.select ('#tooltip')
                         .style ('left', xPosition + 'px')
                         .style ('top', yPosition + 'px')
                         .select ('#label').html ( outputStr ); 

                       d3.select ('#tooltip').classed ('hidden', false);
                   } )
                   .on ('mouseout', function(d) 
                   { 
                       // Remove the tooltip
                       d3.select ('#tooltip').classed ('hidden', true);
                   } ); 

                   xPos += dataset[i][j+1];

            } // for j

            svg.append ('text')
               .attr ('x', -10)
               .attr ('y', yScale (2.5 - i) + 5)
               .attr ('text-anchor', 'end')
               .text (labels_Genders[i])
               .attr ('class', 'textOutput')
               .attr ('id', 'label_' + i);
 
            svg.append ('text')
               .attr ('x', xScale(xPos) + 5)
               .attr ('y', yScale (2.5 - i) + 5)
               .text (xPos)
               .attr ('text-anchor', 'start')
               .attr ('class', 'textOutput')
               .attr ('id', 'output_' + i);
        }


        //
        // absolute / percent button callback
        //
        d3.selectAll ('.datarange').on ('click', function()
        {
            // console.log ('dataRange button CB');  

            var selBtnID = +d3.select(this).node().getAttribute ('stateID');
            //console.log ('selBtnID  ' + selBtnID);  

            if (selBtnID != selected)
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

            // update the range
            xScale.domain ( [ 0, maxAbsRow[selBtnID] ] );

            var offset = 0;
            var suffix = '';
            if (selBtnID == 1)
            {
                        offset = 3;
                        suffix = ' %'
            }

            // Get the data and modify the rects
            for (var i = 0; i < 3; i++)
            {   
                var xPos = 0;
 
                for (var j = 0; j < 3; j++)
                {   
                    d3.select ('#cell_' + i + j)
                      .transition ()
                      .duration (updateDuration)
                      .attr ('x', xScale (xPos)) 
                      .attr ('y', yScale (3 - i) + space)
                      .attr ('width', xScale (dataset[i + offset][j+1]))
                      .attr ('height', barHeight - space)
                      .attr ('fill', colours_Outcomes[j])
                      .attr ('barValue', (dataset[i + offset][j+1]).toFixed(1) + suffix);
                        
                      xPos += dataset[i + offset][j+1];
                }
                    
                if (selBtnID == 0)
                {
                    d3.select ('#output_' + i) 
                      .attr ('x', xScale(xPos) + 5)
                      .attr ('y', yScale (2.5 - i) + 5)
                      .attr ('text-anchor', 'start')
                      .text (xPos)
                      .transition ()
                      .duration (updateDuration)
                      .attr ('opacity', 1);
                }
                else if (selBtnID == 1)
                {
                    d3.select ('#output_' + i) 
                      .transition ()
                      .duration (updateDuration)
                      .attr ('opacity', 0);
                }
            } 

            selected = selBtnID;

        } );

    } );

}


