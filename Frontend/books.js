
        // Fetch and display books data
        async function loadBooks() {
            try {
                const response = await fetch('http://localhost:5196/api/Books/get-all-books'); // Replace with your API endpoint
        
                // Check if the response is OK
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                const books = await response.json();
                const booksTable = document.getElementById('booksTable');
        
                // Populate table with books data
                booksTable.innerHTML = books.map(book => `
                    <tr>
                        <td>${book.title || 'N/A'}</td>
                      
                        <td>${book.authorNames || 'N/A'}</td>
                        <td>${book.publisherName || 'N/A'}</td>
                        <td>${book.isbn || 'N/A'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editBook(${book.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error loading books:', error);
                alert('Failed to load books. Please try again later.');
            }
        }
        // Fetch Publishers, Categories, and Authors when the modal is shown
        const fetchDropdownData = async () => {
            try {
              // Fetch data from API endpoints (replace URLs with actual API endpoints)
              const publishersResponse = await fetch('http://localhost:5196/api/Publisher/get-all-publishers');
              const publishers = await publishersResponse.json();
        
             
              const authorsResponse = await fetch('http://localhost:5196/api/Author/get-all-authors');
              const authors = await authorsResponse.json();
        
              // Populate the publisher dropdown
              const publisherSelect = document.getElementById('bookPublisher');
              publishers.forEach(publisher => {
                const option = document.createElement('option');
                option.value = publisher.id;
                option.textContent = publisher.name;
                publisherSelect.appendChild(option);
              });
        
              
        
              // Populate the author dropdown
              const authorSelect = document.getElementById('bookAuthor');
              authors.forEach(author => {
                const option = document.createElement('option');
                option.value = author.id;
                option.textContent = author.name;
                authorSelect.appendChild(option);
              });
            } catch (error) {
              console.error('Error fetching data:', error);
              alert('Failed to load dropdown data.');
            }
          };
        
          // Trigger fetch when modal is opened
          const addBookModal = document.getElementById('addBookModal');
          addBookModal.addEventListener('show.bs.modal', fetchDropdownData);
        
          // Function to handle form submission and send data to API
          function submitBook() {
            const bookTitle = document.getElementById('bookTitle').value;
            const bookISBN = document.getElementById('bookISBN').value;
            const bookPublisher = document.getElementById('bookPublisher').value;
           
            const bookAuthor = document.getElementById('bookAuthor').value;
        
            if (!bookTitle || !bookISBN || !bookPublisher ||  !bookAuthor) {
              alert('Please fill in all fields.');
              return;
            }
        
            // Prepare the book data
            const bookData = {
              title: bookTitle,
              isbn: bookISBN,
              publisherId: bookPublisher,
              authorId: bookAuthor
            };
        
            // Make the API request to add the book
            fetch('http://localhost:5196/api/Books/add-book-with-authors', {
              method: 'POST', // Specify the request method
              headers: {
                'Content-Type': 'application/json', // Tell the server we're sending JSON data
              },
              body: JSON.stringify(bookData) // Convert the book data to a JSON string
            })
            .then(response => {
              if (response.ok) {
                return response.json();
              }
              throw new Error('Failed to add book');
            })
            .then(data => {
              console.log('Book added successfully:', data);
        
              // Close modal
              var modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
              modal.hide();
        
              // Clear the form
              document.getElementById('addBookForm').reset();
        
              // Optionally, you can show a success message or update the UI to reflect the added book
              alert('Book added successfully!');
            })
            .catch(error => {
              console.error('Error adding book:', error);
              alert('Error adding book. Please try again.');
            });
          }
        
        let currentBookId = null;
        
        // Function to open modal and load book data
async function editBook(bookId) {
    currentBookId = bookId; // Store book ID for update

    try {
        const response = await fetch(`http://localhost:5196/api/Books/get-book-by-id/${bookId}`);
        if (!response.ok) throw new Error("Failed to fetch book data.");

        const book = await response.json();

        // Populate form fields with book data
        document.getElementById("editBookId").value = book.id;
        document.getElementById("editTitle").value = book.title || "";
        document.getElementById("editISBN").value = book.isbn || "";
        document.getElementById("editAuthorIds").value = book.authorIds ? book.authorIds.join(", ") : "";

        // Load publishers and set the selected publisher
        await loadEditFormDropdowns(book.publisherId);

        // Show modal
        const editModal = new bootstrap.Modal(document.getElementById("editBookModal"));
        editModal.show();
    } catch (error) {
        console.error("Error loading book:", error);
    }
}

// Function to load publishers in the edit form
async function loadEditFormDropdowns(selectedPublisher) {
    const publisherSelect = document.getElementById("editPublisherId");
    publisherSelect.innerHTML = '<option value="">Select Publisher</option>'; // Reset options

    try {
        const publishersResponse = await fetch("http://localhost:5196/api/Publisher/get-all-publishers");
        if (!publishersResponse.ok) throw new Error("Failed to fetch publishers");

        const publishers = await publishersResponse.json();

        publishers.forEach(publisher => {
            const isSelected = selectedPublisher && publisher.id == selectedPublisher ? "selected" : "";
            publisherSelect.innerHTML += `<option value="${publisher.id}" ${isSelected}>${publisher.name}</option>`;
        });
    } catch (error) {
        console.error("Error loading dropdowns:", error);
    }
}

// Function to update book
document.getElementById("editBookForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const updatedBook = {
        title: document.getElementById("editTitle").value,
        isbn: parseInt(document.getElementById("editISBN").value),
        publisherId: parseInt(document.getElementById("editPublisherId").value),
        authorIds: document.getElementById("editAuthorIds").value.split(",").map(id => parseInt(id.trim())),
    };

    try {
        const response = await fetch(`http://localhost:5196/api/Books/update-book-by-id/${currentBookId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBook)
        });

        if (response.ok) {
            showToast("Book updated successfully!", "success");
            new bootstrap.Modal(document.getElementById("editBookModal")).hide();
            loadBooks(); // Refresh book list
        } else {
            showToast("Failed to update book.", "danger");
        }
    } catch (error) {
        console.error("Error updating book:", error);
        showToast("Error updating book.", "danger");
    }
});
        // Function to update book
        document.getElementById("editBookForm").addEventListener("submit", async function (event) {
            event.preventDefault();
            
            const updatedBook = {
                title: document.getElementById("editTitle").value,
                isbn: parseInt(document.getElementById("editISBN").value),
                publisherId: parseInt(document.getElementById("editPublisherId").value),
                categoryId: parseInt(document.getElementById("editCategoryId").value),
                authorIds: parseInt(document.getElementById("editAuthorIds").value),
            };
        
            try {
                const response = await fetch(`http://localhost:5196/api/Books/update-book-by-id/${currentBookId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(updatedBook)
                });
        
                if (response.ok) {
                    showToast("Book updated successfully!", "success");
                    new bootstrap.Modal(document.getElementById("editBookModal")).hide();
                    loadBooks(); // Refresh book list
                } else {
                    showToast("Failed to update book.", "danger");
                }
            } catch (error) {
                console.error("Error updating book:", error);
                showToast("Error updating book.", "danger");
            }
        });
        
        // Function to show toast message
        function showToast(message, type) {
            const toastEl = document.getElementById("updateToast");
            const toastBody = document.getElementById("toastMessage");
        
            toastEl.classList.remove("bg-success", "bg-danger");
            toastEl.classList.add(type === "success" ? "bg-success" : "bg-danger");
            
            toastBody.textContent = message;
            new bootstrap.Toast(toastEl).show();
        }
               
        
        async function loadFilters() {
            try {
               
                const publishersResponse = await fetch('http://localhost:5196/api/Publisher/get-all-publishers');
        
        
                const publishers = await publishersResponse.json();
        
               
                const publisherSelect = document.getElementById('filterPublisher');
        
               
                publisherSelect.innerHTML = `<option value="">Filter by Publisher</option>`;
        
              
        
                publishers.forEach(publisher => {
                    publisherSelect.innerHTML += `<option value="${publisher.id}">${publisher.name}</option>`;
                });
        
            } catch (error) {
                console.error("Error loading filters:", error);
                alert("Failed to load  publishers.");
            }
        }
        
        // Global variable to hold books data
        let books = [];
        
        // Fetch and display books data
        async function loadBooks() {
            try {
                const response = await fetch('http://localhost:5196/api/Books/get-all-books'); // Replace with your API endpoint
        
                // Check if the response is OK
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
        
                books = await response.json(); // Assign fetched data to the global `books` variable
                const booksTable = document.getElementById('booksTable');
        
                // Populate table with books data
                booksTable.innerHTML = books.map(book => `
                    <tr>
                        <td>${book.title || 'N/A'}</td>
                        <td>${book.authorNames || 'N/A'}</td>
                        <td>${book.publisherName || 'N/A'}</td>
                        <td>${book.isbn || 'N/A'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm" onclick="editBook(${book.id})">Edit</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
                        </td>
                    </tr>
                `).join('');
            } catch (error) {
                console.error('Error loading books:', error);
                alert('Failed to load books. Please try again later.');
            }
        }
        
        // Function to handle the search functionality
        // Function to handle the search functionality
        function searchBooks() {
            const searchQuery = document.getElementById('searchBar').value.toLowerCase();
        
            const filteredBooks = books.filter(book => {
                return (
                    book.title.toLowerCase().includes(searchQuery) ||
                    String(book.authorNames).toLowerCase().includes(searchQuery) || // Ensure authorNames is a string
                    String(book.publisherName).toLowerCase().includes(searchQuery)  // Ensure publisherName is a string
                );
            });
        
            displayBooks(filteredBooks);
        }
        
        // Attach the search function to the search input field
        document.getElementById('searchBar').addEventListener('input', searchBooks);
        
        // Function to handle filter functionality
        function filterBooks() {
            const selectedPublisherId = document.getElementById('filterPublisher').value;
        
            const filteredBooks = books.filter(book => {
                return !selectedPublisherId || book.publisherId == selectedPublisherId;
            });
        
            displayBooks(filteredBooks);
        }
        
        // Attach the filter function to the filter dropdown
        document.getElementById('filterPublisher').addEventListener('change', filterBooks);
        
        function displayBooks(filteredBooks) {
            const booksTable = document.getElementById('booksTable');
            booksTable.innerHTML = filteredBooks.map(book => `
                <tr>
                    <td>${book.title || 'N/A'}</td>
                    <td>${book.authorNames || 'N/A'}</td>
                    <td>${book.publisherName || 'N/A'}</td>
                    <td>${book.isbn || 'N/A'}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editBook(${book.id})">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteBook(${book.id})">Delete</button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Initialize page
        loadBooks();
        loadFilters();
        
                
        
                async function deleteBook(bookId) {
                    if (confirm('Are you sure you want to delete this book?')) {
                        await fetch(`http://localhost:5196/api/Books/delete-book-by-id/${bookId}`, { method: 'DELETE' });
                        loadBooks(); // Refresh books list
                    }
                }
        
                // Initialize page
                loadBooks();
                loadFilters();