import numpy as np
import matplotlib.pyplot as plt

from scipy import integrate


# Tranmission Rate
beta = 0.5

# Recovery Rate
gamma = 0.2

# Initial values... for S, I, R
Y_0 = [0.99, 0.01, 0]

# The time values to solve the equations over
TimeStart = 0
TimeEnd   = 50
Times     = np.linspace (TimeStart, TimeEnd, 200)

# function used to compute the current state of the ODEs
def dYdt (t, Y):
    return np.array ([ -beta * Y[0] * Y[1],\
                        beta * Y[0] * Y[1] - gamma * Y[1],\
                        gamma * Y[1] ])

# Initialize the results 
Y_Solution = np.zeros ([len(Times), len(Y_0)])
Y_Solution [0, :] = Y_0

# Create the an 'integrate.ode' instance that does the heavy work to
# solve the ODE system
ODESolver = integrate.ode (dYdt)
ODESolver.set_initial_value (Y_0, TimeStart)

# Finally solve the ODE system.  Note that we are doing this in a loop
# so we can catch any errors
for i in range (1, len(Times)):
    Y_Solution [i, :] = ODESolver.integrate (Times[i])
    
    if not ODESolver.successful ():
        print (f'Could not integrate at point: {i}')



# plot the results...        
plt.figure (figsize=(10,8))
plt.plot (Times, Y_Solution)
plt.legend (['Susceptible', 'Infected', 'Removed'])
plt.xlabel ('Time')
plt.ylabel ('Population')
plt.title ('SIR Model')
plt.grid (True)
plt.show ()


