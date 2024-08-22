import express from "express";
import routes from "./routes";
import { errorHandler } from "./utils/ErrorHandler";

const app = express();
app.use(express.json());
app.use("/", routes);
app.use(errorHandler);
app.listen(3000, () =>
  console.log(`
    🐿 Squirrel Servers Manager
    🚀 Server ready at: http://localhost:3000`),
);
