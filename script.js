// Define the DOM elements
const filmsList = document.querySelector("#films");
const movieDetails = document.querySelector("#movie-details");
const poster = document.getElementById('poster');
const title = document.getElementById('title');
const runtime = document.getElementById('runtime');
const showtime = document.getElementById('showtime');
const availableTickets = document.getElementById('available-tickets');
const buyTicketButton = document.getElementById('buy-ticket');

// Fetch and display the list of films
function fetchFilms() {
  fetch('http://localhost:3000/films') // Update with your actual API endpoint
    .then(response => response.json())
    .then(data => {
      // Clear any previous films in the list
      filmsList.innerHTML = '';

      data.forEach(film => {
        const li = document.createElement('li');
        li.classList.add('film', 'item');
        li.textContent = film.title;
        li.dataset.id = film.id;

        // Add delete button to each film
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', (event) => {
          event.stopPropagation();  // Prevent the click event from firing
          deleteFilm(film.id, li);  // Pass li for removing from DOM directly
        });
        li.appendChild(deleteButton);

        // Add event listener for clicking a film to load its details
        li.addEventListener('click', () => loadMovieDetails(film.id));

        filmsList.appendChild(li);
      });
    })
    .catch(error => console.error('Error fetching films:', error));
}

// Load movie details when clicked on a film in the list
function loadMovieDetails(filmId) {
  fetch(`http://localhost:3000/films/${filmId}`) // Update with your actual API endpoint
    .then(response => response.json())
    .then(film => {
      title.textContent = film.title;
      runtime.textContent = `${film.runtime} mins`;
      showtime.textContent = `Showtime: ${film.showtime}`;
      availableTickets.textContent = `Tickets available: ${film.capacity - film.tickets_sold}`;
      poster.src = film.poster;

      // Enable or disable the "Buy Ticket" button based on available tickets
      buyTicketButton.disabled = film.capacity - film.tickets_sold === 0;
      buyTicketButton.textContent = film.capacity - film.tickets_sold === 0 ? "Sold Out" : "Buy Ticket";

      // Update the buy ticket button action
      buyTicketButton.onclick = () => buyTicket(film.id, film.tickets_sold, film.capacity);
    })
    .catch(error => console.error('Error loading movie details:', error));
}

// Buy ticket for the selected movie
function buyTicket(filmId, ticketsSold, capacity) {
  if (ticketsSold < capacity) {
    const newTicketsSold = ticketsSold + 1;

    fetch(`http://localhost:3000/films/${filmId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets_sold: newTicketsSold })
    })
      .then(response => response.json())
      .then(film => {
        loadMovieDetails(film.id);
        alert('Ticket purchased!');
      })
      .catch(error => console.error('Error purchasing ticket:', error));
  } else {
    alert('Sorry, this film is sold out.');
  }
}

// Delete a film from the server and the list
function deleteFilm(filmId, liElement) {
  fetch(`http://localhost:3000/films/${filmId}`, {
    method: 'DELETE'
  })
    .then(() => {
      liElement.remove();  // Remove film item from the DOM
      alert('Film deleted successfully!');
    })
    .catch(error => {
      console.error('Error deleting film:', error);
      alert('Failed to delete film.');
    });
}

// Load films on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchFilms();
});

