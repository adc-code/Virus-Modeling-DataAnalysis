function D3App ()
{
    var dataFile = 'ONCovidCases_DateRange.csv';

    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        var timeZoneAdjustment = 1000*60*60*5; // in millisecs...

        return [  new Date (new Date (d['start_date']).getTime() + timeZoneAdjustment),
                  new Date (new Date (d['end_date']).getTime() + timeZoneAdjustment)     ];
    };


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        console.log (data);
 
        var labels = [ 'Start Date', 'End Date' ];

        for (var i = 0; i < 2; i++)
        {
            var output = '<strong>' + labels[i] + '</strong>';
            output += '<hr>';
            output += (data[0][i]).toDateString();

            d3.select ('#block_' + i).node().innerHTML = output;
        }

        console.log (data);
    } ); 

}


