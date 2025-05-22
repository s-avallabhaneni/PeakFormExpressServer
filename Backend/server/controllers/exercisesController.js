const pool = require('../db');

exports.createExercise = async (req, res) => {
    const { templateId } = req.params;
    const { name } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO exercises (template_id, name) VALUES ($1, $2) RETURNING *',
            [templateId, name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getExercisesForTemplate = async (req, res) => {
    const { templateId } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM exercises WHERE template_id = $1',
            [templateId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateExercise = async (req, res) => {
    const {exerciseId} = req.params;
    const {name} = req.body;
    
    try {
        const result = await pool.query (
            'UPDATE exercises SET name = $1 WHERE id = $2 RETURNING *',
            [name, exerciseId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Exercise not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteExercise = async (req, res) => {
    const { exerciseId } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM exercises WHERE id = $1 RETURNING *',
            [exerciseId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Exercise not found' });
        res.json({ message: 'Exercise deleted', exercise: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
