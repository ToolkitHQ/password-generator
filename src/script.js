/* ====================================
Password Generator - JavaScript Logic
====================================

This application demonstrates:
- Cryptographically secure random password generation
- Modern Clipboard API usage
- localStorage for persistent user preferences
- Accessible form controls
- Responsive UI with real-time updates
*/

// ========================================
// 1. DOM ELEMENT REFERENCES
// ========================================
// Caching DOM elements for better performance

const passwordInput = document.getElementById("passwordInput");
const copyBtn = document.getElementById("copyBtn");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

const lengthSlider = document.getElementById("lengthSlider");
const lengthValue = document.getElementById("lengthValue");

const includeUppercase = document.getElementById("includeUppercase");
const includeLowercase = document.getElementById("includeLowercase");
const includeNumbers = document.getElementById("includeNumbers");
const includeSpecial = document.getElementById("includeSpecial");

const strengthValue = document.getElementById("strengthValue");
const strengthBar = document.getElementById("strengthBar");

// ========================================
// 2. CHARACTER SETS FOR PASSWORD GENERATION
// ========================================

const CHAR_SETS = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    special: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// ========================================
// 3. DEFAULT SETTINGS
// ========================================

const DEFAULT_SETTINGS = {
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSpecial: true,
};

// ========================================
// 4. UTILITY FUNCTIONS
// ========================================

/**
 * Generates a cryptographically secure random password
 *
 * Uses crypto.getRandomValues() for secure randomness instead of Math.random()
 * This is recommended for passwords and other security-sensitive operations
 *
 * @returns {string} The generated password
 */
function generatePassword() {
    // Build the character set based on user selections
    let charSet = "";

    if (includeUppercase.checked) charSet += CHAR_SETS.uppercase;
    if (includeLowercase.checked) charSet += CHAR_SETS.lowercase;
    if (includeNumbers.checked) charSet += CHAR_SETS.numbers;
    if (includeSpecial.checked) charSet += CHAR_SETS.special;

    // Validate that at least one character set is selected
    if (charSet.length === 0) {
        alert("Please select at least one character set!");
        return "";
    }

    // Get the desired password length
    const length = parseInt(lengthSlider.value);

    // Create an empty password string
    let password = "";

    // Use crypto.getRandomValues() for secure randomness
    // This is much more secure than Math.random() for password generation
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);

    // Build password by selecting random characters from the character set
    for (let i = 0; i < length; i++) {
        // Use modulo to ensure we stay within the character set bounds
        const randomIndex = randomValues[i] % charSet.length;
        password += charSet[randomIndex];
    }

    return password;
}

/**
 * Calculates password strength based on length and character set diversity
 *
 * Strength levels:
 * - Weak: < 40 entropy bits
 * - Fair: 40-59 entropy bits
 * - Good: 60-79 entropy bits
 * - Strong: 80+ entropy bits
 *
 * @returns {object} Object with 'level' (weak/fair/good/strong) and 'score'
 */
function calculateStrength() {
    const password = passwordInput.value;

    // If no password, return empty state
    if (!password) {
        return { level: "", score: 0 };
    }

    // Calculate character set size
    let charSetSize = 0;
    if (/[a-z]/.test(password)) charSetSize += 26;
    if (/[A-Z]/.test(password)) charSetSize += 26;
    if (/[0-9]/.test(password)) charSetSize += 10;
    if (/[^a-zA-Z0-9]/.test(password)) charSetSize += 32;

    // Calculate entropy: log2(charSetSize^length)
    const entropy = password.length * Math.log2(charSetSize);

    // Determine strength level based on entropy
    let level = "";
    if (entropy < 40) {
        level = "weak";
    } else if (entropy < 60) {
        level = "fair";
    } else if (entropy < 80) {
        level = "good";
    } else {
        level = "strong";
    }

    return { level, score: Math.min(entropy, 100) };
}

/**
 * Updates the password strength indicator in the UI
 */
function updateStrength() {
    const strength = calculateStrength();

    // Clear previous classes
    strengthBar.className = "strength-bar-fill";
    strengthValue.className = "strength-value";

    // Update UI based on strength level
    if (strength.level) {
        strengthBar.classList.add(strength.level);
        strengthValue.classList.add(strength.level);
        strengthValue.textContent =
            strength.level.charAt(0).toUpperCase() + strength.level.slice(1);
    } else {
        strengthValue.textContent = "-";
    }
}

/**
 * Loads user settings from localStorage
 * Falls back to default settings if not found
 */
function loadSettings() {
    const saved = localStorage.getItem("passwordGeneratorSettings");

    if (saved) {
        try {
            const settings = JSON.parse(saved);
            lengthSlider.value = settings.length;
            includeUppercase.checked = settings.includeUppercase;
            includeLowercase.checked = settings.includeLowercase;
            includeNumbers.checked = settings.includeNumbers;
            includeSpecial.checked = settings.includeSpecial;

            updateLengthDisplay();
        } catch (e) {
            console.error("Error loading settings:", e);
            // Use defaults if there's an error
            applyDefaults();
        }
    } else {
        applyDefaults();
    }
}

