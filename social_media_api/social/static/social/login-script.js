// DOM Elements
const loginCard = document.getElementById("loginCard")
const signupCard = document.getElementById("signupCard")
const loginForm = document.getElementById("loginForm")
const signupForm = document.getElementById("signupForm")
const signupLink = document.getElementById("signupLink")
const signinLink = document.getElementById("signinLink")
const togglePassword = document.getElementById("togglePassword")
const toggleSignupPassword = document.getElementById("toggleSignupPassword")
const loginBtn = document.getElementById("loginBtn")
const signupBtn = document.getElementById("signupBtn")
const successMessage = document.getElementById("successMessage")

// Form switching
signupLink.addEventListener("click", (e) => {
  e.preventDefault()
  switchToSignup()
})

signinLink.addEventListener("click", (e) => {
  e.preventDefault()
  switchToLogin()
})

function switchToSignup() {
  document.querySelector(".login-card").classList.add("fade-out")

  setTimeout(() => {
    document.querySelector(".login-card").style.display = "none"
    signupCard.style.display = "block"
    signupCard.classList.add("fade-in")
  }, 300)
}

function switchToLogin() {
  signupCard.classList.add("fade-out")

  setTimeout(() => {
    signupCard.style.display = "none"
    document.querySelector(".login-card").style.display = "block"
    document.querySelector(".login-card").classList.remove("fade-out")
    document.querySelector(".login-card").classList.add("fade-in")
  }, 300)
}

// Password toggle functionality
togglePassword.addEventListener("click", () => {
  const passwordInput = document.getElementById("password")
  const icon = togglePassword.querySelector("i")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    icon.classList.remove("fa-eye")
    icon.classList.add("fa-eye-slash")
  } else {
    passwordInput.type = "password"
    icon.classList.remove("fa-eye-slash")
    icon.classList.add("fa-eye")
  }
})

toggleSignupPassword.addEventListener("click", () => {
  const passwordInput = document.getElementById("signupPassword")
  const icon = toggleSignupPassword.querySelector("i")

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    icon.classList.remove("fa-eye")
    icon.classList.add("fa-eye-slash")
  } else {
    passwordInput.type = "password"
    icon.classList.remove("fa-eye-slash")
    icon.classList.add("fa-eye")
  }
})

// Form validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

function showError(input, message) {
  input.classList.add("error")
  input.classList.remove("success")

  // Remove existing error message
  const existingError = input.parentNode.parentNode.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }

  // Add new error message
  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.textContent = message
  input.parentNode.parentNode.appendChild(errorDiv)
}

function showSuccess(input) {
  input.classList.add("success")
  input.classList.remove("error")

  // Remove error message
  const existingError = input.parentNode.parentNode.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }
}

function clearValidation(input) {
  input.classList.remove("error", "success")
  const existingError = input.parentNode.parentNode.querySelector(".error-message")
  if (existingError) {
    existingError.remove()
  }
}

// Real-time validation
document.getElementById("email").addEventListener("blur", function () {
  if (this.value && !validateEmail(this.value) && !this.value.includes("@")) {
    // If it doesn't contain @, treat as username (valid)
    showSuccess(this)
  } else if (this.value && this.value.includes("@") && !validateEmail(this.value)) {
    showError(this, "Please enter a valid email address")
  } else if (this.value) {
    showSuccess(this)
  }
})

document.getElementById("signupEmail").addEventListener("blur", function () {
  if (this.value && !validateEmail(this.value)) {
    showError(this, "Please enter a valid email address")
  } else if (this.value) {
    showSuccess(this)
  }
})

document.getElementById("signupPassword").addEventListener("input", function () {
  if (this.value && !validatePassword(this.value)) {
    showError(this, "Password must be at least 6 characters long")
  } else if (this.value) {
    showSuccess(this)
  }
})

document.getElementById("confirmPassword").addEventListener("blur", function () {
  const password = document.getElementById("signupPassword").value
  if (this.value && this.value !== password) {
    showError(this, "Passwords do not match")
  } else if (this.value) {
    showSuccess(this)
  }
})

// Login form submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const rememberMe = document.getElementById("rememberMe").checked

  // Basic validation
  if (!email || !password) {
    if (!email) showError(document.getElementById("email"), "Email or username is required")
    if (!password) showError(document.getElementById("password"), "Password is required")
    return
  }

  // Show loading state
  setLoadingState(loginBtn, true)

  try {
    // Simulate API call
    await simulateLogin(email, password, rememberMe)

    // Show success message
    showSuccessMessage()

    // Redirect after delay
    setTimeout(() => {
      window.location.href = "index.html" // Redirect to main page
    }, 2000)
  } catch (error) {
    showError(document.getElementById("password"), "Invalid email/username or password")
    setLoadingState(loginBtn, false)
  }
})

