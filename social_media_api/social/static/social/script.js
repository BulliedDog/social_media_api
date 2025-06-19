// DOM Elements
const likeButtons = document.querySelectorAll(".like-btn")
const bookmarkButtons = document.querySelectorAll(".bookmark-btn")
const followButtons = document.querySelectorAll(".follow-btn")
const postButton = document.querySelector(".post-btn")
const postInput = document.querySelector(".post-input")

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout)
    logout()
  }
})

// Like functionality
likeButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const isLiked = this.classList.contains("liked")
    const countElement = this.querySelector(".action-count")
    const heartIcon = this.querySelector("i")
    let currentCount = Number.parseInt(this.dataset.likes)

    if (isLiked) {
      // Unlike
      this.classList.remove("liked")
      heartIcon.classList.remove("fas")
      heartIcon.classList.add("far")
      currentCount--
    } else {
      // Like
      this.classList.add("liked")
      heartIcon.classList.remove("far")
      heartIcon.classList.add("fas")
      currentCount++

      // Add animation
      this.style.transform = "scale(1.2)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    }

    countElement.textContent = currentCount
    this.dataset.likes = currentCount
  })
})

// Bookmark functionality
bookmarkButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const isBookmarked = this.classList.contains("bookmarked")
    const icon = this.querySelector("i")

    if (isBookmarked) {
      this.classList.remove("bookmarked")
      icon.classList.remove("fas")
      icon.classList.add("far")
    } else {
      this.classList.add("bookmarked")
      icon.classList.remove("far")
      icon.classList.add("fas")

      // Add animation
      this.style.transform = "scale(1.2)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    }
  })
})

// Follow functionality
followButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const isFollowing = this.classList.contains("following")

    if (isFollowing) {
      this.classList.remove("following")
      this.textContent = "Follow"
    } else {
      this.classList.add("following")
      this.textContent = "Following"

      // Add animation
      this.style.transform = "scale(1.1)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    }
  })
})

// Post creation functionality
if (postButton && postInput) {
  postButton.addEventListener("click", () => {
    const postText = postInput.value.trim()

    if (postText) {
      // Create new post element
      const newPost = createPostElement(postText)

      // Add to feed
      const postsContainer = document.querySelector(".posts-feed")
      postsContainer.insertBefore(newPost, postsContainer.firstChild)

      // Clear input
      postInput.value = ""

      // Add animation
      newPost.style.opacity = "0"
      newPost.style.transform = "translateY(-20px)"
      setTimeout(() => {
        newPost.style.transition = "all 0.3s ease"
        newPost.style.opacity = "1"
        newPost.style.transform = "translateY(0)"
      }, 10)

      // Add event listeners to new post
      addPostEventListeners(newPost)
    }
  })

  // Allow posting with Enter key
  postInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      postButton.click()
    }
  })
}

// Create new post element
function createPostElement(text) {
  const postElement = document.createElement("article")
  postElement.className = "card post"

  const currentTime = new Date().toLocaleString()

  postElement.innerHTML = `
        <header class="post-header">
            <div class="post-user">
                <div class="avatar">
                    <img src="/placeholder.svg?height=40&width=40" alt="John Doe" class="avatar-img">
                </div>
                <div class="post-user-info">
                    <h4>John Doe</h4>
                    <p class="post-time">Just now</p>
                </div>
            </div>
            <button class="post-menu-btn">
                <i class="fas fa-ellipsis-h"></i>
            </button>
        </header>

        <div class="post-content">
            <p>${text}</p>
        </div>

        <footer class="post-actions">
            <div class="action-buttons">
                <button class="action-btn like-btn" data-likes="0">
                    <i class="far fa-heart"></i>
                    <span class="action-count">0</span>
                </button>
                <button class="action-btn">
                    <i class="far fa-comment"></i>
                    <span class="action-count">0</span>
                </button>
                <button class="action-btn">
                    <i class="fas fa-share"></i>
                    <span class="action-count">0</span>
                </button>
            </div>
            <button class="bookmark-btn">
                <i class="far fa-bookmark"></i>
            </button>
        </footer>
    `

  return postElement
}

// Add event listeners to new posts
function addPostEventListeners(postElement) {
  const likeBtn = postElement.querySelector(".like-btn")

  // Like functionality
  likeBtn.addEventListener("click", function () {
    const isLiked = this.classList.contains("liked")
    const countElement = this.querySelector(".action-count")
    const heartIcon = this.querySelector("i")
    let currentCount = Number.parseInt(this.dataset.likes)

    if (isLiked) {
      this.classList.remove("liked")
      heartIcon.classList.remove("fas")
      heartIcon.classList.add("far")
      currentCount--
    } else {
      this.classList.add("liked")
      heartIcon.classList.remove("far")
      heartIcon.classList.add("fas")
      currentCount++

      this.style.transform = "scale(1.2)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    }

    countElement.textContent = currentCount
    this.dataset.likes = currentCount
  })

  // Bookmark functionality
  bookmarkBtn.addEventListener("click", function () {
    const isBookmarked = this.classList.contains("bookmarked")
    const icon = this.querySelector("i")

    if (isBookmarked) {
      this.classList.remove("bookmarked")
      icon.classList.remove("fas")
      icon.classList.add("far")
    } else {
      this.classList.add("bookmarked")
      icon.classList.remove("far")
      icon.classList.add("fas")

      this.style.transform = "scale(1.2)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    }
  })
}
// Add loading animation for images
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("load", function () {
    this.style.opacity = "1"
  })

  img.style.opacity = "0"
  img.style.transition = "opacity 0.3s ease"
})

// Navigation active state
const navButtons = document.querySelectorAll(".nav-btn")
navButtons.forEach((button) => {
  button.addEventListener("click", function () {
    navButtons.forEach((btn) => btn.classList.remove("active"))
    this.classList.add("active")
  })
})

// Mobile responsive menu toggle (if needed)
function toggleMobileMenu() {
  // Implementation for mobile menu if needed
  console.log("Mobile menu toggled")
}

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("SocialHub loaded successfully!")

  // Add any initialization code here

  // Simulate loading delay for images
  setTimeout(() => {
    document.querySelectorAll("img").forEach((img) => {
      img.style.opacity = "1"
    })
  }, 100)
})

const token = localStorage.getItem('accessToken')
if (!token) {
  window.location.href = 'social/login'
}