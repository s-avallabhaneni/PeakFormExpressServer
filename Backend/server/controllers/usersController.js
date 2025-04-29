const pool = require('../db');

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// exports.createUser = async (req, res) => {
//     const { name, email } = req.body;
//     try {
//         const result = await pool.query(
//             'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
//             [name, email]
//         );
//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        if (req.user.userId !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.userId !== parseInt(id)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted', user: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
