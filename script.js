// Animate the drawing of paths in the graphs
document.addEventListener("DOMContentLoaded", () => {
    const paths = document.querySelectorAll('.waveform');
    
    paths.forEach(path => {
        const length = path.getTotalLength();
        
        // Clear any previous transition
        path.style.transition = 'none';
        
        // Setup starting position
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = length;
        
        // Trigger reflow
        path.getBoundingClientRect();
        
        // Setup transition
        path.style.transition = 'stroke-dashoffset 2s ease-in-out';
        path.style.strokeDashoffset = '0';
    });

    // Make the interactive hover panel trigger some effects
    const gimbalHover = document.querySelector('.interactive-hover');
    if (gimbalHover) {
        gimbalHover.addEventListener('mouseover', () => {
            const innerElements = gimbalHover.querySelectorAll('ellipse, circle, rect');
            innerElements.forEach(el => {
                if(el.getAttribute('stroke')) {
                    el.style.filter = `drop-shadow(0 0 5px ${el.getAttribute('stroke')})`;
                }
            });
        });

        gimbalHover.addEventListener('mouseout', () => {
            const innerElements = gimbalHover.querySelectorAll('ellipse, circle, rect');
            innerElements.forEach(el => {
                el.style.filter = 'none';
            });
        });
    }

    // Interactive Hub Callout Glow Toggle
    const callouts = document.querySelectorAll('.callout');
    setInterval(() => {
        callouts.forEach(callout => {
            const textEl = callout.querySelector('.glow-text');
            if(textEl) {
                const currentBorder = textEl.style.borderColor;
                textEl.style.boxShadow = `0 0 10px ${currentBorder}, inset 0 0 5px ${currentBorder}`;
                
                setTimeout(() => {
                    textEl.style.boxShadow = 'none';
                }, 1000);
            }
        });
    }, 2000);
});
