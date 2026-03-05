document.addEventListener('DOMContentLoaded', () => {
    const treeContainer = document.getElementById('collection-tree');

    const contentHeader = document.getElementById('content-header');
    const contentBreadcrumb = document.getElementById('content-breadcrumb');
    const contentTitle = document.getElementById('content-title');
    const contentDate = document.getElementById('content-date');

    const articleContentContainer = document.getElementById('article-content');
    const homeView = document.getElementById('home-view');
    const contentBodyLayout = document.getElementById('content-body-layout');
    const recentPostsList = document.getElementById('recent-posts-list');
    const sidebarBottom = document.querySelector('.sidebar-bottom');
    const contentScroller = document.getElementById('content-scroller');
    const searchInput = document.getElementById('post-search');
    const shareBtn = document.getElementById('share-btn');

    const marqueeText = document.getElementById('marquee-text');
    const mobileMarquee = document.getElementById('mobile-marquee');
    let isScrolledDown = false;

    /* SCROLL LISTENER FOR MOBILE MARQUEE */
    if (contentScroller) {
        contentScroller.addEventListener('scroll', () => {
            if (window.innerWidth <= 900) {
                if (contentScroller.scrollTop > 50 && !isScrolledDown) {
                    isScrolledDown = true;
                    document.body.classList.add('scrolled-down');
                    if (mobileMarquee) mobileMarquee.classList.add('marquee-active');
                } else if (contentScroller.scrollTop <= 50 && isScrolledDown) {
                    isScrolledDown = false;
                    document.body.classList.remove('scrolled-down');
                    if (mobileMarquee) mobileMarquee.classList.remove('marquee-active');
                }
            } else {
                if (isScrolledDown) {
                    isScrolledDown = false;
                    document.body.classList.remove('scrolled-down');
                    if (mobileMarquee) mobileMarquee.classList.remove('marquee-active');
                }
            }
        });
    }

    /* SHARE BUTTON LOGIC */
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const currentUrl = window.location.href;
            navigator.clipboard.writeText(currentUrl).then(() => {
                const originalText = shareBtn.innerText;
                shareBtn.innerText = '[ LINK COPIED ]';
                setTimeout(() => {
                    shareBtn.innerText = originalText;
                }, 2000);
            });
        });
    }

    /* MOBILE MENU TOGGLE */
    const mobileToggleBtn = document.getElementById('mobile-nav-toggle');
    const sidebarDrawer = document.getElementById('mobile-sidebar');

    if (mobileToggleBtn) {
        mobileToggleBtn.addEventListener('click', () => {
            sidebarDrawer.classList.toggle('active');
            if (sidebarDrawer.classList.contains('active')) {
                mobileToggleBtn.innerText = '[ CLOSE INDEX ]';
            } else {
                mobileToggleBtn.innerText = '[ ACCESS INDEX ]';
            }
        });
    }

    /* ABOUT SECTION EXPANDER */
    const aboutToggle = document.getElementById('about-toggle');
    const aboutContent = document.getElementById('about-content');
    const aboutIndicator = document.getElementById('about-indicator');

    if (aboutToggle) {
        aboutToggle.addEventListener('click', () => {
            if (aboutContent.style.display === 'block') {
                aboutContent.style.display = 'none';
                aboutIndicator.innerText = '+';
                aboutIndicator.style.transform = 'rotate(0deg)';
                aboutToggle.style.color = '';
            } else {
                aboutContent.style.display = 'block';
                aboutIndicator.innerText = '−';
                aboutIndicator.style.transform = 'rotate(180deg)';
                aboutToggle.style.color = 'var(--sys-text-bright)';
            }
        });
    }

    /* SVG ICONS */
    const icons = {
        chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
        folderClosed: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sys-icon folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        folderOpen: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sys-icon folder"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
        file: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sys-icon file"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
    };

    /* FOLDER STATE MANAGEMENT */
    const getFolderState = () => {
        try {
            return JSON.parse(localStorage.getItem('sysFolderState')) || {};
        } catch (e) {
            return {};
        }
    };

    const saveFolderState = (state) => {
        localStorage.setItem('sysFolderState', JSON.stringify(state));
    };

    let folderState = getFolderState();

    const toggleFolder = (folderId, forceState) => {
        const newState = forceState !== undefined ? forceState : !folderState[folderId];
        folderState[folderId] = newState;
        saveFolderState(folderState);

        // update DOM dynamically if elements exist
        const children = document.getElementById(`children-${folderId}`);
        const chevron = document.getElementById(`chevron-${folderId}`);
        const iconContainer = document.getElementById(`icon-${folderId}`);

        if (children) {
            if (newState) {
                children.classList.add('expanded');
                if (chevron && chevron.firstElementChild) chevron.firstElementChild.classList.add('expanded');
                if (iconContainer) iconContainer.innerHTML = icons.folderOpen;
            } else {
                children.classList.remove('expanded');
                if (chevron && chevron.firstElementChild) chevron.firstElementChild.classList.remove('expanded');
                if (iconContainer) iconContainer.innerHTML = icons.folderClosed;
            }
        }
    };

    const expandAllFolders = () => {
        for (const key in folderState) folderState[key] = true;
        saveFolderState(folderState);
        document.querySelectorAll('.tree-children').forEach(el => {
            const folderId = el.id.replace('children-', '');
            toggleFolder(folderId, true);
        });
    };

    const collapseAllFolders = () => {
        for (const key in folderState) folderState[key] = false;
        saveFolderState(folderState);
        document.querySelectorAll('.tree-children').forEach(el => {
            const folderId = el.id.replace('children-', '');
            toggleFolder(folderId, false);
        });
    };

    if (document.getElementById('btn-expand-all')) {
        document.getElementById('btn-expand-all').addEventListener('click', expandAllFolders);
    }
    if (document.getElementById('btn-collapse-all')) {
        document.getElementById('btn-collapse-all').addEventListener('click', collapseAllFolders);
    }

    /* 1. BUILD TECH TREE DATA */
    const buildTreeData = () => {
        const tree = {};
        if (typeof blogData === 'undefined') return tree;
        blogData.forEach(post => {
            if (!tree[post.collection]) {
                tree[post.collection] = {};
            }
            if (!tree[post.collection][post.subCollection]) {
                tree[post.collection][post.subCollection] = [];
            }
            tree[post.collection][post.subCollection].push(post);
        });
        return tree;
    };

    /* 2. RENDER THE TREE (Folder File System) */
    const renderSidebarTree = (filterText = '') => {
        const treeData = buildTreeData();
        let html = '';

        const lowerFilter = filterText.toLowerCase();

        for (const [collection, subCollections] of Object.entries(treeData)) {
            const colId = 'col-' + collection.replace(/\s+/g, '-').toLowerCase();
            if (folderState[colId] === undefined) folderState[colId] = true; // Open by default

            let collectionHtml = `<li class="tree-group">
                <div class="folder-item collection-folder" data-folder="${colId}">
                    <span id="chevron-${colId}">
                        ${icons.chevron}
                    </span>
                    <span class="folder-icon-wrapper" id="icon-${colId}">
                        ${folderState[colId] || filterText ? icons.folderOpen : icons.folderClosed}
                    </span>
                    <span class="folder-name"><span class="folder-name-inner">${collection}</span></span>
                </div>
                <ul class="tree-children ${folderState[colId] || filterText ? 'expanded' : ''}" id="children-${colId}">
            `;
            let hasCollectionMatch = false;

            for (const [subCol, posts] of Object.entries(subCollections)) {
                const subId = colId + '-' + subCol.replace(/\s+/g, '-').toLowerCase();
                if (folderState[subId] === undefined) folderState[subId] = false; // Closed by default

                let subHtml = `<li class="tree-group sub-group">
                    <div class="folder-item sub-folder" data-folder="${subId}">
                        <span id="chevron-${subId}">
                            ${icons.chevron}
                        </span>
                        <span class="folder-icon-wrapper" id="icon-${subId}">
                            ${folderState[subId] || filterText ? icons.folderOpen : icons.folderClosed}
                        </span>
                        <span class="folder-name"><span class="folder-name-inner">${subCol}</span></span>
                    </div>
                    <ul class="tree-children ${folderState[subId] || filterText ? 'expanded' : ''}" id="children-${subId}">
                `;
                let hasSubMatch = false;

                posts.forEach(post => {
                    const matchesFilter = post.title.toLowerCase().includes(lowerFilter) ||
                        post.summary.toLowerCase().includes(lowerFilter);
                    if (matchesFilter) {
                        subHtml += `
                            <li>
                                <div class="folder-item file-item post-link" data-id="${post.id}">
                                    <span class="folder-name"><span class="folder-name-inner">${post.title}</span></span>
                                </div>
                            </li>
                        `;
                        hasSubMatch = true;
                        hasCollectionMatch = true;
                    }
                });

                subHtml += `</ul></li>`;
                if (hasSubMatch || !filterText) {
                    collectionHtml += subHtml;
                }
            }

            collectionHtml += `</ul></li>`;
            if (hasCollectionMatch || !filterText) {
                html += collectionHtml;
            }
        }

        if (html === '') {
            html = '<li class="tree-group"><div class="folder-item" style="color:var(--sys-accent)">NO RECORDS FOUND</div></li>';
        }

        treeContainer.innerHTML = html;
        saveFolderState(folderState); // persist state init

        // Sync chevron directions after render
        document.querySelectorAll('.tree-children.expanded').forEach(el => {
            const folderId = el.id.replace('children-', '');
            const chevron = document.getElementById(`chevron-${folderId}`);
            if (chevron && chevron.firstElementChild) chevron.firstElementChild.classList.add('expanded');
        });

        attachClickHandlers();
    };

    /* 3. SEARCH FILTER */
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderSidebarTree(e.target.value);
        });
    }

    /* 3.5 RENDER OUTLINE */
    const outlineContainer = document.getElementById('outline-container');
    const postOutline = document.getElementById('post-outline');

    const generateOutline = (container) => {
        if (!outlineContainer || !postOutline) return;

        postOutline.innerHTML = '';
        const headers = container.querySelectorAll('h1, h2, h3, h4');

        if (headers.length === 0) {
            outlineContainer.style.display = 'none';
            return;
        }

        // The container is shown on desktop, hidden on mobile via CSS
        outlineContainer.style.display = 'block';

        headers.forEach((header, index) => {
            if (!header.id) {
                let textId = header.innerText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                if (!textId) textId = 'heading-' + index;

                // Ensure ID starts with a letter to be a safe CSS selector
                if (/^[0-9]/.test(textId)) {
                    textId = 'header-' + textId;
                }

                let uniqueId = textId;
                let counter = 1;
                while (document.getElementById(uniqueId) || container.querySelector(`[id="${uniqueId}"]`)) {
                    uniqueId = textId + '-' + counter;
                    counter++;
                }
                header.id = uniqueId;
            }

            const level = parseInt(header.tagName.substring(1));
            // e.g. h1&h2 = 0 indent, h3 = 10, h4 = 20
            const indent = Math.max(0, level - 2) * 12;

            const li = document.createElement('li');
            li.style.marginBottom = '2px';

            const link = document.createElement('div');
            link.className = 'folder-item file-item';

            const nameWrapper = document.createElement('span');
            nameWrapper.className = 'folder-name';

            const nameInner = document.createElement('span');
            nameInner.className = 'folder-name-inner';
            nameInner.innerText = header.innerText;
            // Dim the sub-headers slightly to match tree hierarchy
            nameInner.style.opacity = level > 2 ? '0.8' : '1';
            nameInner.style.fontSize = level > 2 ? '0.75rem' : '0.8rem';

            nameWrapper.appendChild(nameInner);
            link.appendChild(nameWrapper);

            link.style.paddingLeft = `${indent + 8}px`;

            link.addEventListener('click', (e) => {
                e.preventDefault();
                header.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            li.appendChild(link);
            postOutline.appendChild(li);
        });
    };

    /* 4. RENDER HOME PANE */
    const renderHome = (updateState = true) => {
        if (updateState) {
            window.history.pushState({ postId: '' }, '', '/');
        }

        // Hide post content layout
        if (contentBodyLayout) contentBodyLayout.style.display = 'none';
        contentHeader.style.display = 'none';
        contentHeader.style.visibility = 'hidden';
        contentHeader.style.opacity = '0';
        contentScroller.classList.add('is-home');

        // Hide sidebar dossier on home page
        if (sidebarBottom) sidebarBottom.style.display = 'none';

        if (homeView) {
            homeView.style.display = 'block';
            setTimeout(() => {
                homeView.classList.remove('fade-out');
            }, 50);
        }

        // Hide mini player on home
        if (window.setMiniPlayerVisibility) {
            window.setMiniPlayerVisibility(false);
        }

        // Populate recent posts if not done
        if (recentPostsList && recentPostsList.children.length === 0 && typeof blogData !== 'undefined') {
            const sortedPosts = [...blogData].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
            recentPostsList.innerHTML = sortedPosts.map(post => `
                <a href="/${post.id}" class="recent-post-item" data-id="${post.id}">
                    <div class="rp-meta">${post.date} // ${post.collection} / ${post.subCollection}</div>
                    <div class="rp-title">${post.title.toUpperCase()}</div>
                </a>
            `).join('');

            const recentLinks = recentPostsList.querySelectorAll('.recent-post-item');
            recentLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const pId = link.getAttribute('data-id');
                    navigateToPost(pId);
                });
            });
        }

        if (window.innerWidth <= 900) {
            sidebarDrawer.classList.remove('active');
            if (mobileToggleBtn) mobileToggleBtn.innerText = '[ ACCESS INDEX ]';
        }
    };

    /* 4.5 RENDER POST IN MAIN PANE */
    const renderPost = (postId, updateState = true) => {
        const post = blogData.find(p => p.id === postId);
        if (!post) return;

        if (updateState) {
            window.history.pushState({ postId }, '', `/${postId}`);
        }

        // Expand parent folders automatically when rendering
        const colId = 'col-' + post.collection.replace(/\s+/g, '-').toLowerCase();
        const subId = colId + '-' + post.subCollection.replace(/\s+/g, '-').toLowerCase();

        if (!folderState[colId]) toggleFolder(colId, true);
        if (!folderState[subId]) toggleFolder(subId, true);

        // Hide home view and show post content layout
        contentScroller.classList.remove('is-home');
        if (homeView) {
            homeView.classList.add('fade-out');
            setTimeout(() => {
                homeView.style.display = 'none';
                if (contentBodyLayout) contentBodyLayout.style.display = 'flex';
            }, 200);
        } else {
            if (contentBodyLayout) contentBodyLayout.style.display = 'flex';
        }

        // Show sidebar dossier on post pages
        if (sidebarBottom) sidebarBottom.style.display = 'block';

        // Close sidebar on mobile after selection
        if (window.innerWidth <= 900) {
            sidebarDrawer.classList.remove('active');
            mobileToggleBtn.innerText = '[ ACCESS INDEX ]';
        }

        // Fade out transition
        articleContentContainer.classList.add('fade-out');

        setTimeout(() => {
            try {
                // Populate Sticky Header
                if (contentBreadcrumb) contentBreadcrumb.innerText = `${post.collection} / ${post.subCollection}`;
                if (contentTitle) contentTitle.innerText = post.title.toUpperCase();
                if (contentDate) contentDate.innerText = post.date;

                // Populate Marquee Text
                if (marqueeText) {
                    marqueeText.innerText = `${post.collection} / ${post.subCollection} // ${post.title.toUpperCase()}`;
                }

                // Show Sticky Header if hidden
                if (contentHeader && (contentHeader.style.visibility === 'hidden' || contentHeader.style.opacity === '0')) {
                    contentHeader.style.display = 'block';
                    contentHeader.style.visibility = 'visible';
                    contentHeader.style.opacity = '1';
                }

                // Populate Scrolling Article Content
                if (typeof marked !== 'undefined') {
                    articleContentContainer.innerHTML = marked.parse(post.content);
                } else {
                    articleContentContainer.innerText = post.content;
                    console.error("Marked library not found. Rendering raw text.");
                }

                // Generate Outline
                generateOutline(articleContentContainer);

                // Process Mermaid Blocks
                const mermaidBlocks = articleContentContainer.querySelectorAll('code.language-mermaid');
                mermaidBlocks.forEach(block => {
                    const parent = block.parentElement;
                    const div = document.createElement('div');
                    div.className = 'mermaid';
                    div.textContent = block.textContent;
                    parent.replaceWith(div);
                });

                if (typeof mermaid !== 'undefined' && mermaidBlocks.length > 0) {
                    mermaid.initialize({ startOnLoad: false, theme: 'dark' });
                    mermaid.run({ querySelector: '.mermaid' }).catch(err => console.error(err));
                }

                contentScroller.scrollTop = 0;
            } catch (err) {
                console.error("CRITICAL ERROR DURING RENDER:", err);
            } finally {
                // Always remove fade-out to prevent blank screen
                articleContentContainer.classList.remove('fade-out');

                // Show mini player on post
                if (window.setMiniPlayerVisibility) {
                    window.setMiniPlayerVisibility(true);
                }
            }
        }, 200);
    };

    // Navigation helper to prevent page reloads
    const navigateToPost = (postId) => {
        // Active state styling
        document.querySelectorAll('.post-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.post-link[data-id="${postId}"]`);
        if (activeLink) activeLink.classList.add('active');

        if (postId === 'home') {
            renderHome();
            return;
        }

        // Render
        renderPost(postId);
    };

    /* 5. CLICK HANDLERS */
    const attachClickHandlers = () => {
        // Folder toggles
        const folders = document.querySelectorAll('.collection-folder, .sub-folder');
        folders.forEach(folder => {
            folder.addEventListener('click', (e) => {
                e.preventDefault();
                const folderId = folder.getAttribute('data-folder');
                toggleFolder(folderId);
            });
        });

        // File selection
        const files = document.querySelectorAll('.post-link');
        files.forEach(file => {
            file.addEventListener('click', (e) => {
                e.preventDefault();

                // Active state styling
                document.querySelectorAll('.post-link').forEach(l => l.classList.remove('active'));
                file.classList.add('active');

                // Render
                const postId = file.getAttribute('data-id');
                navigateToPost(postId);
            });
        });
    };

    /* 6. LIGHTBOX / ZOOM LOGIC */
    const lightbox = document.getElementById('sys-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    const lightboxContent = document.getElementById('lightbox-content');

    let currentZoom = 1;
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    const openLightbox = (src) => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        resetZoom();
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    const resetZoom = () => {
        currentZoom = 0.6; // Reduced default zoom level
        updateZoom();
        if (lightboxContent) {
            lightboxContent.scrollLeft = 0;
            lightboxContent.scrollTop = 0;
        }
    };

    const updateZoom = () => {
        if (lightboxImg) {
            lightboxImg.style.transform = `scale(${currentZoom})`;
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (zoomInBtn) zoomInBtn.addEventListener('click', (e) => { e.stopPropagation(); currentZoom += 0.2; updateZoom(); });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', (e) => { e.stopPropagation(); currentZoom = Math.max(0.1, currentZoom - 0.2); updateZoom(); });
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', (e) => { e.stopPropagation(); resetZoom(); });

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target === lightboxContent) closeLightbox();
        });
    }

    if (lightboxContent) {
        lightboxContent.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX - lightboxContent.offsetLeft;
            startY = e.pageY - lightboxContent.offsetTop;
            scrollLeft = lightboxContent.scrollLeft;
            scrollTop = lightboxContent.scrollTop;
        });

        lightboxContent.addEventListener('mouseleave', () => { isDragging = false; });
        lightboxContent.addEventListener('mouseup', () => { isDragging = false; });

        lightboxContent.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - lightboxContent.offsetLeft;
            const y = e.pageY - lightboxContent.offsetTop;
            const walkX = (x - startX);
            const walkY = (y - startY);
            lightboxContent.scrollLeft = scrollLeft - walkX;
            lightboxContent.scrollTop = scrollTop - walkY;
        });
    }

    if (articleContentContainer) {
        articleContentContainer.addEventListener('click', (e) => {
            const container = e.target.closest('.zoom-image-container');
            if (container) {
                const img = container.querySelector('img');
                if (img) openLightbox(img.src);
            }
        });
    }

    // Initial Path Routing...
    if (typeof blogData !== 'undefined') {
        renderSidebarTree();

        // Handle initial path routing
        const initialPath = window.location.pathname.substring(1).replace(/\/$/, ''); // Get path minus leading/trailing slashes
        if (initialPath === '' || initialPath === 'home') {
            renderHome(false);
            setTimeout(() => {
                const activeLink = document.querySelector(`.post-link[data-id="home"]`);
                if (activeLink) activeLink.classList.add('active');
            }, 100);
        } else if (initialPath && blogData.some(p => p.id === initialPath)) {
            renderPost(initialPath, false);
            // Highlight active link after a short delay for tree to settle
            setTimeout(() => {
                const activeLink = document.querySelector(`.post-link[data-id="${initialPath}"]`);
                if (activeLink) activeLink.classList.add('active');
            }, 100);
        }
    } else {
        console.error("DATA CORE OFFLINE: data.js not found.");
        if (homeView) homeView.innerHTML = `<h2>ERROR</h2><p>Data.js not loaded.</p>`;
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (event) => {
        const postId = event.state ? event.state.postId : window.location.pathname.substring(1).replace(/\/$/, '');

        if (postId === '' || postId === 'home') {
            renderHome(false);
            document.querySelectorAll('.post-link').forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelector(`.post-link[data-id="home"]`);
            if (activeLink) activeLink.classList.add('active');
        } else if (postId && blogData.some(p => p.id === postId)) {
            renderPost(postId, false);
            document.querySelectorAll('.post-link').forEach(l => l.classList.remove('active'));
            const activeLink = document.querySelector(`.post-link[data-id="${postId}"]`);
            if (activeLink) activeLink.classList.add('active');
        } else {
            renderHome(false);
            document.querySelectorAll('.post-link').forEach(l => l.classList.remove('active'));
            if (outlineContainer) outlineContainer.style.display = 'none';
        }
    });
});
