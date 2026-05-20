import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const API_BASE_URL = 'https://meal-match.app';
const stripePromise = loadStripe('pk_live_51PgpU6RdONrymUvueFN7rtgEQPJd4eavjTKR4W4K4hI2FZtgcl7CHj4kp1gtB9MEoxBmREB4baFOoSvO2juUhVN400tdrKKLPK');

const translations = {
    'English': {
        heroTitle: "MealMatch AI v2.0", heroSubtitle: "Your intelligent partner for smart, sustainable, and delicious weekly meal planning.",
        criteriaTitle: "Set Your Criteria", langLabel: "Language", dietLabel: "Dietary Preference", budgetLabel: "Weekly Budget Mode - £",
        familyLabel: "People to Feed", ingredientsLabel: "Ingredients to Use Up", sexLabel: "Sex", ageLabel: "Age",
        medicalLabel: "Medical Conditions", weightLabel: "Weight", generateButton: "Generate Smart Plan",
        generateLoading: "Generating...", mealPlanTitle: "Your Weekly Meal Plan", mealPlanEmpty: "No plan yet! Fill in your preferences.",
        groceryTitle: "Grocery List", groceryEmpty: "Nothing on your list!", workoutTitle: "Workout Program",
        workoutEmpty: "No workout plan yet!", loginTitle: "Welcome Back!", registerTitle: "Join MealMatch AI",
        loginSub: "Log in to view your plans.", registerSub: "Create an account to start your 3 day free trial.",
        downloadPlan: "Download Plan (.DOCX)", downloadList: "Download List (.DOCX)", downloadModal: "Download as DOCX",
        spamNote: "Note: Please check your spam/junk folder for your activation email!"
    },
    'Romanian': {
        heroTitle: "MealMatch AI v2.0", heroSubtitle: "Partenerul tău inteligent pentru planificarea meselor săptămânale.",
        criteriaTitle: "Setează Criteriile", langLabel: "Limbă", dietLabel: "Preferință Dietetică", budgetLabel: "Buget Săptămânal - £",
        familyLabel: "Persoane", ingredientsLabel: "Ingrediente de Folosit", sexLabel: "Sex", ageLabel: "Vârstă",
        medicalLabel: "Condiții Medicale", weightLabel: "Greutate", generateButton: "Generează Planul",
        generateLoading: "Se generează...", mealPlanTitle: "Planul Tău de Mese", mealPlanEmpty: "Niciun plan încă!",
        groceryTitle: "Lista de Cumpărături", groceryEmpty: "Nimic pe listă!", workoutTitle: "Program Antrenament",
        workoutEmpty: "Niciun plan!", loginTitle: "Bine ai revenit!", registerTitle: "Alătură-te MealMatch AI",
        loginSub: "Conectează-te pentru a vedea planurile.", registerSub: "Creează un cont pentru proba de 3 zile.",
        downloadPlan: "Descarcă Planul (.DOCX)", downloadList: "Descarcă Lista (.DOCX)", downloadModal: "Descarcă ca DOCX",
        spamNote: "Notă: Te rugăm să verifici și folderul Spam pentru e-mailul de activare!"
    },
    'Spanish': {
        heroTitle: "MealMatch AI v2.0", heroSubtitle: "Tu socio para comidas saludables y sostenibles.",
        criteriaTitle: "Configuración", langLabel: "Idioma", dietLabel: "Dieta", budgetLabel: "Presupuesto - £",
        familyLabel: "Personas", ingredientsLabel: "Ingredientes", sexLabel: "Sexo", ageLabel: "Edad",
        medicalLabel: "Médico", weightLabel: "Peso", generateButton: "Generar Plan", generateLoading: "Generando...",
        mealPlanTitle: "Tu Plan Semanal", mealPlanEmpty: "Sin plan.", groceryTitle: "Lista de Compras",
        groceryEmpty: "Lista vacía.", workoutTitle: "Tu Entrenamiento", workoutEmpty: "Sin rutina.",
        loginTitle: "¡Bienvenido de nuevo!", registerTitle: "Únete a MealMatch AI",
        loginSub: "Inicia sesión para ver tus planes.", registerSub: "Crea una cuenta para tu prueba de 3 días.",
        downloadPlan: "Descargar Plan (.DOCX)", downloadList: "Descargar Lista (.DOCX)", downloadModal: "Descargar como DOCX",
        spamNote: "Nota: ¡Revisa tu carpeta de spam para el correo de activación!"
    },
    'Italian': {
        heroTitle: "MealMatch AI v2.0", heroSubtitle: "Il tuo partner intelligente per la pianificazione dei pasti.",
        criteriaTitle: "Imposta i Tuoi Criteri", langLabel: "Lingua", dietLabel: "Dieta", budgetLabel: "Budget Settimanale - £",
        familyLabel: "Persone", ingredientsLabel: "Ingredienti", sexLabel: "Sesso", ageLabel: "Età",
        medicalLabel: "Condizioni Mediche", weightLabel: "Peso", generateButton: "Genera Piano", generateLoading: "Generazione...",
        mealPlanTitle: "Il Tuo Piano Pasti", mealPlanEmpty: "Nessun piano ancora!", groceryTitle: "Lista della Spesa",
        groceryEmpty: "Niente sulla lista!", workoutTitle: "Programma di Allenamento", workoutEmpty: "Nessun piano!",
        loginTitle: "Bentornato!", registerTitle: "Unisciti a MealMatch AI",
        loginSub: "Accedi per vedere i tuoi piani.", registerSub: "Crea un account per la tua prova di 3 giorni.",
        downloadPlan: "Scarica Piano (.DOCX)", downloadList: "Scarica Lista (.DOCX)", downloadModal: "Scarica come DOCX",
        spamNote: "Nota: Controlla la cartella spam per l'email di attivazione!"
    }
};

