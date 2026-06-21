import { Phone, AlertTriangle } from 'lucide-react'

export default function EmergencyBanner({ data }) {
    if (!data) return null

    return (
        <div className="emergency-banner">
            <h2>
                <AlertTriangle size={22} />
                🚨 EMERGENCY — Seek Help Immediately
            </h2>
            <p>Your symptoms may require immediate medical attention.</p>

            {data.whatToDoNow && (
                <ul>
                    {Array.isArray(data.whatToDoNow)
                        ? data.whatToDoNow.map((step, i) => <li key={i}>{step}</li>)
                        : <li>{data.whatToDoNow}</li>
                    }
                </ul>
            )}

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a
                    href="tel:911"
                    className="btn"
                    style={{
                        background: 'white', color: '#DC2626',
                        fontWeight: 700, textDecoration: 'none'
                    }}
                >
                    <Phone size={17} /> Call 911
                </a>
                <a
                    href="tel:112"
                    className="btn"
                    style={{
                        background: 'rgba(255,255,255,0.2)', color: 'white',
                        fontWeight: 600, textDecoration: 'none'
                    }}
                >
                    <Phone size={17} /> Call 112
                </a>
                <a
                    href="tel:108"
                    className="btn"
                    style={{
                        background: 'rgba(255,255,255,0.2)', color: 'white',
                        fontWeight: 600, textDecoration: 'none'
                    }}
                >
                    <Phone size={17} /> Call 108
                </a>
            </div>
        </div>
    )
}
