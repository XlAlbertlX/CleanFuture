const target = document.querySelector('.our-stats__item');
let anim_toggle = true;
const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && anim_toggle) {
            anim_toggle = false;
            let plastic = document.querySelector('#plastic');
            let glass = document.querySelector('#glass');
            let paper = document.querySelector('#paper');
            let iron = document.querySelector('#iron');

            setTimeout(() => {
                anime({
                    targets: plastic,
                    innerHTML: [0, 200],
                    easing: 'easeInOutCubic',
                    round: 1,
                    duration: 2000
                });
                anime({
                    targets: glass,
                    innerHTML: [0, 345],
                    easing: 'easeInOutCubic',
                    round: 1,
                    duration: 2000
                });
                anime({
                    targets: paper,
                    innerHTML: [0, 600],
                    easing: 'easeInOutCubic',
                    round: 1,
                    duration: 2000
                });
                anime({
                    targets: iron,
                    innerHTML: [0, 228],
                    easing: 'easeInOutCubic',
                    round: 1,
                    duration: 2000
                });
            }, 200);

        }
    });
});

observer.observe(target);