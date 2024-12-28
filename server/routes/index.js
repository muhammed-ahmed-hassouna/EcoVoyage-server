const userRouter = require("./user/user_routes");
const destinationsRoutes = require("./destinations/destinations_routes");
const accommodationRoutes = require("./accommodation/accommodation_routes");
const activitiesRoutes = require("./activities/activities_routes");
const packagesRoutes = require("./packages/packages_routes");
const contactUsRouter = require("./contact_us/contactUs_routes");
const flightsRoute = require("./flights/flights_routes");
const statisticsRoute = require("./statistics/statistics_routes");
const ticketbooking = require("./ticketbooking/ticketbooking_routes");
const stripeRouter = require("./stripe/stripe_routes");
const roomsRouter = require("./rooms/rooms_routes");
const emailRouter = require("./email/email_routes");

module.exports = (app) => {
  app.use(userRouter);
  app.use(destinationsRoutes);
  app.use(accommodationRoutes);
  app.use(activitiesRoutes);
  app.use(packagesRoutes);
  app.use(contactUsRouter);
  app.use(flightsRoute);
  app.use(statisticsRoute);
  app.use(ticketbooking);
  app.use(stripeRouter);
  app.use(roomsRouter);
  app.use(emailRouter);
};
