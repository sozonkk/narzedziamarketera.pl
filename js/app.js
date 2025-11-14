// ========================================
// STATE & DATA
// ========================================

let allTools = [];
let filteredTools = [];

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadTools();
    setupEventListeners();
    renderTools();
});

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

    card.innerHTML = `
        <span class="tool-icon">${tool.icon}</span>
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

    // Populate modal
    document.getElementById('modalIcon').textContent = tool.icon;
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
// GLOBAL FUNCTIONS (for HTML onclick)
// ========================================

window.closeModal = closeModal;
window.resetFilters = resetFilters;
