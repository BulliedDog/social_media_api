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
      const postId = this.dataset.postId

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

async function loadComments(postId) {
  try {
    const res = await fetch("/api/comments/", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    })

    if (!res.ok) throw new Error("Could not load comments")

    const comments = await res.json()
    const container = document.querySelector(`.comments-container[data-post-id="${postId}"]`)
    container.innerHTML = ""

    comments
      .filter(c => c.post === postId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .forEach(c => {
        const el = document.createElement("div")
        el.className = "comment"
        el.innerHTML = `<strong>${c.author}</strong>: ${c.text} <small>${dayjs(c.created_at).fromNow()}</small>`
        container.appendChild(el)
      })
  } catch (err) {
    console.error(err)
  }
}


function bindFollowButtons() {
  const followButtons = document.querySelectorAll(".follow-btn")
  followButtons.forEach(button => {
    // Remove existing listeners before adding new to avoid duplicates
    button.replaceWith(button.cloneNode(true))
  })
  // Re-select buttons after cloning (removes duplicates)
  document.querySelectorAll(".follow-btn").forEach(button => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.userId
      const isFollowing = button.classList.contains("following")

      try {
        const endpoint = `/api/users/${userId}/${isFollowing ? 'unfollow' : 'follow'}/`
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        })

        if (!res.ok) throw new Error("Failed to update follow status")

        button.classList.toggle("following")
        button.textContent = isFollowing ? "Follow" : "Following"
      } catch (err) {
        console.error(err)
      }
    })
  })
}


async function loadUsers() {
  try {
    const token = localStorage.getItem('accessToken')
    if (!token) throw new Error('User not authenticated')

    const res = await fetch('/api/users/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) throw new Error('Failed to fetch users')

    const users = await res.json()

    const suggestionsList = document.querySelector('.suggestions-list')
    if (!suggestionsList) return

    suggestionsList.innerHTML = '' // clear example users

    users.forEach(user => {
      const mutualCount = user.mutual_friends_count || 0

      const userEl = document.createElement('div')
      userEl.className = 'suggestion-item'
      userEl.innerHTML = `
        <div class="suggestion-user">
          <div class="suggestion-info">
            <p class="suggestion-name">${user.username}</p>
            <p class="suggestion-mutual">${mutualCount} mutual friend${mutualCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button class="follow-btn ${user.is_following ? 'following' : ''}" data-user-id="${user.id}">
          ${user.is_following ? 'Following' : 'Follow'}
        </button>
      `
      suggestionsList.appendChild(userEl)
    })

    bindFollowButtons() // bind after inserting elements
  } catch (err) {
    console.error('Error loading users:', err)
  }
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
          ${post.image_url ? `<img src="${post.image_url}" alt="${post.title}" style="width:100%; height:auto; object-fit:cover;" />` : ''}
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
          <div class="comments-section" data-post-id="${post.id}">
            <button style="margin-bottom:20px;" class="toggle-comments post-btn-style">Show Comments</button>
            <div class="comments-container" data-post-id="${post.id}" style="display:none;">
              <div class="comments-list"></div>
            </div>
            <form class="comment-form">
              <input class="post-input" type="text" name="comment" placeholder="Add a comment..." required />
              <button class="post-btn-style" type="submit">Post comment</button>
            </form>
          </div>
        </div>
      `

      postsFeed.appendChild(postEl)

      // Attach comment toggle logic
      const toggleBtn = postEl.querySelector('.toggle-comments')
      const commentsContainer = postEl.querySelector('.comments-container')

      toggleBtn.addEventListener('click', () => {
        const isVisible = commentsContainer.style.display === 'block'
        commentsContainer.style.display = isVisible ? 'none' : 'block'
        toggleBtn.textContent = isVisible ? 'Show Comments' : 'Hide Comments'
        if (!isVisible) loadComments(post.id)
      })

      // Handle comment submission
      const form = postEl.querySelector('.comment-form')
      const input = postEl.querySelector('.post-input')

      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        const text = input.value.trim()
        if (!text) return

        try {
          const res = await fetch("/api/comments/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            body: JSON.stringify({ text, post: post.id })
          })

          if (res.ok) {
            input.value = ""
            loadComments(post.id)
          } else {
            console.error("Failed to post comment")
          }
        } catch (err) {
          console.error(err)
        }
      })
    })

    bindLikeButtons()
  } catch (err) {
    console.error(err)
    document.getElementById('postsFeed').textContent = 'Failed to load posts.'
  }
}


async function handlePostSubmit() {
  const postText = document.getElementById("post-input").value.trim()
  const postTitle = document.getElementById("post-title-input").value.trim()
  const imageInput = document.getElementById("post-image-input")
  const token = localStorage.getItem("accessToken")

  if (!postTitle || !postText) {
    alert("Title and description required")
    return
  }

  try {
    const formData = new FormData()
    formData.append("title", postTitle)
    formData.append("description", postText)
    if (imageInput?.files.length > 0) {
      formData.append("image", imageInput.files[0])
    }

    const res = await fetch("/api/posts/", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData
    })

    const data = await res.json()
    if (!res.ok) return alert("Failed: " + (data.detail || JSON.stringify(data)))

    document.getElementById("post-input").value = ""
    document.getElementById("post-title-input").value = ""
    document.getElementById("post-image-input").value = ""
    document.getElementById("file-name").textContent = ""
    if (imageInput) imageInput.value = ""

    loadPosts()
  } catch (err) {
    console.error("Error:", err)
    alert("Something went wrong")
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
  if (postButton && !postButton.dataset.bound) {
    postButton.addEventListener("click", handlePostSubmit)
    postButton.dataset.bound = "true" 
  }

  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout)
  }

  const imageInput = document.getElementById("post-image-input")
  const fileNameDisplay = document.getElementById("file-name")

  imageInput.addEventListener("change", () => {
    const file = imageInput.files[0]
    if (file) {
      fileNameDisplay.textContent = file.name
    } else {
      fileNameDisplay.textContent = ""
    }
  })

  bindFollowButtons()
  loadPosts()
  loadUsers()
})
