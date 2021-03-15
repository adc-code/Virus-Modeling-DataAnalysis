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

    var TotalValues = [ {}, {}, {}, {} ];
    var MaxValues   = [ 0, 0, 0, 0 ];
  
    var CircleRad   = 7; 

    var UpdateDuration = 500;


    // Tooltip data label...
    var TTLabel = [ 'Total Cases', 'Resolved', 'Not Resolved', 'Fatal' ]; 
    var TTType = 0;   // 0: regular  1: zoomed      
    var TTStrings = [ {}, {} ];

    // Used to map UI element to data element...
    var dataMapping = [ 3,      // Total Cases
                        0,      // Resolved
                        2,      // Not Resolved
                        1 ];    // Fatal


    var DTBtnColours = [ d3.interpolateBlues (0.95),      // Total Cases
                         d3.interpolateGreens (0.95),     // Resolved
                         d3.interpolatePurples (0.95),    // Not Resolved
                         d3.interpolateGreys (0.95)  ];   // Fatal


    var projection = d3.geoMercator ()
                       .center ([ AreasOfInterest['ALL'][0], AreasOfInterest['ALL'][1] ])
		       .scale (1200)
                       .translate ( [width / 2, height / 2] );

    // Define path generator, using the Mercator projection
    var path = d3.geoPath ()
                 .projection ( projection );

    // Make the SVG
    var svg = d3.select ('#graph').append('svg')
                .attr ('width', width + margin.left + margin.right)
                .attr ('height', height + margin.top + margin.bottom)
                .append ('g')
                .attr ('transform', 'translate(' + margin.left + ',' + margin.top + ')');


    //
    // Find data mapping...
    //
    var findDataMapping = function (dataset)
    {
        var TotalIndex       = 0;
        var ResolvedIndex    = 0;
        var NotResolvedIndex = 0;
        var FatalIndex       = 0;

        for (var i = 0; i < 4; i++)
        {
            if (dataset[i][1] == 'Total Cases')
                TotalIndex = i;
            else if (dataset[i][1] == 'Resolved')
                ResolvedIndex = i;
            else if (dataset[i][1] == 'Not Resolved')
                NotResolvedIndex = i;
            else if (dataset[i][1] == 'Fatal')
                FatalIndex = i;
        }

        var mapping = [ TotalIndex, ResolvedIndex, NotResolvedIndex, FatalIndex ];

        return mapping;
    }


    //
    // used to parse the CSV file properly
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
    // Update the colours on the map
    //
    var UpdateFillColours = function (elemType, updateTime)
    {
        for (var key in TotalValues[elemType]) 
        {
            // Logarithmic...
            var value = Math.log10 (TotalValues[elemType][key] + 1) / Math.log10 (MaxValues[elemType]);

            // Linear... 
            // var value = TotalValues[elemType][key] / MaxValues[elemType];

            var colourVal = 0;
            if (elemType == 0)
                colourVal = d3.interpolateBlues (value);      // Total Cases
            else if (elemType == 1)
                colourVal = d3.interpolateGreens (value);     // Resolved
            else if (elemType == 2)
                colourVal = d3.interpolatePurples (value);    // Not Resolved
            else if (elemType == 3)
                colourVal = d3.interpolateGreys (value);      // Fatal

            d3.select ('#' + key)
              .transition ()
              .duration (updateTime)
              .style ('fill', colourVal);
        }
    }


    //
    // Utility to make ID name to allow lookups on date
    //
    var MakeIDName = function (name)
    {
        return name.split(',').join(' ').split (' ')[0]
    }

    // Load in GeoJSON data
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
           .attr ('PHUData', '-') 
           .on ('mousemove', function(d)
           {
               var xPosition = d3.event.pageX; 
               var yPosition = d3.event.pageY + 15; 

               d3.select ('#tooltip')
                 .style ('left', xPosition + 'px')
                 .style ('top', yPosition + 'px')
                 .select ('#label').html ( TTStrings[TTType][ d3.select(this).attr ('id') ] );

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


           d3.csv ('ONCovidCases_PHUAgeOutcomes.csv', rowConverter).then (function (data) 
           {
               //console.log (data);            
               dataset = data;

               dataMapping = findDataMapping (dataset);

               // highlight the default buttons
               d3.select ('#DTbtn_' + currSelectedDataType).style ('background-color', DTBtnColours[currSelectedDataType]);
               d3.select ('#DTbtn_' + currSelectedDataType).style ('color', '#fff');
               d3.select ('#' + currSelectedRegion).classed ('button_sel', true);

               var numPHUs = dataset.length / 4;

               for (var i = 0; i < numPHUs; i++)
               {
                   var TTOutputReg    = '';
                   var TTOutputZoomed = '';

                   TTOutputReg += '<strong>' + dataset[ dataMapping[0] + i*4 ][0] + '</strong>';
                   TTOutputReg += '<hr>'
                   TTOutputReg += '<table width="100%">';

                   var AgeGroupLabels = [ '<20', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s', 'Total' ];

                   TTOutputZoomed = TTOutputReg;
                   TTOutputZoomed += '<tr>'; 
                   TTOutputZoomed += '<td></td>';
                   for (const AgeGroup of AgeGroupLabels)
                       TTOutputZoomed += '<td><strong>' + AgeGroup + '</strong></td>';
                   TTOutputZoomed += '</tr>'; 

                   var PHU_Id = MakeIDName (dataset[ dataMapping[0] + i*4 ][0]);

                   for (var elem = 0; elem < 4; elem++)
                   {
                       var PHUData = dataset [ dataMapping[elem] + i*4 ].slice();
                       PHUData.shift(); PHUData.shift(); PHUData.shift();

                       var total = d3.sum (PHUData);
                       if (total > MaxValues[elem])
                           MaxValues[elem] = total;                                

                       TotalValues[elem][PHU_Id] = total;

                       TTOutputReg += '<tr>'
                       TTOutputReg += '<td><strong>' + TTLabel[elem] + ': ' + '</strong></td>';
                       TTOutputReg += '<td align="right">' + total + '</td>';
                       TTOutputReg += '</tr>'
                            
                       TTOutputZoomed += '<tr>';
                       TTOutputZoomed += '<td><strong>' + TTLabel[elem] + '</strong></td>';
                       for (const val of PHUData)
                           TTOutputZoomed += '<td align="right" padding-left="2px">' + val + '</td>';
                       TTOutputZoomed += '<td align="right" padding-left="2px">' + total + '</td>';

                       TTOutputZoomed += '</tr>'; 
                   } 

                   TTOutputReg    += '</table>';
                   TTOutputZoomed += '</table>'; 

                   TTStrings[0][PHU_Id] = TTOutputReg;
                   TTStrings[1][PHU_Id] = TTOutputZoomed;
               }

               UpdateFillColours (currSelectedDataType, 0);

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

        UpdateFillColours (val, UpdateDuration); 

        currSelectedDataType = val;

    } );

}



