const pool = require('../db');

exports.createFeedback = async (req, res) => {
    const { formScore, stabilityScore, controlScore } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO workout_feedback (form_score, stability_score, control_score) VALUES ($1, $2, $3) RETURNING *',
            [formScore, stabilityScore, controlScore]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteFeedback = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query(
        `DELETE FROM workout_feedback WHERE id = $1 RETURNING *`,
        [id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Feedback not found" });
      }
  
      res.status(200).json({ message: "Feedback deleted", feedback: result.rows[0] });
    } catch (err) {
      console.error("Error deleting feedback:", err.message);
      res.status(500).json({ error: "Server error while deleting feedback" });
    }
  };