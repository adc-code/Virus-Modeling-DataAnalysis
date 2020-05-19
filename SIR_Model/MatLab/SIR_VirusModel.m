%
% Code to call the ode solver and then plot the results
%

% times to solve the set of ODEs over
tspan = [0 : 0.1 : 50];

% initial values...
y0 = [0.99 0.01 0.00];

% the 'heavy lifting' is done here...
[t, y] = ode45 ('SIR_Equations', tspan, y0);

% finally plot the results...
plot (t, y, 'LineWidth', 2);

title ('SIR Model');
xlabel ('time');
ylabel ('Population');
grid on;
legend ('Susceptible', 'Infected', 'Recovered');

