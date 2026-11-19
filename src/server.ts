import app from "./app";
import config from "./config";
import { initNeonDB } from "./db";

const main = async () => {
  initNeonDB();
  app.listen(config.port, () => {
    console.log(`Express Server is running on PORT: ${config.port}`);
  });
};

main();
