
// ===== GAME STATE ===== //
class MovieGuessGame {
    constructor() {
        // Game configuration
        this.secretMovie = '';
        this.attempts = 0;
        this.gameActive = false;
        this.guessHistory = [];
        this.currentTheme = 'dark';
        
        // DOM elements
        this.elements = {
            // Sections
            setupSection: document.getElementById('setup-section'),
            guessSection: document.getElementById('guess-section'),
            resultSection: document.getElementById('result-section'),
            
            // Setup elements
            setupForm: document.getElementById('setupForm'),
            movieInput: document.getElementById('movieInput'),
            startGameBtn: document.getElementById('startGameBtn'),
            
            // Guessing elements
            guessForm: document.getElementById('guessForm'),
            guessInput: document.getElementById('guessInput'),
            quitBtn: document.getElementById('quitBtn'),
            feedbackArea: document.getElementById('feedbackArea'),
            guessHistory: document.getElementById('guessHistory'),
            attemptCount: document.getElementById('attemptCount'),
            
            // Result elements
            resultIcon: document.getElementById('resultIcon'),
            resultMessage: document.getElementById('resultMessage'),
            movieReveal: document.getElementById('movieReveal'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            
            // Theme toggle
            themeToggle: document.getElementById('themeToggle')
        };
        
        // Initialize game
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupTheme();
        this.focusMovieInput();
    }
    
    bindEvents() {
        // Setup form submission
        this.elements.setupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        // Guess form submission
        this.elements.guessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGuess();
        });
        
        // Quit button
        this.elements.quitBtn.addEventListener('click', () => {
            this.quitGame();
        });
        
