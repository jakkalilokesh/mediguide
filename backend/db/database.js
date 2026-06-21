/**
 * MediGuide MySQL Database Layer
 * Tables: users, sessions, messages, health_metrics, emergency_contacts, symptom_logs
 */

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mediguidedb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ─── Schema Initialization ─────────────────────────────────────
async function initializeDatabase() {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            age INT,
            gender VARCHAR(50),
            allergies TEXT,
            conditions TEXT,
            medications TEXT,
            blood_type VARCHAR(10),
            language VARCHAR(10) DEFAULT 'en',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          );
        `);
        // Note: Default values for JSON in MySQL can be tricky. We handle '[]' in JS layer or as string.

        await pool.query(`
          CREATE TABLE IF NOT EXISTS sessions (
            id VARCHAR(255) PRIMARY KEY,
            user_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            modules TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            session_id VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            content TEXT NOT NULL,
            module VARCHAR(50),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS health_metrics (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            metric_type VARCHAR(50) NOT NULL,
            value REAL NOT NULL,
            unit VARCHAR(50),
            notes TEXT,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            name VARCHAR(255) NOT NULL,
            phone VARCHAR(50) NOT NULL,
            relationship VARCHAR(100),
            is_primary TINYINT(1) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        await pool.query(`
          CREATE TABLE IF NOT EXISTS symptom_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            symptom TEXT NOT NULL,
            severity INT DEFAULT 5,
            module VARCHAR(50),
            urgency VARCHAR(50),
            logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          );
        `);

        console.log('✅ MySQL Database initialized');
    } catch (error) {
        console.error('❌ Failed to initialize MySQL database:', error.message);
    }
}

// Ensure database is initialized
initializeDatabase();

// ─── Query Helpers ─────────────────────────────────────────────

