const express = require("express");
const app = express();
app.use(express.json());
var cors = require('cors');
app.use(cors());

const userRouter = require("./routes/user_routes");

const destinations_routes = require('./routes/destinations_routes');

const accommodationRoutes = require('./routes/accommodation-routes');

const activitiesRoutes = require('./routes/activities_routes');

const packagesRoutes = require('./routes/packages-routes');

const contactUsRouter = require('./routes/contactUs_routes');

const flightsRoute = require('./routes/flights-routes');

const statisticsRoute = require('./routes/statistics-routes');

const ticketbooking = require('./routes/ticketbooking-routes');

const stripeRouter = require('./routes/stripe-routes');

const roomsRouter = require('./routes/rooms-routes');

app.use(userRouter);

app.use(destinations_routes);

app.use(accommodationRoutes);

app.use(activitiesRoutes);

app.use(contactUsRouter);

app.use(packagesRoutes);

app.use(flightsRoute);

app.use(statisticsRoute);

app.use(ticketbooking);

app.use(stripeRouter);

app.use(roomsRouter);

const PORT = 3999;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

