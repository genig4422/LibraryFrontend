// Function to fetch and display borrowed books
async function loadBorrowedBooks() {
    try {
        const response = await fetch('http://localhost:5196/api/Members/all-borrowed-books'); // Update with your API endpoint
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const borrowedBooks = await response.json();
        const borrowedBooksTable = document.getElementById("borrowedBooksTable");

        // Clear the current table data
        borrowedBooksTable.innerHTML = '';

        borrowedBooks.forEach(borrow => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${borrow.borrowId}</td>
                <td>${borrow.bookTitle}</td>
                <td>${borrow.member}</td>
                <td>${borrow.borrowDate}</td>
                <td>${borrow.returnDate}</td>
                <td>
                    <button class="btn btn-warning btn-sm" onclick="editBorrowedBook(${borrow.borrowId})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteBorrowedBook(${borrow.borrowId})">Delete</button>
                </td>
            `;

            borrowedBooksTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
    }
}

// Call the loadBorrowedBooks function on page load
document.addEventListener('DOMContentLoaded', loadBorrowedBooks);

// Function to handle form submission for adding a new borrowed book
document.getElementById('addBorrowedBookForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const bookTitle = document.getElementById('borrowedBook').value;
    const member = document.getElementById('borrowedMember').value;
    const borrowDate = document.getElementById('borrowedDate').value;
    const returnDate = document.getElementById('returnDate').value;

    const newBorrowedBook = {
        bookTitle,
        member,
        borrowDate,
        returnDate
    };

    try {
        const response = await fetch('http://localhost:5196/api/BorrowedBooks/add-borrowed-book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBorrowedBook)
        });

        if (!response.ok) throw new Error(`Error adding borrowed book: ${response.statusText}`);

        // Reload borrowed books after adding
        loadBorrowedBooks();

        // Clear the form and close the modal
        document.getElementById('addBorrowedBookForm').reset();
        const modal = bootstrap.Modal.getInstance(document.getElementById('addBorrowedBookModal'));
        modal.hide();
    } catch (error) {
        console.error('Error adding borrowed book:', error);
    }
});

// Function to delete a borrowed book entry
async function deleteBorrowedBook(borrowId) {
    try {
        const response = await fetch(`http://localhost:5196/api/BorrowedBooks/delete-borrowed-book/${borrowId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Error deleting borrowed book: ${response.statusText}`);

        // Reload borrowed books after deletion
        loadBorrowedBooks();
    } catch (error) {
        console.error('Error deleting borrowed book:', error);
    }
}

// Function to edit a borrowed book entry (optional)
function editBorrowedBook(borrowId) {
    console.log('Editing borrowed book with ID:', borrowId);
    // Implement edit functionality (e.g., pre-fill form and handle update)
}
