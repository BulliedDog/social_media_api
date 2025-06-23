if (typeof dayjs !== 'undefined' && typeof dayjs_plugin_relativeTime !== 'undefined') {
    dayjs.extend(dayjs_plugin_relativeTime);
}

let isPostSubmitting = false; // Flag to prevent multiple rapid post submissions

// UPDATED: setLoadingState with more robust error handling and logging
function setLoadingState(button, loading) {
    console.log("setLoadingState: called with button:", button, "and loading:", loading);
    if (!button) {
        console.error("setLoadingState: Button element is null or undefined. Cannot set loading state.");
        return; 
    }

    try {
        const btnText = button.querySelector(".btn-text");
        const btnLoader = button.querySelector(".btn-loader");
        console.log("setLoadingState: Found btnText:", btnText, "btnLoader:", btnLoader);

        // If the button doesn't have specific text/loader spans, fall back to simple disable
        if (!btnText && !btnLoader) {
            button.disabled = loading;
            console.log(`setLoadingState: Falling back to simple disable. Button disabled: ${button.disabled}`);
            return;
        }

        if (loading) {
            if (btnText) {
                btnText.style.display = "none";
                console.log("setLoadingState: Hid btnText.");
            }
            if (btnLoader) {
                btnLoader.style.display = "block"; // Assuming loader is hidden by default
                console.log("setLoadingState: Showed btnLoader.");
            }
            button.disabled = true;
            console.log("setLoadingState: Button disabled.");
        } else {
            if (btnText) {
                btnText.style.display = "block";
                console.log("setLoadingState: Showed btnText.");
            }
            if (btnLoader) {
                btnLoader.style.display = "none";
                console.log("setLoadingState: Hid btnLoader.");
            }
            button.disabled = false;
            console.log("setLoadingState: Button enabled.");
        }
    } catch (error) {
        console.error("setLoadingState: An error occurred inside setLoadingState:", error);
        // Fallback: try to disable the button even if internal elements cause issues
        button.disabled = loading;
    }
}


// Logout function for authenticated pages
function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/social/login/"; // Redirect to login page upon logout
}

// Helper function for making authenticated API requests
async function makeAuthenticatedRequest(url, options = {}) {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        console.warn("No access token found. Redirecting to login.");
        logout(); // Redirect to login page if no token
        throw new Error("No access token available."); 
    }

    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        // 'Content-Type': 'application/json', // This will be set by FormData automatically if body is FormData
        ...options.headers 
    };

    // If FormData is used, we explicitly don't set Content-Type header here
    // The browser will set it correctly (e.g., multipart/form-data)
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    } else if (!headers['Content-Type']) { // Only set default if not already set or explicitly deleted
        headers['Content-Type'] = 'application/json';
    }


    const fetchOptions = {
        ...options,
        headers: headers
    };

    const res = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized or 403 Forbidden errors
    if (res.status === 401 || res.status === 403) {
        console.error(`Authentication error (${res.status}). Token expired or invalid. Redirecting to login.`);
        logout(); // Force logout and redirect
        throw new Error("Authentication failed.");
    }

    if (!res.ok) {
        let errorData = {};
        try {
            errorData = await res.json();
        } catch (e) {
            // If response is not JSON, use plain text status
            throw new Error(`API call failed with status ${res.status}: ${res.statusText}`);
        }
        throw new Error(`API call failed with status ${res.status}: ${errorData.detail || JSON.stringify(errorData)}`);
    }

    return res;
}

// --- Functions for your social feed functionality ---