// Signup form submission
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("signupEmail").value
  const username = document.getElementById("username").value
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const agreeTerms = document.getElementById("agreeTerms").checked

  // Validation
  let isValid = true

  if (!firstName) {
    showError(document.getElementById("firstName"), "First name is required")
    isValid = false
  }

  if (!lastName) {
    showError(document.getElementById("lastName"), "Last name is required")
    isValid = false
  }

  if (!email || !validateEmail(email)) {
    showError(document.getElementById("signupEmail"), "Please enter a valid email address")
    isValid = false
  }

  if (!username) {
    showError(document.getElementById("username"), "Username is required")
    isValid = false
  }

  if (!password || !validatePassword(password)) {
    showError(document.getElementById("signupPassword"), "Password must be at least 6 characters long")
    isValid = false
  }

  if (password !== confirmPassword) {
    showError(document.getElementById("confirmPassword"), "Passwords do not match")
    isValid = false
  }

  if (!agreeTerms) {
    alert("Please agree to the Terms of Service and Privacy Policy")
    isValid = false
  }

  if (!isValid) return

  // Show loading state
  setLoadingState(signupBtn, true)

  try {
    // Simulate API call
    await simulateSignup(firstName, lastName, email, username, password)

    // Show success message
    showSuccessMessage("Account created successfully!")

    // Redirect after delay
    setTimeout(() => {
      window.location.href = "index.html" // Redirect to main page
    }, 2000)
  } catch (error) {
    showError(document.getElementById("signupEmail"), "Email or username already exists")
    setLoadingState(signupBtn, false)
  }
})

// Helper functions
function setLoadingState(button, loading) {
  const btnText = button.querySelector(".btn-text")
  const btnLoader = button.querySelector(".btn-loader")

  if (loading) {
    btnText.style.display = "none"
    btnLoader.style.display = "block"
    button.disabled = true
  } else {
    btnText.style.display = "block"
    btnLoader.style.display = "none"
    button.disabled = false
  }
}

function showSuccessMessage(message = "Welcome to SocialHub!") {
  const successContent = successMessage.querySelector(".success-content h3")
  successContent.textContent = message
  successMessage.style.display = "flex"
}

// Simulate API calls
async function simulateLogin(email, password, rememberMe) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful login for demo purposes
      if (email && password) {
        // Store user data in localStorage for demo
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email,
            name: "John Doe",
            rememberMe: rememberMe,
          }),
        )
        resolve()
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 1500)
  })
}

async function simulateSignup(firstName, lastName, email, username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful signup for demo purposes
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: email,
          name: `${firstName} ${lastName}`,
          username: username,
        }),
      )
      resolve()
    }, 2000)
  })
}

// Social login handlers
document.querySelector(".google-btn").addEventListener("click", () => {
  alert("Google login would be implemented here")
})

document.querySelector(".facebook-btn").addEventListener("click", () => {
  alert("Facebook login would be implemented here")
})

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Login page loaded successfully!")

  // Check if user is already logged in
  const user = localStorage.getItem("user")
  if (user) {
    // Redirect to main page if already logged in
    // window.location.href = 'index.html'
  }

  // Add input focus animations
  const inputs = document.querySelectorAll(".form-input")
  inputs.forEach((input) => {
    input.addEventListener("focus", function () {
      this.parentNode.style.transform = "scale(1.02)"
    })

    input.addEventListener("blur", function () {
      this.parentNode.style.transform = "scale(1)"
    })
  })
})

// Handle form reset
function resetForm(form) {
  form.reset()
  const inputs = form.querySelectorAll(".form-input")
  inputs.forEach((input) => {
    clearValidation(input)
  })
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Enter key to submit forms
  if (e.key === "Enter" && e.target.classList.contains("form-input")) {
    const form = e.target.closest("form")
    if (form) {
      form.dispatchEvent(new Event("submit"))
    }
  }
})

document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault(); // stop the form from refreshing the page

        const emailOrUsername = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:8000/api/token/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: emailOrUsername,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert("Login failed: " + (errorData.detail || "Invalid credentials."));
                return;
            }

            const data = await response.json();

            // Save tokens in localStorage or sessionStorage
            localStorage.setItem("access", data.access);
            localStorage.setItem("refresh", data.refresh);

            // Optionally show success message
            document.getElementById("successMessage").style.display = "flex";

            // Redirect after a short delay
            setTimeout(() => {
                window.location.href = "/dashboard/";  // or your home page
            }, 1500);

        } catch (error) {
            console.error("Login error:", error);
            alert("An unexpected error occurred.");
        }
    });
});
