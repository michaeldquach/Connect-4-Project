COMP 2406 Check-in 3 - Connect 4 
Michael Quach 101179729

This is the Connect 4 project.
I am working alone.

Please see the report for any further information.

the floating IP is:
134.117.128.171
and the password is:
 student

To run the server:
ssh student@134.117.128.171
//type student as password
cd project
node server

To access the server:
ssh -L 9999:localhost:3000 student@134.117.128.171
//type student as password
//in browser on your computer go to
http://localhost:9999/

NOTE: Some website functionality requires you to log in. Please use these two users's login credentials (two accounts are required to play a game with each other):

BestPlayer123
testpassword

WorstPlayer456
differentpassword

Other accounts (and initialization data) can be found in the usersModule.js in the javascript folder.

Thank you.
