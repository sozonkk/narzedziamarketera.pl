// ========================================
// STATE & DATA
// ========================================

let allTools = [];
let filteredTools = [];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await loadTools();
    setupEventListeners();
    setupScrollListener();
    renderTools();
    initTypewriterEffect();
});

// ========================================
// THEME MANAGEMENT
// ========================================

function initTheme() {
    // Load theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ========================================
// SCROLL MANAGEMENT
// ========================================

function setupScrollListener() {
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ========================================
// LOAD TOOLS FROM JSON
// ========================================

async function loadTools() {
    try {
        const response = await fetch('data/tools.json');
        const data = await response.json();
        allTools = data.tools;
        filteredTools = [...allTools];
    } catch (error) {
        console.error('Error loading tools:', error);
        showError();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', toggleTheme);

    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Filters
    document.getElementById('categoryFilter').addEventListener('change', applyFilters);
    document.getElementById('pricingFilter').addEventListener('change', applyFilters);
    document.getElementById('levelFilter').addEventListener('change', applyFilters);

    // Modal close on overlay click
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') {
            closeModal();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// ========================================
// FILTERING
// ========================================

function handleSearch(e) {
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const pricingFilter = document.getElementById('pricingFilter').value;
    const levelFilter = document.getElementById('levelFilter').value;

    filteredTools = allTools.filter(tool => {
        // Search filter
        const matchesSearch = tool.name.toLowerCase().includes(searchTerm) ||
                            tool.description.toLowerCase().includes(searchTerm) ||
                            tool.shortDescription.toLowerCase().includes(searchTerm);

        // Category filter
        const matchesCategory = !categoryFilter || tool.category === categoryFilter;

        // Pricing filter
        const matchesPricing = !pricingFilter || tool.pricing === pricingFilter;

        // Level filter
        const matchesLevel = !levelFilter || tool.level === levelFilter;

        return matchesSearch && matchesCategory && matchesPricing && matchesLevel;
    });

    renderTools();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('pricingFilter').value = '';
    document.getElementById('levelFilter').value = '';
    applyFilters();
}

// ========================================
// RENDERING
// ========================================

function renderTools() {
    const toolsGrid = document.getElementById('toolsGrid');
    const toolsCount = document.getElementById('toolsCount');
    const noResults = document.getElementById('noResults');

    // Update count
    toolsCount.textContent = filteredTools.length;

    // Clear grid
    toolsGrid.innerHTML = '';

    // Show/hide no results message
    if (filteredTools.length === 0) {
        noResults.style.display = 'block';
        return;
    } else {
        noResults.style.display = 'none';
    }

    // Render tool cards
    filteredTools.forEach(tool => {
        const card = createToolCard(tool);
        toolsGrid.appendChild(card);
    });
}

function createToolCard(tool) {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.onclick = () => openModal(tool);

    const logoUrl = getLogoUrl(tool);
    const iconHtml = logoUrl
        ? `<img src="${logoUrl}" alt="${tool.name} logo" class="tool-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
           <span class="tool-icon" style="display:none; font-size:3rem;">${tool.icon}</span>`
        : `<span class="tool-icon" style="font-size:3rem;">${tool.icon}</span>`;

    card.innerHTML = `
        ${iconHtml}
        <h3 class="tool-name">${tool.name}</h3>
        <p class="tool-description">${tool.shortDescription}</p>
        <div class="tool-badges">
            <span class="badge badge-category">${tool.category}</span>
            <span class="badge badge-pricing">${tool.pricing}</span>
            <span class="badge badge-level">${tool.level}</span>
        </div>
    `;

    return card;
}

// ========================================
// MODAL
// ========================================

function openModal(tool) {
    const overlay = document.getElementById('modalOverlay');

    // Populate modal icon (logo or emoji)
    const modalIcon = document.getElementById('modalIcon');
    const logoUrl = getLogoUrl(tool);

    if (logoUrl) {
        modalIcon.innerHTML = `<img src="${logoUrl}" alt="${tool.name} logo" style="width:64px;height:64px;object-fit:contain;border-radius:12px;" onerror="this.parentElement.textContent='${tool.icon}'">`;
    } else {
        modalIcon.textContent = tool.icon;
        modalIcon.style.fontSize = '4rem';
    }

    document.getElementById('modalTitle').textContent = tool.name;
    document.getElementById('modalCategory').textContent = tool.category;
    document.getElementById('modalPricing').textContent = tool.pricing;
    document.getElementById('modalLevel').textContent = tool.level;
    document.getElementById('modalDescription').textContent = tool.description;
    document.getElementById('modalTarget').textContent = tool.targetAudience;
    document.getElementById('modalPrice').textContent = tool.priceDetails;
    document.getElementById('modalBestFor').textContent = tool.bestFor;

    // Format "How to start" as a list
    const howToStart = tool.howToStart.split('\n').map(step => {
        return `<p>${step}</p>`;
    }).join('');
    document.getElementById('modalHowToStart').innerHTML = howToStart;

    // Set link
    document.getElementById('modalLink').href = tool.url;

    // Show modal
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ========================================
// UTILITIES
// ========================================

function getLogoUrl(tool) {
    // Extract domain from URL
    try {
        const url = new URL(tool.url);
        const domain = url.hostname.replace('www.', '');
        return `https://logo.clearbit.com/${domain}`;
    } catch (e) {
        // Fallback to emoji if URL parsing fails
        return null;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError() {
    const toolsGrid = document.getElementById('toolsGrid');
    toolsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <h3 style="color: #ef4444; margin-bottom: 1rem;">Błąd ładowania danych</h3>
            <p style="color: #a3a3a3;">Nie udało się załadować narzędzi. Odśwież stronę.</p>
        </div>
    `;
}

// ========================================
// TYPEWRITER EFFECT
// ========================================

function initTypewriterEffect() {
    const searchInput = document.getElementById('searchInput');
    const toolNames = [
        'Mailchimp',
        'Google Analytics',
        'Canva',
        'SEMrush',
        'HubSpot',
        'Buffer',
        'Ahrefs',
        'Zapier',
        'ConvertKit',
        'Hotjar'
    ];

    let currentToolIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let isPaused = false;

    function type() {
        const currentTool = toolNames[currentToolIndex];

        if (isPaused) {
            setTimeout(type, 2000); // Pause for 2 seconds
            isPaused = false;
            return;
        }

        if (isDeleting) {
            currentCharIndex--;
            searchInput.setAttribute('placeholder', currentTool.substring(0, currentCharIndex));

            if (currentCharIndex === 0) {
                isDeleting = false;
                currentToolIndex = (currentToolIndex + 1) % toolNames.length;
                setTimeout(type, 500); // Pause before typing next word
                return;
            }
        } else {
            currentCharIndex++;
            searchInput.setAttribute('placeholder', currentTool.substring(0, currentCharIndex));

            if (currentCharIndex === currentTool.length) {
                isDeleting = true;
                isPaused = true;
                setTimeout(type, 2000); // Pause when word is complete
                return;
            }
        }

        const speed = isDeleting ? 50 : 100;
        setTimeout(type, speed);
    }

    // Start the effect
    type();
}

// ========================================
// GLOBAL FUNCTIONS (for HTML onclick)
// ========================================

window.closeModal = closeModal;
window.resetFilters = resetFilters;
