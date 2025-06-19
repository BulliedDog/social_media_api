// DOM Elements
const loginCard = document.querySelector(".login-card")
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

// Form switching - Fixed version
if (signupLink) {
  signupLink.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("Signup link clicked") // Debug log
    switchToSignup()
  })
}

if (signinLink) {
  signinLink.addEventListener("click", (e) => {
    e.preventDefault()
    console.log("Signin link clicked") // Debug log
    switchToLogin()
  })
}

function switchToSignup() {
  console.log("Switching to signup") // Debug log
  if (loginCard && signupCard) {
    loginCard.style.opacity = "0"
    loginCard.style.transform = "translateX(-20px)"

    setTimeout(() => {
      loginCard.style.display = "none"
      signupCard.style.display = "block"
      signupCard.style.opacity = "0"
      signupCard.style.transform = "translateX(20px)"

      // Force reflow
      signupCard.offsetHeight

      signupCard.style.transition = "all 0.3s ease"
      signupCard.style.opacity = "1"
      signupCard.style.transform = "translateX(0)"
    }, 300)
  }
}

function switchToLogin() {
  console.log("Switching to login") // Debug log
  if (loginCard && signupCard) {
    signupCard.style.opacity = "0"
    signupCard.style.transform = "translateX(20px)"

    setTimeout(() => {
      signupCard.style.display = "none"
      loginCard.style.display = "block"
      loginCard.style.opacity = "0"
      loginCard.style.transform = "translateX(-20px)"

      // Force reflow
      loginCard.offsetHeight

      loginCard.style.transition = "all 0.3s ease"
      loginCard.style.opacity = "1"
      loginCard.style.transform = "translateX(0)"
    }, 300)
  }
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

function validateUsername(username) {
  return username.length >= 3 && /^[a-zA-Z0-9_]+$/.test(username)
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
document.getElementById("username").addEventListener("blur", function () {
  if (this.value && !validateUsername(this.value)) {
    showError(this, "Username must be at least 3 characters and contain only letters, numbers, and underscores")
  } else if (this.value) {
    showSuccess(this)
  }
})

document.getElementById("signupUsername").addEventListener("blur", function () {
  if (this.value && !validateUsername(this.value)) {
    showError(this, "Username must be at least 3 characters and contain only letters, numbers, and underscores")
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

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  // Basic validation
  if (!username || !password) {
    if (!username) showError(document.getElementById("username"), "Username is required")
    if (!password) showError(document.getElementById("password"), "Password is required")
    return
  }

  if (!validateUsername(username)) {
    showError(document.getElementById("username"), "Please enter a valid username")
    return
  }

  // Show loading state
  setLoadingState(loginBtn, true)

  try {
    // Simulate API call
    await simulateLogin(username, password)

    // Show success message
    showSuccessMessage()

    // Redirect after delay
    setTimeout(() => {
      window.location.href = "index.html" // Redirect to main page
    }, 2000)
  } catch (error) {
    showError(document.getElementById("password"), "Invalid username or password")
    setLoadingState(loginBtn, false)
  }
})

// Signup form submission
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const username = document.getElementById("signupUsername").value
  const email = document.getElementById("signupEmail").value
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const bio = document.getElementById("bio").value

  // Validation
  let isValid = true

  if (!username || !validateUsername(username)) {
    showError(
      document.getElementById("signupUsername"),
      "Username must be at least 3 characters and contain only letters, numbers, and underscores",
    )
    isValid = false
  }

  if (!email || !validateEmail(email)) {
    showError(document.getElementById("signupEmail"), "Please enter a valid email address")
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

  if (!isValid) return

  // Show loading state
  setLoadingState(signupBtn, true)

  try {
    // Simulate API call
    await simulateSignup(username, email, password, bio)

    // Show success message
    showSuccessMessage("Account created successfully!")

    // Redirect after delay
    setTimeout(() => {
      window.location.href = "index.html" // Redirect to main page
    }, 2000)
  } catch (error) {
    showError(document.getElementById("signupUsername"), "Username or email already exists")
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
async function simulateLogin(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful login for demo purposes
      if (username && password) {
        // Store user data in localStorage for demo
        localStorage.setItem(
          "user",
          JSON.stringify({
            username: username,
            name: username,
          }),
        )
        resolve()
      } else {
        reject(new Error("Invalid credentials"))
      }
    }, 1500)
  })
}

async function simulateSignup(username, email, password, bio) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate successful signup for demo purposes
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: username,
          email: email,
          name: username,
          bio: bio,
        }),
      )
      resolve()
    }, 2000)
  })
}

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
  const inputs = document.querySelectorAll(".form-input, .form-textarea")
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
  const inputs = form.querySelectorAll(".form-input, .form-textarea")
  inputs.forEach((input) => {
    clearValidation(input)
  })
}

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Enter key to submit forms
  if (
    e.key === "Enter" &&
    (e.target.classList.contains("form-input") || e.target.classList.contains("form-textarea"))
  ) {
    // Don't submit on textarea enter, allow new lines
    if (e.target.classList.contains("form-textarea")) {
      return
    }

    const form = e.target.closest("form")
    if (form) {
      form.dispatchEvent(new Event("submit"))
    }
  }
})
