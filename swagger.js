const swaggerJsdoc = require("swagger-jsdoc");
const { setup, serve } = require("swagger-ui-express");

exports.initSwagger = (app) => {
  // eslint-disable-next-line
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Your API",
        version: "1.0.0",
        description: "API documentation for Your Application",
      },
      servers: [
        {
          url: "http://localhost:8000",
        },
      ],
      components: {
        responses: {
          200: {
            description: "Success",
          },
          400: {
            description:
              "Bad request. You may need to verify your information.",
          },
          401: {
            description: "Unauthorized request, you need additional privileges",
          },
          403: {
            description:
              "Forbidden request, you must login first. See /auth/login",
          },
          404: {
            description: "Object not found",
          },
          422: {
            description:
              "Unprocessable entry error, the request is valid but the server refused to process it",
          },
          500: {
            description: "Unexpected error, maybe try again later",
          },
        },

        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
    apis: ["./routes/*.js"],
  };
  const swaggerSpec = swaggerJsdoc(options);
  app.use("/docs", serve, setup(swaggerSpec));
};
