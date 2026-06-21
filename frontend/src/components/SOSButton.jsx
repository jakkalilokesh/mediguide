import { useState } from 'react'
import { AlertTriangle, Phone, MapPin, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function SOSButton() {
    const [active, setActive] = useState(false)
    const [location, setLocation] = useState(null)
    const [contacts, setContacts] = useState([])
    const { isAuthenticated, authFetch } = useAuth()

    const handleSOS = async () => {
        setActive(true)

        // Get GPS location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation(null)
            )
        }

        // Fetch emergency contacts
        if (isAuthenticated) {
            try {
                const res = await authFetch('/api/emergency')
                if (res.ok) {
                    const data = await res.json()
                    setContacts(data.contacts)
                }
            } catch { }
        }
    }

    const close = () => {
        setActive(false)
        setLocation(null)
        setContacts([])
    }

    return (
        <>
            <button className="sos-float-btn" onClick={handleSOS} title="Emergency SOS">
                <AlertTriangle size={22} />
                <span>SOS</span>
            </button>

            {active && (
                <div className="sos-overlay" onClick={close}>
                    <div className="sos-modal" onClick={e => e.stopPropagation()}>
                        <button className="sos-close" onClick={close}><X size={20} /></button>

                        <div className="sos-header">
                            <AlertTriangle size={36} />
                            <h2>Emergency SOS</h2>
                        </div>

                        {/* Location */}
                        <div className="sos-section">
                            <h3><MapPin size={16} /> Your Location</h3>
                            {location ? (
                                <div className="sos-location">
                                    <p>📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}</p>
                                    <a href={`https://maps.google.com/?q=${location.lat},${location.lng}`} target="_blank" rel="noopener noreferrer" className="sos-map-link">
                                        Open in Google Maps ↗
                                    </a>
                                </div>
                            ) : (
                                <p className="sos-muted">Getting location... (allow GPS access)</p>
                            )}
                        </div>

                        {/* Emergency Numbers */}
                        <div className="sos-section">
                            <h3><Phone size={16} /> Emergency Numbers</h3>
                            <div className="sos-numbers">
                                <a href="tel:112" className="sos-call"><span>🚨</span> 112 — All Emergencies</a>
                                <a href="tel:102" className="sos-call"><span>🚑</span> 102 — Ambulance</a>
                                <a href="tel:108" className="sos-call"><span>🏥</span> 108 — Emergency Medical</a>
                            </div>
                        </div>

                        {/* Personal Contacts */}
                        {contacts.length > 0 && (
                            <div className="sos-section">
                                <h3>Your Emergency Contacts</h3>
                                <div className="sos-contacts">
                                    {contacts.map(c => (
                                        <a key={c.id} href={`tel:${c.phone}`} className="sos-contact">
                                            <span>{c.name}</span>
                                            <span>{c.phone}</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share Location */}
                        {location && (
                            <button className="sos-share-btn" onClick={() => {
                                const msg = `🆘 EMERGENCY! I need help!\nMy location: https://maps.google.com/?q=${location.lat},${location.lng}`
                                if (navigator.share) {
                                    navigator.share({ title: 'Emergency SOS', text: msg })
                                } else {
                                    navigator.clipboard.writeText(msg)
                                    alert('Location copied to clipboard!')
                                }
                            }}>
                                📤 Share My Location
                            </button>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
