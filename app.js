const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchType = document.getElementById('search-type'); 
const resultsDiv = document.getElementById('results');
const loadMoreButton = document.getElementById('load-more'); 

let isSearching = false;
let currentPage = 1; 
let currentQuery = ''; 
let currentType = ''; 
let totalResults = 0; 


searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (isSearching) return;

    const query = searchInput.value.trim();
    const type = searchType.value;

    if (!query) return;

    
    currentQuery = query;
    currentType = type;
    currentPage = 1; 
    resultsDiv.innerHTML = ''; 
    await fetchResults(); 
});


loadMoreButton.addEventListener('click', async () => {
    if (isSearching) return;
    currentPage++; 
    await fetchResults(); 
});

async function fetchResults() {
    isSearching = true;
    const url = `https://openlibrary.org/search.json?${currentType}=${encodeURIComponent(
        currentQuery
    )}&page=${currentPage}`; 

    try {
        
        if (currentPage === 1) {
            resultsDiv.innerHTML = '<center><p style="color: white;">Cargando...</p></center>';
        }
        loadMoreButton.style.display = 'none'; 

        const response = await fetch(url);
        const data = await response.json();
        totalResults = data.num_found; 
        displayResults(data.docs, totalResults);
    } catch (error) {
        resultsDiv.innerHTML = '<p>Ocurrió un error al buscar. Por favor, intenta de nuevo.</p>';
        console.error(error);
    } finally {
        isSearching = false;
    }
}

function displayResults(books, total) {
    resultsDiv.innerHTML = '';

    
    const searchCount = document.getElementById('search-count');
    searchCount.textContent = `Se encontraron ${total} libros`;

    if (books.length === 0) {
        resultsDiv.innerHTML = '<p>No se encontraron libros</p>';
        return;
    }

    books.forEach((book) => {
        const coverUrl = book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
            : './nofnd.png';

        const container = document.createElement('div');
        container.classList.add('book-container');

        container.innerHTML = `
            <img src="${coverUrl}" alt="Portada de ${book.title}" class="book-cover" />
            <h3 class="book-title">${book.title}</h3>
            <p class="book-author"><strong>Autor:</strong> ${book.author_name ? book.author_name.join(', ') : 'Desconocido'}</p>
            <p class="book-year"><strong>Año:</strong> ${book.first_publish_year || 'Desconocido'}</p>
        `;

        resultsDiv.appendChild(container);
    });

    
    createPagination(total);
}


function createPagination(total) {
    const totalPages = Math.ceil(total / 100); 

    const paginationContainer = document.createElement('div');
    paginationContainer.classList.add('pagination');

    
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.addEventListener('click', () => {
            currentPage--;
            fetchResults(); 
        });
        paginationContainer.appendChild(prevButton);
    }

    
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.addEventListener('click', () => {
            currentPage++;
            fetchResults(); 
        });
        paginationContainer.appendChild(nextButton);
    }

    resultsDiv.appendChild(paginationContainer);
}
