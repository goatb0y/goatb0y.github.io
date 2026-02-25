document.addEventListener('DOMContentLoaded', () => {
    console.log('LCARS Terminal Online...');

    // Typewriter effect for sections
    const typeWriter = (elements) => {
        elements.forEach(el => {
            const text = el.innerText;
            el.innerText = '';
            let i = 0;
            const speed = 30;

            const type = () => {
                if (i < text.length) {
                    el.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            };
            type();
        });
    };

    // Initialize typewriter for intro text
    const textBlocks = document.querySelectorAll('.lcars-text-block p');
    // typeWriter(textBlocks); // Uncomment if you want the typing effect on load
});
