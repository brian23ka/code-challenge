document.addEventListener("DOMContentLoaded", () => {
    const filmsList = document.getElementById("films");
    const movieTitle = document.getElementById("movie-title");
    const moviePoster = document.getElementById("movie-poster");
    const movieRuntime = document.getElementById("movie-runtime");
    const movieShowtime = document.getElementById("movie-showtime");
    const movieTickets = document.getElementById("movie-tickets");
    const buyTicketBtn = document.getElementById("buy-ticket");

    const baseUrl = "http://localhost:3000/films";
    const ticketsUrl = "http://localhost:3000/tickets";

    // Fetch all movies and populate the list
    fetch(baseUrl)
        .then(response => response.json())
        .then(movies => {
            movies.forEach(movie => addMovieToList(movie));
            if (movies.length > 0) {
                displayMovieDetails(movies[0]);
            }
        });

    function addMovieToList(movie) {
        const li = document.createElement("li");
        li.textContent = movie.title;
        li.classList.add("film", "item");

        if (movie.capacity - movie.tickets_sold === 0) {
            li.classList.add("sold-out"); // Apply sold-out class initially
        }

        li.addEventListener("click", () => displayMovieDetails(movie));
        
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.style.opacity = "0.5"; // Initially faded
        deleteBtn.addEventListener("mouseover", () => deleteBtn.style.opacity = "1");
        deleteBtn.addEventListener("mouseout", () => deleteBtn.style.opacity = "0.5");
        deleteBtn.addEventListener("click", (event) => {
            event.stopPropagation(); // Prevent triggering movie selection
            deleteMovie(movie.id, li);
        });
        
        li.appendChild(deleteBtn);
        filmsList.appendChild(li);
    }

    function displayMovieDetails(movie) {
        movieTitle.textContent = movie.title;
        moviePoster.src = movie.poster;
        movieRuntime.textContent = movie.runtime;
        movieShowtime.textContent = movie.showtime;
        updateTickets(movie);
        
        buyTicketBtn.onclick = (event) => {
            event.preventDefault();
            buyTicket(movie);
        };
    }

    function updateTickets(movie) {
        const availableTickets = movie.capacity - movie.tickets_sold;
        movieTickets.textContent = availableTickets;

        const movieListItem = [...filmsList.children].find(li => li.textContent.includes(movie.title));

        if (availableTickets === 0) {
            buyTicketBtn.textContent = "Sold Out";
            buyTicketBtn.disabled = true;

            if (movieListItem) {
                movieListItem.classList.add("sold-out");
            }
        } else {
            buyTicketBtn.textContent = "Buy Ticket";
            buyTicketBtn.disabled = false;

            if (movieListItem) {
                movieListItem.classList.remove("sold-out");
            }
        }
    }

    function buyTicket(movie) {
        const availableTickets = movie.capacity - movie.tickets_sold;
        
        if (availableTickets > 0) {
            movie.tickets_sold++;
            updateTickets(movie);
            
            fetch(`${baseUrl}/${movie.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tickets_sold: movie.tickets_sold })
            })
            .then(response => response.json())
            .then(updatedMovie => {
                console.log("Updated tickets sold:", updatedMovie.tickets_sold);
                
                // Post new ticket purchase to the server
                fetch(ticketsUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ film_id: movie.id, number_of_tickets: 1 })
                })
                .then(response => response.json())
                .then(ticket => {
                    console.log("New ticket purchase recorded:", ticket);
                })
                .catch(error => console.error("Error posting ticket purchase:", error));
            })
            .catch(error => console.error("Error updating tickets:", error));
        }
    }

    function deleteMovie(movieId, listItem) {
        fetch(`${baseUrl}/${movieId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            if (response.ok) {
                listItem.remove();
                console.log("Movie deleted successfully");
            } else {
                console.error("Failed to delete movie");
            }
        })
        .catch(error => console.error("Error deleting movie:", error));
    }
});

