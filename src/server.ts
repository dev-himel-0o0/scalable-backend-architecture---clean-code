import type { Express, Request, Response } from "express";
import express from "express";
import { DatabaseError, Pool } from "pg";
import config from "./config";

const app: Express = express();

const pool = new Pool({
  connectionString: config.connectionString,
});

const initNeonDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        age INT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log("Database connected!");
  } catch (error) {
    console.error(`Database ${error}`);
  }
};

initNeonDB();

app.use(express.json());
app.use(express.urlencoded());

app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

app.post("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const { name, age, email, password } = req.body;
    const result = await pool.query(
      `
        INSERT INTO users (name, age, email,  password) VALUES ($1, $2, $3, $4) RETURNING *
      `,
      [name, age, email, password],
    );

    res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
});

app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);

    if (!result.rowCount) {
      res.status(404).json({
        success: false,
        message: "Users list is empty!",
        data: result.rows,
      });
    }

    res.status(200).json({
      success: true,
      message: "Users fetched successfully!",
      data: result.rows,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
});

app.get("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [id]);

    res.status(200).json({
      success: true,
      message: "User fetched successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
});

app.put("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, age, password, is_active } = req.body;
    const result = await pool.query(
      `
        UPDATE users SET
        name = COALESCE($1, name),
        age = COALESCE($2, age),
        password = COALESCE($3, password),
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
        WHERE id=$5 RETURNING *
      `,
      [name ?? null, age ?? null, password ?? null, is_active ?? null, id],
    );

    res.status(201).json({
      success: true,
      message: "User updated successfully!",
      data: result.rows[0],
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
});

app.delete("/api/v1/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      message:
        error instanceof DatabaseError
          ? error.message
          : "Internal Server Error!",
      error: error,
    });
  }
});

app.listen(config.port, () => {
  console.log(`Express Server is running on PORT: ${config.port}`);
});
