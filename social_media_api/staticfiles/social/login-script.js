const loginForm = document.getElementById("loginForm")
const signupForm = document.getElementById("signupForm")
const loginBtn = document.getElementById("loginBtn")
const signupBtn = document.getElementById("signupBtn")
const messageEl = document.getElementById("message")
const successMessage = document.getElementById("successMessage")

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validatePassword(password) {
  return password.length >= 6
}

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

function showError(message) {
  if (messageEl) {
    messageEl.textContent = message
  } else {
    alert(message)
  }
}

function showSuccessMessage(message = "Success!") {
  const successContent = successMessage?.querySelector(".success-content h3")
  if (successContent) successContent.textContent = message
  if (successMessage) successMessage.style.display = "flex"
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    if (!username || !validatePassword(password)) {
      showError("Please enter a valid username and password.")
      return
    }

    setLoadingState(loginBtn, true)

    try {
      const res = await fetch("/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Login failed")

      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)

      try {
        const profileRes = await fetch("/api/user/", {
          headers: {
            "Authorization": `Bearer ${data.access}`,
            "Content-Type": "application/json"
          }
        })

        if (!profileRes.ok) throw new Error("Failed to fetch user profile")

        const userData = await profileRes.json()
        localStorage.setItem("user", JSON.stringify(userData))
      } catch (profileErr) {
        console.error("User profile fetch error:", profileErr)
        showError("Unable to load user profile.")
        return
      }

      window.location.href = "/social/home/"

    } catch (err) {
      showError(err.message || "Login error")
      window.location.href = "/social/login/"
    } finally {
      setLoadingState(loginBtn, false)
    }
  })
}

// SIGNUP
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const username = document.getElementById("signupUsername").value
    const email = document.getElementById("signupEmail").value
    const password = document.getElementById("signupPassword").value
    const password2 = document.getElementById("confirmPassword").value
    const bio = document.getElementById("bio").value

    if (!username || !validateEmail(email) || !validatePassword(password) || password !== password2) {
      showError("Please fill out all fields correctly, username might be missing, email might be wrongly typed o passwords don't match.")
      return
    }

    setLoadingState(signupBtn, true)

    try {
      const res = await fetch("/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, password2, bio })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || "Signup failed")

      if (data.access && data.refresh) {
        localStorage.setItem("accessToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
      }

      showSuccessMessage("Account created successfully!")
      setTimeout(() => {
        window.location.href = "/social/home/"
      }, 1500)
    } catch (err) {
      showError(err.message || "Signup error")
      window.location.href = "/social/login/"
    } finally {
      setLoadingState(signupBtn, false)
    }
  })
}

const loginCard = document.getElementById("loginCard")
const signupCard = document.getElementById("signupCard")
const signupLink = document.getElementById("signupLink")
const signinLink = document.getElementById("signinLink")

function switchToSignup() {
  if (loginCard && signupCard) {
    loginCard.style.opacity = "0"
    loginCard.style.transform = "translateX(-20px)"

    setTimeout(() => {
      loginCard.style.display = "none"
      signupCard.style.display = "block"
      signupCard.style.opacity = "0"
      signupCard.style.transform = "translateX(20px)"
      signupCard.offsetHeight // force reflow
      signupCard.style.transition = "all 0.3s ease"
      signupCard.style.opacity = "1"
      signupCard.style.transform = "translateX(0)"
    }, 300)
  }
}

function switchToLogin() {
  if (loginCard && signupCard) {
    signupCard.style.opacity = "0"
    signupCard.style.transform = "translateX(20px)"

    setTimeout(() => {
      signupCard.style.display = "none"
      loginCard.style.display = "block"
      loginCard.style.opacity = "0"
      loginCard.style.transform = "translateX(-20px)"
      loginCard.offsetHeight
      loginCard.style.transition = "all 0.3s ease"
      loginCard.style.opacity = "1"
      loginCard.style.transform = "translateX(0)"
    }, 300)
  }
}

// Event listeners for switching
if (signupLink) {
  signupLink.addEventListener("click", (e) => {
    e.preventDefault()
    switchToSignup()
  })
}

if (signinLink) {
  signinLink.addEventListener("click", (e) => {
    e.preventDefault()
    switchToLogin()
  })
}
