
let img = document.getElementById('avtomat');
let circle = document.getElementById('circle');
img.addEventListener("mouseenter", function() {
    anime({
        targets: '#avtomat', // селектор твоего элемента
        translateX: function() {
            return anime.random(0, 30); // аnime.js сам сгенерит случайное число от 0 до 50
        },
        translateY: function() {
            return anime.random(0, 30); // аnime.js сам сгенерит случайное число от 0 до 50
        }
    })});
img.addEventListener("mouseleave", function() {
    anime({
        targets: '#avtomat', // селектор твоего элемента
        translateX: function() {
            return anime.random(0, 30); // аnime.js сам сгенерит случайное число от 0 до 50
        },
        translateY: function() {
            return anime.random(0, 30); // аnime.js сам сгенерит случайное число от 0 до 50
        }
    })});
circle.addEventListener("mouseenter", function() {
    anime({
        targets: '#circle', // селектор твоего элемента
        translateX: function() {
            return anime.random(0, 5); // аnime.js сам сгенерит случайное число от 0 до 50
        },
        translateY: function() {
            return anime.random(0, 5); // аnime.js сам сгенерит случайное число от 0 до 50
        }
    })});
circle.addEventListener("mouseleave", function() {
    anime({
        targets: '#acircle', // селектор твоего элемента
        translateX: function() {
            return anime.random(0, 5); // аnime.js сам сгенерит случайное число от 0 до 50
        },
        translateY: function() {
            return anime.random(0, 5); // аnime.js сам сгенерит случайное число от 0 до 50
        }
    })});