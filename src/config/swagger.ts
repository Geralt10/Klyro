import path from "node:path";
import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Klyro API",
      version: "1.0.0",
      description:
        "Versioned REST API for the Klyro multi-vendor commerce platform.",
    },
  },
  apis: [path.resolve(process.cwd(), "docs/openapi.yaml")],
});
