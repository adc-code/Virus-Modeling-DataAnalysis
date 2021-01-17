//
// isCanvasSupported: used to check if the browser supports the canvas
//
function isCanvasSupported ()
{
    var elem = document.createElement ('canvas');
    return !!(elem.getContext && elem.getContext ('2d'));
}

        
//
// canvasApp: the main canvas application
//
function canvasApp ()
{
    if (!isCanvasSupported())
    {
        return;
    }

    //
    // drawScreen: draws one simulation update cycle
    //
    function drawScreen ()
    {
        // draw the canvas or simulation area
        context.fillStyle = '#EEEEEE';
        context.fillRect (0, 0, theCanvas.width, theCanvas.height);

        // draw the walls
        context.strokeStyle = '#000000'; 
        context.strokeRect (1,  1, theCanvas.width-2, theCanvas.height-2);
		
        // perform one simulation step
        update ();
        testWalls ();
        collide ();
        render ();
    }
	

    //
    // update: updates the positions for all the balls
    //
    function update ()
    {
        for (var i = 0; i < balls.length; i++)
        {
            ball = balls [i];
            ball.nextXPos = (ball.currXPos += ball.currXVel);
            ball.nextYPos = (ball.currYPos += ball.currYVel);
        }
    }


    //
    // testWalls: used to check if a ball hits one of the walls.
    // 	
    function testWalls ()
    {
        var ball;
        var testBall;
		
        for (var i = 0; i < balls.length; i++)
        {
            ball = balls[i];
			
            if (ball.nextXPos + ball.radius > theCanvas.width)
            {
                ball.currXVel = -1 * ball.currXVel;
                ball.nextXPos = theCanvas.width - ball.radius;
            }				
            else if (ball.nextXPos - ball.radius < 0)
            {
                ball.currXVel = -1 * ball.currXVel;
                ball.nextXPos = ball.radius;
            }			
            else if (ball.nextYPos + ball.radius > theCanvas.height)
            {
                ball.currYVel = -1 * ball.currYVel;
                ball.nextYPos = theCanvas.height - ball.radius;
            } 
            else if (ball.nextYPos - ball.radius < 0)
            {
                ball.currYVel = -1 * ball.currYVel;
                ball.nextYPos = ball.radius;
            }
        }
    }

	
    //
    // render: used to draw the elements to the canvas
    //
    function render () 
    {
        var ball;
        for (var i = 0; i < balls.length; i++)
        {
            ball = balls [i];

            if (ball.state == DISEASE_STATE_INFECTED)
                context.fillStyle = "#FF0000";
            else
                context.fillStyle = "#000000";

            ball.currXPos = ball.nextXPos;
            ball.currYPos = ball.nextYPos;
			
            context.beginPath ();
            context.arc (ball.currXPos, ball.currYPos, ball.radius, 0, 2*Math.PI, true);
            context.closePath ();
            context.fill ();
        }
    }
	

    //
    // collide: checks and eventually updates the state of the balls if they hit each other
    //
    function collide ()
    {
        var ball;
        var testBall;

        for (var i = 0; i < balls.length; i++)
        {
            ball = balls [i];
            for (var j = i+1; j < balls.length; j++)
            {
                testBall = balls [j];
                if (hitTestCircle (ball, testBall))
                {
                    collideBalls (ball, testBall);
                }
            }
        }
    }

	
    //
    // hitTestCircle: check to see if two balls share the same space
    //
    function hitTestCircle (ball1, ball2)
    {
        var retval = false;

        var dx = ball1.nextXPos - ball2.nextXPos;
        var dy = ball1.nextYPos - ball2.nextYPos;
        var distance = (dx * dx + dy * dy);

        if (distance <= (ball1.radius + ball2.radius) * (ball1.radius + ball2.radius))
        {
            retval = true;
        }

        return retval;
    }


    //
    // collideBalls: if two balls do hit each other, this code determines the new speeds and directions
    //               based on the law of conversation of kinetic energy and momentum
    //
    function collideBalls (ball1, ball2)
    {
        var dx = ball1.nextXPos - ball2.nextXPos;
        var dy = ball1.nextYPos - ball2.nextYPos;
 
        var collisionAngle = Math.atan2 (dy, dx);
 
        var speed1 = Math.sqrt (ball1.currXVel * ball1.currXVel + ball1.currYVel * ball1.currYVel);
        var speed2 = Math.sqrt (ball2.currXVel * ball2.currXVel + ball2.currYVel * ball2.currYVel);
 
        var direction1 = Math.atan2 (ball1.currYVel, ball1.currXVel);
        var direction2 = Math.atan2 (ball2.currYVel, ball2.currXVel);
 
        var velocityx_1 = speed1 * Math.cos (direction1 - collisionAngle);
        var velocityy_1 = speed1 * Math.sin (direction1 - collisionAngle);
        var velocityx_2 = speed2 * Math.cos (direction2 - collisionAngle);
        var velocityy_2 = speed2 * Math.sin (direction2 - collisionAngle);
		
        var final_velocityx_1 = ((ball1.mass - ball2.mass) * velocityx_1 + (ball2.mass + ball2.mass) * velocityx_2) / (ball1.mass + ball2.mass);
        var final_velocityx_2 = ((ball1.mass + ball1.mass) * velocityx_1 + (ball2.mass - ball1.mass) * velocityx_2) / (ball1.mass + ball2.mass);
 
        var final_velocityy_1 = velocityy_1;
        var final_velocityy_2 = velocityy_2;
 
        ball1.currXVel = Math.cos (collisionAngle) * final_velocityx_1 + Math.cos (collisionAngle + Math.PI/2) * final_velocityy_1;
        ball1.currYVel = Math.sin (collisionAngle) * final_velocityx_1 + Math.sin (collisionAngle + Math.PI/2) * final_velocityy_1;
        ball2.currXVel = Math.cos (collisionAngle) * final_velocityx_2 + Math.cos (collisionAngle + Math.PI/2) * final_velocityy_2;
        ball2.currYVel = Math.sin (collisionAngle) * final_velocityx_2 + Math.sin (collisionAngle + Math.PI/2) * final_velocityy_2;
 
        ball1.nextXPos = (ball1.nextXPos += ball1.currXVel);
        ball1.nextYPos = (ball1.nextYPos += ball1.currYVel);
        ball2.nextXPos = (ball2.nextXPos += ball2.currXVel);
        ball2.nextYPos = (ball2.nextYPos += ball2.currYVel);

        if (Math.random() < InfectionRate)
        {
            if (ball1.state == DISEASE_STATE_INFECTED)
                ball2.state = ball1.state;
            else if (ball2.state == DISEASE_STATE_INFECTED)
                ball1.state = ball2.state;
        }
    }

    // Perhaps these should be constant values or enums
    var SPEEDS = [ 0.1, 0.5, 1, 2, 5 ];
               
    var SIM_STATE_STOP = 1;
    var SIM_STATE_PLAY = 2;

    var DISEASE_STATE_SUSCEPTABLE = 1;
    var DISEASE_STATE_INFECTED    = 2;
    var DISEASE_STATE_RECOVERED   = 3;
    var DISEASE_STATE_DEAD        = 4;

    var BALL_RADIUS = 5;
    var BALL_MASS   = 5;

    // Initial values of key simulation parameters
    var SimState          = SIM_STATE_STOP;
    var InfectionRate     = 0.75;
    var InitialInfections = 1;
    var InitialSpeed      = SPEEDS [2];
    var NumBalls          = 100;

    // Key simulation variables...
    var SimTimerId;
    var UpdatedParams = false;
    var balls = new Array ();

    theCanvas = document.getElementById ('canvasSimArea');
    context = theCanvas.getContext ('2d');


    //
    // GenerateBalls: used to create and initialize all the balls.
    //	
    function GenerateBalls ()
    {
        var newBall, xPos, yPos, currSpeed, currDir, xVel, yVel, nextXPos, nextYPos;
	
        balls = [];

        for (var i = 0; i < NumBalls; i++)
        {
            while (true)
            {
                xPos      = 3*BALL_RADIUS + (Math.floor(Math.random()*theCanvas.width) - 3*BALL_RADIUS);
                yPos      = 3*BALL_RADIUS + (Math.floor(Math.random()*theCanvas.height) - 3*BALL_RADIUS);
                currSpeed = InitialSpeed;
                currDir   = Math.floor (360 * Math.random()) * Math.PI / 180;
                xVel      = Math.cos (currDir) * currSpeed;
                yVel      = Math.sin (currDir) * currSpeed;
		nextXPos = (xPos + xVel);
                nextYPos = (yPos + yVel);	

                newBall = {currXPos:  xPos, 
                           currYPos:  yPos, 
                           nextXPos:  nextXPos, 
                           nextYPos:  nextYPos, 
                           radius:    BALL_RADIUS, 
                           speed:     currSpeed, 
                           direction: currDir,
                           currXVel:  xVel, 
                           currYVel:  yVel, 
                           mass:      BALL_MASS,
                           state:     DISEASE_STATE_SUSCEPTABLE };

                if (i < InitialInfections)
                    newBall.state = DISEASE_STATE_INFECTED;
 
                if (canStartHere (newBall))
                    break;
            }

            balls.push (newBall);
        }
    }


    //
    // canStartHere: Tests if a balls location is acceptable
    //	
    function canStartHere (ball)
    {
        var retval = true;
        for (var i = 0; i < balls.length; i++)
        {
            if (hitTestCircle (ball, balls[i]))
            {
                retval = false;
            }
        }

        return retval;
    }


    //
    // OnStartButtonClick: callback to handle the start/top button
    //
    function OnStartButtonClick ()
    {
        if (SimState == SIM_STATE_STOP)
        {
            // If STOPPED go to PLAY state

            SimState = SIM_STATE_PLAY;
            document.getElementById ('StartBtn').innerHTML = 'Stop';
                    
            document.getElementById ('initSpeedList').disabled  = true;
            document.getElementById ('totalPopList').disabled   = true;
            document.getElementById ('initInfectList').disabled = true;
            document.getElementById ('infRateSlider').disabled  = true;
            document.getElementById ('infRateTextBox').disabled = true;

            // Hide any messages
            document.getElementById ('msgBox').style.display = 'none';

            if (UpdatedParams == true)
            {
                GenerateBalls ();
                UpdatedParams = false;
            }

            // Start the simulation
            SimTimerId = setInterval (drawScreen, 20);
        }
        else if (SimState == SIM_STATE_PLAY)
        {
            // if PLAYING go to STOP state

            SimState = SIM_STATE_STOP;
            document.getElementById ('StartBtn').innerHTML = 'Start';
 
            document.getElementById ('initSpeedList').disabled  = false;
            document.getElementById ('totalPopList').disabled   = false;
            document.getElementById ('initInfectList').disabled = false;
            document.getElementById ('infRateSlider').disabled  = false;
            document.getElementById ('infRateTextBox').disabled = false;

            // Stop the simulation 
            clearTimeout (SimTimerId);
        }
    }


    //
    // OnInitSpeedListChange: callback to handle the initial speed selection list
    //            
    function OnInitSpeedListChange ()
    {
        speedVal = document.getElementById ('initSpeedList').value;
        InitialSpeed = SPEEDS [speedVal]; 

        document.getElementById ('msgBox').style.display = 'block';
        UpdatedParams = true;
    }


    //
    // OnTotalPopListChange: callback to handle the total population selection list
    //            
    function OnTotalPopListChange ()
    {
        NumBalls = document.getElementById ('totalPopList').value;

        document.getElementById ('msgBox').style.display = 'block';
        UpdatedParams = true;
    }


    //
    // OnInitInfectListChange: callback to handle changes with the initial number of infections selection list
    //            
    function OnInitInfectListChange ()
    {
        InitialInfections = document.getElementById ('initInfectList').value;

        document.getElementById ('msgBox').style.display = 'block';
        UpdatedParams = true;
    }


    //
    // OnInfRateSliderChange: callback to handle changes with the infection rate slider
    //            
    function OnInfRateSliderChange ()
    {
        value = document.getElementById ('infRateSlider').value;
        document.getElementById ('infRateTextBox').value = value + '%';

        InfectionRate = value / 100;
        document.getElementById ('msgBox').style.display = 'block';
        UpdatedParams = true;
    }

	
    // register all the callbacks...
    document.getElementById ('StartBtn').addEventListener ('click', OnStartButtonClick);
    document.getElementById ('initSpeedList').addEventListener ('change', OnInitSpeedListChange);
    document.getElementById ('totalPopList').addEventListener ('change', OnTotalPopListChange);
    document.getElementById ('initInfectList').addEventListener ('change', OnInitInfectListChange);
    document.getElementById ('infRateSlider').addEventListener ('change', OnInfRateSliderChange);
    document.getElementById ('infRateSlider').addEventListener ('input', OnInfRateSliderChange);


    // Make the balls and draw the screen once	
    GenerateBalls (); 
    drawScreen ();
}


