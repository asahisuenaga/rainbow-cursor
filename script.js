(function () {
    if (window.stylishCursorLoaded) {
        return;
    }
    window.stylishCursorLoaded = true;

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

    // Function to apply gradient animation based on the current border-color
    function applyGradientAnimation(cursor, colorScheme = 'dynamic', applyTranslucent = false) {
        const computedStyle = window.getComputedStyle(cursor);
        const borderColor = computedStyle.borderColor || 'rgb(0, 0, 0)';
        const borderColorArray = rgbToArray(borderColor);

        const gradientStyles = {
            rainbow: ['#ffb6c1', '#ff69b4', '#da70d6', '#9370db', '#48c9b0', '#f0e68c', '#ffd700'],
            red: ['#ff0000', '#c43a3a', '#8b0000', '#e34e5b', '#ff6347'],
            dynamic: [
                adjustColor(borderColorArray, 100),
                adjustColor(borderColorArray, -50)
            ],
            snow: ['#00bfff', '#1e90ff', '#4682b4', '#add8e6', '#e0f0ff'],
            ocean: ['#2193b0', '#6dd5ed', '#b2fefa', '#2f80ed', '#56ccf2'],
            forest: ['#005c1e', '#228b22', '#6b8e23', '#2e8b57', '#006400'],
            fire: ['#ff4500', '#ff8c00', '#ffd700', '#ffa500', '#ff6347'],
            ice: ['#00ffff', '#e0ffff', '#afeeee', '#7fffd4', '#d0f8ff'],
            neon: ['#39ff14', '#ff073a', '#ffd700', '#da22ff', '#7fff00'],
            gold: ['#ffd700', '#ffb84d', '#ffa500', '#ff8c00', '#daa520'],
            silver: ['#c0c0c0', '#d3d3d3', '#a9a9a9', '#555555', '#e6e6fa'],
            twilight: ['#ffa07a', '#fa8072', '#e9967a', '#a0522d', '#2e2e2e'],
            vintage: ['#eacda3', '#d6ae7b', '#b08968', '#7f6a5b', '#4a413a'],
            tropical: ['#ffd700', '#ff4500', '#ff8c00', '#00fa9a', '#1e90ff'],
            floral: ['#ff69b4', '#ffb6c1', '#ffc0cb', '#ffdab9', '#ffe4e1'],
            candy: ['#ffc3a0', '#ff85a1', '#ff6d6a', '#ffc1cc', '#ff99a8'],
            emerald: ['#50c878', '#2e8b57', '#3cb371', '#00fa9a', '#00ff7f'],
            sunset: ['#ff5e62', '#ff9966', '#ffc371', '#d62828', '#9400d3'],
            galaxy: ['#663399', '#4b0082', '#0000ff', '#8a2be2', '#9932cc'],
            aurora: ['#00c9ff', '#92fe9d', '#00f260', '#0575e6']
        };

        let gradientColors = gradientStyles[colorScheme] || gradientStyles.dynamic;

        if (applyTranslucent) {
            gradientColors = gradientColors.map(color => {
                if (color.startsWith('rgb')) {
                    return color.replace('rgb', 'rgba').replace(')', ', 0.5)');
                } else {
                    return color + '80';
                }
            });
        }

        const styleSheet = document.createElement('style');
        document.head.appendChild(styleSheet);

        const keyframes = `
        @keyframes gradientAnimation {
            0% { background-position: 0% 0%; }
            25% { background-position: 100% 0%; }
            50% { background-position: 100% 100%; }
            75% { background-position: 0% 100%; }
            100% { background-position: 0% 0%; }
        }
    `;
        styleSheet.sheet.insertRule(keyframes, 0);

        cursor.style.borderWidth = "0";
        cursor.style.background = `linear-gradient(-45deg, ${gradientColors.join(', ')})`;
        cursor.style.backgroundSize = "400% 400%";
        cursor.style.animation = "gradientAnimation 10s ease infinite";
    }

    // Updated monitorColorChange to persist the chosen gradient style
    function monitorColorChange(cursor) {
        let lastBorderColor = window.getComputedStyle(cursor).borderColor;

        const observer = new MutationObserver(() => {
            const currentBorderColor = window.getComputedStyle(cursor).borderColor;
            if (currentBorderColor !== lastBorderColor) {
                lastBorderColor = currentBorderColor;

                debouncedStorageGet(['gradientStyle', 'TranslucentMode'], (result) => {
                    const gradientStyle = result.gradientStyle || 'rainbow';
                    const translucentMode = result.TranslucentMode || false;
                    applyGradientAnimation(cursor, gradientStyle, translucentMode);
                });
            }
        });

        observer.observe(cursor, { attributes: true, attributeFilter: ['style'] });
    }

    function applytypewriterAnimation() {
        debouncedStorageGet(['typewriterAnimation'], (result) => {
            const typewriterAnimation = result.typewriterAnimation || false;
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

    // Function to apply blink removal from storage
    function applyBlinkRemoval() {
        debouncedStorageGet(['Blink'], (result) => {
            const Blink = result.Blink || 'false';
            const cursorElements = document.querySelectorAll('.docs-text-ui-cursor-blink, .kix-cursor, .CodeMirror-cursor, .monaco-editor .cursors-layer .cursor');

            if (Blink === 'true') {
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

    // Listen for storage changes and apply new settings live
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

    // Function to apply caret width from storage
    function applyCaretWidth(cursor) {
        debouncedStorageGet(['Thickness'], (result) => {
            const width = result.Thickness || '2';  
            cursor.style.width = `${width}px`;
        });
    }

    // Updated initialize function to retrieve and apply gradient style on load
    function initialize() {
        const currentUserCaret = document.getElementById('kix-current-user-cursor-caret');
        cache.cursorElements = currentUserCaret ? [currentUserCaret] : [];
        if (cache.cursorElements.length > 0) {
            debouncedStorageGet(['gradientStyle', 'TranslucentMode'], (result) => {
                const gradientStyle = result.gradientStyle || 'rainbow';
                const translucentMode = result.TranslucentMode || false;
                Array.from(cache.cursorElements).forEach(cursor => {
                    applyGradientAnimation(cursor, gradientStyle, translucentMode);
                });
            });

            applyCaretWidth(cache.cursorElements[0]);
            monitorColorChange(cache.cursorElements[0]);
            applyBlinkRemoval();
            applytypewriterAnimation();

            chrome.storage.onChanged.addListener((changes, area) => {
                if (area === 'sync') {
                    cache.storageCache = {};

                    if (changes.Thickness) {
                        const newWidth = changes.Thickness.newValue || '2';
                        Array.from(cache.cursorElements).forEach(cursor => {
                            cursor.style.width = `${newWidth}px`;
                        });
                    }
                    if (changes.Blink) {
                        applyBlinkRemoval();
                    }
                    if (changes.typewriterAnimation) {
                        applytypewriterAnimation();
                    }
                    if (changes.gradientStyle || changes.TranslucentMode) {
                        debouncedStorageGet(['gradientStyle', 'TranslucentMode'], (result) => {
                            const gradientStyle = changes.gradientStyle ? changes.gradientStyle.newValue : (result.gradientStyle || 'rainbow');
                            const translucentMode = changes.TranslucentMode ? changes.TranslucentMode.newValue : (result.TranslucentMode || false);
                            Array.from(cache.cursorElements).forEach(cursor => {
                                applyGradientAnimation(cursor, gradientStyle, translucentMode);
                            });
                        });
                    }
                }
            });
            showThankYouOverlay();
            scheduleRatingOverlay();
        } else {
            setTimeout(initialize, 500);
        }
    }

    initialize();

    // Listen for Google Docs tab switches
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
            const Blink = result.Blink !== undefined ? result.Blink : 'false';
            const typewriterAnimation = result.typewriterAnimation !== undefined ? result.typewriterAnimation : false;
            const gradientStyle = result.gradientStyle || 'rainbow';

            document.documentElement.style.setProperty('--caret-width', `${Thickness}px`);

            let caretBlinkStyle;
            if (Blink === 'true') {
                caretBlinkStyle = 'blink-off-class';
            } else {
                caretBlinkStyle = 'blink-on-class';
            }

            document.documentElement.classList.remove('blink-off-class', 'blink-on-class',);
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

    // === TOAST UTILITY ===
    function showToast({ id, message, actions }) {
        const old = document.getElementById(id);
        if (old) old.remove();

        let toastContainer = document.getElementById('stylish-cursor-toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'stylish-cursor-toast-container';
            toastContainer.style.cssText = `
            position: fixed;
            top: 32px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 2147483647;
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
            pointer-events: none;
        `;
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.id = id;
        toast.setAttribute('role', 'status');
        toast.tabIndex = -1;
        toast.style.cssText = `
        background: linear-gradient(145deg, #f0f2f5, #ffffff);
        color: #333;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        min-width: 260px;
        max-width: 700px;
        padding: 12px 20px 12px 20px;
        margin: 0;
        font-family: 'Google Sans', sans-serif;
        font-size: 1rem;
        pointer-events: auto;
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 16px;
        animation: stylish-cursor-toast-in 0.3s ease;
        white-space: nowrap;
    `;
        if (message && message.trim() !== '') {
            const textSpan = document.createElement('span');
            textSpan.style.cssText = 'font-weight: 400; display: flex; align-items: center; gap: 0px;';
            textSpan.innerHTML = message; 
            toast.appendChild(textSpan);
        }

        // Actions
        if (actions && actions.length > 0) {
            const actionsDiv = document.createElement('div');
            actionsDiv.style.cssText = 'display: flex; gap: 8px; align-items: center;';
            actions.forEach(({ label, onClick, href, primary }) => {
                const btn = href
                    ? document.createElement('a')
                    : document.createElement('button');
                btn.textContent = label;
                btn.className = primary ? 'primary' : '';
                btn.style.cssText = `
                appearance: none;
                background: linear-gradient(145deg, #e8e8e8, #ffffff);
                border: 1px solid #d0d0d0;
                padding: 4px 8px;
                border-radius: 8px;
                font-family: 'Google Sans', sans-serif;
                font-size: 1rem;
                color: #333;
                cursor: pointer;
                font-weight: 400;
                text-decoration: none;
                margin: 0;
                box-shadow: inset 1px 1px 3px rgba(255,255,255,0.6),
                            inset -1px -1px 3px rgba(0,0,0,0.05);
                transition: all 0.3s ease;
                ${primary ? 'background: linear-gradient(to top, #4A90E2, #6AB0F3); color: #fff; border: none;' : ''}
            `;
                if (href) {
                    btn.href = href;
                    btn.target = '_blank';
                    btn.rel = 'noopener noreferrer';
                } else {
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        if (onClick) onClick();
                        toast.remove();
                    };
                }
                actionsDiv.appendChild(btn);
            });
            toast.appendChild(actionsDiv);
        }

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.setAttribute('aria-label', 'Close');
        closeBtn.style.cssText = `
        background: none;
        border: none;
        color: #888;
        font-size: 1rem;
        cursor: pointer;
        line-height: 1;
        align-self: center;
    `;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            toast.remove();
        };
        toast.appendChild(closeBtn);

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            toast.style.background = 'linear-gradient(145deg, #1b1b1b, #232323)';
            toast.style.color = '#f5f5f5';
            closeBtn.style.color = '#bbb';
        }

        if (!document.getElementById('stylish-cursor-toast-anim')) {
            const style = document.createElement('style');
            style.id = 'stylish-cursor-toast-anim';
            style.textContent = `
        @keyframes stylish-cursor-toast-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        `;
            document.head.appendChild(style);
        }

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 15000);
    }

    function showThankYouOverlay() {
        if (localStorage.getItem('stylishCursorOverlayShown')) return;
        const githubLinkHTML = "<a href='https://github.com/asahisuenaga/rainbow-cursor' target='_blank'>Github</a>";
        const thankYouMessage = chrome.i18n.getMessage('thankYouTitle', [githubLinkHTML]);
        showToast({
            id: 'stylish-cursor-overlay',
            message: thankYouMessage,
            actions: []
        });
        localStorage.setItem('stylishCursorOverlayShown', 'true');
    }

    function showRatingOverlay() {
        if (localStorage.getItem('stylishCursorRatingShown')) return;
        if (!window.location.href.includes('docs.google.com/document')) return;
        const chromeWebStoreLinkHTML = "<a href='https://chromewebstore.google.com/detail/custom-cursor-in-google-d/nnmghknojpihdnofejbocdcnmhibkfdc/reviews' target='_blank'>Chrome Web Store</a>";
        const ratingMessage = chrome.i18n.getMessage('ratingTitle', [chromeWebStoreLinkHTML]);
        showToast({
            id: 'stylish-cursor-rating-overlay',
            message: ratingMessage,
            actions: []
        });
        localStorage.setItem('stylishCursorRatingShown', 'true');
    }

    // Function to track time spent in Google Docs and schedule rating overlay
    function scheduleRatingOverlay() {
        if (localStorage.getItem('stylishCursorRatingShown')) {
            return;
        }

        let timeSpent = parseInt(localStorage.getItem('stylishCursorTimeSpent') || '0');

        if (cache.timeTracker) {
            clearInterval(cache.timeTracker);
        }

        cache.timeTracker = setInterval(() => {
            if (window.location.href.includes('docs.google.com/document')) {
                timeSpent += 60000; // Add 1 minute (60,000 ms)
                localStorage.setItem('stylishCursorTimeSpent', timeSpent.toString());

                if (timeSpent >= 300000) {
                    clearInterval(cache.timeTracker);
                    cache.timeTracker = null;
                    showRatingOverlay();
                }
            } else {
                clearInterval(cache.timeTracker);
                cache.timeTracker = null;
            }
        }, 60000);

        if (cache.visibilityHandler) {
            document.removeEventListener('visibilitychange', cache.visibilityHandler);
        }

        cache.visibilityHandler = () => {
            if (document.visibilityState === 'visible' &&
                window.location.href.includes('docs.google.com/document')) {
                scheduleRatingOverlay();
            }
        };

        document.addEventListener('visibilitychange', cache.visibilityHandler);
    }
})();