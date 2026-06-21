/**
 * MediGuide ML Symptom Scoring Engine
 * Local ML-like system that provides urgency scoring and confidence
 * independently of the LLM. Acts as a safety net and consistency layer.
 *
 * Features:
 * - Weighted keyword matching (150+ medical terms)
 * - Symptom combination detection (dangerous pairs)
 * - Duration & severity modifiers
 * - Confidence scoring (0–100)
 * - Urgency override logic
 */

// ─── Weighted Medical Keyword Database ──────────────────────────

const SYMPTOM_WEIGHTS = {
    // CRITICAL (0.9–1.0) — immediate emergency
    'chest pain': 0.95, 'heart attack': 1.0, 'cardiac arrest': 1.0,
    'not breathing': 1.0, 'stopped breathing': 1.0, 'no pulse': 1.0,
    'unconscious': 0.95, 'unresponsive': 0.95, 'seizure': 0.90,
    'stroke': 1.0, 'anaphylaxis': 0.95, 'severe bleeding': 0.90,
    'coughing blood': 0.90, 'vomiting blood': 0.90, 'blood in stool': 0.80,
    'difficulty breathing': 0.88, 'cant breathe': 0.92, 'choking': 0.90,
    'overdose': 0.95, 'poisoning': 0.90, 'suicidal': 1.0,
    'gunshot': 1.0, 'stabbing': 0.95, 'electrocution': 0.90,
    'drowning': 1.0, 'severe burn': 0.90, 'head injury': 0.85,
    'spinal injury': 0.90, 'neck injury': 0.85,

    // HIGH (0.7–0.89)
    'high fever': 0.75, 'fever over 103': 0.80, 'fever over 104': 0.85,
    'severe headache': 0.72, 'worst headache': 0.80, 'thunderclap headache': 0.85,
    'blurred vision': 0.65, 'sudden vision loss': 0.82, 'double vision': 0.70,
    'severe abdominal pain': 0.75, 'appendicitis': 0.78,
    'chest tightness': 0.78, 'irregular heartbeat': 0.75, 'palpitations': 0.65,
    'shortness of breath': 0.80, 'wheezing': 0.60, 'asthma attack': 0.78,
    'swollen tongue': 0.80, 'swollen throat': 0.82, 'face swelling': 0.75,
    'allergic reaction': 0.72, 'severe allergy': 0.82,
    'stiff neck': 0.68, 'confusion': 0.72, 'disoriented': 0.70,
    'fainting': 0.65, 'collapse': 0.75, 'passed out': 0.70,
    'paralysis': 0.85, 'numbness one side': 0.82, 'slurred speech': 0.85,
    'fracture': 0.70, 'broken bone': 0.70, 'dislocation': 0.68,
    'deep cut': 0.65, 'wound wont stop bleeding': 0.75,
    'severe dehydration': 0.72, 'heat stroke': 0.78, 'hypothermia': 0.78,
    'meningitis': 0.85, 'sepsis': 0.90,

    // MODERATE (0.4–0.69)
    'fever': 0.45, 'mild fever': 0.35, 'temperature': 0.35,
    'headache': 0.30, 'migraine': 0.50, 'tension headache': 0.35,
    'stomach pain': 0.40, 'abdominal pain': 0.45, 'cramps': 0.35,
    'nausea': 0.35, 'vomiting': 0.45, 'diarrhea': 0.40,
    'dizziness': 0.45, 'lightheaded': 0.40, 'vertigo': 0.50,
    'cough': 0.30, 'persistent cough': 0.45, 'dry cough': 0.30, 'wet cough': 0.35,
    'sore throat': 0.30, 'swollen glands': 0.40,
    'back pain': 0.35, 'lower back pain': 0.40, 'sciatica': 0.45,
    'joint pain': 0.35, 'swelling': 0.40, 'inflammation': 0.40,
    'rash': 0.35, 'hives': 0.45, 'itching': 0.25, 'skin rash': 0.35,
    'burning urination': 0.45, 'frequent urination': 0.40,
    'blood pressure high': 0.55, 'blood pressure low': 0.55,
    'anxiety': 0.35, 'panic attack': 0.50, 'insomnia': 0.30,
    'fatigue': 0.25, 'exhaustion': 0.35, 'weakness': 0.40,
    'muscle pain': 0.30, 'body ache': 0.30, 'sore muscles': 0.25,
    'ear pain': 0.35, 'ear infection': 0.40, 'hearing loss': 0.50,
    'eye pain': 0.40, 'red eye': 0.35, 'eye discharge': 0.35,
    'toothache': 0.30, 'tooth pain': 0.30, 'gum bleeding': 0.35,
    'constipation': 0.25, 'bloating': 0.25, 'gas': 0.15,
    'heartburn': 0.30, 'acid reflux': 0.30, 'indigestion': 0.25,
    'runny nose': 0.15, 'congestion': 0.20, 'sneezing': 0.15,
    'cold': 0.20, 'flu': 0.35, 'covid': 0.50,
    'diabetes': 0.50, 'high blood sugar': 0.55, 'low blood sugar': 0.60,
    'weight loss unexplained': 0.55, 'lump': 0.55, 'swollen lymph nodes': 0.50,
    'chest discomfort': 0.65, 'arm pain left': 0.70,
    'tingling': 0.35, 'numbness': 0.40, 'pins and needles': 0.30,
    'bruising': 0.25, 'bruise easily': 0.40,
    'nosebleed': 0.30, 'bleeding gums': 0.30,

    // LOW (0.0–0.29)
    'mild pain': 0.20, 'slight discomfort': 0.15, 'minor cut': 0.15,
    'small bruise': 0.10, 'paper cut': 0.05, 'hangnail': 0.05,
    'hiccups': 0.05, 'dry skin': 0.10, 'chapped lips': 0.05,
    'dandruff': 0.05, 'minor headache': 0.15,
};

