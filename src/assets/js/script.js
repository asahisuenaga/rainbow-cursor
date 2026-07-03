(function () {
    if (window.rainbowCursorLoaded) {
        return;
    }
    window.rainbowCursorLoaded = true;

    const cache = {
        cursorElements: null,
        lastStorageCheck: 0,
        storageCache: {},
        timeTracker: null,
        visibilityHandler: null
    };

    function debouncedStorageGet(keys, callback, delay = 100) {
        const cacheKey = Array.isArray(keys) ? keys.join(',') : keys;
        const now = Date.now();

        if (cache.storageCache[cacheKey] && (now - cache.lastStorageCheck) < delay) {
            callback(cache.storageCache[cacheKey]);
            return;
        }

        cache.lastStorageCheck = now;
        chrome.storage.sync.get(keys, (result) => {
            cache.storageCache[cacheKey] = result;
            callback(result);
        });
    }

    function rgbToArray(rgb) {
        return rgb.match(/\d+/g).map(Number);
    }

    function adjustColor(color, amount) {
        return `rgb(${color.map(value => Math.min(255, Math.max(0, value + amount))).join(', ')})`;
    }

    function normalizeStoredBoolean(value, defaultValue = false, invertString = false) {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'string') {
            const boolValue = value.toLowerCase() === 'true';
            return invertString ? !boolValue : boolValue;
        }
        return Boolean(value);
    }

    function buildGradientBackground(colorScheme = 'multicolor', applyTranslucent = true, gradientType = 'linear', borderColorArray = [0, 0, 0]) {
        const gradientStyles = {
            rainbow: ['#ff69b4', '#9370db', '#48c9b0', '#ffd700', '#ff69b4'],
            multicolor: [
                adjustColor(borderColorArray, 100),
                adjustColor(borderColorArray, -50)
            ],

            microRed: ['#d32f2f', '#c62828', '#b71c1c', '#c62828', '#d32f2f'],
            microOrange: ['#f57c00', '#ef6c00', '#e65100', '#ef6c00', '#f57c00'],
            microYellow: ['#fbc02d', '#f9a825', '#f57f17', '#f9a825', '#fbc02d'],
            microGreen: ['#388e3c', '#2e7d32', '#1b5e20', '#2e7d32', '#388e3c'],
            microBlue: ['#1976d2', '#1565c0', '#0d47a1', '#1565c0', '#1976d2'],
            microPurple: ['#7b1fa2', '#6a1b9a', '#4a148c', '#6a1b9a', '#7b1fa2'],

            radicalRed: ['#ff003c', '#a00018', '#ff4d7a', '#400005', '#ff003c'],
            radicalOrange: ['#ff6a00', '#4a1500', '#ffaa66', '#220500', '#ff6a00'],
            radicalYellow: ['#ffff00', '#554400', '#ffea88', '#221100', '#ffff00'],
            radicalGreen: ['#00ff66', '#004411', '#88ffaa', '#001100', '#00ff66'],
            radicalBlue: ['#00d2ff', '#001a44', '#77e5ff', '#000511', '#00d2ff'],
            radicalPurple: ['#cc00ff', '#330044', '#ee99ff', '#11001a', '#cc00ff'],

            extremeRed: ['#ff1a1a', '#660000', '#ff6666', '#990000', '#ff3333'],
            extremeOrange: ['#ff7f00', '#803f00', '#ffa64d', '#b35900', '#ff9433'],
            extremeYellow: ['#ffee00', '#998f00', '#fff566', '#ccc200', '#fff999'],
            extremeGreen: ['#00cc44', '#004d1a', '#33ff77', '#00802b', '#66ff99'],
            extremeBlue: ['#0066ff', '#002266', '#4d94ff', '#0044cc', '#80b3ff'],
            extremePurple: ['#b300b3', '#4d004d', '#ff66ff', '#800080', '#ff99ff'],

            harmonicRed: ['#ff416c', '#ff4b2b', '#ff6a00', '#ff4b2b', '#ff416c'],
            harmonicOrange: ['#ff8c00', '#ffa500', '#ffb732', '#ffa500', '#ff8c00'],
            harmonicYellow: ['#ffe259', '#ffa751', '#ff7e5f', '#ffa751', '#ffe259'],
            harmonicGreen: ['#00ff87', '#60efff', '#0061ff', '#60efff', '#00ff87'],
            harmonicBlue: ['#00c6ff', '#0072ff', '#00416a', '#0072ff', '#00c6ff'],
            harmonicPurple: ['#9c27b0', '#e91e63', '#ff4081', '#e91e63', '#9c27b0'],

            invertedRed: ['#ff003c', '#00bfa5', '#88001b', '#00e5ff', '#ff003c'],
            invertedOrange: ['#ff6f00', '#304ffe', '#a84300', '#3d5afe', '#ff6f00'],
            invertedYellow: ['#ffd600', '#6200ea', '#aa8000', '#7c4dff', '#ffd600'],
            invertedGreen: ['#00c853', '#aa00ff', '#007f32', '#d500f9', '#00c853'],
            invertedBlue: ['#0091ea', '#ff6d00', '#0064b7', '#ffab40', '#0091ea'],
            invertedPurple: ['#aa00ff', '#64dd17', '#6a008a', '#aeea00', '#aa00ff']
        };

        let gradientColors = gradientStyles[colorScheme] || gradientStyles.multicolor;

        if (applyTranslucent) {
            gradientColors = gradientColors.map(color => {
                if (color.startsWith('rgb')) {
                    return color.replace('rgb', 'rgba').replace(')', ', .5)');
                }
                return color + '80';
            });
        }

        const [firstColor, secondColor, thirdColor, fourthColor] = gradientColors;
        const typeMap = {
            'linear': {
                background: `linear-gradient(180deg, ${firstColor}, ${secondColor || firstColor}, ${thirdColor || secondColor || firstColor}, ${fourthColor || thirdColor || firstColor})`,
                animation: 'caretLinear 10s ease infinite'
            },
            'segmented': {
                background: `linear-gradient(180deg, ${firstColor} 20%, ${secondColor || firstColor} 20% 40%, ${thirdColor || secondColor || firstColor} 40% 60%, ${secondColor || firstColor} 60% 80%, ${fourthColor || thirdColor || firstColor} 80%)`,
                animation: 'caretLinear 10s ease infinite'
            },
            'fade': {
                background: `radial-gradient(circle at 50% -100%, ${firstColor}, ${secondColor || firstColor} 50%, transparent 100%), radial-gradient(circle at 50% 200%, ${fourthColor || thirdColor || firstColor}, ${thirdColor || secondColor || firstColor} 50%, transparent 100%)`,
                animation: 'caretFade 10s ease infinite'
            }
        };

        const gradConfig = typeMap[gradientType] || typeMap['linear'];
        return {
            background: gradConfig.background,
            animation: gradConfig.animation,
            backgroundSize: '300% 300%'
        };
    }

    function applyGradientAnimation(cursor, colorScheme = 'multicolor', applyTranslucent = false, gradientType = 'linear') {
        const computedStyle = window.getComputedStyle(cursor);
        const borderColor = computedStyle.borderColor || 'rgb(0, 0, 0)';
        const borderColorArray = rgbToArray(borderColor);

        let styleSheet = document.getElementById('rainbow-cursor-keyframes');
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = 'rainbow-cursor-keyframes';
            styleSheet.textContent = `
            @keyframes caretLinear {
                0% { background-position: 50% 0%; }
                25% { background-position: 50% 100%; }
                50% { background-position: 50% 100%; }
                75% { background-position: 50% 0%; }
                100% { background-position: 50% 0%; }
            }
            @keyframes caretFade {
                0%, 100% { background-position: 50% 0%; } 
                50% { background-position: 50% 100%; }
            }
        `;
            document.head.appendChild(styleSheet);
        }

        const { background, animation, backgroundSize } = buildGradientBackground(colorScheme, applyTranslucent, gradientType, borderColorArray);

        cursor.style.borderWidth = "0";
        cursor.style.background = background;
        cursor.style.backgroundSize = backgroundSize;
        cursor.style.backgroundRepeat = 'no-repeat';
        cursor.style.backgroundPosition = 'center center';
        cursor.style.transformOrigin = 'center center';
        cursor.style.animation = animation;
        cursor.style.animationFillMode = 'both';
    }

    function monitorColorChange(cursor) {
        let lastBorderColor = window.getComputedStyle(cursor).borderColor;

        const observer = new MutationObserver(() => {
            const currentBorderColor = window.getComputedStyle(cursor).borderColor;
            if (currentBorderColor !== lastBorderColor) {
                lastBorderColor = currentBorderColor;

                debouncedStorageGet(['gradientStyle', 'TranslucentMode', 'GradientType'], (result) => {
                    const gradientStyle = result.gradientStyle || 'rainbow';
                    const translucentMode = result.TranslucentMode || false;
                    const gradientType = result.GradientType || 'linear';
                    applyGradientAnimation(cursor, gradientStyle, translucentMode, gradientType);
                });
            }
        });

        observer.observe(cursor, { attributes: true, attributeFilter: ['style'] });
    }

    function applytypewriterAnimation() {
        debouncedStorageGet(['typewriterAnimation'], (result) => {
            const typewriterAnimation = normalizeStoredBoolean(result.typewriterAnimation, false);
            const cursorElements = document.querySelectorAll('.docs-text-ui-cursor-blink, .kix-cursor, .CodeMirror-cursor, .monaco-editor .cursors-layer .cursor');

            if (typewriterAnimation) {
                cursorElements.forEach(cursor => {
                    cursor.style.setProperty('transition', 'all 80ms ease', 'important');
                });
            } else {
                cursorElements.forEach(cursor => {
                    cursor.style.removeProperty('transition');
                });
            }
        });
    }

    function applyBlinkRemoval() {
        debouncedStorageGet(['Blink'], (result) => {
            const showBlink = normalizeStoredBoolean(result.Blink, true, true);
            const cursorElements = document.querySelectorAll('.docs-text-ui-cursor-blink, .kix-cursor, .CodeMirror-cursor, .monaco-editor .cursors-layer .cursor');

            if (!showBlink) {
                cursorElements.forEach(cursor => {
                    cursor.style.setProperty('-webkit-animation-iteration-count', '0', 'important');
                    cursor.style.setProperty('animation-iteration-count', '0', 'important');
                    cursor.style.setProperty('visibility', 'visible', 'important');
                });
            } else {
                cursorElements.forEach(cursor => {
                    cursor.style.removeProperty('-webkit-animation-iteration-count');
                    cursor.style.removeProperty('animation-iteration-count');
                    cursor.style.removeProperty('visibility');
                    cursor.style.removeProperty('-webkit-animation-duration');
                    cursor.style.removeProperty('animation-duration');
                });
            }
        });
    }

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'sync') {
            cache.storageCache = {};

            if (changes.Blink) {
                applyBlinkRemoval();
            }
            if (changes.typewriterAnimation) {
                applytypewriterAnimation();
            }
        }
    });

    function applyCaretWidth(cursor) {
        debouncedStorageGet(['Thickness'], (result) => {
            const width = result.Thickness || '2';
            cursor.style.width = `${width}px`;
        });
    }

    function initialize() {
        const currentUserCaret = document.getElementById('kix-current-user-cursor-caret');

        applyBlinkRemoval();
        applytypewriterAnimation();

        if (currentUserCaret) {
            cache.cursorElements = [currentUserCaret];

            debouncedStorageGet(['gradientStyle', 'TranslucentMode', 'GradientType'], (result) => {
                const gradientStyle = result.gradientStyle || 'rainbow';
                const translucentMode = result.TranslucentMode || false;
                const gradientType = result.GradientType || 'linear';
                applyGradientAnimation(currentUserCaret, gradientStyle, translucentMode, gradientType);
            });

            applyCaretWidth(currentUserCaret);
            monitorColorChange(currentUserCaret);

            chrome.storage.onChanged.addListener((changes, area) => {
                if (area === 'sync') {
                    cache.storageCache = {};

                    if (changes.Blink) {
                        applyBlinkRemoval();
                    }
                    if (changes.typewriterAnimation) {
                        applytypewriterAnimation();
                    }
                    if (changes.Thickness) {
                        const newWidth = changes.Thickness.newValue || '2';
                        currentUserCaret.style.width = `${newWidth}px`;
                    }
                    if (changes.gradientStyle || changes.TranslucentMode || changes.GradientType) {
                        debouncedStorageGet(['gradientStyle', 'TranslucentMode', 'GradientType' ], (result) => {
                            const gradientStyle = changes.gradientStyle ? changes.gradientStyle.newValue : (result.gradientStyle || 'rainbow');
                            const translucentMode = normalizeStoredBoolean(changes.TranslucentMode ? changes.TranslucentMode.newValue : result.TranslucentMode, false);
                            const gradientType = changes.GradientType ? changes.GradientType.newValue : (result.GradientType || 'linear');
                            applyGradientAnimation(currentUserCaret, gradientStyle, translucentMode, gradientType);
                        });
                    }
                }
            });
        } else {
            chrome.storage.onChanged.addListener((changes, area) => {
                if (area === 'sync') {
                    cache.storageCache = {};
                    if (changes.Blink) applyBlinkRemoval();
                    if (changes.typewriterAnimation) applytypewriterAnimation();
                }
            });
        }
    }

    initialize();

    window.addEventListener('googleDocsTabSwitch', (event) => {
        cache.cursorElements = null;
        cache.storageCache = {};
        setTimeout(() => {
            initialize();
        }, 100);
    });

    let lastUrl = window.location.href;
    const urlObserver = new MutationObserver(() => {
        const currentUrl = window.location.href;
        if (currentUrl !== lastUrl && currentUrl.includes('docs.google.com/document')) {
            lastUrl = currentUrl;
            cache.cursorElements = null;
            cache.storageCache = {};
            setTimeout(() => {
                initialize();
            }, 100);
        }
    });

    urlObserver.observe(document, { subtree: true, childList: true });

    function applyCaretStyling() {
        debouncedStorageGet(['Thickness', 'Blink', 'typewriterAnimation', 'gradientStyle'], (result) => {

            const Thickness = result.Thickness || '2';
            const showBlink = normalizeStoredBoolean(result.Blink, true, true);
            const typewriterAnimation = normalizeStoredBoolean(result.typewriterAnimation, false);
            const gradientStyle = result.gradientStyle || 'rainbow';

            document.documentElement.style.setProperty('--caret-width', `${Thickness}px`);

            const caretBlinkStyle = showBlink ? 'blink-on-class' : 'blink-off-class';
            document.documentElement.classList.remove('blink-off-class', 'blink-on-class');
            document.documentElement.classList.add(caretBlinkStyle);

            const typewriterAnimationClass = typewriterAnimation ? 'typewriter-animation-on' : 'typewriter-animation-off';
            document.documentElement.classList.remove('typewriter-animation-on', 'typewriter-animation-off');
            document.documentElement.classList.add(typewriterAnimationClass);

            const gradientClass = `gradient-${gradientStyle}`;
            document.documentElement.classList.remove(...Array.from(document.documentElement.classList).filter(cls => cls.startsWith('gradient-')));
            document.documentElement.classList.add(gradientClass);
        });
    }
    applyCaretStyling();
})();