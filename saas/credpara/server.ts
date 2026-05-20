import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Configuração do pool de conexões com o MySQL do cPanel
  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  // Inicializa o banco de dados e a tabela de usuários
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(50) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'vendedor'
      )
    `);

    // Tenta adicionar a coluna role caso a tabela já exista sem ela
    try {
      await connection.query("ALTER TABLE usuarios ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'vendedor'");
    } catch (e) {
      // Ignora se a coluna já existir
    }

    // Insere o usuário dono padrão se ele não existir
    const [donoRows]: any = await connection.query("SELECT * FROM usuarios WHERE usuario = ?", ["dono"]);
    if (donoRows.length === 0) {
      await connection.query("INSERT INTO usuarios (usuario, senha, role) VALUES (?, ?, ?)", ["dono", "123456", "dono"]);
      console.log("Default dono user created in DB.");
    }

    // Insere o usuário vendedor padrão se ele não existir
    const [vendedorRows]: any = await connection.query("SELECT * FROM usuarios WHERE usuario = ?", ["vendedor"]);
    if (vendedorRows.length === 0) {
      await connection.query("INSERT INTO usuarios (usuario, senha, role) VALUES (?, ?, ?)", ["vendedor", "123456", "vendedor"]);
      console.log("Default vendedor user created in DB.");
    }

    // Insere o usuário admin padrão se ele não existir
    const [adminRows]: any = await connection.query("SELECT * FROM usuarios WHERE usuario = ?", ["admin"]);
    if (adminRows.length === 0) {
      await connection.query("INSERT INTO usuarios (usuario, senha, role) VALUES (?, ?, ?)", ["admin", "123456", "dono"]);
      console.log("Default admin user created in DB.");
    }
    
    connection.release();
  } catch (error) {
    console.error("Warning: Error initializing database (running in offline/fallback mode):", error);
  }

  // API Config Routes (Salva e recupera as configurações locais)
  const fs = require("fs");
  const configPath = path.join(process.cwd(), "config.json");

  app.get(["/api/config", "/api/config/"], (req, res) => {
    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, "utf-8");
        return res.json(JSON.parse(content));
      } catch (e) {
        return res.json({});
      }
    }
    return res.json({});
  });

  app.post(["/api/config", "/api/config/"], (req, res) => {
    try {
      fs.writeFileSync(configPath, JSON.stringify(req.body, null, 2), "utf-8");
      return res.json({ success: true, message: "Configurações salvas com sucesso no servidor local" });
    } catch (e) {
      return res.status(500).json({ success: false, message: "Falha ao salvar configurações localmente" });
    }
  });

  // API Routes
  app.post(["/api/login", "/api/login/"], async (req, res) => {
    const { username, password } = req.body;

    try {
      // 1. Tenta validar no banco de dados MySQL
      const [rows]: any = await pool.query(
        "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
        [username, password]
      );

      if (rows.length > 0) {
        return res.json({ 
          success: true, 
          token: "mock-jwt-token",
          role: rows[0].role || 'vendedor'
        });
      }

      // 2. Fallback estático caso o banco não tenha o registro ou em ambiente de desenvolvimento
      if (username === "dono" && password === "123456") {
        return res.json({ success: true, token: "mock-jwt-token", role: "dono" });
      }
      if (username === "vendedor" && password === "123456") {
        return res.json({ success: true, token: "mock-jwt-token", role: "vendedor" });
      }
      if (username === "admin" && password === "123456") {
        return res.json({ success: true, token: "mock-jwt-token", role: "dono" });
      }

      return res.status(401).json({ success: false, message: "Usuário ou senha inválidos" });
    } catch (err) {
      console.error("Login DB error:", err);
      // Fallback em caso de erro de conexão com o banco
      if (username === "dono" && password === "123456") {
        return res.json({ success: true, token: "mock-jwt-token", role: "dono" });
      }
      if (username === "vendedor" && password === "123456") {
        return res.json({ success: true, token: "mock-jwt-token", role: "vendedor" });
      }
      if (username === "admin" && password === "123456") {
        return res.json({ success: true, token: "mock-jwt-token", role: "dono" });
      }
      return res.status(500).json({ success: false, message: "Erro de conexão com o banco de dados" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

