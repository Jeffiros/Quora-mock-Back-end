import express from "express";
import questionsRouter from './questions.mjs'
import answersRouter from "./answers.mjs";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const port = 4000;

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
      description: "API documentation for your service",
    },
  },
  apis: ["./questions.mjs", "./answers.mjs"],
};

const specs = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(specs));

app.use(express.json());
app.use('/questions', questionsRouter);
app.use('/answers', answersRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