/**
 * Saves user settings to localStorage for next visit
 */
function saveSettings() {
    const settings = {
        length: parseInt(lengthSlider.value),
        includeUppercase: includeUppercase.checked,
        includeLowercase: includeLowercase.checked,
        includeNumbers: includeNumbers.checked,
        includeSpecial: includeSpecial.checked,
    };

    localStorage.setItem("passwordGeneratorSettings", JSON.stringify(settings));
}

/**
 * Applies default settings and saves them
 */
function applyDefaults() {
    lengthSlider.value = DEFAULT_SETTINGS.length;
    includeUppercase.checked = DEFAULT_SETTINGS.includeUppercase;
    includeLowercase.checked = DEFAULT_SETTINGS.includeLowercase;
    includeNumbers.checked = DEFAULT_SETTINGS.includeNumbers;
    includeSpecial.checked = DEFAULT_SETTINGS.includeSpecial;

    updateLengthDisplay();
    saveSettings();
}

/**
 * Updates the length value display when slider changes
 */
function updateLengthDisplay() {
    lengthValue.textContent = lengthSlider.value;
    // Update the CSS gradient for visual feedback
    lengthSlider.style.setProperty("--value", lengthSlider.value + "%");
}

/**
 * Shows a temporary copy confirmation message
 */
function showCopyFeedback() {
    // Remove existing feedback if present
    const existingFeedback = document.querySelector(".copy-feedback");
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Create and show new feedback message
    const feedback = document.createElement("div");
    feedback.className = "copy-feedback";
    feedback.textContent = "✓ Copied to clipboard!";
    document.body.appendChild(feedback);

    // Remove feedback after 2 seconds
    setTimeout(() => {
        feedback.remove();
    }, 2000);
}

// ========================================
// 5. EVENT LISTENERS
// ========================================

/**
 * Generate password when button is clicked
 */
generateBtn.addEventListener("click", () => {
    const newPassword = generatePassword();
    if (newPassword) {
        passwordInput.value = newPassword;
        updateStrength();
        saveSettings();
    }
});

/**
 * Copy password to clipboard using modern Clipboard API
 * Provides user feedback on success/failure
 */
copyBtn.addEventListener("click", async () => {
    if (!passwordInput.value) {
        alert("Please generate a password first!");
        return;
    }

    try {
        // Use modern Clipboard API for secure copying
        await navigator.clipboard.writeText(passwordInput.value);
        showCopyFeedback();
    } catch (err) {
        // Fallback for older browsers or HTTPS requirement issues
        console.error("Failed to copy:", err);
        alert("Failed to copy password. Please try again.");
    }
});

/**
 * Update password length display and regenerate password
 */
lengthSlider.addEventListener("input", () => {
    updateLengthDisplay();
    if (passwordInput.value) {
        generatePassword();
        const newPassword = generatePassword();
        if (newPassword) {
            passwordInput.value = newPassword;
            updateStrength();
            saveSettings();
        }
    }
});

/**
 * Update password when character set selections change
 */
includeUppercase.addEventListener("change", saveSettings);
includeLowercase.addEventListener("change", saveSettings);
includeNumbers.addEventListener("change", saveSettings);
includeSpecial.addEventListener("change", saveSettings);

includeUppercase.addEventListener("change", () => {
    if (passwordInput.value) {
        const newPassword = generatePassword();
        if (newPassword) {
            passwordInput.value = newPassword;
            updateStrength();
        }
    }
});

includeLowercase.addEventListener("change", () => {
    if (passwordInput.value) {
        const newPassword = generatePassword();
        if (newPassword) {
            passwordInput.value = newPassword;
            updateStrength();
        }
    }
});

includeNumbers.addEventListener("change", () => {
    if (passwordInput.value) {
        const newPassword = generatePassword();
        if (newPassword) {
            passwordInput.value = newPassword;
            updateStrength();
        }
    }
});

includeSpecial.addEventListener("change", () => {
    if (passwordInput.value) {
        const newPassword = generatePassword();
        if (newPassword) {
            passwordInput.value = newPassword;
            updateStrength();
        }
    }
});

/**
 * Reset/Regenerate current password
 */
resetBtn.addEventListener("click", () => {
    const newPassword = generatePassword();
    if (newPassword) {
        passwordInput.value = newPassword;
        updateStrength();
    }
});

/**
 * Reset all settings to defaults
 */
resetSettingsBtn.addEventListener("click", () => {
    if (confirm("Reset all settings to defaults?")) {
        applyDefaults();
        generateBtn.click();
    }
});

// ========================================
// 6. INITIALIZATION
// ========================================

// Load saved settings on page load
loadSettings();

// Generate initial password
generateBtn.click();

// Update CSS variable for slider gradient on load
updateLengthDisplay();