// ─── Dangerous Symptom Combinations ────────────────────────────

const DANGEROUS_COMBOS = [
    { symptoms: ['chest pain', 'shortness of breath'], boost: 0.30, name: 'Possible cardiac event' },
    { symptoms: ['chest pain', 'arm pain'], boost: 0.35, name: 'Possible heart attack' },
    { symptoms: ['chest pain', 'sweating'], boost: 0.25, name: 'Cardiac warning' },
    { symptoms: ['headache', 'stiff neck', 'fever'], boost: 0.30, name: 'Possible meningitis' },
    { symptoms: ['headache', 'confusion'], boost: 0.25, name: 'Neurological concern' },
    { symptoms: ['fever', 'rash', 'stiff neck'], boost: 0.30, name: 'Possible meningitis' },
    { symptoms: ['slurred speech', 'numbness'], boost: 0.35, name: 'Possible stroke' },
    { symptoms: ['slurred speech', 'confusion'], boost: 0.30, name: 'Possible stroke' },
    { symptoms: ['weakness', 'numbness one side'], boost: 0.35, name: 'Possible stroke' },
    { symptoms: ['difficulty breathing', 'swelling'], boost: 0.30, name: 'Possible anaphylaxis' },
    { symptoms: ['difficulty breathing', 'hives'], boost: 0.30, name: 'Allergic reaction' },
    { symptoms: ['vomiting', 'severe headache'], boost: 0.20, name: 'Elevated ICP concern' },
    { symptoms: ['fever', 'confusion'], boost: 0.25, name: 'Possible sepsis' },
    { symptoms: ['abdominal pain', 'fever', 'vomiting'], boost: 0.20, name: 'Possible appendicitis' },
    { symptoms: ['dizziness', 'chest pain'], boost: 0.25, name: 'Cardiac concern' },
    { symptoms: ['coughing blood', 'chest pain'], boost: 0.25, name: 'Pulmonary concern' },
    { symptoms: ['high fever', 'seizure'], boost: 0.25, name: 'Febrile seizure' },
];

// ─── Duration Modifiers ────────────────────────────────────────

function getDurationModifier(text) {
    const lower = text.toLowerCase();

    // Very recent — less concerning for most things
    if (/just now|minutes ago|just started|few minutes/.test(lower)) return 0.0;

    // Hours — moderate
    if (/few hours|several hours|since morning|since last night|today/.test(lower)) return 0.05;

    // Days — concerning
    if (/\b(\d+)\s*days?\b/.test(lower)) {
        const days = parseInt(lower.match(/(\d+)\s*days?/)[1]);
        if (days >= 7) return 0.15;
        if (days >= 3) return 0.10;
        return 0.05;
    }

    // Weeks — more concerning
    if (/\b(\d+)\s*weeks?\b/.test(lower) || /week/.test(lower)) return 0.15;

    // Months — significant
    if (/\b(\d+)\s*months?\b/.test(lower) || /month/.test(lower)) return 0.20;

    // Chronic / persistent
    if (/chronic|persistent|recurring|keeps? coming back|on and off/.test(lower)) return 0.15;

    return 0.0;
}

// ─── Severity Modifiers ────────────────────────────────────────

