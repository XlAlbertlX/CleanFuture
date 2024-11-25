let akkordions = document.querySelectorAll('.questions__accordion');
akkordions.forEach(function (accordion) {
    accordion.addEventListener('click', function(event) {
        if (event.target.classList.contains('questions__question') || event.target.classList.contains('questions__title') || event.target.classList.contains('questions__button')) {
            this.querySelector('.questions__answer').classList.toggle('visible');
            this.querySelector('.questions__button').classList.toggle('visible');
        }
    });
});