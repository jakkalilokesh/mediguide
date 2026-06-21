import { createContext, useContext, useState } from 'react'

const translations = {
    en: {
        nav: { home: 'Home', symptoms: 'Symptoms', firstaid: 'First Aid', medicine: 'Medicine', wellness: 'Wellness', mentalhealth: 'Mental Health', nutrition: 'Nutrition', calculators: 'Calculators', drugs: 'Drug Check', history: 'History', analytics: 'Dashboard', healthdata: 'Health Data', profile: 'Profile', login: 'Login', register: 'Sign Up', logout: 'Logout', emergency: 'Emergency' },
        common: { submit: 'Submit', cancel: 'Cancel', save: 'Save', delete: 'Delete', loading: 'Loading...', error: 'Something went wrong', success: 'Success!', back: 'Back', next: 'Next', search: 'Search...', noResults: 'No results found', required: 'Required' },
        auth: { loginTitle: 'Welcome Back', registerTitle: 'Create Account', email: 'Email', password: 'Password', name: 'Full Name', loginBtn: 'Log In', registerBtn: 'Create Account', noAccount: "Don't have an account?", hasAccount: 'Already have an account?', forgotPassword: 'Forgot password?' },
        home: { title: 'Your AI Health Companion', subtitle: 'Get instant, intelligent health guidance powered by advanced AI. From symptom analysis to nutrition planning — all in one place.', stats: { modules: 'Health Modules', aiPowered: 'AI-Powered', available: '24/7 Available', secure: 'Secure' } },
        profile: { title: 'Health Profile', age: 'Age', gender: 'Gender', bloodType: 'Blood Type', allergies: 'Allergies', conditions: 'Chronic Conditions', medications: 'Current Medications', addItem: 'Add item and press Enter' },
        analytics: { title: 'Health Analytics', totalQueries: 'Total Queries', favoriteModule: 'Most Used Module', moduleUsage: 'Module Usage', dailyActivity: 'Daily Activity', symptomTrends: 'Symptom Trends' },
        healthData: { title: 'Health Data', addMetric: 'Add Metric', heartRate: 'Heart Rate', weight: 'Weight', steps: 'Steps', sleep: 'Sleep Hours', bloodPressure: 'Blood Pressure', temperature: 'Temperature', oxygenSat: 'Oxygen Saturation', bloodSugar: 'Blood Sugar', waterIntake: 'Water Intake', calories: 'Calories', noData: 'No health data recorded yet. Start tracking!' },
        emergency: { title: 'Emergency Setup', sosBtn: 'SOS Emergency', contacts: 'Emergency Contacts', addContact: 'Add Contact', name: 'Contact Name', phone: 'Phone Number', relationship: 'Relationship', primary: 'Primary Contact' },
    },
    hi: {
        nav: { home: 'होम', symptoms: 'लक्षण', firstaid: 'प्राथमिक चिकित्सा', medicine: 'दवा', wellness: 'स्वास्थ्य', mentalhealth: 'मानसिक स्वास्थ्य', nutrition: 'पोषण', calculators: 'कैलकुलेटर', drugs: 'दवा जांच', history: 'इतिहास', analytics: 'डैशबोर्ड', healthdata: 'स्वास्थ्य डेटा', profile: 'प्रोफ़ाइल', login: 'लॉगिन', register: 'साइन अप', logout: 'लॉगआउट', emergency: 'आपातकालीन' },
        common: { submit: 'जमा करें', cancel: 'रद्द करें', save: 'सुरक्षित करें', delete: 'हटाएं', loading: 'लोड हो रहा है...', error: 'कुछ गलत हुआ', success: 'सफलता!', back: 'पीछे', next: 'आगे', search: 'खोजें...', noResults: 'कोई परिणाम नहीं', required: 'आवश्यक' },
        auth: { loginTitle: 'वापसी पर स्वागत है', registerTitle: 'खाता बनाएं', email: 'ईमेल', password: 'पासवर्ड', name: 'पूरा नाम', loginBtn: 'लॉगिन करें', registerBtn: 'खाता बनाएं', noAccount: 'खाता नहीं है?', hasAccount: 'पहले से खाता है?', forgotPassword: 'पासवर्ड भूल गए?' },
        home: { title: 'आपका AI स्वास्थ्य साथी', subtitle: 'उन्नत AI द्वारा संचालित तत्काल, बुद्धिमान स्वास्थ्य मार्गदर्शन प्राप्त करें।', stats: { modules: 'स्वास्थ्य मॉड्यूल', aiPowered: 'AI संचालित', available: '24/7 उपलब्ध', secure: 'सुरक्षित' } },
        profile: { title: 'स्वास्थ्य प्रोफ़ाइल', age: 'आयु', gender: 'लिंग', bloodType: 'रक्त समूह', allergies: 'एलर्जी', conditions: 'पुरानी बीमारियां', medications: 'वर्तमान दवाइयां', addItem: 'आइटम जोड़ें और Enter दबाएं' },
        analytics: { title: 'स्वास्थ्य विश्लेषण', totalQueries: 'कुल प्रश्न', favoriteModule: 'सबसे अधिक उपयोग', moduleUsage: 'मॉड्यूल उपयोग', dailyActivity: 'दैनिक गतिविधि', symptomTrends: 'लक्षण रुझान' },
        healthData: { title: 'स्वास्थ्य डेटा', addMetric: 'मेट्रिक जोड़ें', heartRate: 'हृदय गति', weight: 'वज़न', steps: 'कदम', sleep: 'नींद के घंटे', bloodPressure: 'रक्तचाप', temperature: 'तापमान', oxygenSat: 'ऑक्सीजन संतृप्ति', bloodSugar: 'रक्त शर्करा', waterIntake: 'पानी का सेवन', calories: 'कैलोरी', noData: 'कोई स्वास्थ्य डेटा दर्ज नहीं है।' },
        emergency: { title: 'आपातकालीन सेटअप', sosBtn: 'SOS आपातकालीन', contacts: 'आपातकालीन संपर्क', addContact: 'संपर्क जोड़ें', name: 'संपर्क नाम', phone: 'फ़ोन नंबर', relationship: 'संबंध', primary: 'प्राथमिक संपर्क' },
    },
    es: {
        nav: { home: 'Inicio', symptoms: 'Síntomas', firstaid: 'Primeros Auxilios', medicine: 'Medicina', wellness: 'Bienestar', mentalhealth: 'Salud Mental', nutrition: 'Nutrición', calculators: 'Calculadoras', drugs: 'Medicamentos', history: 'Historial', analytics: 'Análisis', healthdata: 'Datos de Salud', profile: 'Perfil', login: 'Iniciar Sesión', register: 'Registrarse', logout: 'Cerrar Sesión', emergency: 'Emergencia' },
        common: { submit: 'Enviar', cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', loading: 'Cargando...', error: 'Algo salió mal', success: '¡Éxito!', back: 'Atrás', next: 'Siguiente', search: 'Buscar...', noResults: 'Sin resultados', required: 'Requerido' },
        auth: { loginTitle: 'Bienvenido', registerTitle: 'Crear Cuenta', email: 'Correo', password: 'Contraseña', name: 'Nombre Completo', loginBtn: 'Iniciar Sesión', registerBtn: 'Crear Cuenta', noAccount: '¿No tienes cuenta?', hasAccount: '¿Ya tienes cuenta?', forgotPassword: '¿Olvidaste tu contraseña?' },
        home: { title: 'Tu Compañero de Salud con IA', subtitle: 'Obtén orientación de salud instantánea e inteligente.', stats: { modules: 'Módulos de Salud', aiPowered: 'Con IA', available: '24/7 Disponible', secure: 'Seguro' } },
        profile: { title: 'Perfil de Salud', age: 'Edad', gender: 'Género', bloodType: 'Tipo de Sangre', allergies: 'Alergias', conditions: 'Condiciones Crónicas', medications: 'Medicamentos Actuales', addItem: 'Agregar y presionar Enter' },
        analytics: { title: 'Análisis de Salud', totalQueries: 'Consultas Totales', favoriteModule: 'Módulo Más Usado', moduleUsage: 'Uso de Módulos', dailyActivity: 'Actividad Diaria', symptomTrends: 'Tendencias de Síntomas' },
        healthData: { title: 'Datos de Salud', addMetric: 'Agregar Métrica', heartRate: 'Ritmo Cardíaco', weight: 'Peso', steps: 'Pasos', sleep: 'Horas de Sueño', bloodPressure: 'Presión Arterial', temperature: 'Temperatura', oxygenSat: 'Saturación de Oxígeno', bloodSugar: 'Azúcar en Sangre', waterIntake: 'Consumo de Agua', calories: 'Calorías', noData: 'No hay datos de salud registrados.' },
        emergency: { title: 'Configuración de Emergencia', sosBtn: 'SOS Emergencia', contacts: 'Contactos de Emergencia', addContact: 'Agregar Contacto', name: 'Nombre', phone: 'Teléfono', relationship: 'Relación', primary: 'Contacto Principal' },
    },
    fr: {
        nav: { home: 'Accueil', symptoms: 'Symptômes', firstaid: 'Premiers Secours', medicine: 'Médecine', wellness: 'Bien-être', mentalhealth: 'Santé Mentale', nutrition: 'Nutrition', calculators: 'Calculatrices', drugs: 'Médicaments', history: 'Historique', analytics: 'Tableau de Bord', healthdata: 'Données de Santé', profile: 'Profil', login: 'Connexion', register: "S'inscrire", logout: 'Déconnexion', emergency: 'Urgence' },
        common: { submit: 'Soumettre', cancel: 'Annuler', save: 'Sauvegarder', delete: 'Supprimer', loading: 'Chargement...', error: 'Quelque chose a mal tourné', success: 'Succès!', back: 'Retour', next: 'Suivant', search: 'Rechercher...', noResults: 'Aucun résultat', required: 'Requis' },
        auth: { loginTitle: 'Bienvenue', registerTitle: 'Créer un Compte', email: 'Email', password: 'Mot de passe', name: 'Nom Complet', loginBtn: 'Se Connecter', registerBtn: 'Créer un Compte', noAccount: "Pas de compte?", hasAccount: 'Déjà un compte?', forgotPassword: 'Mot de passe oublié?' },
        home: { title: 'Votre Compagnon Santé IA', subtitle: "Obtenez des conseils de santé instantanés et intelligents.", stats: { modules: 'Modules Santé', aiPowered: 'IA', available: '24/7 Disponible', secure: 'Sécurisé' } },
        profile: { title: 'Profil de Santé', age: 'Âge', gender: 'Genre', bloodType: 'Groupe Sanguin', allergies: 'Allergies', conditions: 'Conditions Chroniques', medications: 'Médicaments Actuels', addItem: 'Ajouter et appuyer sur Entrée' },
        analytics: { title: 'Analyse de Santé', totalQueries: 'Total des Requêtes', favoriteModule: 'Module le Plus Utilisé', moduleUsage: 'Utilisation des Modules', dailyActivity: 'Activité Quotidienne', symptomTrends: 'Tendances des Symptômes' },
        healthData: { title: 'Données de Santé', addMetric: 'Ajouter une Métrique', heartRate: 'Fréquence Cardiaque', weight: 'Poids', steps: 'Pas', sleep: 'Heures de Sommeil', bloodPressure: 'Tension Artérielle', temperature: 'Température', oxygenSat: "Saturation en Oxygène", bloodSugar: 'Glycémie', waterIntake: "Consommation d'Eau", calories: 'Calories', noData: 'Aucune donnée de santé enregistrée.' },
        emergency: { title: "Configuration d'Urgence", sosBtn: 'SOS Urgence', contacts: "Contacts d'Urgence", addContact: 'Ajouter un Contact', name: 'Nom', phone: 'Téléphone', relationship: 'Relation', primary: 'Contact Principal' },
    },
    te: {
        nav: { home: 'హోమ్', symptoms: 'లక్షణాలు', firstaid: 'ప్రథమ చికిత్స', medicine: 'మందు', wellness: 'ఆరోగ్యం', mentalhealth: 'మానసిక ఆరోగ్యం', nutrition: 'పోషణ', calculators: 'కాల్కులేటర్లు', drugs: 'డ్రగ్ చెక్', history: 'చరిత్ర', analytics: 'డాష్‌బోర్డ్', healthdata: 'ఆరోగ్య డేటా', profile: 'ప్రొఫైల్', login: 'లాగిన్', register: 'సైన్ అప్', logout: 'లాగ్ అవుట్', emergency: 'అత్యవసరం' },
        common: { submit: 'సబ్మిట్', cancel: 'రద్దు', save: 'సేవ్', delete: 'తొలగించు', loading: 'లోడ్ అవుతోంది...', error: 'ఏదో తప్పు జరిగింది', success: 'విజయం!', back: 'వెనుకకు', next: 'తదుపరి', search: 'వెతకండి...', noResults: 'ఫలితాలు లేవు', required: 'తప్పనిసరి' },
        auth: { loginTitle: 'తిరిగి స్వాగతం', registerTitle: 'ఖాతా సృష్టించండి', email: 'ఇమెయిల్', password: 'పాస్‌వర్డ్', name: 'పూర్తి పేరు', loginBtn: 'లాగిన్', registerBtn: 'ఖాతా సృష్టించండి', noAccount: 'ఖాతా లేదా?', hasAccount: 'ఇప్పటికే ఖాతా ఉందా?', forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?' },
        home: { title: 'మీ AI ఆరోగ్య సహాయకుడు', subtitle: 'అధునాతన AI ద్వారా తక్షణ, తెలివైన ఆరోగ్య మార్గదర్శకత్వం పొందండి.', stats: { modules: 'ఆరోగ్య మాడ్యూల్స్', aiPowered: 'AI ఆధారిత', available: '24/7 అందుబాటు', secure: 'సురక్షితం' } },
        profile: { title: 'ఆరోగ్య ప్రొఫైల్', age: 'వయస్సు', gender: 'లింగం', bloodType: 'రక్త గ్రూప్', allergies: 'అలెర్జీలు', conditions: 'దీర్ఘకాలిక వ్యాధులు', medications: 'ప్రస్తుత మందులు', addItem: 'ఐటెమ్ జోడించి Enter నొక్కండి' },
        analytics: { title: 'ఆరోగ్య విశ్లేషణ', totalQueries: 'మొత్తం ప్రశ్నలు', favoriteModule: 'ఎక్కువ వాడిన మాడ్యూల్', moduleUsage: 'మాడ్యూల్ వాడకం', dailyActivity: 'రోజువారీ కార్యకలాపం', symptomTrends: 'లక్షణ ధోరణులు' },
        healthData: { title: 'ఆరోగ్య డేటా', addMetric: 'మెట్రిక్ జోడించు', heartRate: 'గుండె లయ', weight: 'బరువు', steps: 'అడుగులు', sleep: 'నిద్ర గంటలు', bloodPressure: 'రక్తపోటు', temperature: 'ఉష్ణోగ్రత', oxygenSat: 'ఆక్సిజన్ సంతృప్తత', bloodSugar: 'రక్త చక్కెర', waterIntake: 'నీటి తీసుకోవడం', calories: 'కేలరీలు', noData: 'ఆరోగ్య డేటా ఇంకా నమోదు కాలేదు.' },
        emergency: { title: 'అత్యవసర సెటప్', sosBtn: 'SOS అత్యవసరం', contacts: 'అత్యవసర సంప్రదింపులు', addContact: 'సంప్రదింపు జోడించు', name: 'పేరు', phone: 'ఫోన్ నంబర్', relationship: 'సంబంధం', primary: 'ప్రాథమిక సంప్రదింపు' },
    },
}

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState(() => localStorage.getItem('mediguide-lang') || 'en')

    const setLanguage = (l) => {
        setLang(l)
        localStorage.setItem('mediguide-lang', l)
    }

    const t = (path) => {
        const keys = path.split('.')
        let val = translations[lang]
        for (const k of keys) {
            val = val?.[k]
        }
        // Fallback to English
        if (!val) {
            val = translations.en
            for (const k of keys) val = val?.[k]
        }
        return val || path
    }

    return (
        <LanguageContext.Provider value={{ lang, setLanguage, t, languages: Object.keys(translations) }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const ctx = useContext(LanguageContext)
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
    return ctx
}
