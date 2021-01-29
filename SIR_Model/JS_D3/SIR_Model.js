
function D3SVGApp ()
{
    // 
    // ODE Stuff...
    // 

    var timeStart  =   0;
    var timeEnd    =  50;
    var deltaT     = 0.1;

    var beta   = 0.5;
    var gamma  = 0.2;
        
    var capLevel = 0.2;

    var t_0 = 0.00;
    var S_0 = 0.99;
    var I_0 = 0.01;
    var R_0 = 0.00;


    var dSdt = function (S, I, R) 
    {
        return -beta * S * I;
    };


    var dIdt = function (S, I, R)
    {
        return beta * S * I - gamma * I
    };


    var dRdt = function (S, I, R)
    {
        return gamma * I
    };


    var ComputeValues = function (t_0, S_0, I_0, R_0, time_1, time_2)
    {
        var t_n = t_0;
        var S_n = S_0;
        var I_n = I_0;
        var R_n = R_0;

        // The number of datapoints
        var NumPoints  = Math.ceil ( (time_2 - time_1) / deltaT );

        var times     = [t_0];
        var S_Results = [S_0]; 
        var I_Results = [I_0]; 
        var R_Results = [R_0]; 

        var Results   = [];
        Results.push ( {'t': t_0, 'S': S_0, 'I': I_0, 'R': R_0} );

        for (var i = 0; i < NumPoints; i++)
        {
            var k1 = deltaT * dSdt (S_n, I_n, R_n);
            var l1 = deltaT * dIdt (S_n, I_n, R_n);
            var m1 = deltaT * dRdt (S_n, I_n, R_n);

            var k2 = deltaT * dSdt (S_n + 0.5*k1, I_n + 0.5*l1, R_n + 0.5*m1);
            var l2 = deltaT * dIdt (S_n + 0.5*k1, I_n + 0.5*l1, R_n + 0.5*m1);
            var m2 = deltaT * dRdt (S_n + 0.5*k1, I_n + 0.5*l1, R_n + 0.5*m1);

            var k3 = deltaT * dSdt (S_n + 0.5*k2, I_n + 0.5*l2, R_n + 0.5*m2);
            var l3 = deltaT * dIdt (S_n + 0.5*k2, I_n + 0.5*l2, R_n + 0.5*m2);
            var m3 = deltaT * dRdt (S_n + 0.5*k2, I_n + 0.5*l2, R_n + 0.5*m2);

            var k4 = deltaT * dSdt (S_n + k3, I_n + l3, R_n + m3);
            var l4 = deltaT * dIdt (S_n + k3, I_n + l3, R_n + m3);
            var m4 = deltaT * dRdt (S_n + k3, I_n + l3, R_n + m3);

            S_n = S_n + 1/6 * (k1 + 2*k2 + 2*k3 + k4);
            I_n = I_n + 1/6 * (l1 + 2*l2 + 2*l3 + l4);
            R_n = R_n + 1/6 * (m1 + 2*m2 + 2*m3 + m4);

            t_n = t_n + deltaT;

            Results.push ( { 't': t_n, 'S': S_n, 'I': I_n, 'R': R_n } );
        }

        return Results;

    }; // function ComputeValues


    //
    // D3 Stuff...
    //
    var margin = { top: 10, right: 45, bottom: 60, left: 70 };

    // var width  = 0.66 * window.innerWidth  - margin.left - margin.right;
    // var height = 0.66 * window.innerHeight - margin.top  - margin.bottom; 
    var width  = 550  - margin.left - margin.right;
    var height = 330  - margin.top  - margin.bottom; 

    // X scale will use the index of our data
    var xScale = d3.scaleLinear ()
                   .domain ([timeStart, timeEnd])   // input
                   .range ([0, width]);             // output

    // Y scale will use the randomly generate number 
    var yScale = d3.scaleLinear ()
                   .domain ([0, 1])                 // input 
                   .range ([height, 0]);            // output 

    var lineS = d3.line ()
                  .x (function(d)    {  return xScale (d.t);  })     // set the x values for the line generator
                  .y (function(d)    {  return yScale (d.S);  })     // set the y values for the line generator 
                  .curve (d3.curveMonotoneX) // apply smoothing to the line

    var lineI = d3.line ()
                  .x (function(d)    {  return xScale (d.t);  })     // set the x values for the line generator
                  .y (function(d)    {  return yScale (d.I);  })     // set the y values for the line generator 
                  .curve (d3.curveMonotoneX) // apply smoothing to the line

    var lineR = d3.line ()
                  .x (function(d)    {  return xScale (d.t);  })     // set the x values for the line generator
                  .y (function(d)    {  return yScale (d.R);  })     // set the y values for the line generator 
                  .curve (d3.curveMonotoneX) // apply smoothing to the line

    var lineCap = d3.line ()
                    .x (function(d)    {  return xScale (d.t);  })     // set the x values for the line generator
                    .y (function(d)    {  return yScale (d.y);  })     // set the y values for the line generator 

    var dataset = ComputeValues (t_0, S_0, I_0, R_0, timeStart, timeEnd);

    var svg = d3.select ('div#graph')
                .append ('svg')
                .attr ('width', width + margin.left + margin.right)
                .attr ('height', height + margin.top + margin.bottom)
                .append ('g')
                .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Define axes
    var xAxis = d3.axisBottom ()
                  .scale (xScale);

    // Define Y axis
    var yAxis = d3.axisLeft ()
                  .scale (yScale)
                  .tickFormat (d => 100 * d + "%");  

    // Create axes
    svg.append ('g')
       .attr ('class', 'x axis')
       .attr ('transform', 'translate(0,' + height + ')')
       .call (xAxis);

    svg.append ('g')
       .attr ('class', 'y axis')
       .attr ('transform', 'translate(' + 0 + ',0)')
       .call (yAxis); 

    svg.append ('path')
       .datum (dataset)         
       .attr ('class', 'lineI') 
       .attr ('d', lineI);      

    svg.append ('path')
       .datum (dataset)         
       .attr ('class', 'lineS') 
       .attr ('d', lineS);      

    svg.append ('path')
       .datum (dataset)         
       .attr ('class', 'lineR') 
       .attr ('d', lineR);     

    svg.append ('path')
       .datum ( [ {t: timeStart, y: capLevel}, {t: timeEnd, y: capLevel} ] )
       .attr ('class', 'lineCap') // Assign a class for styling 
       .attr ('d', lineCap);

    svg.append ('text')
       .style ('text-anchor', 'middle')
       .attr ('transform', 'rotate(-90)')
       .attr ('x', -height * 0.5)
       .attr ('y', -margin.left * 0.66)
       .text ('Percent of Population')
       .attr ('class', 'axisLabel');

    svg.append ('text')
       .style ('text-anchor', 'left')
       .text ('Time')
       .attr ('x', xScale (timeEnd) + 0.2 * margin.right )
       .attr ('y', height + 0.2 * margin.bottom)
       .attr ('class', 'axisLabel');

    svg.append ('rect')
       .attr ('x', xScale (0))
       .attr ('y', height + 0.5 * margin.bottom)
       .attr ('width', 10)
       .attr ('height', 10)
       .attr ('fill', '#0033cc');

    svg.append ('text')
       .style ('text-anchor', 'left')
       .text ('Susceptible')
       .attr ('x', xScale (0) + 15)
       .attr ('y', height + 0.5 * margin.bottom + 10)
       .attr ('class', 'axisLabel');

    svg.append ('rect')
       .attr ('x', xScale (15))
       .attr ('y', height + 0.5 * margin.bottom)
       .attr ('width', 10)
       .attr ('height', 10)
       .attr ('fill', '#ffab00');

    svg.append ('text')
       .style ('text-anchor', 'left')
       .text ('Infected')
       .attr ('x', xScale (15) + 15)
       .attr ('y', height + 0.5 * margin.bottom + 10)
       .attr ('class', 'axisLabel');

    svg.append ('rect')
       .attr ('x', xScale (30))
       .attr ('y', height + 0.5 * margin.bottom)
       .attr ('width', 10)
       .attr ('height', 10)
       .attr ('fill', '#009933');

    svg.append ('text')
       .style ('text-anchor', 'left')
       .text ('Removed')
       .attr ('x', xScale (30) + 15)
       .attr ('y', height + 0.5 * margin.bottom + 10)
       .attr ('class', 'axisLabel');


    var redrawGraph = function ()
    {
        dataset = ComputeValues (t_0, S_0, I_0, R_0, timeStart, timeEnd);

        svg.select ('.lineI').attr ('d', lineI (dataset));
        svg.select ('.lineS').attr ('d', lineS (dataset));
        svg.select ('.lineR').attr ('d', lineR (dataset));
    };


    // 
    // Callbacks
    //
    d3.select ('input#sliderBeta').on ('input', function() 
    {
        beta = +d3.select(this).node().value;
        d3.select ('#betaValue').text (beta.toFixed(2)); 

        redrawGraph ();                            
    });


    d3.select ('input#sliderGamma').on ('input', function() 
    {
        gamma = +d3.select(this).node().value;
        d3.select ('#gammaValue').text (gamma.toFixed (2));
                      
        redrawGraph ();                            
    });


    d3.select ('input#sliderCapacity').on ('input', function()
    {
        capLevel = +d3.select(this).node().value;
        d3.select ('#capValue').text (((100 * capLevel).toFixed(0)).toString() + "%");

        // console.log (capLevel);

        lineData = [ {t: 0, y: capLevel}, {t: timeEnd, y: capLevel} ];
        svg.select ('.lineCap').attr ('d', lineCap(lineData));
    });


    d3.select ('input#sliderTimeMax').on ('input', function()
    {
        timeEnd = +d3.select(this).node().value;
        d3.select ('#timeMaxValue').text (timeEnd);
        xScale.domain ([timeStart, timeEnd]);
   
        // Update x-axis
        svg.select ('.x.axis')
           .transition ()
           .duration (500)
           .call (xAxis);

        redrawGraph ();                            
    });
                     
}