const stmts = {
    // Users
    createUser: {
        run: async (email, password, name) => {
            const [result] = await pool.query(`INSERT INTO users (email, password, name, allergies, conditions, medications) VALUES (?, ?, ?, '[]', '[]', '[]')`, [email, password, name]);
            return { lastInsertRowid: result.insertId };
        }
    },
    getUserByEmail: {
        get: async (email) => {
            const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
            return rows[0];
        }
    },
    getUserById: {
        get: async (id) => {
            const [rows] = await pool.query(`SELECT id, email, name, age, gender, allergies, conditions, medications, blood_type, language, created_at FROM users WHERE id = ?`, [id]);
            return rows[0];
        }
    },
    updateProfile: {
        run: async (name, age, gender, allergies, conditions, medications, blood_type, language, id) => {
            const [result] = await pool.query(`UPDATE users SET name=?, age=?, gender=?, allergies=?, conditions=?, medications=?, blood_type=?, language=? WHERE id=?`, [name, age, gender, allergies, conditions, medications, blood_type, language, id]);
            return { changes: result.affectedRows };
        }
    },

    // Sessions
    createSession: {
        run: async (id, user_id) => {
            const [result] = await pool.query(`INSERT INTO sessions (id, user_id, modules) VALUES (?, ?, '[]')`, [id, user_id]);
            return { changes: result.affectedRows };
        }
    },
    getSession: {
        get: async (id) => {
            const [rows] = await pool.query(`SELECT * FROM sessions WHERE id = ?`, [id]);
            return rows[0];
        }
    },
    updateSessionTime: {
        run: async (modules, id) => {
            const [result] = await pool.query(`UPDATE sessions SET modules=? WHERE id=?`, [modules, id]);
            return { changes: result.affectedRows };
        }
    },
    getSessionsByUser: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT * FROM sessions WHERE user_id = ? ORDER BY last_updated DESC LIMIT 50`, [user_id]);
            return rows;
        }
    },
    deleteSession: {
        run: async (id) => {
            const [result] = await pool.query(`DELETE FROM sessions WHERE id = ?`, [id]);
            return { changes: result.affectedRows };
        }
    },

    // Messages
    addMessage: {
        run: async (session_id, role, content, module) => {
            const [result] = await pool.query(`INSERT INTO messages (session_id, role, content, module) VALUES (?, ?, ?, ?)`, [session_id, role, content, module]);
            return { lastInsertRowid: result.insertId };
        }
    },
    getMessages: {
        all: async (session_id) => {
            const [rows] = await pool.query(`SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC`, [session_id]);
            return rows;
        }
    },
    getRecentMessages: {
        all: async (session_id, module) => {
            const [rows] = await pool.query(`SELECT * FROM messages WHERE session_id = ? AND module = ? ORDER BY timestamp DESC LIMIT 6`, [session_id, module]);
            return rows.reverse(); // Because order by DESC returns newest first, reverse to get chronological
        }
    },

    // Health Metrics
    addMetric: {
        run: async (user_id, metric_type, value, unit, notes, recorded_at) => {
            const [result] = await pool.query(`INSERT INTO health_metrics (user_id, metric_type, value, unit, notes, recorded_at) VALUES (?, ?, ?, ?, ?, ?)`, [user_id, metric_type, value, unit, notes, recorded_at]);
            return { lastInsertRowid: result.insertId };
        }
    },
    getMetrics: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT * FROM health_metrics WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 100`, [user_id]);
            return rows;
        }
    },
    getMetricsByType: {
        all: async (user_id, metric_type) => {
            const [rows] = await pool.query(`SELECT * FROM health_metrics WHERE user_id = ? AND metric_type = ? ORDER BY recorded_at DESC LIMIT 50`, [user_id, metric_type]);
            return rows;
        }
    },
    deleteMetric: {
        run: async (id, user_id) => {
            const [result] = await pool.query(`DELETE FROM health_metrics WHERE id = ? AND user_id = ?`, [id, user_id]);
            return { changes: result.affectedRows };
        }
    },

    // Emergency Contacts
    addContact: {
        run: async (user_id, name, phone, relationship, is_primary) => {
            const [result] = await pool.query(`INSERT INTO emergency_contacts (user_id, name, phone, relationship, is_primary) VALUES (?, ?, ?, ?, ?)`, [user_id, name, phone, relationship, is_primary]);
            return { lastInsertRowid: result.insertId };
        }
    },
    getContacts: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY is_primary DESC`, [user_id]);
            return rows;
        }
    },
    deleteContact: {
        run: async (id, user_id) => {
            const [result] = await pool.query(`DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?`, [id, user_id]);
            return { changes: result.affectedRows };
        }
    },
    updateContact: {
        run: async (name, phone, relationship, is_primary, id, user_id) => {
            const [result] = await pool.query(`UPDATE emergency_contacts SET name=?, phone=?, relationship=?, is_primary=? WHERE id=? AND user_id=?`, [name, phone, relationship, is_primary, id, user_id]);
            return { changes: result.affectedRows };
        }
    },

    // Symptom Logs
    addSymptomLog: {
        run: async (user_id, symptom, severity, module, urgency) => {
            const [result] = await pool.query(`INSERT INTO symptom_logs (user_id, symptom, severity, module, urgency) VALUES (?, ?, ?, ?, ?)`, [user_id, symptom, severity, module, urgency]);
            return { lastInsertRowid: result.insertId };
        }
    },
    getSymptomLogs: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT * FROM symptom_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 100`, [user_id]);
            return rows;
        }
    },
    getSymptomStats: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT module, COUNT(*) as count, AVG(severity) as avg_severity FROM symptom_logs WHERE user_id = ? GROUP BY module`, [user_id]);
            return rows;
        }
    },

    // Analytics
    getModuleUsage: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT module, COUNT(*) as count FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ?) AND role = 'user' GROUP BY module ORDER BY count DESC`, [user_id]);
            return rows;
        }
    },
    getDailyActivity: {
        all: async (user_id) => {
            const [rows] = await pool.query(`SELECT DATE(timestamp) as day, COUNT(*) as count FROM messages WHERE session_id IN (SELECT id FROM sessions WHERE user_id = ?) AND role = 'user' GROUP BY day ORDER BY day DESC LIMIT 30`, [user_id]);
            return rows;
        }
    }
};

module.exports = { pool, stmts };
