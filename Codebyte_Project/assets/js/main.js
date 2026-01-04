import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyDQSWzR8UVNqzAV3qHw5lx5yVjQwT4nif4",
    authDomain: "codebyte4255.firebaseapp.com",
    projectId: "codebyte4255",
    storageBucket: "codebyte4255.firebasestorage.app",
    messagingSenderId: "656268398204",
    appId: "1:656268398204:web:c3c43d44486f04ba8ec3f9",
    measurementId: "G-VLRQEH8JFE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 2. SKELETON LOADER LOGIC
// Shows professional shimmers for 1.8s then reveals the design
window.addEventListener('load', () => {
    setTimeout(() => {
        const skeletons = document.querySelectorAll('.skeleton-text, .skeleton-card');
        const contents = document.querySelectorAll('.content-hidden');

        skeletons.forEach(s => s.style.display = 'none');
        contents.forEach(c => {
            c.classList.remove('content-hidden');
            // Small timeout to allow CSS transitions to trigger
            setTimeout(() => { c.style.opacity = "1"; }, 50);
        });

        // Initialize Scroll Animations
        AOS.init({ 
            duration: 1000, 
            once: true,
            offset: 100
        });
    }, 1800);
});

// 3. CUSTOM MODAL CONTROLS
window.closeModal = function() {
    const modal = document.getElementById('successModal');
    modal.style.opacity = "0";
    setTimeout(() => {
        modal.style.display = 'none';
    }, 400); // Wait for fade transition
};

// 4. FORM SUBMISSION HANDLER
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button');
        const originalText = btn.innerText;

        // UI State: Loading
        btn.innerText = "DEPLOYING...";
        btn.disabled = true;

        const payload = {
            name: e.target.querySelector('input[name="name"]').value,
            email: e.target.querySelector('input[name="email"]').value,
            message: e.target.querySelector('textarea[name="message"]').value
        };

        try {
            // STEP A: Save to Firebase Firestore (Database)
            await addDoc(collection(db, "inquiries"), {
                ...payload,
                timestamp: new Date().toLocaleString()
            });

            // STEP B: Send to Formspree (Email Notification)
            // It uses the 'action' attribute defined in your HTML form
            await fetch(contactForm.action, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { 
                    'Accept': 'application/json', 
                    'Content-Type': 'application/json' 
                }
            });

            // STEP C: Show Success Modal (No browser alerts)
            const modal = document.getElementById('successModal');
            modal.style.display = 'flex';
            setTimeout(() => { modal.style.opacity = "1"; }, 10);
            
            // Reset form fields
            contactForm.reset();

        } catch (err) {
            console.error("System Error:", err);
            // Even if Formspree fails, as long as Firebase succeeds, we consider it a win.
            // You can add an error modal trigger here if desired.
        } finally {
            // Restore button state
            btn.innerText = originalText;
            btn.disabled = false;
        }
    });
}