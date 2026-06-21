import { useState, useEffect, Suspense, lazy, Component } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Navbar from './components/Sidebar'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import OnboardingTour from './components/OnboardingTour'
import SOSButton from './components/SOSButton'
import ProtectedRoute from './components/ProtectedRoute'

// ── Lazy-loaded page components (code splitting) ──
const Home = lazy(() => import('./pages/Home'))
const SymptomChecker = lazy(() => import('./pages/SymptomChecker'))
const FirstAid = lazy(() => import('./pages/FirstAid'))
const MedicineInfo = lazy(() => import('./pages/MedicineInfo'))
const Wellness = lazy(() => import('./pages/Wellness'))
const MentalHealth = lazy(() => import('./pages/MentalHealth'))
const NutritionPlanner = lazy(() => import('./pages/NutritionPlanner'))
const HealthCalculators = lazy(() => import('./pages/HealthCalculators'))
const DrugInteraction = lazy(() => import('./pages/DrugInteraction'))
const History = lazy(() => import('./pages/History'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Analytics = lazy(() => import('./pages/Analytics'))
const HealthData = lazy(() => import('./pages/HealthData'))
const EmergencySetup = lazy(() => import('./pages/EmergencySetup'))
const Consultation = lazy(() => import('./pages/Consultation'))

const API_BASE = '/api'
const FETCH_TIMEOUT = 30000 // 30 seconds

/* ── PWA Service Worker Registration ── */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(() => console.log('SW registered'))
            .catch(() => { })
    })
}

/* ── React Error Boundary ── */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        console.error('App Error:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <div className="error-boundary-icon">⚠️</div>
                        <h2>Something went wrong</h2>
                        <p>An unexpected error occurred. Please try refreshing the page.</p>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.href = '/'
                            }}
                        >
                            Return to Home
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}

/* ── Page Loading Spinner ── */
function PageLoader() {
    return (
        <div className="page-loader">
            <div className="page-loader-spinner"></div>
            <p>Loading...</p>
        </div>
    )
}

/* ── Medical Video Background ── */
function MedicalBackground() {
    return (
        <div className="medical-bg">
            <video
                autoPlay
                muted
                loop
                playsInline
                className="medical-bg-video"
                poster=""
            >
                <source
                    src="https://cdn.pixabay.com/video/2019/09/19/27019-361107952_large.mp4"
                    type="video/mp4"
                />
            </video>
            <div className="medical-bg-overlay"></div>
        </div>
    )
}

function App() {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('mediguide-theme') === 'dark'
    })
    const [sessionId, setSessionId] = useState(null)
    const { token } = useAuth()
    const location = useLocation()
    const [routeAnnouncement, setRouteAnnouncement] = useState('')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
        localStorage.setItem('mediguide-theme', darkMode ? 'dark' : 'light')
    }, [darkMode])

    // Announce route changes for screen readers
    useEffect(() => {
        const pageName = location.pathname === '/' ? 'Home' : location.pathname.slice(1).replace(/-/g, ' ')
        setRouteAnnouncement(`Navigated to ${pageName} page`)
    }, [location.pathname])

    const startSession = async () => {
        if (sessionId) return sessionId
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
            const res = await fetch(`${API_BASE}/start`, {
                method: 'POST',
                signal: controller.signal,
            })
            clearTimeout(timeoutId)
            const data = await res.json()
            setSessionId(data.sessionId)
            return data.sessionId
        } catch {
            return null
        }
    }

    const sendMessage = async (endpoint, message) => {
        const sid = await startSession()
        if (!sid) return { error: 'Unable to connect. Please try again.' }
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)
            const headers = { 'Content-Type': 'application/json' }
            if (token) headers.Authorization = `Bearer ${token}`
            const res = await fetch(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ sessionId: sid, message }),
                signal: controller.signal,
            })
            clearTimeout(timeoutId)
            return await res.json()
        } catch (err) {
            if (err.name === 'AbortError') {
                return { error: 'Request timed out. Please try again.' }
            }
            return { error: 'Unable to reach the server. Please try again.' }
        }
    }

    return (
        <>
            {/* Skip Navigation for keyboard/screen-reader users */}
            <a href="#main-content" className="skip-nav">Skip to main content</a>

            {/* Screen reader route announcements */}
            <div className="sr-only" aria-live="polite" role="status">
                {routeAnnouncement}
            </div>

            <MedicalBackground />
            <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
            <div className="app-wrapper sidebar-layout">
                <main className="main-content" role="main" id="main-content" tabIndex="-1">
                    <div className="page-container">
                        <ErrorBoundary>
                            <Suspense fallback={<PageLoader />}>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/symptoms" element={<ProtectedRoute><SymptomChecker sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/firstaid" element={<ProtectedRoute><FirstAid sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/medicine" element={<ProtectedRoute><MedicineInfo sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/wellness" element={<ProtectedRoute><Wellness sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/mentalhealth" element={<ProtectedRoute><MentalHealth sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/nutrition" element={<ProtectedRoute><NutritionPlanner sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/calculators" element={<ProtectedRoute><HealthCalculators /></ProtectedRoute>} />
                                    <Route path="/druginteraction" element={<ProtectedRoute><DrugInteraction sendMessage={sendMessage} /></ProtectedRoute>} />
                                    <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                                    <Route path="/health-data" element={<ProtectedRoute><HealthData /></ProtectedRoute>} />
                                    <Route path="/emergency" element={<ProtectedRoute><EmergencySetup /></ProtectedRoute>} />
                                    <Route path="/consultation" element={<ProtectedRoute><Consultation sendMessage={sendMessage} /></ProtectedRoute>} />
                                </Routes>
                            </Suspense>
                        </ErrorBoundary>
                    </div>
                    <Footer />
                </main>
            </div>
            <Chatbot sendMessage={sendMessage} />
            <SOSButton />
            <OnboardingTour />
        </>
    )
}

export default App
