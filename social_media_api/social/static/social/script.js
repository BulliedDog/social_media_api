// Extend dayjs plugin
if (typeof dayjs_plugin_relativeTime !== 'undefined') {
  dayjs.extend(dayjs_plugin_relativeTime)
}

function logout() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
  window.location.href = "/social/login/"
}

function bindLikeButtons() {
  const likeButtons = document.querySelectorAll(".like-btn")
  likeButtons.forEach((button) => {
    button.addEventListener("click", async function () {
      const isLiked = this.classList.contains("liked")
      const countElement = this.querySelector(".action-count")
      const heartIcon = this.querySelector("i")
      let currentCount = Number.parseInt(this.dataset.likes)
      const postId = this.dataset.postId

      // Call backend to toggle like
      const res = await fetch(`/api/posts/${postId}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      })

      if (!res.ok) {
        console.error("Like failed")
        return
      }

      const data = await res.json()

      // Update UI with correct count and state
      if (data.liked) {
        this.classList.add("liked")
        heartIcon.classList.remove("far")
        heartIcon.classList.add("fas")
      } else {
        this.classList.remove("liked")
        heartIcon.classList.remove("fas")
        heartIcon.classList.add("far")
      }

      countElement.textContent = data.likes_count
      this.dataset.likes = data.likes_count
    })
  })
}

function bindBookmarkButtons() {
  const bookmarkButtons = document.querySelectorAll(".bookmark-btn")
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
        this.style.transform = "scale(1.2)"
        setTimeout(() => {
          this.style.transform = "scale(1)"
        }, 150)
      }
    })
  })
}

function bindFollowButtons() {
  const followButtons = document.querySelectorAll(".follow-btn")
  followButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const isFollowing = this.classList.contains("following")
      this.classList.toggle("following")
      this.textContent = isFollowing ? "Follow" : "Following"
      this.style.transform = "scale(1.1)"
      setTimeout(() => {
        this.style.transform = "scale(1)"
      }, 150)
    })
  })
}

async function loadPosts() {
  try {
    const accessToken = localStorage.getItem('accessToken')
    if (!accessToken) throw new Error('User is not authenticated')

    const res = await fetch('/api/posts/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) throw new Error('Failed to fetch posts')

    const posts = await res.json()

    // Sort newest to oldest
    posts.sort((a, b) => new Date(b.date_published) - new Date(a.date_published))

    const postsFeed = document.getElementById('postsFeed')
    postsFeed.innerHTML = ''

    posts.forEach(post => {
      const postEl = document.createElement('div')
      postEl.className = 'post-card'

      postEl.innerHTML = `
        <div class="card">
          <h3>${post.title}</h3>
          <p>${dayjs(post.date_published).fromNow()}</p>
          ${post.image ? `<img src="${post.image}" alt="${post.title}" />` : ''}
          <p>${post.description}</p>
          <small>By ${post.author_username}</small>
          <button
            class="like-btn ${post.user_liked ? 'liked' : ''}"
            data-post-id="${post.id}"
            data-likes="${post.likes_count}"
            style="color:white; background-color: transparent !important; border: none;"
          >
            <i class="${post.user_liked ? 'fas' : 'far'} fa-heart"></i>
            <span class="action-count">${post.likes_count}</span>
          </button>
        </div>
      `

      postsFeed.appendChild(postEl)
    })

    bindLikeButtons()
    bindBookmarkButtons()
  } catch (err) {
    console.error(err)
    document.getElementById('postsFeed').textContent = 'Failed to load posts.'
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("accessToken")
  if (!token) return logout()

  const user = JSON.parse(localStorage.getItem("user"))
  const usernameDisplay = document.getElementById("usernameDisplay")
  if (user?.username && usernameDisplay) {
    usernameDisplay.textContent = user.username
  }

  const postButton = document.querySelector(".post-btn")
  const postInput = document.getElementById("post-input")
  const postTitleInput = document.getElementById("post-title-input")

  if (postButton && postInput && postTitleInput) {
    postButton.addEventListener("click", async () => {
      const postText = postInput.value.trim()
      const postTitle = postTitleInput.value.trim()
      const token = localStorage.getItem("accessToken")

      if (!postTitle || !postText) return alert("Title and description required")

      try {
        const res = await fetch("/api/posts/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ title: postTitle, description: postText })
        })

        const data = await res.json()
        if (!res.ok) return alert("Failed: " + (data.detail || JSON.stringify(data)))

        postInput.value = ""
        postTitleInput.value = ""
        loadPosts()
      } catch (err) {
        console.error("Error:", err)
        alert("Something went wrong")
      }
    })
  }

  bindFollowButtons()
  loadPosts()
})
