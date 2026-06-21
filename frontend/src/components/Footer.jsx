import { Link } from 'react-router-dom'
import { HeartPulse } from 'lucide-react'

export default function Footer() {
    const year = new Date().getFullYear()

    return (
        <footer className="app-footer">
            <div className="footer-inner">

                <div className="footer-brand">
                    <HeartPulse size={18} color="var(--primary)" />
                    <span className="footer-brand-name">MediGuide</span>
                </div>

                <div className="footer-links">
                    <Link to="/" className="footer-link">Home</Link>
                    <Link to="/symptoms" className="footer-link">Symptoms</Link>
                    <Link to="/firstaid" className="footer-link">First Aid</Link>
                    <Link to="/wellness" className="footer-link">Wellness</Link>
                    <Link to="/consultation" className="footer-link">AI Clinic</Link>
                    <Link to="/emergency" className="footer-link">Emergency</Link>
                </div>

                <div className="footer-bottom">
                    <span>© {year} MediGuide — Built with 💚 for better health</span>
                </div>
            </div>
        </footer>
    )
}
