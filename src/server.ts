import app from "./app";
import config from "./config";
import { initNeonDB, pool } from "./db";

const main = async () => {
  try {
    await initNeonDB();
  } catch (error) {
    console.error(
      "Database initialization failed; server was not started.",
      error,
    );
    try {
      await pool.end();
    } catch (closeError) {
      console.error(
        "Failed to close the database pool after startup failure.",
        closeError,
      );
    }
    process.exitCode = 1;
    return;
  }

  app.listen(config.port, () => {
    console.log(`Express Server is running on PORT: ${config.port}`);
  });
};

void main();
