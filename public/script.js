// Handle link form submission
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('linkForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Retrieve values from the form
    const linkName = document.getElementById('linkName').value.trim();
    const linkUrl = document.getElementById('linkUrl').value.trim();

    // Validate input
    if (!linkName || !linkUrl) {
      console.error('Link name and URL are required.');
      return; // Exit the function if validation fails
    }

    try {
      const response = await fetch('/saveLink', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ linkName, linkUrl })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Log response data
        loadLinks(); // Reload links
        event.target.reset(); // Reset form
      } else {
        const errorData = await response.json(); // Attempt to get error details from response
        console.error('Failed to save link:', errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

// Variable to store all links
let allLinks = [];

// Function to load and display embedded links
async function loadLinks() {
  console.log('loadLinks called');

  const response = await fetch('/links');
  const data = await response.json();

  console.log('Links response:', data);

  if (data.success) {
    const links = data.data;

    // Ensure links is an array
    if (!Array.isArray(links)) {
      console.error('Error: links is not an array');
      return;
    }

    console.log('New links:', links);

    // Remove duplicates from the new links
    const uniqueLinks = links.filter((link, index, self) =>
      self.findIndex((f) => f.url === link.url) === index
    );

    // Loop through the new links and add them to allLinks only if they don't exist
    uniqueLinks.forEach((link) => {
      if (!allLinks.find((existingLink) => existingLink.url === link.url)) {
        allLinks.push(link);
      }
    });

    console.log('Updated allLinks:', allLinks);

    // Store the links in local storage
    localStorage.setItem('allLinks', JSON.stringify(allLinks));

    const embeddedContent = document.getElementById('embeddedContent');
    embeddedContent.innerHTML = ''; // Clear the container

    // Append new links to the content
    allLinks.forEach((link) => {
      const linkElement = `
        <div class="post">
          <button class="post">
            <h2 class="file-name" onclick="toggleContent(this)">${link.name}</h2>
          </button>
          <div class="content" style="display: none;">
            <iframe src="${link.url}" width="auto" height="569" allow="autoplay" frameborder="0" allowfullscreen></iframe>
            <button class="remove" data-url="${link.url}" onclick="removeLink(this)">Remove</button>
          </div>
        </div>
      `;
      embeddedContent.innerHTML += linkElement; // Append new links
    });
  } else {
    console.error(data.message || 'Failed to load links');
  }
}

// Function to open the link in the iframe
function toggleContent(element) {
  let contentDiv = element.parentNode.nextElementSibling; // Get the next sibling (the content div)
  contentDiv.style.display = (contentDiv.style.display === "none" || contentDiv.style.display === "") ? "block" : "none"; // Toggle visibility
}

// Function to remove a link
function removeLink(button) {
  const url = button.getAttribute('data-url');
  const index = allLinks.findIndex((link) => link.url === url);
  if (index !== -1) {
    allLinks.splice(index, 1);
    localStorage.setItem('allLinks', JSON.stringify(allLinks));
    loadLinks(); // Reload links
  }
}

// Function to delete all links
function clearAllLinks() {
  allLinks = []; // Clear the allLinks array
  localStorage.removeItem('allLinks'); // Remove from local storage
  loadLinks(); // Reload the links (now empty)
}

// Load links from local storage when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const storedLinks = localStorage.getItem('allLinks');
  if (storedLinks) {
    allLinks = JSON.parse(storedLinks);
    loadLinks(); // Call loadLinks to display the stored links
  }
});

// Load links on page load
window.onload = async function() {
  await loadLinks(); // Load links
};

// Search functionality
function searchPosts() {
  let input = document.getElementById('search-bar').value.toLowerCase();
  let posts = document.getElementsByClassName('post');

  if (input.trim() === "") {
    Array.from(posts).forEach(post => post.style.display = ""); // Show all posts
    return; // Exit the function
  }

  Array.from(posts).forEach(post => {
    let fileName = post.getElementsByClassName('file-name')[0].innerText.toLowerCase();
    post.style.display = fileName.includes(input) ? "" : "none"; // Show or hide the post
  });
}

// Check for 'Enter' key in search
function checkEnter(event) {
  if (event.key === "Enter") {
    searchPosts();
  }
}
