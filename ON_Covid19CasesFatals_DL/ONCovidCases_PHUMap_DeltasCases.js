function D3MapApp ()
{
    // Width and height
    var overallWidth  = 600;
    var overallHeight = 500;

    // SVG Width, height, and some added spacing
    var margin = {
            top:    0,
            right:  0,
            bottom: 0,
            left:   0
    };

    var width  = overallWidth - margin.left - margin.right;
    var height = overallHeight - margin.top - margin.bottom;

           
    var AreasOfInterest = {
        NW:  [ -90.962631, 51.387821, 2 ],
        NE:  [ -83.068382, 49.409674, 2 ],
        EA:  [ -76.298815, 44.948434, 7 ],
        CE:  [ -78.944480, 44.254501, 9 ],
        TOR: [ -79.3832,  43.6532, 14 ],
        CW:  [ -79.844480, 43.254501, 9 ],
        SW:  [ -81.9582077, 42.838026, 7 ],
        ALL: [ -85.3,     50,      1 ]
    };
            

    var currSelectedRegion   = 'ALL';
    var currSelectedDataType = 0;

    var currSliderIndex      = 0;

    var TotalValues = [ {}, {}, {}, {} ];
    var MaxValues;
    var OverallMax = 1;
  
    var CircleRad   = 7; 

    var UpdateDuration = 500;

    var datasetBounds = [ ];
    var dataTypeIndex = [ 0,     // Cumm. Case Totals
                          2,     // Rate of Cumm. Case Total growth 
                          3,     // Fatal Case Totals
                          5  ];  // Rate of Fatal Case Total growth


    // Tooltip data label...
    var TTLabel = [ 'Total Cases: ', 
                    'Average Rate of New Cases/Day: ', 
                    'Total Fatalities: ', 
                    'Average Rate of New Fatalities/Day: ' ]; 
    var TTStrings = [ {}, {} ];


    var DTBtnColours = [ d3.interpolatePuBu (0.95),         // Total Cases
                         d3.interpolateGreens (0.95),       // Resolved
                         d3.interpolateGreys (0.95),        // Not Resolved
                         d3.interpolatePurples (0.95)  ];   // Fatal

    var projection = d3.geoMercator ()
                       .center ([ AreasOfInterest['ALL'][0], AreasOfInterest['ALL'][1] ])
		       .scale (1200)
                       .translate ( [width / 2, height / 2] )

    // Define path generator, using the Albers USA projection
    var path = d3.geoPath ()
                 .projection ( projection );

    // Make the SVG
    var svg = d3.select ('#graph').append('svg')
                .attr ('width', width + margin.left + margin.right)
                .attr ('height', height + margin.top + margin.bottom)
                .append ('g')
                .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var dataMapping = { 2: 'Algoma',             3: 'Brant',     
                        4: 'Chatham-Kent',       5: 'Durham', 
                        6: 'Eastern',            7: 'Grey',      
                        8: 'Haldimand-Norfolk',  9: 'Haliburton',
                       10: 'Halton',            11: 'Hamilton', 
                       12: 'Hastings',          13: 'Huron',
                       14: 'Kingston',          15: 'Lambton', 
                       16: 'Leeds',             17: 'Middlesex-London',
                       18: 'Niagara',           19: 'North', 
                       20: 'Northwestern',      21: 'Ottawa',
                       22: 'Peel',              23: 'Peterborough', 
                       24: 'Porcupine',         25: 'Renfrew',
                       26: 'Simcoe',            27: 'Southwestern', 
                       28: 'Sudbury',           29: 'Thunder',
                       30: 'Timiskaming',       31: 'Toronto', 
                       32: 'Region',            33: 'Wellington-Dufferin-Guelph', 
                       34: 'Windsor-Essex',     35: 'York', };

    var revDictLookup = function (id)
    {
        var keys = Object.keys (dataMapping);
        for (var i = 0; i < keys.length; i++)
            if (dataMapping[keys[i]] == id)
                return keys[i];
    };


    //
    // used to parse the CSV file properly
    //
    var rowConverter = function (d) 
    {
        // console.log (d);

        return [
            new Date (new Date (d['Dates']).getTime() + 1000*60*60*5),  parseInt(d['Type']),                            //  0  1
            parseFloat (d['Algoma']),                                  parseFloat (d['Brant']),                         //  2  3
            parseFloat (d['Chatham-Kent']),                            parseFloat (d['Durham']),                        //  4  5
            parseFloat (d['Eastern']),                                 parseFloat (d['Grey Bruce']),                    //  6  7
            parseFloat (d['Haldimand-Norfolk']),                       parseFloat (d['Haliburton Kawartha Pineridge']), //  8  9
            parseFloat (d['Halton']),                                  parseFloat (d['Hamilton']),                      // 10 11
            parseFloat (d['Hastings Prince Edward']),                  parseFloat (d['Huron Perth']),                   // 12 13
            parseFloat (d['Kingston Frontenac Lennox & Addington']),   parseFloat (d['Lambton']),                       // 14 15
            parseFloat (d['Leeds Grenville and Lanark']),              parseFloat (d['Middlesex-London']),              // 16 17
            parseFloat (d['Niagara']),                                 parseFloat (d['North Bay Parry Sound']),         // 18 19
            parseFloat (d['Northwestern']),                            parseFloat (d['Ottawa']),                        // 20 21
            parseFloat (d['Peel']),                                    parseFloat (d['Peterborough']),                  // 22 23
            parseFloat (d['Porcupine']),                               parseFloat (d['Renfrew']),                       // 24 25
            parseFloat (d['Simcoe Muskoka']),                          parseFloat (d['Southwestern']),                  // 26 27
            parseFloat (d['Sudbury']),                                 parseFloat (d['Thunder Bay']),                   // 28 29
            parseFloat (d['Timiskaming']),                             parseFloat (d['Toronto']),                       // 30 31
            parseFloat (d['Waterloo']),                                parseFloat (d['Wellington Dufferin Guelph']),    // 32 33
            parseFloat (d['Windsor-Essex']),                           parseFloat (d['York']),                          // 34 35                         
        ];  
    }


    //
    // Update the colours on the map
    //
    var UpdateFillColours = function (updateTime)
    {
        // var OverallMax = d3.max ( MaxValues[0] );

        for (var i = 2; i < dataset[0].length; i++)
        {
            var OverallMax = d3.max ( MaxValues[ currSelectedDataType ] );
            var value = Math.log10 (dataset[ currSliderIndex ][i] + 1) / Math.log10 (OverallMax);

            var colourVal = 0;
            if (currSelectedDataType == 0)
                colourVal = d3.interpolatePuBu (value);
            else if (currSelectedDataType == 1)
                colourVal = d3.interpolateGreens (value);
            else if (currSelectedDataType == 2)
                colourVal = d3.interpolateGreys (value);    
            else if (currSelectedDataType == 3)
                colourVal = d3.interpolatePurples (value);    
                        
            d3.select ('#' + dataMapping[i]).transition().duration(updateTime).style ('fill', colourVal);
        }
    }


    //
    // Callback to deal with the slider...
    //
    var UpdateSliderBounds = function ()
    {
        var originalMin   = d3.select ('#sliderDate').attr ('min');
        var originalMax   = d3.select ('#sliderDate').attr ('max');
        var originalValue = d3.select ('#sliderDate').node().value;

        var orgPercent = (originalValue - originalMin) / (originalMax - originalMin);

        // console.log (originalMin, originalMax, originalValue, orgPercent);

        d3.select ('#sliderDate').attr ('min', datasetBounds[ dataTypeIndex[currSelectedDataType] ][0]);
        d3.select ('#sliderDate').attr ('max', datasetBounds[ dataTypeIndex[currSelectedDataType] ][1]);

        currSliderIndex = Math.round ( orgPercent * (datasetBounds[ dataTypeIndex[currSelectedDataType] ][1] - 
                                                     datasetBounds[ dataTypeIndex[currSelectedDataType] ][0])  
                                                  +  datasetBounds[ dataTypeIndex[currSelectedDataType] ][0] ); 

        // console.log (datasetBounds[ dataTypeIndex[currSelectedDataType] ][0], datasetBounds[ dataTypeIndex[currSelectedDataType] ][1]);
        // console.log ('currSliderIndex = ', currSliderIndex);

        d3.select ('#sliderDate').node().value = currSliderIndex;

        d3.select ('#FirstDay').html ( 'Start: ' + dataset[ datasetBounds[ dataTypeIndex[currSelectedDataType] ][0] ][0].toDateString () );
        d3.select ('#LastDay').html ( 'End: ' + dataset[ datasetBounds[ dataTypeIndex[currSelectedDataType] ][1] ][0].toDateString () );
        d3.select ('#SelDay').html ( 'Selected: ' + dataset[ currSliderIndex ][0].toDateString () );
    }


    //
    // Utility to make ID name to allow lookups on date
    //
    var MakeIDName = function (name)
    {
        return name.split(',').join(' ').split (' ')[0]
    }


    //
    // Load in GeoJSON data
    //
    d3.json ("Updated_ON_PHU_Map.json").then (function(json) 
    {
        //console.log (json);

        // Bind data and create one path per GeoJSON feature
        svg.selectAll ('PHUArea')
           .data (json.features)
           .enter ()
           .append ('path')
           .attr ('class', 'PHUArea')
           .attr ('d', path)
	   .attr ('id',   function (d, i) { return MakeIDName (json.features[i].properties.ENGLISH_NAME); })
	   .attr ('PHUName', function (d, i) { return json.features[i].properties.ENGLISH_NAME; })
           .attr ('PHUIndex', function (d, i) { return i; }) 
           .on ('mousemove', function(d)
           {
               var xPosition = d3.event.pageX; 
               var yPosition = d3.event.pageY + 15; 

               var outputStr = d3.select(this).attr ('PHUName') + '<hr>';
               outputStr += TTLabel[currSelectedDataType];

               var value = dataset[ currSliderIndex ][ revDictLookup ( d3.select(this).attr ('id')) ];
               if (currSelectedDataType == 1 || currSelectedDataType == 3) 
                   value = value.toFixed (1);

               outputStr += value;

               d3.select ('#tooltip')
                 .style ('left', xPosition + 'px')
                 .style ('top', yPosition + 'px')
                 .select ('#label').html ( outputStr );

               d3.select ('#tooltip').classed ('hidden', false); 
           } )
           .on ('mouseout', function(d)
           {
               d3.select ('#tooltip').classed ('hidden', true);
           } );

        // Make circles for the cities... they are shown when needed
        for (var i = 0; i < json.features.length; i++)
        {
            var point = projection ( [json.features[i].properties.long, json.features[i].properties.lat] );

            var TTText = '';
            TTText += '<strong>' + json.features[i].properties.ENGLISH_NAME + '</strong>';
            TTText += '<hr>';
            TTText += json.features[i].properties.city + '<br>';
            TTText += json.features[i].properties.address + '<br>';
            TTText += json.features[i].properties.postalcode;

            svg.append ('circle')
               .attr ('cx', point[0])
               .attr ('cy', point[1])
               .attr ('r', 5)
               .attr ('fill', '#ff3300')
               .attr ('id', 'CIRC_' + MakeIDName (json.features[i].properties.ENGLISH_NAME) )
               .attr ('class', json.features[i].properties.region )
               .style ('display', 'none')
               .attr ('tttext', TTText)
               .on ('mousemove', function(d)
               {
                   var xPosition = d3.event.pageX;
                   var yPosition = d3.event.pageY + 15;

                   d3.select ('#tooltip')
                     .style ('left', xPosition + 'px')
                     .style ('top', yPosition + 'px')
                     .select ('#label').html ( d3.select(this).attr ('tttext') );

                   d3.select ('#tooltip').classed ('hidden', false);
               } )
               .on ('mouseout', function(d)
               {
                   d3.select ('#tooltip').classed ('hidden', true);
               } );
        }


        d3.csv ('ONCovidCases_PHUDailyChanges.csv', rowConverter).then (function (data) 
        {
            // console.log (data);            
            dataset = data;

            datasetBounds = [ ];

            var startIndex = 0;
            for (var type = 1; type <= 6; type++)
            {
                var endIndex = dataset.length - 1;
                for (var i = startIndex; i < dataset.length; i++)
                {
                    if (dataset[i][1] != type)
                    {
                        endIndex = i-1;
                        break;
                    }
                }

                datasetBounds.push ( [startIndex, endIndex] );
                startIndex = endIndex+1;
            }

            // console.log (datasetBounds);

            UpdateSliderBounds ();

            d3.select ('#DTbtn_' + currSelectedDataType).style ('background-color', DTBtnColours[currSelectedDataType]);
            d3.select ('#DTbtn_' + currSelectedDataType).style ('color', '#fff');
            d3.select ('#' + currSelectedRegion).classed ('button_sel', true);

            MaxValues = [ ];

            // reminder... we are looking at datasets 0, 2, 3, and 5
            var dataElems = [ 0, 2, 3, 5 ];
                    
            for (var i = 0; i < dataElems.length; i++)
            {
                // in these cases, the max is the final line of the data
                if (i == 0 || i == 2)
                {
                    var lastLine = dataset[ datasetBounds[ dataElems[i] ][1] ].slice ();
                    lastLine.shift(); lastLine.shift(); 
                         
                    MaxValues.push (lastLine);    
                }
                else
                {
                    var tmpMaxValues = dataset [ datasetBounds[ dataElems[i] ][0] ].slice ()
                    tmpMaxValues.shift(); tmpMaxValues.shift(); 

                    // Go through the elements and find the max
                    for (var j = datasetBounds[ dataElems[i] ][0]; j < datasetBounds[ dataElems[i] ][1]; j++)
                    {
                        for (var k = 2; k < dataset[0].length; k++)
                        {
                            if (dataset[j][k] > tmpMaxValues[k-2])
                                tmpMaxValues[k-2] = dataset[j][k];
                        }
                    }

                    MaxValues.push (tmpMaxValues);
                }
            }

            // console.log (MaxValues);

            UpdateFillColours (0);

        } );
  
    } );



    //
    // CB for region buttons
    //
    d3.selectAll ('.regionBtn').on ('click', function() 
    {
        var regionId = d3.select(this).node().getAttribute ('id');
        if (regionId != currSelectedRegion)
        {
            d3.select ('#' + currSelectedRegion).classed ('button_sel', false);
            d3.select ('#' + regionId).classed ('button_sel', true);
        }
        else
        {
            // do nothing...
            return;
        }

        currSelectedRegion = regionId;

        var point = projection ( [ AreasOfInterest[regionId][0], AreasOfInterest[regionId][1] ] );
        var scale = AreasOfInterest [regionId][2];

        if (regionId == 'ALL') 
            TTType = 0;
        else
            TTType = 1;

        d3.selectAll ('circle')
          .transition ()
          .duration (UpdateDuration/2)
          .style ('display', 'none');

        d3.selectAll ('.' + regionId + '_Region').attr ('r', 0); 
        d3.selectAll ('.' + regionId + '_Region')
          .transition ()
          .duration (UpdateDuration/2)
          .style ('display', 'block');
                
        svg.transition()
           .duration (UpdateDuration*2)
           .attr ('transform', 'translate(' + width/2 + ',' + height/2 + ')scale(' + scale + ')translate(' + (-point[0]) + ',' + (-point[1]) + ')')
           .on ('end', function () 
           { 
               d3.selectAll ('.' + regionId + '_Region')
                 .transition ()
                 .duration (UpdateDuration/2)
                 .attr ('r', CircleRad / scale); 
           } );
    } ); 



    //
    // CB for data type buttons...
    //
    d3.selectAll ('.dataTypeBtn').on ('click', function()
    {
        // Update the UI button highlighting if it has changed...

        var val = d3.select(this).node().getAttribute ('val');
        if (val != currSelectedDataType)
        {
            d3.select ('#DTbtn_' + val).style ('background-color', DTBtnColours[val]);
            d3.select ('#DTbtn_' + val).style ('color', '#fff');

            d3.select ('#DTbtn_' + currSelectedDataType).style ('background-color', null);
            d3.select ('#DTbtn_' + currSelectedDataType).style ('color', null);
        }
        else
        {
            return;
        }

        currSelectedDataType = val;

        // update slider range
        UpdateSliderBounds ();

        // and update the fill colours...
        UpdateFillColours (UpdateDuration); 
    } );


           
    //
    // CB function to deal with the slider
    //
    d3.select ('input#sliderDate').on ('input', function() 
    {
        // get the value from the slider...
        var index = +d3.select(this).node().value;
        currSliderIndex = +d3.select(this).node().value;

        // Update the map colouring and the date string...
        UpdateFillColours (0);
        d3.select ('#SelDay').html ( 'Selected: ' + dataset[ currSliderIndex ][0].toDateString () );

    } );

}


