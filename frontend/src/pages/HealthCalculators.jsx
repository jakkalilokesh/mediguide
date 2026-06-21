import { useState } from 'react'
import { Calculator, Activity, Droplets, Heart, RotateCcw } from 'lucide-react'

/* ── BMI Calculator ── */
function BMICalculator() {
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [unit, setUnit] = useState('metric') // metric or imperial
    const [result, setResult] = useState(null)

    const calculate = () => {
        let h = parseFloat(height)
        let w = parseFloat(weight)
        if (!h || !w || h <= 0 || w <= 0) return

        let bmi
        if (unit === 'metric') {
            bmi = w / ((h / 100) ** 2)
        } else {
            bmi = (w / (h ** 2)) * 703
        }

        let category, color
        if (bmi < 18.5) { category = 'Underweight'; color = '#3B82F6' }
        else if (bmi < 25) { category = 'Normal weight'; color = '#22C55E' }
        else if (bmi < 30) { category = 'Overweight'; color = '#F59E0B' }
        else { category = 'Obese'; color = '#EF4444' }

        setResult({ bmi: bmi.toFixed(1), category, color })
    }

    return (
        <div className="calc-section">
            <h3><Calculator size={18} /> BMI Calculator</h3>
            <div className="calc-toggle">
                <button className={unit === 'metric' ? 'active' : ''} onClick={() => setUnit('metric')}>Metric</button>
                <button className={unit === 'imperial' ? 'active' : ''} onClick={() => setUnit('imperial')}>Imperial</button>
            </div>
            <div className="calc-inputs">
                <div className="calc-field">
                    <label>{unit === 'metric' ? 'Height (cm)' : 'Height (inches)'}</label>
                    <input type="number" className="input-field" value={height} onChange={e => setHeight(e.target.value)} placeholder={unit === 'metric' ? '170' : '67'} />
                </div>
                <div className="calc-field">
                    <label>{unit === 'metric' ? 'Weight (kg)' : 'Weight (lbs)'}</label>
                    <input type="number" className="input-field" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'metric' ? '70' : '154'} />
                </div>
            </div>
            <button className="btn btn-primary" onClick={calculate}>Calculate BMI</button>
            {result && (
                <div className="calc-result" style={{ borderLeftColor: result.color }}>
                    <div className="calc-result-value" style={{ color: result.color }}>{result.bmi}</div>
                    <div className="calc-result-label">{result.category}</div>
                    <p className="calc-result-note">
                        BMI is a screening tool, not a diagnostic measure. It doesn't account for muscle mass, bone density, or body composition.
                    </p>
                </div>
            )}
        </div>
    )
}

/* ── Calorie Calculator ── */
function CalorieCalculator() {
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('male')
    const [height, setHeight] = useState('')
    const [weight, setWeight] = useState('')
    const [activity, setActivity] = useState('1.55')
    const [result, setResult] = useState(null)

    const calculate = () => {
        const a = parseInt(age), h = parseFloat(height), w = parseFloat(weight)
        if (!a || !h || !w) return

        let bmr
        if (gender === 'male') {
            bmr = 10 * w + 6.25 * h - 5 * a + 5
        } else {
            bmr = 10 * w + 6.25 * h - 5 * a - 161
        }

        const tdee = bmr * parseFloat(activity)
        setResult({
            bmr: Math.round(bmr),
            maintenance: Math.round(tdee),
            weightLoss: Math.round(tdee - 500),
            weightGain: Math.round(tdee + 500),
        })
    }

    return (
        <div className="calc-section">
            <h3><Activity size={18} /> Daily Calorie Needs</h3>
            <div className="calc-inputs">
                <div className="calc-field">
                    <label>Age</label>
                    <input type="number" className="input-field" value={age} onChange={e => setAge(e.target.value)} placeholder="25" />
                </div>
                <div className="calc-field">
                    <label>Gender</label>
                    <select className="input-field" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="calc-field">
                    <label>Height (cm)</label>
                    <input type="number" className="input-field" value={height} onChange={e => setHeight(e.target.value)} placeholder="170" />
                </div>
                <div className="calc-field">
                    <label>Weight (kg)</label>
                    <input type="number" className="input-field" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
                </div>
            </div>
            <div className="calc-field" style={{ marginBottom: 14 }}>
                <label>Activity Level</label>
                <select className="input-field" value={activity} onChange={e => setActivity(e.target.value)}>
                    <option value="1.2">Sedentary (little/no exercise)</option>
                    <option value="1.375">Lightly active (1-3 days/week)</option>
                    <option value="1.55">Moderately active (3-5 days/week)</option>
                    <option value="1.725">Very active (6-7 days/week)</option>
                    <option value="1.9">Extra active (athlete/physical job)</option>
                </select>
            </div>
            <button className="btn btn-primary" onClick={calculate}>Calculate</button>
            {result && (
                <div className="calc-result" style={{ borderLeftColor: 'var(--primary)' }}>
                    <div className="calc-result-grid">
                        <div>
                            <span className="calc-result-value">{result.bmr}</span>
                            <span className="calc-result-label">BMR (kcal)</span>
                        </div>
                        <div>
                            <span className="calc-result-value" style={{ color: 'var(--primary)' }}>{result.maintenance}</span>
                            <span className="calc-result-label">Maintenance</span>
                        </div>
                        <div>
                            <span className="calc-result-value" style={{ color: '#3B82F6' }}>{result.weightLoss}</span>
                            <span className="calc-result-label">Weight Loss</span>
                        </div>
                        <div>
                            <span className="calc-result-value" style={{ color: '#F59E0B' }}>{result.weightGain}</span>
                            <span className="calc-result-label">Weight Gain</span>
                        </div>
                    </div>
                    <p className="calc-result-note">Based on Mifflin-St Jeor equation. Results are estimates — consult a dietitian for personalized plans.</p>
                </div>
            )}
        </div>
    )
}

