const multer = require('multer');
const { uploadToS3 } = require('../utils/s3');
const { OpenAI } = require('openai');
const pool = require('../db');

const upload = multer(); // memory storage

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// middleware to handle upload
exports.uploadMiddleware = upload.single('image');

// controller
exports.handleImageUpload = async (req, res) => {
  const { userId } = req.params;
  const {exercise_name} = req.body;





  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    // 1. Upload to S3
    const imageUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

    // 2. Send to OpenAI (Vision API)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: getPrompt(exercise_name) },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 500
    });

    const openaiResponse = completion.choices[0].message.content;

    // 3. Save to DB
    const result = await pool.query(
      `INSERT INTO user_images (user_id, image_url, openai_response, exercise_name)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, imageUrl, openaiResponse, exercise_name]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUserImages = async (req, res) => {
  const { userId } = req.params;

  //Ensure user is only accessing their own images
  if (req.user.userId !== parseInt(userId)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const result = await pool.query(
      `SELECT id, image_url, openai_response, created_at
       FROM user_images
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user images:', err.message);
    res.status(500).json({ error: 'Failed to fetch user images' });
  }
};



const STANDARD_SUFFIX =
  " Return each result ONLY as 'Category: score' on its own line—no extra words. Give some score for each category";

/* ---- core prompts for every exercise (without suffix) ---- */
const basePrompts = {
  /* ---------- Chest ---------- */
  "Dumbbell Bench Press":
    "Rate this image of a Dumbbell Bench Press on: (1) bench set‑up & upper‑back arch, (2) grip/wrist alignment & dumbbell path, (3) elbow angle & depth/lock‑out, (4) overall control & safety.",
  "Cable / Pec‑Deck Fly":
    "Rate this image of a Chest Fly on: (1) cable/arm alignment, (2) slight‑bend elbow path, (3) shoulder retraction & chest stretch, (4) tempo & end‑range squeeze.",
  "Push‑Up":
    "Rate this push‑up image on: (1) hand placement vs. shoulder width, (2) full‑body line & core brace, (3) elbow angle/flaring, (4) depth & lock‑out control.",
  "Low‑to‑High Cable Fly":
    "Rate this low‑to‑high cable fly image on: (1) cable angle & start position, (2) stagger stance & torso stability, (3) arm path/upper‑chest squeeze, (4) tempo & ROM.",

  /* ---------- Back ---------- */
  "Lat Pulldown":
    "Rate this lat‑pulldown image on: (1) grip width/hand position, (2) torso angle & lean, (3) elbow path toward hips, (4) ROM & eccentric control.",
  "Seated Cable Row":
    "Rate this seated cable row image on: (1) neutral spine & torso stability, (2) handle path to mid‑torso, (3) shoulder retraction at finish, (4) controlled lowering.",
  "Single‑Arm Dumbbell Row":
    "Rate this one‑arm dumbbell row image on: (1) hip hinge & flat back, (2) elbow angle/row path, (3) scapular retraction, (4) ROM & tempo.",
  "Straight‑Arm Cable Pulldown":
    "Rate this straight‑arm pulldown image on: (1) shoulder position & slight forward lean, (2) near‑straight arms/elbow softness, (3) lat engagement through range, (4) core stability & tempo.",

  /* ---------- Shoulders ---------- */
  "Seated Dumbbell Overhead Press":
    "Rate this seated DB overhead press image on: (1) seat angle & spinal alignment, (2) wrist/elbow stack, (3) depth to chin & full lock‑out, (4) shoulder stability & tempo.",
  "Lateral Raise":
    "Rate this lateral raise image on: (1) start arm angle/cable path, (2) lead‑with‑elbow height, (3) minimal shoulder shrug, (4) controlled lowering.",
  "Reverse Fly":
    "Rate this reverse fly image on: (1) hip hinge/back flat, (2) arm path & slight‑bend elbows, (3) rear‑delt vs. upper‑trap dominance, (4) ROM & tempo.",
  "Cable Face Pull":
    "Rate this face pull image on: (1) rope height at eye level, (2) elbow flare & external rotation, (3) scapular retraction/pause, (4) neck & core alignment.",

  /* ---------- Arms ---------- */
  "Alternating Curl":
    "Rate this biceps‑curl image on: (1) fixed elbow position, (2) wrist supination/grip, (3) full extension & peak squeeze, (4) body swing control.",
  "Hammer Curl":
    "Rate this hammer curl image on: (1) neutral grip & wrist alignment, (2) elbow tracking, (3) ROM & tempo, (4) upper‑arm isolation (no swing).",
  "Cable Triceps Push‑Down":
    "Rate this triceps push‑down image on: (1) elbows pinned to sides, (2) neutral wrist/grip, (3) full extension & lock‑out, (4) torso stability & control.",
  "Overhead DB Triceps Extension":
    "Rate this overhead triceps extension image on: (1) arms by ears & neutral spine, (2) elbow flare control, (3) deep stretch & full extension, (4) core brace/tempo.",

  /* ---------- Legs & Glutes ---------- */
  "Goblet Squat":
    "Rate this goblet squat image on: (1) foot stance & squat depth, (2) knee tracking over toes, (3) torso angle & neutral spine, (4) weight distribution & control.",
  "Bulgarian / Split Squat":
    "Rate this split‑squat image on: (1) stance length & balance, (2) front‑knee angle/tracking, (3) torso upright & hip drop, (4) ROM & tempo.",
  "Leg Extension":
    "Rate this leg‑extension image on: (1) seat/pad adjustment & knee alignment, (2) controlled extension & quad squeeze, (3) eccentric control, (4) overall setup safety.",
  "Leg Curl":
    "Rate this leg‑curl image on: (1) pad just above ankle, (2) hips glued to bench, (3) full curl ROM, (4) smooth eccentric.",
  "Standing Calf Raise":
    "Rate this calf‑raise image on: (1) foot placement on step, (2) ankle ROM—full stretch & peak contraction, (3) slight knee bend, (4) balance & tempo.",

  /* ---------- Core ---------- */
  "Plank":
    "Rate this plank image on: (1) straight head‑to‑heels line, (2) core brace/no hip sag, (3) shoulder position over elbows/hands, (4) breathing & tension.",
  "Hanging / Captain’s Chair Leg Raise":
    "Rate this leg‑raise image on: (1) grip & shoulder stability, (2) posterior pelvic tilt initiation, (3) leg path & straightness, (4) swing control.",
  "Cable Woodchop / Pallof Press":
    "Rate this woodchop/pallof image on: (1) cable height & athletic stance, (2) arm path & straightness, (3) trunk rotation control/anti‑rotation, (4) core brace & hip stability.",
  "Weighted Crunch on Bench":
    "Rate this weighted crunch image on: (1) lower‑back contact start, (2) spine flexion & ROM, (3) weight placement/control, (4) neck alignment."
};

const exercisePrompts = Object.fromEntries(
  Object.entries(basePrompts).map(([key, prompt]) => [key, `${prompt}${STANDARD_SUFFIX}`])
);

function getPrompt(exercise_name) {
  return exercisePrompts[exercise_name] ?? " Unknown exercise name";
}