let blogPosts = [];
const POSTS_PER_PAGE = 6;
let currentPage = 1;

// Throttle function to limit scroll event firing
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Load posts with pagination
function loadPosts(page) {
  const start = (page - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const postsToShow = blogPosts.slice(start, end);

  const container = document.getElementById('blogPosts');

  postsToShow.forEach((post) => {
    const postElement = document.createElement('div');
    postElement.className = 'blog-card';
    postElement.innerHTML = `
            <img 
              data-src="${post.imageUrl}" 
              class="blog-card-image lazy" 
              alt="${post.title}"
              loading="lazy"
            >
            <div class="blog-card-content">
              <h2 class="blog-title">${post.title}</h2>
              <div class="blog-meta">${post.date}</div>
              <div class="blog-content">${post.content}</div>
              <div class="mt-4">
                <button onclick="editPost(${post.id})" class="btn btn-primary me-2">Edit</button>
                <button onclick="deletePost(${post.id})" class="btn btn-outline-danger">Delete</button>
              </div>
            </div>
          `;
    container.appendChild(postElement);

    // Observe newly added images
    const lazyImages = postElement.querySelectorAll('.lazy');
    lazyImages.forEach((img) => imageObserver.observe(img));
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Load initial data
  loadFromLocalStorage();

  // Set up infinite scroll
  const scrollHandler = throttle(() => {
    if (
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 1000
    ) {
      currentPage++;
      loadPosts(currentPage);
    }
  }, 500);

  window.addEventListener('scroll', scrollHandler);
});

function initializeDefaultPosts() {
  const defaultPosts = [
    {
      id: 1,
      title: 'The Art of Minimalist Writing',
      content:
        "Minimalist writing is about expressing ideas clearly and concisely. It's about stripping away unnecessary words and focusing on what truly matters. In today's fast-paced world, the ability to communicate effectively with fewer words has become increasingly valuable. This approach not only makes your writing more accessible but also more impactful.",
      imageUrl: 'assets/image/workspace.jpg',
      date: 'January 1, 2025',
    },
    {
      id: 2,
      title: 'Finding Peace in Reading',
      content:
        "In a world filled with digital distractions, there's something magical about sitting down with a good book. The smell of paper, the weight of the book in your hands, and the quiet concentration it demands create a peaceful sanctuary in our busy lives. Reading not only broadens our horizons but also provides a much-needed escape from the constant noise of modern life.",
      imageUrl: 'assets/image/buku.jpg',
      date: 'January 3, 2025',
    },
    {
      id: 3,
      title: 'The Perfect Writing Space',
      content:
        "Creating the ideal writing environment is crucial for productivity and creativity. A clean desk, good lighting, and comfortable seating can make all the difference. Whether it's a cozy corner in your home or a favorite café, finding your perfect writing space can help unlock your creative potential and make the writing process more enjoyable.",
      imageUrl: 'assets/image/workspace2.jpg',
      date: 'January 5, 2025',
    },
  ];

  if (!localStorage.getItem('blogPosts')) {
    blogPosts = defaultPosts;
    saveToLocalStorage();
  }
}

document.getElementById('blogForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  const imageUrl =
    document.getElementById('imageUrl').value || '/api/placeholder/400/400';

  if (title && content) {
    const post = {
      id: Date.now(),
      title: title,
      content: content,
      imageUrl: imageUrl,
      date: new Date().toLocaleDateString(),
    };

    blogPosts.push(post);
    saveToLocalStorage();
    renderPosts();

    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('imageUrl').value = '';
  }
});

function saveToLocalStorage() {
  localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('blogPosts');
  if (saved) {
    blogPosts = JSON.parse(saved);
  } else {
    initializeDefaultPosts();
  }
  renderPosts();
}

function renderPosts() {
  const container = document.getElementById('blogPosts');
  container.innerHTML = '';

  blogPosts.forEach((post) => {
    const postElement = document.createElement('div');
    postElement.className = 'blog-card';
    postElement.innerHTML = `
            <img src="${post.imageUrl}" class="blog-card-image" alt="${post.title}">
            <div class="blog-card-content">
                <h2 class="blog-title">${post.title}</h2>
                <div class="blog-meta">${post.date}</div>
                <div class="blog-content">${post.content}</div>
                <div class="mt-4">
                    <button onclick="editPost(${post.id})" class="btn btn-primary me-2">Edit</button>
                    <button onclick="deletePost(${post.id})" class="btn btn-outline-danger">Delete</button>
                </div>
            </div>
        `;
    container.appendChild(postElement);
  });
}

function editPost(id) {
  const post = blogPosts.find((p) => p.id === id);
  if (post) {
    document.getElementById('title').value = post.title;
    document.getElementById('content').value = post.content;
    document.getElementById('imageUrl').value = post.imageUrl;
    deletePost(id);
  }
}

function deletePost(id) {
  blogPosts = blogPosts.filter((post) => post.id !== id);
  saveToLocalStorage();
  renderPosts();
}

// Intersection Observer for lazy loading images
const imageObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  },
  {
    rootMargin: '50px 0px',
    threshold: 0.1,
  }
);

// Initialize smooth scrolling with better performance
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  });
});

function handleContactSubmit(event) {
  event.preventDefault();

  // Get form values
  const name = document.getElementById('contactName').value;
  const email = document.getElementById('contactEmail').value;
  const message = document.getElementById('contactMessage').value;

  // Here you would typically send the data to a server
  // For now, we'll just show the success message

  // Show success message
  const successMessage = document.getElementById('successMessage');
  successMessage.style.display = 'block';

  // Reset form
  document.getElementById('contactForm').reset();

  // Hide success message after 5 seconds
  setTimeout(() => {
    successMessage.style.display = 'none';
  }, 5000);
}
loadFromLocalStorage();
