const pool = require('../db');

exports.createSet = async (req, res) => {
    const { exerciseId } = req.params;
    const { reps, weight } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO sets (exercise_id, reps, weight) VALUES ($1, $2, $3) RETURNING *',
            [exerciseId, reps, weight]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSetsForExercise = async (req, res) => {
    const { exerciseId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM sets WHERE exercise_id = $1',
            [exerciseId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSet = async (req, res) => {
    const {setId} = req.params;
    const {reps, weight} = req.body;
    
    try {
        const result = await pool.query (
            'UPDATE sets SET reps = $1, weight = $2 WHERE id = $3 RETURNING *',
            [reps, weight, setId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Set not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteSet = async (req, res) => {
    const { setId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM sets WHERE id = $1 RETURNING *',
            [setId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Set not found' });
        res.json({ message: 'Set deleted', set: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
