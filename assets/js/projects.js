/* =========================================================================
   projects.js
   Project Gallery data — add your projects here!
   
   Each project entry has:
     - title:       Project name
     - description: Short description (1-2 sentences)
     - image:       Path to project image (relative to root, e.g. "/assets/images/projects/my-project.webp")
     - tags:        Array of short tags/categories (optional)
     - link:        URL to project or post (optional)
   ========================================================================= */

const projectsData = [
    {
        title: "PERSONAL WEBSITE",
        description: "A retro-futuristic personal website built from scratch with vanilla HTML, CSS, and JavaScript.",
        image: "/assets/images/profile.webp",
        tags: ["WEB", "DESIGN"],
        link: "/"
    },
    {
        title: "MORTALITY PROBE",
        description: "An interactive exploration of existential meaning through participatory mapping and design research.",
        image: "/assets/images/profile.webp",
        tags: ["RESEARCH", "DESIGN"],
        link: "/sign/mortality-probe"
    },
    {
        title: "MAKERSPACE INFRASTRUCTURE",
        description: "Design and implementation of national-scale prototyping infrastructure across multiple regions.",
        image: "/assets/images/profile.webp",
        tags: ["HARDWARE", "SERVICE DESIGN"],
        link: null
    }
];

/* Render project gallery cards */
function renderProjectGallery() {
    const container = document.getElementById('project-gallery');
    if (!container) return;

    container.innerHTML = projectsData.map((project, i) => `
        <div class="gallery-card" ${project.link ? `data-link="${project.link}"` : ''}>
            <div class="gallery-card-image">
                <img src="${project.image}" alt="${project.title}" loading="lazy">
                <div class="gallery-card-overlay">
                    <span class="gallery-card-num">${String(i + 1).padStart(2, '0')}</span>
                </div>
            </div>
            <div class="gallery-card-body">
                <div class="gallery-card-tags">
                    ${(project.tags || []).map(tag => `<span class="gallery-tag">${tag}</span>`).join('')}
                </div>
                <div class="gallery-card-title">${project.title}</div>
                <div class="gallery-card-desc">${project.description}</div>
            </div>
        </div>
    `).join('');

    // Click handler for project cards with links
    container.querySelectorAll('.gallery-card[data-link]').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const link = card.getAttribute('data-link');
            if (link.startsWith('/') && !link.startsWith('//')) {
                // Internal link — use SPA navigation if available
                const postId = link.substring(1).replace(/\/$/, '');
                if (postId && typeof blogData !== 'undefined' && blogData.some(p => p.id === postId)) {
                    window.history.pushState({ postId }, '', link);
                    window.dispatchEvent(new PopStateEvent('popstate', { state: { postId } }));
                } else if (postId === '' || postId === 'home') {
                    window.history.pushState({ postId: '' }, '', '/');
                    window.dispatchEvent(new PopStateEvent('popstate', { state: { postId: '' } }));
                }
            } else {
                window.open(link, '_blank');
            }
        });
    });
}

// Auto-render when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderProjectGallery);
} else {
    renderProjectGallery();
}