/* ── Water Intake Calculator ── */
function WaterCalculator() {
    const [weight, setWeight] = useState('')
    const [exercise, setExercise] = useState('30')
    const [climate, setClimate] = useState('temperate')
    const [result, setResult] = useState(null)

    const calculate = () => {
        const w = parseFloat(weight)
        if (!w) return

        let base = w * 0.033 // 33ml per kg
        const exerciseMin = parseInt(exercise) || 0
        const exerciseExtra = (exerciseMin / 30) * 0.35
        const climateMultiplier = climate === 'hot' ? 1.2 : climate === 'cold' ? 0.95 : 1.0

        const total = (base + exerciseExtra) * climateMultiplier
        setResult({
            liters: total.toFixed(1),
            glasses: Math.round(total / 0.25),
            oz: Math.round(total * 33.814),
        })
    }

    return (
        <div className="calc-section">
            <h3><Droplets size={18} /> Water Intake</h3>
            <div className="calc-inputs">
                <div className="calc-field">
                    <label>Weight (kg)</label>
                    <input type="number" className="input-field" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" />
                </div>
                <div className="calc-field">
                    <label>Daily Exercise (min)</label>
                    <input type="number" className="input-field" value={exercise} onChange={e => setExercise(e.target.value)} placeholder="30" />
                </div>
                <div className="calc-field">
                    <label>Climate</label>
                    <select className="input-field" value={climate} onChange={e => setClimate(e.target.value)}>
                        <option value="cold">Cold</option>
                        <option value="temperate">Temperate</option>
                        <option value="hot">Hot/Tropical</option>
                    </select>
                </div>
            </div>
            <button className="btn btn-primary" onClick={calculate}>Calculate</button>
            {result && (
                <div className="calc-result" style={{ borderLeftColor: '#3B82F6' }}>
                    <div className="calc-result-grid">
                        <div>
                            <span className="calc-result-value" style={{ color: '#3B82F6' }}>{result.liters}L</span>
                            <span className="calc-result-label">Daily Target</span>
                        </div>
                        <div>
                            <span className="calc-result-value">{result.glasses}</span>
                            <span className="calc-result-label">Glasses (250ml)</span>
                        </div>
                        <div>
                            <span className="calc-result-value">{result.oz} oz</span>
                            <span className="calc-result-label">Fluid Ounces</span>
                        </div>
                    </div>
                    <p className="calc-result-note">Increase intake during illness, pregnancy, or breastfeeding. Water-rich foods also count toward daily hydration.</p>
                </div>
            )}
        </div>
    )
}

