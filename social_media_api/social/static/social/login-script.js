// A simple logout function, useful if you need to clear old tokens from login page context.
function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    // No redirect here, as the user is already on the login page.
}

function hideMessages() {
    const messageBox = document.getElementById('message');
    const successMessageBox = document.getElementById('successMessage');

    if (messageBox) {
        messageBox.style.display = 'none';
        messageBox.innerHTML = ''; // Clear any previous error text
    }
    if (successMessageBox) {
        successMessageBox.style.display = 'none';
        const successContentH3 = successMessageBox.querySelector('.success-content h3');
        if (successContentH3) {
            successContentH3.innerHTML = ''; // Clear success message header
        }
    }
}

// Function to toggle password visibility
function setupPasswordToggle(passwordInputId, toggleButtonId) {
    const passwordInput = document.getElementById(passwordInputId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (passwordInput && toggleButton) {
        toggleButton.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    }
}

// Global references for buttons/messages (if they exist in your HTML)
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const successMessage = document.getElementById("successMessage");
const messageElement = document.getElementById("message"); // For error display

// Helper functions for showing loading state, errors, and success messages
function setLoadingState(button, loading) {
    if (!button) return;
    const btnText = button.querySelector(".btn-text");
    const btnLoader = button.querySelector(".btn-loader");
    if (btnText && btnLoader) {
        if (loading) {
            btnText.style.display = "none";
            btnLoader.style.display = "block";
            button.disabled = true;
        } else {
            btnText.style.display = "block";
            btnLoader.style.display = "none";
            button.disabled = false;
        }
    }
}

function showError(message) {
    hideMessages(); // Ensure previous messages are hidden when a new error is shown
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.style.display = 'block';
    } else {
        console.error("Error display element with ID 'message' not found. Message:", message);
        alert(message);
    }
}

function showSuccessMessage(message = "Success!") {
    hideMessages(); // Ensure previous messages are hidden when a new success message is shown
    const successContent = successMessage?.querySelector(".success-content h3");
    if (successContent) successContent.textContent = message;
    if (successMessage) successMessage.style.display = "flex";
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

// Login Form Handling
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        showError(""); // This already clears any existing error message at the start

        if (!username || !validatePassword(password)) {
            showError("Please enter a valid username and a password of at least 6 characters.");
            return;
        }

        setLoadingState(loginBtn, true);

        try {
            const res = await fetch("/api/token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) {
                showError(data.detail || "Login failed. Check your credentials.");
                return;
            }

            // --- SUCCESS PATH STARTS HERE ---
            localStorage.setItem("accessToken", data.access);
            localStorage.setItem("refreshToken", data.refresh);

            // Attempt to fetch user profile immediately after login
            try {
                const profileRes = await fetch("/api/user/", {
                    headers: {
                        "Authorization": `Bearer ${data.access}`,
                        "Content-Type": "application/json"
                    }
                });

                if (profileRes.ok) {
                    const userData = await profileRes.json();
                    localStorage.setItem("user", JSON.stringify(userData));
                } else {
                    console.warn("Login successful, but failed to fetch user profile.");
                }
            } catch (profileErr) {
                console.error("Error fetching user profile:", profileErr);
            }

            // Explicitly hide all messages (error and success) before redirecting
            hideMessages(); 

            // Redirect to the home page after successful login
            window.location.href = "/social/home/";

        } catch (err) {
            console.error("Network or unexpected login error:", err);
            showError("An unexpected error occurred. Please try again later.");
        } finally {
            setLoadingState(loginBtn, false);
        }
    });
}

// Signup Form Handling
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("signupUsername").value;
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        const password2 = document.getElementById("confirmPassword").value;
        const bio = document.getElementById("bio").value;

        showError("");

        if (!username || !validateEmail(email) || !validatePassword(password) || password !== password2) {
            showError("Please fill out all fields correctly. Passwords must match and be at least 6 characters.");
            return;
        }

        setLoadingState(signupBtn, true);

        try {
            const res = await fetch("/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, password2, bio })
            });

            const data = await res.json();
            if (!res.ok) {
                if (data.username) showError("Username: " + data.username.join(', '));
                else if (data.email) showError("Email: " + data.email.join(', '));
                else if (data.password) showError("Password: " + data.password.join(', '));
                else if (data.password2) showError("Repeat password: " + data.password2.join(', '));
                else if (data.detail) showError(data.detail);
                else showError("Signup failed: " + JSON.stringify(data));
                return;
            }

            if (data.access && data.refresh) {
                localStorage.setItem("accessToken", data.access);
                localStorage.setItem("refreshToken", data.refresh);
                try {
                    const profileRes = await fetch("/api/user/", {
                        headers: { "Authorization": `Bearer ${data.access}` }
                    });
                    if (profileRes.ok) {
                        const userData = await profileRes.json();
                        localStorage.setItem("user", JSON.stringify(userData));
                    }
                } catch (profileErr) {
                    console.warn("Signup successful, but failed to fetch user profile.", profileErr);
                }
            }

            showSuccessMessage("Account created successfully! Redirecting...");
            setTimeout(() => {
                window.location.href = "/social/home/";
            }, 1500);

        } catch (err) {
            console.error("Network or unexpected signup error:", err);
            showError("An unexpected error occurred during signup. Please try again.");
        } finally {
            setLoadingState(signupBtn, false);
        }
    });
}

// Logic for switching between Login and Signup cards
const loginCard = document.getElementById("loginCard");
const signupCard = document.getElementById("signupCard");
const signupLink = document.getElementById("signupLink");
const signinLink = document.getElementById("signinLink");

function switchToSignup() {
    hideMessages(); // Clear messages before switching cards
    if (loginCard && signupCard) {
        loginCard.style.opacity = "0";
        loginCard.style.transform = "translateX(-20px)";
        setTimeout(() => {
            loginCard.style.display = "none";
            signupCard.style.display = "block";
            signupCard.style.opacity = "0";
            signupCard.style.transform = "translateX(20px)";
            signupCard.offsetHeight;
            signupCard.style.transition = "all 0.3s ease";
            signupCard.style.opacity = "1";
            signupCard.style.transform = "translateX(0)";
        }, 300);
    }
}

function switchToLogin() {
    hideMessages(); // Clear messages before switching cards
    if (loginCard && signupCard) {
        signupCard.style.opacity = "0";
        signupCard.style.transform = "translateX(20px)";
        setTimeout(() => {
            signupCard.style.display = "none";
            loginCard.style.display = "block";
            loginCard.style.opacity = "0";
            loginCard.style.transform = "translateX(-20px)";
            loginCard.offsetHeight;
            loginCard.style.transition = "all 0.3s ease";
            loginCard.style.opacity = "1";
            loginCard.style.transform = "translateX(0)";
        }, 300);
    }
}

// Attach event listeners for switching forms
if (signupLink) { signupLink.addEventListener("click", (e) => { e.preventDefault(); switchToSignup(); }); }
if (signinLink) { signinLink.addEventListener("click", (e) => { e.preventDefault(); switchToLogin(); }); }

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggle('password', 'togglePassword');
    setupPasswordToggle('signupPassword', 'toggleSignupPassword');
    setupPasswordToggle('confirmPassword', 'toggleConfirmPassword');

    // THIS IS THE CRUCIAL CHANGE:
    // Removed the token check and redirect from here.
    // The login page should always allow login, not redirect if a token exists.
});