function getSeverityModifier(text) {
    const lower = text.toLowerCase();

    if (/excruciating|unbearable|worst ever|10\/10|extreme/.test(lower)) return 0.25;
    if (/severe|very bad|intense|terrible|awful|can'?t tolerate/.test(lower)) return 0.20;
    if (/moderate|quite|pretty bad|noticeable|uncomfortable/.test(lower)) return 0.10;
    if (/mild|slight|minor|little|barely/.test(lower)) return -0.05;

    return 0.0;
}

// ─── Main Scoring Function ─────────────────────────────────────

/**
 * Score symptoms locally using weighted keyword matching + combinations
 * @param {string} text — User's symptom description
 * @returns {{ score: number, urgency: string, confidence: number, matchedSymptoms: string[], combos: string[] }}
 */
function scoreSymptoms(text) {
    if (!text || typeof text !== 'string') {
        return { score: 0, urgency: 'low', confidence: 0, matchedSymptoms: [], combos: [] };
    }
    
    // Truncate and strip potentially malicious characters for ReDoS prevention
    const cleanText = text.slice(0, 2000).replace(/[^\w\s.,?!'-]/g, ' ');
    const lower = cleanText.toLowerCase();
    
    let maxWeight = 0;
    let totalWeight = 0;
    const matchedSymptoms = [];
    const matchedCombos = [];

    // 1. Match individual keywords
    for (const [keyword, weight] of Object.entries(SYMPTOM_WEIGHTS)) {
        if (lower.includes(keyword)) {
            matchedSymptoms.push({ keyword, weight });
            totalWeight += weight;
            if (weight > maxWeight) maxWeight = weight;
        }
    }

    // 2. Check dangerous combinations
    let comboBoost = 0;
    for (const combo of DANGEROUS_COMBOS) {
        const allPresent = combo.symptoms.every(s => lower.includes(s));
        if (allPresent) {
            comboBoost = Math.max(comboBoost, combo.boost);
            matchedCombos.push(combo.name);
        }
    }

    // 3. Duration modifier
    const durationMod = getDurationModifier(lower);

    // 4. Severity modifier
    const severityMod = getSeverityModifier(lower);

    // 5. Calculate final score
    // Base: highest matching keyword weight
    // Boosted by: combinations, duration, severity
    let finalScore = maxWeight + comboBoost + durationMod + severityMod;

    // Factor in number of symptoms (more symptoms = slightly higher)
    if (matchedSymptoms.length >= 3) finalScore += 0.05;
    if (matchedSymptoms.length >= 5) finalScore += 0.05;

    // Clamp to 0–1
    finalScore = Math.max(0, Math.min(1, finalScore));

    // 6. Calculate confidence (how well the engine understood the input)
    const confidence = Math.min(100, Math.round(
        (matchedSymptoms.length > 0 ? 40 : 10) +
        (matchedSymptoms.length * 8) +
        (matchedCombos.length * 15) +
        (durationMod > 0 ? 10 : 0) +
        (severityMod !== 0 ? 10 : 0)
    ));

    // 7. Map score to urgency level
    let urgency;
    if (finalScore >= 0.85) urgency = 'CRITICAL';
    else if (finalScore >= 0.70) urgency = 'URGENT';
    else if (finalScore >= 0.50) urgency = 'HIGH';
    else if (finalScore >= 0.30) urgency = 'MODERATE';
    else urgency = 'LOW';

    return {
        score: Math.round(finalScore * 100) / 100,
        urgency,
        confidence,
        matchedSymptoms: matchedSymptoms.map(s => s.keyword),
        combos: matchedCombos,
        modifiers: {
            duration: durationMod,
            severity: severityMod,
            comboBoost,
        }
    };
}

// ─── Urgency Override Logic ────────────────────────────────────

const URGENCY_RANK = { LOW: 1, MODERATE: 2, HIGH: 3, URGENT: 4, CRITICAL: 5 };

/**
 * Merges ML urgency with LLM urgency — always takes the HIGHER urgency
 * @param {string} mlUrgency — from local scoring
 * @param {string} llmUrgency — from LLM response
 * @returns {string} — final urgency level
 */
function mergeUrgency(mlUrgency, llmUrgency) {
    const mlRank = URGENCY_RANK[mlUrgency?.toUpperCase()] || 1;
    const llmKey = llmUrgency?.toUpperCase().split(' ')[0].replace(/[^A-Z]/g, '') || 'LOW';
    const llmRank = URGENCY_RANK[llmKey] || 1;

    // Take the higher urgency for safety
    if (mlRank >= llmRank) return mlUrgency;
    return llmUrgency;
}

module.exports = { scoreSymptoms, mergeUrgency };