function App() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);

    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');

    const [clientSecret, setClientSecret] = useState('');
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);

    const [showAdminModal, setShowAdminModal] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [adminMessage, setAdminMessage] = useState('');

    const [language, setLanguage] = useState('English');
    const [diet, setDiet] = useState('Omnivore');
    const [budget, setBudget] = useState('Mid-Range (£40-£60)');
    const [family, setFamily] = useState(2);
    const [ingredients, setIngredients] = useState('');
    const [sex, setSex] = useState('Male');
    const [age, setAge] = useState('');
    const [medical, setMedical] = useState('');
    const [weight, setWeight] = useState(70);
    const [weightUnit] = useState('kg');

    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [weeklyPlan, setWeeklyPlan] = useState([]);
    const [groceryList, setGroceryList] = useState([]);
    const [workoutPlan, setWorkoutPlan] = useState([]);
    const [totalCost, setTotalCost] = useState(0);

    const [activeModal, setActiveModal] = useState(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalContent, setModalContent] = useState('');
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('Warming up the AI ovens...');

    const t = translations[language] || translations['English'];

    useEffect(() => {
        let interval;
        if (isLoading) {
            const phrases = ["Warming up the AI ovens...", "Chopping virtual vegetables...", "Calculating perfect macros...", "Sourcing the freshest ingredients...", "Consulting with the head chef...", "Plating your weekly meals..."];
            let i = 0;
            setLoadingText(phrases[0]);
            interval = setInterval(() => { i = (i + 1) % phrases.length; setLoadingText(phrases[i]); }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        const savedUserStr = localStorage.getItem('mealmatch_user');
        let currentUser = null;
        if (savedUserStr) {
            try {
                currentUser = JSON.parse(savedUserStr);
                setUser(currentUser);
                if (currentUser.savedMealPlan) setWeeklyPlan(JSON.parse(currentUser.savedMealPlan));
                if (currentUser.savedGroceryList) setGroceryList(JSON.parse(currentUser.savedGroceryList));
                if (currentUser.savedWorkout) setWorkoutPlan(JSON.parse(currentUser.savedWorkout));
            } catch (error) { }
        }

        const query = new URLSearchParams(window.location.search);

        if (query.get('activated') === 'true') {
            setShowAuthModal(true);
            setIsLoginMode(true);
            setAuthSuccess('Account activated! You can now log in to start your 3-day trial.');
            window.history.replaceState({}, document.title, '/');
        }

        const sessionId = query.get('session_id');
        if (sessionId && currentUser) {
            fetch(`${API_BASE_URL}/api/verify-session`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionId, email: currentUser.email })
            }).then(res => res.json()).then(data => {
                if (data.success) {
                    setShowSuccessScreen(true);
                    const updatedUser = { ...currentUser, role: 'premium' };
                    setUser(updatedUser);
                    localStorage.setItem('mealmatch_user', JSON.stringify(updatedUser));
                }
            }).finally(() => { window.history.replaceState({}, document.title, '/'); });
        } else if (sessionId) { window.history.replaceState({}, document.title, '/'); }

        const handleBeforeInstallPrompt = (e) => { e.preventDefault(); setDeferredPrompt(e); setIsInstallable(true); };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') { setDeferredPrompt(null); setIsInstallable(false); }
        }
    };

    const savePlansToDb = async (newMealPlan, newGroceryList, newWorkout) => {
        if (!user) return;
        try {
            await fetch(`${API_BASE_URL}/api/save-plans`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, mealPlan: JSON.stringify(newMealPlan), groceryList: JSON.stringify(newGroceryList), workout: JSON.stringify(newWorkout) })
            });
        } catch (error) { }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthSuccess('');
        const endpoint = isLoginMode ? '/api/login' : '/api/register';

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authForm)
            });
            const rawText = await response.text();
            try {
                const data = JSON.parse(rawText);
                if (!response.ok) {
                    setAuthError(data.error || 'Authentication failed.');
                    return;
                }

                if (!isLoginMode) {
                    setAuthSuccess(data.message);
                    setAuthForm({ username: '', email: '', password: '' });
                    setIsLoginMode(true);
                } else {
                    const userData = {
                        username: data.username, email: data.email, role: data.user ? data.user.role : 'user',
                        savedMealPlan: data.user?.savedMealPlan || null, savedGroceryList: data.user?.savedGroceryList || null, savedWorkout: data.user?.savedWorkout || null
                    };
                    setUser(userData);
                    if (userData.savedMealPlan) setWeeklyPlan(JSON.parse(userData.savedMealPlan));
                    if (userData.savedGroceryList) setGroceryList(JSON.parse(userData.savedGroceryList));
                    if (userData.savedWorkout) setWorkoutPlan(JSON.parse(userData.savedWorkout));

                    localStorage.setItem('mealmatch_user', JSON.stringify(userData));
                    setShowAuthModal(false);
                    setAuthForm({ username: '', email: '', password: '' });
                }
            } catch (parseError) { setAuthError('Something went wrong.'); }
        } catch (error) { setAuthError('Network error.'); }
    };

    const handleLogout = () => {
        setUser(null); localStorage.removeItem('mealmatch_user');
        setWeeklyPlan([]); setGroceryList([]); setWorkoutPlan([]);
    };

    const handleSubscribe = async () => {
        if (!user) { setShowAuthModal(true); return; }
        try {
            const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await response.json();
            if (data.clientSecret) { setClientSecret(data.clientSecret); setShowCheckoutModal(true); }
            else { alert('Failed to initialize checkout.'); }
        } catch (error) { alert('Network error. Please try again.'); }
    };

    const openAdminPanel = async () => { setShowAdminModal(true); fetchUsers(); };
    const fetchUsers = async () => {
        try { const response = await fetch(`${API_BASE_URL}/api/admin/users`); const data = await response.json(); setAllUsers(data); }
        catch (error) { setAdminMessage('Failed to load users.'); }
    };
    const deleteUser = async (email) => {
        if (!window.confirm(`Delete ${email}?`)) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${email}`, { method: 'DELETE' });
            if (response.ok) { setAdminMessage(`Deleted ${email}.`); fetchUsers(); }
        } catch (error) { setAdminMessage('Failed to delete user.'); }
    };
    const resetUserPassword = async (email) => {
        const newPassword = window.prompt(`Enter a new password for ${email}:`);
        if (!newPassword) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users/reset-password`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, newPassword: newPassword })
            });
            if (response.ok) { setAdminMessage(`Password reset for ${email}.`); }
        } catch (error) { setAdminMessage('Failed to reset password.'); }
    };

    const generatePlan = async () => {
        if (!user) { setShowAuthModal(true); return; }
        setIsLoading(true); setStatusMsg(t.generateLoading);

        const promptText = `Generate a UNIQUE 7-day meal plan (3 meals/day), grocery list, AND workout plan.
  Language & Cuisine: ${language}. User: ${sex}, ${age || 'N/A'} years old, ${weight} ${weightUnit}. Medical: ${medical || 'None'}.
  Diet: ${diet}. Budget: ${budget}. Family size: ${family}. Ingredients: ${ingredients || 'None'}. Randomizer Seed: ${Math.random()}
  CRITICAL PRICING RULES: Use realistic UK prices (GBP £). The totalCost MUST be mathematically correct and stay within the budget!
  OUTPUT STRICTLY AS JSON: { "weeklyPlan": [ { "day": "Monday", "meals": [ { "type": "Breakfast", "meal": "Oatmeal" } ] } ], "groceryList": [ { "item": "Oats", "price": 2.50 } ], "workoutPlan": [ { "day": "Monday", "routine": "Jogging" } ], "totalCost": 45.50 }`;

        try {
            const response = await fetch(`${API_BASE_URL}/api/generate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, prompt: promptText, systemInstruction: "Return ONLY raw JSON." })
            });
            const data = await response.json();
            if (response.status === 403) { alert(data.message); return; }
            setWeeklyPlan(data.weeklyPlan || []); setGroceryList(data.groceryList || []);
            setWorkoutPlan(data.workoutPlan || []); setTotalCost(data.totalCost || 0); setStatusMsg('');
            savePlansToDb(data.weeklyPlan, data.groceryList, data.workoutPlan);

            const currentUserStr = localStorage.getItem('mealmatch_user');
            if (currentUserStr) {
                const currentUserObj = JSON.parse(currentUserStr);
                currentUserObj.savedMealPlan = JSON.stringify(data.weeklyPlan);
                currentUserObj.savedGroceryList = JSON.stringify(data.groceryList);
                currentUserObj.savedWorkout = JSON.stringify(data.workoutPlan);
                localStorage.setItem('mealmatch_user', JSON.stringify(currentUserObj));
            }
        } catch (e) { setStatusMsg('Failed to generate plan.'); } finally { setIsLoading(false); }
    };

    const fetchRecipe = async (mealName) => {
        setModalTitle(`Recipe: ${mealName}`); setActiveModal('recipe'); setIsModalLoading(true); setModalContent('');
        const promptText = `Provide a detailed recipe for ${mealName} in ${language}. For ${family} people. Medical: ${medical || 'None'}. Format using HTML tags <h3>, <ul>, <li>, <p>.`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/recipe`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText, systemInstruction: "Reply ONLY with HTML formatted recipe." })
            });
            const data = await response.json();
            if (!response.ok || !data.text) { setModalContent(`<p class="text-red-600 font-bold">Failed to load recipe.</p>`); }
            else { setModalContent(data.text.replace(/```html/gi, '').replace(/```/g, '')); }
        } catch (e) { setModalContent('<p class="text-red-600 font-bold">Network error.</p>'); } finally { setIsModalLoading(false); }
    };

    const fetchWorkout = async (routineName) => {
        setModalTitle(`Workout: ${routineName}`); setActiveModal('workout'); setIsModalLoading(true); setModalContent('');
        const promptText = `Provide detailed instructions for this workout: ${routineName} in ${language}. Format using HTML tags <h3>, <ul>, <li>, <p>.`;
        try {
            const response = await fetch(`${API_BASE_URL}/api/workout`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: promptText, systemInstruction: "Reply ONLY with HTML formatted workout routine." })
            });
            const data = await response.json();
            if (!response.ok || !data.text) { setModalContent(`<p class="text-red-600 font-bold">Failed to load workout.</p>`); }
            else { setModalContent(data.text.replace(/```html/gi, '').replace(/```/g, '')); }
        } catch (e) { setModalContent('<p class="text-red-600 font-bold">Network error.</p>'); } finally { setIsModalLoading(false); }
    };

    const downloadDocx = (filename, htmlContent) => {
        const content = `<html><body>${htmlContent}</body></html>`;
        const blob = new Blob([content], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    };

    const downloadPlan = () => {
        let html = `<h1>Weekly Meal Plan</h1>`;
        weeklyPlan.forEach(d => { html += `<h2>${d.day}</h2><ul>`; d.meals?.forEach(m => { html += `<li><strong>${m.type}:</strong> ${m.meal}</li>`; }); html += `</ul>`; });
        downloadDocx('MealPlan.doc', html);
    };

    const downloadGrocery = () => {
        let html = `<h1>Grocery List</h1><ul>`;
        groceryList.forEach(g => { html += `<li>${g.item} - £${g.price.toFixed(2)}</li>`; });
        html += `</ul><h2>Total: £${totalCost.toFixed(2)}</h2>`;
        downloadDocx('GroceryList.doc', html);
    };

    return (
        <div className="max-w-7xl mx-auto font-sans relative">
            {isLoading && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900 bg-opacity-80 backdrop-blur-md transition-all">
                    <div className="relative flex items-center justify-center w-32 h-32 mb-8">
                        <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
                        <div className="absolute inset-2 rounded-full border-b-4 border-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                        <span className="text-6xl animate-bounce">👨‍🍳</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse mb-3 text-center px-4">{loadingText}</h2>
                </div>
            )}

            {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                        <h2 className="text-3xl font-extrabold text-blue-600 mb-2">{isLoginMode ? t.loginTitle : t.registerTitle}</h2>
                        <p className="text-gray-500 mb-6">{isLoginMode ? t.loginSub : t.registerSub}</p>

                        {authError && <div className="text-red-500 text-sm mb-4 font-bold bg-red-50 p-3 rounded">{authError}</div>}
                        {authSuccess && <div className="text-green-700 text-sm mb-4 font-bold bg-green-50 p-3 rounded">{authSuccess}</div>}

                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                            {!isLoginMode && (<input type="text" required placeholder="Choose a Username" className="w-full p-4 border rounded-lg" value={authForm.username} onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} />)}
                            <input type="email" required placeholder="Email Address" className="w-full p-4 border rounded-lg" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
                            <input type="password" required placeholder="Password" className="w-full p-4 border rounded-lg" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />

                            {!isLoginMode && <p className="text-xs text-orange-600 font-bold">{t.spamNote}</p>}

                            <button type="submit" className="w-full py-3 px-6 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700">{isLoginMode ? "Log In" : "Create Account"}</button>
                        </form>
                        <div className="mt-6 text-sm text-gray-500"><button onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(''); setAuthSuccess(''); }} className="text-blue-600 font-bold hover:underline">{isLoginMode ? "Sign Up Instead" : "Log In Instead"}</button></div>
                        <button onClick={() => setShowAuthModal(false)} className="mt-4 text-sm text-gray-400">Cancel</button>
                    </div>
                </div>
            )}

            {showSuccessScreen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-green-500 bg-opacity-95 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-lg w-full transform transition-all scale-100 border-4 border-green-400">
                        <div className="text-8xl mb-6 animate-bounce">🎉</div>
                        <h1 className="text-4xl font-black text-green-600 mb-4">Payment Successful!</h1>
                        <p className="text-xl text-gray-700 font-medium mb-6">You're all set. <strong className="text-blue-600">MealMatch AI Premium</strong> is now active on your account.</p>
                        <div className="bg-green-50 rounded-xl p-4 mb-8 border border-green-200">
                            <p className="text-sm text-green-800 font-semibold leading-relaxed">Unlimited meal plans, grocery lists, and workout routines. No monthly fees — yours to keep.</p>
                        </div>
                        <button onClick={() => setShowSuccessScreen(false)} className="w-full py-4 rounded-xl text-white font-black text-lg bg-green-500 hover:bg-green-600 shadow-lg transform hover:scale-105 transition">Start cooking</button>
                    </div>
                </div>
            )}

            {showCheckoutModal && clientSecret && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative h-[85vh] overflow-y-auto">
                        <button onClick={() => setShowCheckoutModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 font-bold text-3xl z-50">&times;</button>
                        <h2 className="text-3xl font-black text-center mb-6 text-blue-600">Upgrade to Premium</h2>
                        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}><EmbeddedCheckout /></EmbeddedCheckoutProvider>
                    </div>
                </div>
            )}

            {showAdminModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-3xl font-black text-purple-700">👑 Admin Dashboard</h2>
                            <button onClick={() => setShowAdminModal(false)} className="text-gray-400 hover:text-red-500 font-bold text-2xl">&times;</button>
                        </div>
                        {adminMessage && <div className="mb-4 p-3 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200">{adminMessage}</div>}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100 text-gray-700">
                                        <th className="p-3 border">Username</th>
                                        <th className="p-3 border">Email</th>
                                        <th className="p-3 border">Role</th>
                                        <th className="p-3 border">Status</th>
                                        <th className="p-3 border text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allUsers.map((u, i) => (
                                        <tr key={i} className="hover:bg-gray-50 border-b">
                                            <td className="p-3 font-semibold">{u.username}</td>
                                            <td className="p-3 text-sm text-gray-600">{u.email}</td>
                                            <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'premium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{u.role.toUpperCase()}</span></td>
                                            <td className="p-3 text-xs font-bold">{u.isVerified ? <span className="text-green-600">Verified</span> : <span className="text-red-500">Unverified</span>}</td>
                                            <td className="p-3 flex gap-2 justify-center">
                                                <button onClick={() => resetUserPassword(u.email)} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded text-xs font-bold">Reset Pass</button>
                                                <button onClick={() => deleteUser(u.email)} className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-bold">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto relative">
                        <div className="flex justify-between items-start mb-4 border-b pb-4">
                            <h3 className="text-2xl font-bold text-blue-700">{modalTitle}</h3>
                            <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        <button onClick={() => downloadDocx(`${activeModal}.doc`, modalContent)} className="mb-4 py-2 px-4 rounded-lg text-white font-semibold bg-green-500 hover:bg-green-600 text-sm">{t.downloadModal}</button>
                        {isModalLoading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div> : <div className="prose text-gray-700" dangerouslySetInnerHTML={{ __html: modalContent }}></div>}
                    </div>
                </div>
            )}

            <div className="flex justify-end items-center gap-4 p-4">
                {isInstallable && <button onClick={handleInstallClick} className="text-sm bg-green-500 text-white py-2 px-4 rounded-lg font-bold shadow hover:bg-green-600 transition">📲 Install App</button>}
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="font-semibold">Hi, {user.username}!</span>
                        {user.role !== 'premium' && user.role !== 'admin' && (<button onClick={handleSubscribe} className="text-sm bg-yellow-400 text-yellow-900 py-2 px-4 rounded-lg font-extrabold hover:bg-yellow-500 shadow-sm border border-yellow-500">⭐ Get Lifetime Access (£30)</button>)}
                        {user.role === 'admin' && (<button onClick={openAdminPanel} className="text-sm bg-purple-100 text-purple-600 border border-purple-300 py-2 px-4 rounded-lg font-bold hover:bg-purple-200 shadow-sm">👑 Admin Panel</button>)}
                        <button onClick={handleLogout} className="text-sm bg-red-100 text-red-600 py-2 px-4 rounded-lg font-bold hover:bg-red-200 transition">Log Out</button>
                    </div>
                ) : (
                    <button onClick={() => setShowAuthModal(true)} className="text-sm bg-blue-100 text-blue-600 py-2 px-4 rounded-lg font-bold hover:bg-blue-200 transition">Log In / Register</button>
                )}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-xl p-8 mb-10 text-white text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{t.heroTitle}</h1><p className="text-lg md:text-xl font-light">{t.heroSubtitle}</p>
            </div>
            {statusMsg && <div className="bg-blue-100 text-blue-700 p-4 rounded-lg text-center font-semibold mb-8">{statusMsg}</div>}

            <main className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-xl border-t-8 border-blue-500">
                    <h2 className="text-2xl font-extrabold mb-6">{t.criteriaTitle}</h2>
                    <div className="space-y-5">
                        <div><label className="block text-sm font-medium mb-1">{t.langLabel}</label><select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full p-3 border rounded-lg"><option value="English">English</option><option value="Romanian">Romanian</option><option value="Spanish">Spanish</option><option value="Italian">Italian</option></select></div>
                        <div><label className="block text-sm font-medium mb-1">{t.dietLabel}</label><select value={diet} onChange={(e) => setDiet(e.target.value)} className="w-full p-3 border rounded-lg"><option value="Omnivore">Omnivore</option><option value="Vegetarian">Vegetarian</option><option value="Vegan">Vegan</option><option value="Keto">Keto</option></select></div>
                        <div><label className="block text-sm font-medium mb-1">{t.budgetLabel}</label><select value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full p-3 border rounded-lg"><option value="Strictly Low-Cost (Under £30)">Low-Cost (Under £30)</option><option value="Mid-Range (£40-£60)">Mid-Range (£40-£60)</option><option value="Premium (No Limit)">Premium (No Limit)</option></select></div>
                        <div><label className="block text-sm font-medium mb-1">{t.familyLabel}</label><input type="number" value={family} onChange={(e) => setFamily(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
                        <div><label className="block text-sm font-medium mb-1">{t.ingredientsLabel}</label><textarea rows="3" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="e.g. 2 bell peppers..." className="w-full p-3 border rounded-lg"></textarea></div>
                        <div><label className="block text-sm font-medium mb-1">{t.sexLabel}</label><select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full p-3 border rounded-lg"><option value="Male">Male</option><option value="Female">Female</option></select></div>
                        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium mb-1">{t.ageLabel}</label><input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full p-3 border rounded-lg" placeholder="Years" /></div><div><label className="block text-sm font-medium mb-1">{t.weightLabel}</label><input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full p-3 border rounded-lg" /></div></div>
                        <div><label className="block text-sm font-medium mb-1">{t.medicalLabel}</label><input type="text" value={medical} onChange={(e) => setMedical(e.target.value)} placeholder="e.g., Diabetes..." className="w-full p-3 border rounded-lg" /></div>
                        <div className="mt-8 space-y-3">
                            <button onClick={generatePlan} disabled={isLoading} className="w-full py-3 px-6 rounded-xl text-white font-bold bg-blue-600 hover:bg-blue-700 shadow-lg">{isLoading ? t.generateLoading : t.generateButton}</button>
                            <button onClick={downloadPlan} disabled={weeklyPlan.length === 0} className="w-full py-2 px-4 rounded-xl text-white font-semibold bg-green-500 hover:bg-green-600 shadow-md text-sm disabled:bg-gray-400">{t.downloadPlan}</button>
                            <button onClick={downloadGrocery} disabled={groceryList.length === 0} className="w-full py-2 px-4 rounded-xl text-white font-semibold bg-red-500 hover:bg-red-600 shadow-md text-sm disabled:bg-gray-400">{t.downloadList}</button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h2 className="text-xl font-bold mb-4">{t.mealPlanTitle}</h2>
                        {weeklyPlan.length === 0 ? <p className="text-gray-400">{t.mealPlanEmpty}</p> : (
                            weeklyPlan.map((d, i) => (
                                <div key={i} className="mb-4">
                                    <h4 className="font-bold text-blue-600 mb-1">{d.day}</h4>
                                    {d.meals?.map((m, idx) => (
                                        <div key={idx} onClick={() => fetchRecipe(m.meal)} className="p-2 bg-blue-50 border-l-4 border-blue-500 mb-2 text-sm cursor-pointer hover:bg-blue-100 transition"><div className="font-semibold">{m.type}</div><div>{m.meal}</div></div>
                                    ))}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow flex flex-col">
                        <h2 className="text-xl font-bold mb-4">{t.groceryTitle}</h2>
                        {groceryList.length === 0 ? <p className="text-gray-400">{t.groceryEmpty}</p> : (
                            <><ul className="space-y-2 text-sm flex-grow">{groceryList.map((g, i) => (<li key={i} className="flex justify-between border-b pb-1"><span>{g.item}</span><span className="font-bold">£{(g.price || 0).toFixed(2)}</span></li>))}</ul><div className="mt-4 pt-3 border-t-2 border-gray-300 flex justify-between text-lg font-extrabold text-blue-800"><span>Total Estimate:</span><span>£{Number(totalCost).toFixed(2)}</span></div></>
                        )}
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow">
                        <h2 className="text-xl font-bold mb-4">{t.workoutTitle}</h2>
                        {workoutPlan.length === 0 ? <p className="text-gray-400">{t.workoutEmpty}</p> : (
                            workoutPlan.map((w, i) => (
                                <div key={i} onClick={() => fetchWorkout(w.routine)} className="p-3 mb-2 bg-purple-50 border border-purple-200 rounded cursor-pointer hover:bg-purple-100 transition"><div className="font-bold text-purple-700 mb-1">{w.day}</div><div className="text-sm">{w.routine}</div></div>
                            ))
                        )}
                    </div>
                </div>
            </main>

            <footer className="mt-8 mb-6 text-center text-sm text-gray-500 border-t pt-6">
                <p className="font-semibold text-gray-700">&copy; 2026 Alpha IT Solutions. All rights reserved.</p>
                <p className="mt-2 flex items-center justify-center gap-2 md:gap-4 flex-wrap"><a href="https://www.alphaitsolutions.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline font-bold transition">www.alphaitsolutions.uk</a><span className="hidden md:inline text-gray-300">|</span><span>📞 07853610930</span><span className="hidden md:inline text-gray-300">|</span><a href="mailto:contact@alphaitsolutions.uk" className="text-blue-600 hover:underline">contact@alphaitsolutions.uk</a></p>
                <div className="mt-4 flex justify-center items-center gap-2"><span className="font-semibold text-gray-600">Join us on Facebook:</span><a href="https://www.facebook.com/profile.php?id=61585819985823" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition transform hover:scale-110" aria-label="Facebook Page"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a></div>
            </footer>
        </div>
    );
}

export default App;