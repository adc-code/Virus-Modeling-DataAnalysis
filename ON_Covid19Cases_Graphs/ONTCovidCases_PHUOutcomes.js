function D3App ()
{
    // The data...
    var dataFile = 'ONCovidCases_PHUOutcomes.csv';

    var dataset, xScale, yScale;

    var selected = 0;

    var colours_Outcomes = [ '#008000', '#e68a00', '#595959' ];
    var labels_Outcomes = [ 'Resolved', 'Not Resolved', 'Fatal' ];

    // SVG Width, height, and some added spacing
    var margin = {
            top:    5,
            right:  50,
            bottom: 15,
            left:   280
    };

    var width  = 570 - margin.left - margin.right;
    var height = 550 - margin.top - margin.bottom;

    var updateDuration = 500;


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [
            d['PHUName'], 
            parseInt (d['TotalCases']), 
            parseInt (d['Resolved']), 
            parseInt (d['Not_Resolved']),
            parseInt (d['Fatal']) 
        ];  
    }


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        // console.log (data);            
        dataset = data;

        var dataRange = [ 0, dataset.length ];

        // Find various Max values
        var maxCol = [ 0, 0, 0, 0 ];

        for (var i = 0; i < dataset.length; i++)
        {
            for (var j = 1; j <= 4; j++)
            {
                if (dataset[i][j] > maxCol[j-1])
                    maxCol[j-1] = dataset[i][j];
            }
        }

        //console.log (maxCol);
 
        var svg = d3.select ('#graph').append('svg')
                    .attr ('width', width + margin.left + margin.right)
                    .attr ('height', height + margin.top + margin.bottom)
                    .append ('g')
                    .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

 
        // Define the scales to convert our data to screen coordinates
        xScale = d3.scaleLinear ()
                   .domain ( [ 0, maxCol[0] ] )
                   .range ( [ 0, width ] ); 

        yScale = d3.scaleLinear ()
                   .domain ( dataRange )
                   .range ( [ height, 0 ] ); 

        var space     = 1;
        var barHeight = yScale(1) - yScale(2);

        for (var i = 0; i < dataset.length; i++)
        {
            var xPos = 0;
            for (var j = 2; j <= 4; j++)
            {
                svg.append ('rect')
                   .attr ('x', xScale (xPos))
                   .attr ('y', yScale (dataset.length - i) + space)
                   .attr ('width', xScale (dataset[i][j]))
                   .attr ('height', barHeight - space)
                   .attr ('id', 'cell_' + i + (j-2) )
                   .attr ('fill', colours_Outcomes[j-2])
                   .attr ('barLabel', labels_Outcomes[j-2]) 
                   .attr ('barValue', dataset[i][j]);

                xPos += dataset[i][j];

            } // for j

            svg.append ('text')
               .attr ('x', -10)
               .attr ('y', yScale (dataset.length - 0.5 - i) + 5)
               .attr ('text-anchor', 'end')
               .text (dataset[i][0])
               .attr ('class', 'textOutput')
               .attr ('id', 'label_' + i);

            svg.append ('text')
               .attr ('x', xScale(dataset[i][1]) + 5)
               .attr ('y', yScale(dataset.length - 0.5 - i) + 5)
               .text (dataset[i][1])
               .attr ('text-anchor', 'start')
               .attr ('class', 'textOutput')
               .attr ('id', 'output_' + i); 
        }


        //
        // Callback used to handle the total cases/resolved/not resolved/fatal buttons
        //
        d3.selectAll ('.datarange').on ('click', function()
        {
            // console.log ('dataRange button CB');  

            var selBtnID  = +d3.select(this).node().getAttribute ('stateID');
            var dataColID = +d3.select(this).node().getAttribute ('dataColID');

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

            //console.log ('New max = ' +  maxCol[selBtnID] );

            // update the range
            xScale.domain ( [ 0, maxCol[selBtnID] ] );

            // Get the data and modify the rects
            for (var i = 0; i < dataset.length; i++)
            {   
                var startPos = 0;
 
                for (var j = 2; j <= 4; j++)
                {   
                    var barWidth = 0;
                    if (selBtnID == 0 || j == (selBtnID+1))
                        barWidth = dataset[i][j];

                    d3.select ('#cell_' + i + (j-2) )
                      .transition ()
                      .duration (updateDuration)
                      .attr ('x', xScale (startPos)) 
                      .attr ('width', xScale (barWidth));
                        
                    startPos += barWidth;
                }
                    
                d3.select ('#output_' + i) 
                  .transition ()
                  .duration (updateDuration)
                  .attr ('x', xScale(dataset[i][selBtnID+1]) + 5)
                  .text (dataset[i][selBtnID + 1]); 
            }  

            selected = selBtnID;

        } );

    } );

}



