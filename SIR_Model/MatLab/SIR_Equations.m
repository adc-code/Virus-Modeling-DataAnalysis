function dy = SIR_Equations (t, y)

    % Note: 
    % y(1) -> Susceptiable
    % y(2) -> Infected  
    % y(3) -> Recovered

    beta  = 0.5;
    gamma = 0.2;

    dy = [  ( -beta * y(1) * y(2) )
            ( beta * y(1) * y(2) - gamma * y(2) )
            ( gamma * y(2) ) ];
end