// Load posts
async function loadPosts() {
    try {
        const res = await makeAuthenticatedRequest('/api/posts/');
        const posts = await res.json();
        posts.sort((a, b) => new Date(b.date_published) - new Date(a.date_published)); // Sort by newest

        const postsFeed = document.getElementById('postsFeed');
        if (!postsFeed) {
            console.warn("postsFeed element not found.");
            return;
        }
        postsFeed.innerHTML = ''; // Clear existing posts

        posts.forEach(post => {
            const postEl = document.createElement('div');
            postEl.className = 'post-card';
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
            `;
            postsFeed.appendChild(postEl);

            // Event listener for toggling comments section
            const toggleBtn = postEl.querySelector('.toggle-comments');
            const commentsContainer = postEl.querySelector('.comments-container');
            if (toggleBtn && commentsContainer) {
                toggleBtn.addEventListener('click', () => {
                    const isVisible = commentsContainer.style.display === 'block';
                    commentsContainer.style.display = isVisible ? 'none' : 'block';
                    toggleBtn.textContent = isVisible ? 'Show Comments' : 'Hide Comments';
                    if (!isVisible) loadComments(post.id); // Load comments when showing
                });
            }

            // Event listener for submitting comments
            const commentForm = postEl.querySelector('.comment-form');
            const commentInput = postEl.querySelector('.comment-form .post-input');
            if (commentForm && commentInput) {
                commentForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const text = commentInput.value.trim();
                    if (!text) return;

                    try {
                        await makeAuthenticatedRequest("/api/comments/", {
                            method: "POST",
                            body: JSON.stringify({ text, post: post.id })
                        });
                        commentInput.value = ""; // Clear input
                        loadComments(post.id); // Reload comments for this post
                    } catch (err) {
                        console.error("Error posting comment:", err);
                        alert("Failed to post comment.");
                    }
                });
            }
        });
        bindLikeButtons(); // Bind like buttons after posts are loaded
    } catch (err) {
        console.error("Failed to load posts:", err);
        const postsFeed = document.getElementById('postsFeed');
        if (postsFeed) postsFeed.innerHTML = '<p>Failed to load posts. Please try again.</p>';
        // Redirect to login on load failure
        logout()
    }
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
        el.style="margin-bottom:10px;"
        container.appendChild(el)
      })
  } catch (err) {
    console.error(err)
  }
}

// Bind like buttons to handle click events
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

async function handleLikeButtonClick(e) {
    const button = e.currentTarget;
    const postId = button.dataset.postId;
    let likesCount = parseInt(button.dataset.likes);
    const isLiked = button.classList.contains('liked');

    try {
        const res = await makeAuthenticatedRequest(`/api/posts/${postId}/toggle_like/`, {
            method: 'POST',
            body: JSON.stringify({}) // Empty body for a toggle endpoint
        });

        if (res.ok) {
            if (isLiked) {
                button.classList.remove('liked');
                button.querySelector('i').classList.replace('fas', 'far');
                likesCount--;
            } else {
                button.classList.add('liked');
                button.querySelector('i').classList.replace('far', 'fas');
                likesCount++;
            }
            button.dataset.likes = likesCount;
            button.querySelector('.action-count').textContent = likesCount;
        } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("Failed to toggle like:", errorData);
            alert("Failed to toggle like.");
        }
    } catch (err) {
        console.error("Error toggling like:", err);
        alert("An error occurred while toggling like.");
    }
}

// Load users (for suggestions)
async function loadUsers() {
    try {
        const res = await makeAuthenticatedRequest('/api/users/');
        const users = await res.json();

        const suggestionsList = document.querySelector('.suggestions-list');
        if (!suggestionsList) {
            console.warn(".suggestions-list element not found.");
            return;
        }
        suggestionsList.innerHTML = ''; // Clear existing suggestions

        users.forEach(user => {
            const mutualCount = user.mutual_friends_count || 0;
            const userEl = document.createElement('div');
            userEl.className = 'suggestion-item';
            userEl.innerHTML = `
                <div class="suggestion-user">
                    <div class="suggestion-info">
                        <p class="suggestion-name">${user.username}</p>
                        <p class="suggestion-mutual">${mutualCount} mutual friend${mutualCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <button class="follow-btn ${user.is_following ? 'following' : ''}" data-user-id="${user.id}" data-is-following="${user.is_following ? 'true' : 'false'}">
                    ${user.is_following ? 'Following' : 'Follow'}
                </button>
            `;
            suggestionsList.appendChild(userEl);
        });
        bindFollowButtons(); // Bind follow buttons after users are loaded
    } catch (err) {
        console.error('Error loading users:', err);
        const suggestionsList = document.querySelector('.suggestions-list');
        if (suggestionsList) suggestionsList.innerHTML = '<p>Failed to load user suggestions.</p>';
    }
}

// Bind follow buttons to handle click events
function bindFollowButtons() {
    document.querySelectorAll('.follow-btn').forEach(button => {
        // Remove existing listener to prevent multiple bindings
        button.removeEventListener('click', handleFollowButtonClick);
        button.addEventListener('click', handleFollowButtonClick);
    });
}

async function handleFollowButtonClick(e) {
    const button = e.currentTarget;
    const userId = button.dataset.userId;
    let isFollowing = button.dataset.isFollowing === 'true';

    try {
        const res = await makeAuthenticatedRequest(`/api/users/${userId}/toggle_follow/`, {
            method: 'POST',
            body: JSON.stringify({}) // Empty body for a toggle endpoint
        });

        if (res.ok) {
            isFollowing = !isFollowing; // Toggle the state
            button.dataset.isFollowing = isFollowing ? 'true' : 'false';
            button.textContent = isFollowing ? 'Following' : 'Follow';
            button.classList.toggle('following', isFollowing);
            alert(`You are now ${isFollowing ? 'following' : 'unfollowing'} this user.`);
        } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("Failed to toggle follow:", errorData);
            alert("Failed to toggle follow status.");
        }
    } catch (err) {
        console.error("Error toggling follow:", err);
        alert("An error occurred while changing follow status.");
    }
}

// Handle post submission from the home page
async function handlePostSubmit() {
    // Check if a submission is already in progress
    if (isPostSubmitting) {
        console.log("Post submission already in progress. Ignoring rapid click.");
        return;
    }

    const postTitle = document.getElementById("post-title-input")?.value.trim();
    // CORRECTED: Use "post-input" as the ID for the main post content
    const postText = document.getElementById("post-input")?.value.trim(); 
    const imageInput = document.getElementById("post-image-input");
    const fileNameDisplay = document.getElementById("file-name");
    const postSubmitButton = document.querySelector(".post-btn"); 

    // NEW: Check if the button was found before trying to set its state
    if (!postSubmitButton) {
        console.error("handlePostSubmit: Post button with class '.post-btn' not found!");
        alert("Error: Post button not found on the page.");
        return; // Can't proceed without the button
    }

    // Input validation check
    if (!postTitle && !postText && (!imageInput || imageInput.files.length === 0)) {
        alert("Please enter a title, description, or select an image for your post.");
        return; // Stop execution if validation fails
    }

    // Set the flag to true and disable the button. This should now happen AFTER validation.
    isPostSubmitting = true;
    setLoadingState(postSubmitButton, true); 
    console.log("handlePostSubmit: setLoadingState called to disable button.");

    const formData = new FormData();
    if (postTitle) formData.append("title", postTitle);
    if (postText) formData.append("description", postText); // This now correctly uses 'postText'
    if (imageInput?.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    try {
        const res = await makeAuthenticatedRequest("/api/posts/", {
            method: "POST",
            body: formData
        });

        if (res.ok) {
            // Clear form fields
            document.getElementById("post-title-input").value = "";
            // CORRECTED: Clear the main post input
            document.getElementById("post-input").value = ""; 
            if (imageInput) imageInput.value = "";
            if (fileNameDisplay) fileNameDisplay.textContent = "";
            
            loadPosts(); 
            alert("Post created successfully!");
        } else {
            const errorData = await res.json().catch(() => ({}));
            console.error("handlePostSubmit: Failed to submit post (API error):", errorData);
            alert("Failed to create post: " + (errorData.detail || JSON.stringify(errorData)));
        }
    } catch (err) {
        console.error("handlePostSubmit: An unexpected error occurred during submission:", err);
        alert("An error occurred while submitting your post. Please try again."); 
    } finally {
        // Always reset the flag and re-enable the button
        isPostSubmitting = false;
        if (postSubmitButton) { // Ensure button exists before trying to re-enable
            setLoadingState(postSubmitButton, false); 
            console.log("handlePostSubmit: setLoadingState called in finally block to enable button.");
        }
    }
}


// --- Main DOMContentLoaded listener for the authenticated home page ---
document.addEventListener("DOMContentLoaded", () => {
    // Crucial check: Ensure an access token exists on authenticated pages.
    const token = localStorage.getItem("accessToken");
    if (!token) {
        console.warn("No access token found on home page. Redirecting to login.");
        return logout(); 
    }

    // Optional: Display username if user data is stored
    const user = JSON.parse(localStorage.getItem("user"));
    const usernameDisplay = document.getElementById("usernameDisplay"); 
    if (user?.username && usernameDisplay) {
        usernameDisplay.textContent = user.username;
    }

    // Bind logout button if it exists on the page
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Bind the post submission button (ensure it's not double-bound)
    const postButton = document.querySelector(".post-btn");
    if (postButton && !postButton.dataset.boundPostSubmit) { 
        postButton.addEventListener("click", handlePostSubmit);
        postButton.dataset.boundPostSubmit = "true"; 
    }

    // Handle image input change for displaying file name
    const imageInput = document.getElementById("post-image-input");
    const fileNameDisplay = document.getElementById("file-name");
    if (imageInput && fileNameDisplay) {
        imageInput.addEventListener("change", () => {
            const file = imageInput.files[0];
            if (file) {
                fileNameDisplay.textContent = file.name;
            } else {
                fileNameDisplay.textContent = "";
            }
        });
    }

    // Load initial data for the home page
    loadPosts();
    loadUsers();
});