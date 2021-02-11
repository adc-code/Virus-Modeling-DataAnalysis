function D3App ()
{
    var dataFile = 'ONCovidCases_DeathRates.csv';


    //
    // Function used to parse the CSV.  
    // 
    var rowConverter = function (d) 
    {
        return [  d['outcome'], 
                  parseFloat (d['rate']) 
               ];
    };


    //
    // Read the CSV...
    //
    d3.csv (dataFile, rowConverter).then (function (data) 
    {
        var dataset = data;

        var FatalIndex = 0;
        for (var i = 0; i < dataset.length; i++)
        {
            if (dataset[i][0] == 'Fatal')
            {
                FatalIndex = i;
                break;
            }
        }

        var output = '<strong> Average Fatality Age </strong>';
        output += '<hr>';
        output += (dataset[FatalIndex][1]).toFixed(1);

        d3.select ('#block_1').node().innerHTML = output;

        console.log (data);
    } ); 

}