        // Play again button
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.resetGame();
        });
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Input focus effects
        this.elements.movieInput.addEventListener('focus', () => {
            this.elements.movieInput.parentElement.classList.add('focused');
        });
        
        this.elements.movieInput.addEventListener('blur', () => {
            this.elements.movieInput.parentElement.classList.remove('focused');
        });
        
        this.elements.guessInput.addEventListener('focus', () => {
            this.elements.guessInput.parentElement.classList.add('focused');
        });
        
        this.elements.guessInput.addEventListener('blur', () => {
            this.elements.guessInput.parentElement.classList.remove('focused');
        });
    }
    
    startGame() {
        const movieName = this.elements.movieInput.value.trim();
        
        // Validate input
        if (!movieName) {
            this.showToast('Please enter a movie name!', 'error');
            return;
        }
        
        if (movieName.length < 2) {
            this.showToast('Movie name must be at least 2 characters long!', 'error');
            return;
        }
        
        // Store the secret movie
        this.secretMovie = movieName;
        this.gameActive = true;
        this.attempts = 0;
        this.guessHistory = [];
        
        // Switch to guessing section
        this.switchSection('setup', 'guess');
        
        // Clear guess input and focus
        this.elements.guessInput.value = '';
        this.updateAttemptCount();
        this.clearHistory();
        this.clearFeedback();
        
        setTimeout(() => {
            this.focusGuessInput();
        }, 500);
        
        // Clear movie input for privacy
        this.elements.movieInput.value = '';
        
        this.showFeedback('🎬 Player 2, try to guess the movie!', 'info');
    }
    
    handleGuess() {
        if (!this.gameActive) return;
        
        const guess = this.elements.guessInput.value.trim();
        
        // Validate input
        if (!guess) {
            this.showFeedback('Please enter a movie guess!', 'error');
            return;
        }
        
        // Check for quit command
        if (guess.toLowerCase() === 'quit') {
            this.quitGame();
            return;
        }
        
        // Increment attempts
        this.attempts++;
        this.updateAttemptCount();
        
        // Check if guess is correct (case-insensitive)
        if (guess.toLowerCase() === this.secretMovie.toLowerCase()) {
            this.handleCorrectGuess(guess);
        } else {
            this.handleIncorrectGuess(guess);
        }
        
        // Clear input and refocus
        this.elements.guessInput.value = '';
        this.focusGuessInput();
    }
    
    handleCorrectGuess(guess) {
        this.gameActive = false;
        
        // Add to history
        this.addToHistory(guess, 'correct');
        
        // Show success feedback
        this.showFeedback(
            `🎉 Correct! "${this.secretMovie}" in ${this.attempts} attempt${this.attempts !== 1 ? 's' : ''}!`,
            'success'
        );
        
        // Switch to result section after delay
        setTimeout(() => {
            this.showResult('success');
        }, 2000);
        
        // Play success sound
        this.playSound('success');
    }
    
    handleIncorrectGuess(guess) {
        // Add to history
        this.addToHistory(guess, 'incorrect');
        
        // Show error feedback
        const encouragement = this.getEncouragement();
        this.showFeedback(`❌ "${guess}" is incorrect. ${encouragement}`, 'error');
        
        // Add shake animation to input
        this.elements.guessInput.classList.add('shake');
        setTimeout(() => {
            this.elements.guessInput.classList.remove('shake');
        }, 500);
        
        // Play error sound
        this.playSound('error');
    }
    
    quitGame() {
        this.gameActive = false;
        
        // Show quit feedback
        this.showFeedback(
            `👋 You gave up after ${this.attempts} attempt${this.attempts !== 1 ? 's' : ''}!`,
            'info'
        );
        
        // Switch to result section after delay
        setTimeout(() => {
            this.showResult('quit');
        }, 2000);
    }
    
    showResult(type) {
        // Set result content based on type
        if (type === 'success') {
            this.elements.resultIcon.textContent = '🎉';
            this.elements.resultMessage.textContent = 'Congratulations!';
            this.elements.resultMessage.className = 'text-success mb-4';
            this.elements.movieReveal.innerHTML = `
                <h4 class="text-success mb-2">🎬 You guessed it right!</h4>
                <p class="mb-2"><strong>Movie:</strong> ${this.secretMovie}</p>
                <p class="mb-0"><strong>Attempts:</strong> ${this.attempts}</p>
            `;
        } else if (type === 'quit') {
            this.elements.resultIcon.textContent = '👋';
            this.elements.resultMessage.textContent = 'Game Over';
            this.elements.resultMessage.className = 'text-warning mb-4';
            this.elements.movieReveal.innerHTML = `
                <h4 class="text-warning mb-2">You gave up!</h4>
                <p class="mb-2"><strong>The movie was:</strong> ${this.secretMovie}</p>
                <p class="mb-0"><strong>Attempts made:</strong> ${this.attempts}</p>
            `;
        }
        
        // Switch to result section
        this.switchSection('guess', 'result');
    }
    
    resetGame() {
        // Reset game state
        this.secretMovie = '';
        this.attempts = 0;
        this.gameActive = false;
        this.guessHistory = [];
        
        // Switch back to setup section
        this.switchSection('result', 'setup');
        
        // Clear all inputs and feedback
        this.elements.movieInput.value = '';
        this.elements.guessInput.value = '';
        this.clearFeedback();
        this.clearHistory();
        this.updateAttemptCount();
        
        // Focus movie input
        setTimeout(() => {
            this.focusMovieInput();
        }, 500);
    }
    
    switchSection(from, to) {
        const fromSection = document.getElementById(`${from}-section`);
        const toSection = document.getElementById(`${to}-section`);
        
        // Hide current section
        fromSection.classList.add('hiding');
        
        setTimeout(() => {
            fromSection.style.display = 'none';
            fromSection.classList.remove('hiding');
            
            // Show new section
            toSection.style.display = 'block';
            toSection.classList.add('showing');
            
            setTimeout(() => {
                toSection.classList.remove('showing');
            }, 300);
        }, 300);
    }
    
    addToHistory(guess, type) {
        const historyItem = {
            guess: guess,
            type: type,
            attempt: this.attempts
        };
        
        this.guessHistory.push(historyItem);
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        const historyContainer = this.elements.guessHistory;
        
        // Clear placeholder if exists
        if (historyContainer.children.length === 1 && 
            historyContainer.children[0].classList.contains('text-muted')) {
            historyContainer.innerHTML = '';
        }
        
        // Get latest history item
        const latestItem = this.guessHistory[this.guessHistory.length - 1];
        
        // Create history item element
        const historyElement = document.createElement('div');
        historyElement.className = `guess-item ${latestItem.type}`;
        
        const iconMap = {
            correct: '✅',
            incorrect: '❌'
        };
        
        historyElement.innerHTML = `
            <div>
                <span class="me-2">${iconMap[latestItem.type]}</span>
                <strong>${latestItem.guess}</strong>
            </div>
            <small class="text-muted">
                #${latestItem.attempt}
            </small>
        `;
        
        // Add to history container
        historyContainer.appendChild(historyElement);
        
        // Scroll to bottom
        historyContainer.scrollTop = historyContainer.scrollHeight;
    }
    
    showFeedback(message, type) {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `feedback-message feedback-${type}`;
        feedbackElement.innerHTML = message;
        
        // Clear previous feedback and add new
        this.elements.feedbackArea.innerHTML = '';
        this.elements.feedbackArea.appendChild(feedbackElement);
    }
    
    clearFeedback() {
        this.elements.feedbackArea.innerHTML = '';
    }
    
    clearHistory() {
        this.elements.guessHistory.innerHTML = '<p class="text-muted text-center">Your guesses will appear here...</p>';
    }
    
    updateAttemptCount() {
        this.elements.attemptCount.textContent = this.attempts;
    }
    
    focusMovieInput() {
        setTimeout(() => {
            this.elements.movieInput.focus();
        }, 100);
    }
    
    focusGuessInput() {
        if (this.gameActive) {
            setTimeout(() => {
                this.elements.guessInput.focus();
            }, 100);
        }
    }
    
    getEncouragement() {
        const encouragements = [
            "Try again!",
            "Keep guessing!",
            "You can do it!",
            "Think of another movie!",
            "Don't give up!",
            "One more try!",
            "Almost there!",
            "Keep thinking!"
        ];
        return encouragements[Math.floor(Math.random() * encouragements.length)];
    }
    
    setupTheme() {
        // Check for saved theme
        const savedTheme = localStorage.getItem('movieGameTheme') || 'dark';
        this.setTheme(savedTheme);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('movieGameTheme', theme);
        
        // Update theme toggle icon
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    }
    
    showToast(message, type) {
        // Simple toast implementation
        const toast = document.createElement('div');
        toast.className = `position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }
    
    playSound(type) {
        // Simple sound feedback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const frequency = type === 'success' ? 800 : 400;
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            // Silently fail if audio context is not supported
            console.log('Audio feedback not available');
        }
    }
}

// ===== UTILITY FUNCTIONS ===== //
function shareGame() {
    if (navigator.share) {
        navigator.share({
            title: '🎬 Guess the Movie - Two Player Game',
            text: 'Check out this fun two-player movie guessing game!',
            url: window.location.href
        }).catch(console.error);
    } else {
        // Fallback for browsers that don't support Web Share API
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            alert('Game URL copied to clipboard!');
        }).catch(() => {
            prompt('Copy this URL to share the game:', url);
        });
    }
}

// ===== INITIALIZE GAME ===== //
document.addEventListener('DOMContentLoaded', () => {
    window.movieGame = new MovieGuessGame();
});

// ===== KEYBOARD SHORTCUTS ===== //
document.addEventListener('keydown', (e) => {
    // Escape to focus current input
    if (e.key === 'Escape' && window.movieGame) {
        const setupVisible = window.movieGame.elements.setupSection.style.display !== 'none';
        const guessVisible = window.movieGame.elements.guessSection.style.display !== 'none';
        
        if (setupVisible) {
            window.movieGame.focusMovieInput();
        } else if (guessVisible && window.movieGame.gameActive) {
            window.movieGame.focusGuessInput();
        }
    }
    
    // Enter to submit forms (backup)
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        const form = e.target.closest('form');
        if (form) {
            e.preventDefault();
            form.dispatchEvent(new Event('submit'));
        }
    }
});

// ===== ERROR HANDLING ===== //
window.addEventListener('error', (e) => {
    console.error('Game Error:', e.error);
});

// ===== PERFORMANCE OPTIMIZATION ===== //
// Lazy load animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.fade-in');
    animatedElements.forEach(el => observer.observe(el));
});