//
// MakeLegend
//
function MakeLegend ()
{
    if (!isCanvasSupported())
    {
        return;
    }

    //
    // drawBall
    //
    function drawBall (xLoc, yLoc, colour, label)
    {
        context.fillStyle = colour
        context.beginPath ();
        context.arc (xLoc, yLoc, 5, 0, 2*Math.PI, true);
        context.closePath ();
        context.fill ();

        context.font = '12px Helvetica, sans-serif';
        context.fillStyle = '#000000';
        context.textBaseline = 'middle';
        context.fillText (label, xLoc + 15, yLoc);
    }


    //
    // drawLegend
    //
    function drawLegend ()
    {
        // draw the canvas or simulation area
        context.fillStyle = '#ffffff';
        context.fillRect (0, 0, theCanvas.width, theCanvas.height);

        // draw the walls
        context.strokeStyle = '#000000';
        context.strokeRect (1,  1, theCanvas.width-2, theCanvas.height-2);

        // draw the balls
        var labelWidth = 0.9 * theCanvas.width / 4;
        var xSpace = (theCanvas.width - 4 * labelWidth) / 2;
        var ySpace = theCanvas.height / 2;

        drawBall (xSpace,                ySpace, '#000000', 'Susceptable');
        drawBall (xSpace + labelWidth,   ySpace, '#ff0000', 'Infected');
    }

    theCanvas = document.getElementById ('canvasLegend');
    context = theCanvas.getContext ('2d');

    drawLegend (); 
}