/* ── Heart Rate Zone Calculator ── */
function HeartRateCalculator() {
    const [age, setAge] = useState('')
    const [restingHR, setRestingHR] = useState('')
    const [result, setResult] = useState(null)

    const calculate = () => {
        const a = parseInt(age), rhr = parseInt(restingHR) || 60
        if (!a) return

        const maxHR = 220 - a
        const hrr = maxHR - rhr // Heart rate reserve (Karvonen)

        const zones = [
            { name: 'Zone 1 — Recovery', pct: '50-60%', low: Math.round(hrr * 0.5 + rhr), high: Math.round(hrr * 0.6 + rhr), color: '#93C5FD', benefit: 'Active recovery, warm-up' },
            { name: 'Zone 2 — Fat Burn', pct: '60-70%', low: Math.round(hrr * 0.6 + rhr), high: Math.round(hrr * 0.7 + rhr), color: '#34D399', benefit: 'Fat burning, endurance base' },
            { name: 'Zone 3 — Aerobic', pct: '70-80%', low: Math.round(hrr * 0.7 + rhr), high: Math.round(hrr * 0.8 + rhr), color: '#FBBF24', benefit: 'Cardiovascular fitness' },
            { name: 'Zone 4 — Threshold', pct: '80-90%', low: Math.round(hrr * 0.8 + rhr), high: Math.round(hrr * 0.9 + rhr), color: '#FB923C', benefit: 'Performance, speed' },
            { name: 'Zone 5 — Max Effort', pct: '90-100%', low: Math.round(hrr * 0.9 + rhr), high: maxHR, color: '#F87171', benefit: 'Max performance (short bursts)' },
        ]

        setResult({ maxHR, zones })
    }

    return (
        <div className="calc-section">
            <h3><Heart size={18} /> Heart Rate Zones</h3>
            <div className="calc-inputs">
                <div className="calc-field">
                    <label>Age</label>
                    <input type="number" className="input-field" value={age} onChange={e => setAge(e.target.value)} placeholder="25" />
                </div>
                <div className="calc-field">
                    <label>Resting Heart Rate (bpm)</label>
                    <input type="number" className="input-field" value={restingHR} onChange={e => setRestingHR(e.target.value)} placeholder="60" />
                </div>
            </div>
            <button className="btn btn-primary" onClick={calculate}>Calculate Zones</button>
            {result && (
                <div className="calc-result" style={{ borderLeftColor: '#EF4444' }}>
                    <p style={{ marginBottom: 10, fontWeight: 600 }}>Max Heart Rate: {result.maxHR} bpm</p>
                    <div className="hr-zones">
                        {result.zones.map((z, i) => (
                            <div key={i} className="hr-zone" style={{ borderLeftColor: z.color }}>
                                <div className="hr-zone-header">
                                    <span style={{ color: z.color, fontWeight: 600, fontSize: '.82rem' }}>{z.name}</span>
                                    <span style={{ fontSize: '.78rem', color: 'var(--text-dim)' }}>{z.pct}</span>
                                </div>
                                <div style={{ fontSize: '.9rem', fontWeight: 700 }}>{z.low} – {z.high} bpm</div>
                                <div style={{ fontSize: '.72rem', color: 'var(--text-sec)' }}>{z.benefit}</div>
                            </div>
                        ))}
                    </div>
                    <p className="calc-result-note">Based on Karvonen formula. Consult a doctor before starting intense exercise programs.</p>
                </div>
            )}
        </div>
    )
}

/* ── Main HealthCalculators Page ── */
export default function HealthCalculators() {
    const [activeCalc, setActiveCalc] = useState('bmi')

    const calcs = [
        { id: 'bmi', label: 'BMI', icon: Calculator },
        { id: 'calories', label: 'Calories', icon: Activity },
        { id: 'water', label: 'Water', icon: Droplets },
        { id: 'heartrate', label: 'Heart Rate', icon: Heart },
    ]

    return (
        <div style={{ animation: 'pageIn .4s ease' }}>
            <div className="page-header">
                <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calculator size={26} color="#3B82F6" />
                    Health Calculators
                </h1>
                <p>Quick health calculations — BMI, calorie needs, water intake, and heart rate zones. All computed on your device.</p>
            </div>

            {/* Tab Selector */}
            <div className="calc-tabs" role="tablist">
                {calcs.map(c => (
                    <button
                        key={c.id}
                        role="tab"
                        aria-selected={activeCalc === c.id}
                        className={`calc-tab ${activeCalc === c.id ? 'active' : ''}`}
                        onClick={() => setActiveCalc(c.id)}
                    >
                        <c.icon size={16} />
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Calculator Content */}
            <div style={{ animation: 'pageIn .3s ease' }}>
                {activeCalc === 'bmi' && <BMICalculator />}
                {activeCalc === 'calories' && <CalorieCalculator />}
                {activeCalc === 'water' && <WaterCalculator />}
                {activeCalc === 'heartrate' && <HeartRateCalculator />}
            </div>

            <div style={{ marginTop: 20, padding: '12px 16px', borderLeft: '3px solid var(--border)', fontSize: '.75rem', color: 'var(--text-dim)', lineHeight: 1.6 }}>
                🧮 All calculations are performed locally on your device — no data is sent to any server. Results are estimates for educational purposes.
            </div>
        </div>
    )
}
