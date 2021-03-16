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
        ET:  [ -79.551012, 43.677195, 1.75 ],
        NY:  [ -79.434028, 43.737367, 2 ],
        DT:  [ -79.394117, 43.668709, 3 ],
        SC:  [ -79.231714, 43.756409, 2 ],
        TOR: [ -79.3832,  43.7032, 14 ],
        CW:  [ -79.844480, 43.254501, 9 ],
        SW:  [ -81.9582077, 42.838026, 7 ],
        ALL: [ -79.3832, 43.7032,      1 ]
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
		       .scale (60000)
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


    //
    // used to parse the CSV file properly
    //
    var rowConverter = function (d) 
    {
        //console.log (d);

        return [
            d['NeighNameID'], d['Outcome'], parseInt (d['MaxValue']),
            parseInt (d['19 and younger']), parseInt (d['20-29']), parseInt (d['30-39']), 
            parseInt (d['40-49']), parseInt (d['50-59']), parseInt (d['60-69']),
            parseInt (d['70-79']), parseInt (d['80-89']), parseInt (d['90+']), d['NeighNameFull']
        ];  
    }


    //
    // Update the colours on the map
    //
    var UpdateFillColours = function (elemType, updateTime)
    {
        for (var key in TotalValues[elemType]) 
        {
            console.log ('setting colour for: ', key);

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

            d3.select ('#' + key).transition ()
                                 .duration (updateTime)
                                 .style ('fill', colourVal);
        }
    }


    //
    // Utility to make ID name to allow lookups on date
    //
    var MakeIDName = function (name)
    {
        return name.replace ("'", '').replace ('/', '').replace ('.', '')
                   .split (' ').join (''); 
    }

    // Load in GeoJSON data
    d3.json ('toronto.json').then (function(json) 
    {
        // console.log (json);

        var tmpList = [];
        for (var i = 0; i < json.features.length; i++)
        {
                    //name = json.features[i].properties.HOOD;
                    //name = name.replace (/ /g, '');
                    //console.log (json.features[i].properties.HOOD, MakeIDName(json.features[i].properties.HOOD));
                    tmpList.push (json.features[i].properties.HOOD + '  ' + MakeIDName(json.features[i].properties.HOOD));
        }
        tmpList.sort ();
        for (var i = 0; i < json.features.length; i++)
        {
                    console.log (tmpList[i]);
        }
               

        // Bind data and create one path per GeoJSON feature
        svg.selectAll ('Neighbourhood')
           .data (json.features)
           .enter ()
           .append ('path')
           .attr ('class', 'Neighbourhood')
           .attr ('d', path)
           .attr ('NeighName', function (d, i) { return json.features[i].properties.HOOD; })
	   .attr ('id',   function (d, i) { console.log('added path for: ', MakeIDName (json.features[i].properties.HOOD));
                                                    return MakeIDName (json.features[i].properties.HOOD); })
           .on ('mousemove', function(d)
           {
               var xPosition = d3.event.pageX; 
               var yPosition = d3.event.pageY + 15; 

               d3.select ('#tooltip')
                 .style ('left', xPosition + 'px')
                 .style ('top', yPosition + 'px')
                 .select ('#label').html ( TTStrings[0][ d3.select(this).attr ('id') ] );

               d3.select ('#tooltip').classed ('hidden', false); 
           } )
           .on ('mouseout', function(d)
           {
               d3.select ('#tooltip').classed ('hidden', true);
           } );


        d3.csv ('TorCovidCases_NeighAgeOutcomes.csv', rowConverter).then (function (data) 
        {
            // console.log (data);            
            dataset = data;

            // highlight the default buttons
            d3.select ('#DTbtn_' + currSelectedDataType).style ('background-color', DTBtnColours[currSelectedDataType]);
            d3.select ('#DTbtn_' + currSelectedDataType).style ('color', '#fff');
            d3.select ('#' + currSelectedRegion).classed ('button_sel', true);

            var numHoods = dataset.length / 4;

            for (var i = 0; i < numHoods; i++)
            {
                var TTOutput = '';

                TTOutput += '<strong>' + dataset[ dataMapping[0] + i*4 ][12] + '</strong>';
                TTOutput += '<hr>'
                TTOutput += '<table width="100%">';

                var AgeGroupLabels = [ '<20', '20s', '30s', '40s', '50s', '60s', '70s', '80s', '90s', 'Total' ];

                TTOutput += '<tr>'; 
                TTOutput += '<td></td>';
                for (const AgeGroup of AgeGroupLabels)
                    TTOutput += '<td><strong>' + AgeGroup + '</strong></td>';
                TTOutput += '</tr>'; 

                var Neigh_Id = MakeIDName (dataset[ dataMapping[0] + i*4 ][0]);

                for (var elem = 0; elem < 4; elem++)
                {
                    var NeighData = dataset [ dataMapping[elem] + i*4 ].slice();

                    // Recall that the data element contains the NeighNameID, Outcome, MaxValue,
                    // and NeighNameFull.  We need to get rid of those...
                    NeighData.shift(); NeighData.shift(); NeighData.shift();  NeighData.pop();

                    var total = d3.sum (NeighData);
                    if (total > MaxValues[elem])
                        MaxValues[elem] = total;                                

                    TotalValues[elem][Neigh_Id] = total;


                    TTOutput += '<tr>';
                    TTOutput += '<td><strong>' + TTLabel[elem] + '</strong></td>';
                    for (const val of NeighData)
                        TTOutput += '<td align="right" padding-left="2px">' + val + '</td>';
                    TTOutput += '<td align="right" padding-left="2px">' + total + '</td>';

                    TTOutput += '</tr>'; 
                } 

                TTOutput += '</table>'; 

                TTStrings[0][Neigh_Id] = TTOutput;
            }

            UpdateFillColours (currSelectedDataType, 0); 

        } );
 
    } );  // loading json file


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


