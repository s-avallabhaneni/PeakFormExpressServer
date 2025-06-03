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
    const { exerciseId } = req.params;
    const { name } = req.body;

    try {
        const result = await pool.query(
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
exports.createExerciseWithSets = async (req, res) => {
    const { templateId } = req.params;
    const { name, sets } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Create the exercise
        const exerciseResult = await client.query(
            'INSERT INTO exercises (template_id, name) VALUES ($1, $2) RETURNING *',
            [templateId, name]
        );
        const newExercise = exerciseResult.rows[0];

        // Create each set linked to the new exercise
        const insertSetQuery = `
      INSERT INTO sets (exercise_id, reps, weight)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;

        const createdSets = [];
        for (const set of sets) {
            const setResult = await client.query(insertSetQuery, [
                newExercise.id,
                set.reps,
                set.weight
            ]);
            createdSets.push(setResult.rows[0]);
        }

        await client.query('COMMIT');
        res.status(201).json({ exercise: newExercise, sets: createdSets });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
};
