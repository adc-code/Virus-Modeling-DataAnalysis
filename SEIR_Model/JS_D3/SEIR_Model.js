function D3SVGApp ()
{
    // 
    // ODE Stuff...
    // 

    var timeStart  =   0;
    var timeEnd    =  50;
    var deltaT     = 0.1;

    var beta    = 0.5;
    var gamma   = 0.2;
    var epsilon = 0.5;
    var alpha   = 0; //0.005;
    var mu      = 0; //0.001;
        
    var capLevel = 0.2;

    var S_0 = 0.99;
    var E_0 = 0.01;
    var I_0 = 0.00;
    var R_0 = 0.00;


    var dSdt = function (S, E, I, R)
    {
        return  alpha  -  beta * S * I  -  mu * S;
    };


    var dEdt = function (S, E, I, R)
    {
        return  beta * S * I  -  epsilon * E  -  mu * E;
    };


    var dIdt = function (S, E, I, R)
    {
        return  epsilon * E  -  gamma * I  -  mu * I
    };


    var dRdt = function (S, E, I, R)
    {
        return  gamma * I  -  mu * R;
    };


    var ComputeValues = function (S_0, E_0, I_0, R_0, time_1, time_2)
    {
        var t_n = time_1;
        var S_n = S_0;
        var E_n = E_0;
        var I_n = I_0;
        var R_n = R_0;

        var maxValue = 0;

        // The number of datapoints
        var NumPoints  = Math.ceil ( (time_2 - time_1) / deltaT );

        var Results   = [];
        Results.push ( {'t': time_1, 'S': S_0, 'E': E_0, 'I': I_0, 'R': R_0} );

        for (var i = 0; i < NumPoints; i++)
        {
            var k1 = deltaT * dSdt (S_n, E_n, I_n, R_n);
            var l1 = deltaT * dEdt (S_n, E_n, I_n, R_n);
            var m1 = deltaT * dIdt (S_n, E_n, I_n, R_n);
            var n1 = deltaT * dRdt (S_n, E_n, I_n, R_n);

            var k2 = deltaT * dSdt (S_n + 0.5*k1, E_n + 0.5*l1, I_n + 0.5*m1, R_n + 0.5*n1);
            var l2 = deltaT * dEdt (S_n + 0.5*k1, E_n + 0.5*l1, I_n + 0.5*m1, R_n + 0.5*n1);
            var m2 = deltaT * dIdt (S_n + 0.5*k1, E_n + 0.5*l1, I_n + 0.5*m1, R_n + 0.5*n1);
            var n2 = deltaT * dRdt (S_n + 0.5*k1, E_n + 0.5*l1, I_n + 0.5*m1, R_n + 0.5*n1);

            var k3 = deltaT * dSdt (S_n + 0.5*k2, E_n + 0.5*l2, I_n + 0.5*m2, R_n + 0.5*n2);
            var l3 = deltaT * dEdt (S_n + 0.5*k2, E_n + 0.5*l2, I_n + 0.5*m2, R_n + 0.5*n2);
            var m3 = deltaT * dIdt (S_n + 0.5*k2, E_n + 0.5*l2, I_n + 0.5*m2, R_n + 0.5*n2);
            var n3 = deltaT * dRdt (S_n + 0.5*k2, E_n + 0.5*l2, I_n + 0.5*m2, R_n + 0.5*n2);

            var k4 = deltaT * dSdt (S_n + k3, E_n + l3, I_n + m3, R_n + n3);
            var l4 = deltaT * dEdt (S_n + k3, E_n + l3, I_n + m3, R_n + n3);
            var m4 = deltaT * dIdt (S_n + k3, E_n + l3, I_n + m3, R_n + n3);
            var n4 = deltaT * dRdt (S_n + k3, E_n + l3, I_n + m3, R_n + n3);

            S_n = S_n + 1/6 * (k1 + 2*k2 + 2*k3 + k4);
            E_n = E_n + 1/6 * (l1 + 2*l2 + 2*l3 + l4);
            I_n = I_n + 1/6 * (m1 + 2*m2 + 2*m3 + m4);
            R_n = R_n + 1/6 * (n1 + 2*n2 + 2*n3 + n4);

            t_n = t_n + deltaT;

            var tmpMax = d3.max ( [S_n, E_n, I_n, R_n] );
            if (tmpMax > maxValue)
                maxValue = tmpMax;

            //console.log (maxValue);

            Results.push ( { 't': t_n, 'S': S_n, 'E': E_n, 'I': I_n, 'R': R_n } );
        }

        return { 'data': Results, 'maxValue': maxValue };

    }; // function ComputeValues


    //
    // D3 Stuff...
    //
    var margin = { top: 10, right: 45, bottom: 60, left: 70 };
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
                  .x (function (d)    {  return xScale (d.t);  })    
                  .y (function (d)    {  return yScale (d.S);  })   
                  .curve (d3.curveMonotoneX) 

    var lineE = d3.line ()
                  .x (function (d)    {  return xScale (d.t);  })    
                  .y (function (d)    {  return yScale (d.E);  })   
                  .curve (d3.curveMonotoneX) 

    var lineI = d3.line ()
                  .x (function (d)    {  return xScale (d.t);  })    
                  .y (function (d)    {  return yScale (d.I);  })   
                  .curve (d3.curveMonotoneX) 

    var lineR = d3.line ()
                  .x (function (d)    {  return xScale (d.t);  })   
                  .y (function (d)    {  return yScale (d.R);  })  
                  .curve (d3.curveMonotoneX) 

    var lineCap = d3.line ()
                    .x (function (d)    {  return xScale (d.t);  })   
                    .y (function (d)    {  return yScale (d.y);  })  

    var dataset = ComputeValues (S_0, E_0, I_0, R_0, timeStart, timeEnd);

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
                  .tickFormat (d => Math.floor (100 * d) + "%");  

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
       .datum (dataset.data)         
       .attr ('class', 'lineS')
       .attr ('d', lineS);    

    svg.append ('path')
       .datum (dataset.data)         
       .attr ('class', 'lineE') 
       .attr ('d', lineE);     

    svg.append ('path')
       .datum (dataset.data)         
       .attr ('class', 'lineI') 
       .attr ('d', lineI);     

    svg.append ('path')
       .datum (dataset.data)         
       .attr ('class', 'lineR') 
       .attr ('d', lineR);     

    svg.append ('path')
       .datum ( [ {t: timeStart, y: capLevel}, {t: timeEnd, y: capLevel} ] )
       .attr ('class', 'lineCap') // Assign a class for styling 
       .attr ('d', lineCap);

    //
    // Axis labels...
    //
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

    var legendLabels  = [ 'Susceptible', 'Exposed', 'Infected', 'Recovered' ];
    var legendColours = [ '#0033cc', '#990099', '#ffab00', '#009933' ];
    var legendOffset  = 15;

    for (var i = 0; i < 4; i++)
    {
        svg.append ('rect')
           .attr ('x', xScale (legendOffset * i))
           .attr ('y', height + 0.5 * margin.bottom)
           .attr ('width', 10)
           .attr ('height', 10)
           .attr ('fill', legendColours[i]);

        svg.append ('text')
           .style ('text-anchor', 'left')
           .text (legendLabels[i])
           .attr ('x', xScale (legendOffset * i) + 15)
           .attr ('y', height + 0.5 * margin.bottom + 10)
           .attr ('class', 'axisLabel');
    }


    var redrawGraph = function ()
    {
        dataset = ComputeValues (S_0, E_0, I_0, R_0, timeStart, timeEnd);

        maxValue = Math.ceil (dataset.maxValue * 10) / 10;

        if (maxValue < 1)
            maxValue = 1;

        yScale.domain ([0, maxValue]);

        // Update x-axis
        svg.select ('.y.axis')
           .transition ()
           .duration (250)
           .call (yAxis); 

        svg.select ('.lineS').attr ('d', lineS (dataset.data));
        svg.select ('.lineE').attr ('d', lineE (dataset.data));
        svg.select ('.lineI').attr ('d', lineI (dataset.data));
        svg.select ('.lineR').attr ('d', lineR (dataset.data));
    };


    // 
    // Various callbacks...
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
        d3.select ('#gammaValue').text (gamma.toFixed(2)); 
                      
        redrawGraph ();                            
    });


    d3.select ('input#sliderEps').on ('input', function() 
    {
        epsilon = +d3.select(this).node().value;
        d3.select ('#epsilonValue').text (epsilon.toFixed(2)); 
                      
        redrawGraph ();                            
    });


    d3.select ('input#sliderAlpha').on ('input', function() 
    {
        alpha = +d3.select(this).node().value / 1000;
        d3.select ('#alphaValue').text ( (1000 * alpha).toFixed(0) ); 

        //console.log ('alpha = ', alpha);
                      
        redrawGraph ();                            
    });


    d3.select ('input#sliderMu').on ('input', function() 
    {
        mu = +d3.select(this).node().value / 1000;
        d3.select ('#muValue').text ( (1000 * mu).toFixed(0) ); 

        //console.log ('mu = ', mu);
                      
        redrawGraph ();                            
    });


    d3.select ('input#sliderCapacity').on ('input', function()
    {
        capLevel = +d3.select(this).node().value;
        //capValue.innerHTML = ((100 * capLevel).toFixed(0)).toString() + "%";
        d3.select ('#capValue').text ( ((1000 * capLevel).toFixed(0)).toString() + "%" ); 

        // console.log (capLevel);

        lineData = [ {t: 0, y: capLevel}, {t: timeEnd, y: capLevel} ];
        svg.select ('.lineCap').attr ('d', lineCap(lineData));
    });


    d3.select ('input#sliderTimeMax').on ('input', function()
    {
        timeEnd = +d3.select(this).node().value;
        timeMaxValue.innerHTML = timeEnd;
        xScale.domain ([timeStart, timeEnd]);
   
        // Update x-axis
        svg.select ('.x.axis')
           .transition ()
           .duration (500)
           .call (xAxis);

        redrawGraph ();                            
    });
}



