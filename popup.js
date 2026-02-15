const helloTranslations = [
  'Hello',       // English
  'こんにちは',    // Japanese
  'Hola',        // Spanish
  'Olá',         // Portuguese
  'Привет',      // Russian
  'Bonjour',     // French
  'Hallo',       // German / Dutch
  '你好',        // Chinese
  'Xin chào',   // Vietnamese
  'Ciao',        // Italian
];

let helloIndex = 0;
let typingTimeout = null;
let typingState = { text: '', phase: 'typing', charIndex: 0 };

document.addEventListener('DOMContentLoaded', () => {
  const donation = document.getElementById('donation');
  const optionsContainer = document.getElementById("optionsContainer");
  const livePreviewSection = document.getElementById('livePreviewSection');

  function setLocalizedText(id, messageKey) {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = chrome.i18n.getMessage(messageKey);
    }
  }

  // Set localized text for all elements
  setLocalizedText('gradientLabel', 'gradientLabel');
  setLocalizedText('ThicknessLabel', 'ThicknessLabel');
  setLocalizedText('BlinkLabel', 'BlinkLabel');
  setLocalizedText('typewriterAnimationLabel', 'typewriterAnimationLabel');
  setLocalizedText('TranslucentModeLabel', 'TranslucentModeLabel');
  setLocalizedText('donation', 'donation');
  setLocalizedText('settingsLivePreviewLabel', 'livePreviewLabel');

  // Load saved settings
  chrome.storage.sync.get(['Thickness', 'Blink', 'gradientStyle', 'typewriterAnimation', 'TranslucentMode'], () => {
  });

  if (donation) {
    donation.addEventListener('click', () => {
      window.open('https://coff.ee/asahisuenaga', '_blank');
      window.close();
    });
  }

  let isGoogleDocs = false;

  // Check if user is in Google Docs and set up the display
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentUrl = tabs[0].url;
    isGoogleDocs = currentUrl.includes("docs.google.com/document");

    if (!isGoogleDocs) {
      chrome.tabs.create({ url: 'https://docs.google.com/document' });
      window.close();
    } else {
      if (livePreviewSection) livePreviewSection.style.display = 'block';
      updateSettingsLivePreview();
    }
  });

  function getGradientColors(gradientValue, applyTranslucent = false) {
    const gradientStyles = {
      rainbow: ['#ffb6c1', '#ff69b4', '#da70d6', '#9370db', '#48c9b0', '#f0e68c', '#ffd700'],
      red: ['#ff0000', '#c43a3a', '#8b0000', '#e34e5b', '#ff6347'],
      dynamic: ['#e6e6e6', '#333333'],
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
    let colors = gradientStyles[gradientValue] || gradientStyles.rainbow;

    if (applyTranslucent) {
      colors = colors.map(color => {
        return color + '80';
      });
    }

    return colors;
  }

  function updateSettingsLivePreview(updateCaretOnly = false) {
    if (!isGoogleDocs) return;
    const thicknessObj = thicknessOptions.find(o => o.value === currentThickness) || thicknessOptions[0];

    const blinkEnabled = currentBlink === 'false' || currentBlink === false; // 'false' = blinking is ON
    const typewriterEnabled = currenttypewriterAnimation === 'true' || currenttypewriterAnimation === true;
    const translucentEnabled = currentTranslucentMode === 'true' || currentTranslucentMode === true;

    const gradientColors = getGradientColors(currentGradient, translucentEnabled);
    const gradientCSS = `linear-gradient(-45deg, ${gradientColors.join(', ')})`;
    const previewBox = document.getElementById('settingsLivePreview');
    const livePreviewLabel = chrome.i18n.getMessage('PreviewLabel') || 'Live Preview';
    const labelElement = previewBox.parentElement.querySelector('#settingsLivePreviewLabel');
    if (labelElement) labelElement.textContent = livePreviewLabel;

    const helloText = helloTranslations[helloIndex % helloTranslations.length];
    if (!typingState.text || typingState.text !== helloText) {
      typingState = { text: helloText, phase: 'typing', charIndex: 0 };
    }
    let displayText = helloText.slice(0, typingState.charIndex);

    let animationStyle = '';
    let backgroundStyle = gradientCSS;

    if (blinkEnabled) {
      const duration = '1.4s';
      animationStyle = `animation: caret-blink ${duration} steps(1) infinite, gradientAnimation 20s linear infinite;`;
    } else {
      animationStyle = `animation: gradientAnimation 20s linear infinite;`;
    }

    let smoothTransition = '';
    if (typewriterEnabled) {
      smoothTransition = 'transition: all 80ms ease;';
    }

    let caretClass = `live-gradient-bar live-gradient-animated`;
    let caretStyle = `display:inline-block;vertical-align:bottom;width:${thicknessObj.width}px;height:1.25rem;margin-left:0.5rem;border-radius:0.1875rem;background:${backgroundStyle};background-size:400% 400%;${animationStyle}${smoothTransition}`;

    previewBox.innerHTML = `
  <style>
    @keyframes gradientAnimation { 
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 100%; }
      100% { background-position: 0% 0%; }
    }
    @keyframes caret-blink {
      0%, 49% { opacity: 1; }
      50%, 100% { opacity: 0; }
    }

    .cursor-dropdown-selected:hover {
      background: #ededed;
    }
    @media (prefers-color-scheme: dark) {
      .cursor-dropdown-selected:hover {
        background: #303134;
      }
    }
  </style>

  <div class='cursor-dropdown-selected'
       style='overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 0; cursor: default;'>
    <span style='font-size: 1rem; font-family: inherit; letter-spacing: .2px; color: inherit; user-select: none;'>${displayText}</span>
    <span class='${caretClass}' style='${caretStyle}'></span>
  </div>
`;

    if (updateCaretOnly) return;
    if (typingTimeout) clearTimeout(typingTimeout);

    // Typing loop logic
    if (typingState.phase === 'typing') {
      if (typingState.charIndex < helloText.length) {
        typingTimeout = setTimeout(() => {
          typingState.charIndex++;
          updateSettingsLivePreview();
        }, 180);
      } else {
        typingState.phase = 'pause';
        typingTimeout = setTimeout(() => {
          typingState.phase = 'erasing';
          updateSettingsLivePreview();
        }, 1800);
      }
    } else if (typingState.phase === 'erasing') {
      if (typingState.charIndex > 0) {
        typingTimeout = setTimeout(() => {
          typingState.charIndex--;
          updateSettingsLivePreview();
        }, 90);
      } else {
        typingState.phase = 'typing';
        helloIndex = (helloIndex + 1) % helloTranslations.length;
        typingState.text = helloTranslations[helloIndex];
        typingTimeout = setTimeout(() => {
          updateSettingsLivePreview();
        }, 600);
      }
    }
  }

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  const thicknessOptions = [
    { value: '2', label: '2 px', width: 2 },
    { value: '4', label: '4 px', width: 4 },
    { value: '6', label: '6 px', width: 6 },
    { value: '8', label: '8 px', width: 8 }
  ];
  const thicknessDropdownContainer = document.getElementById('thicknessDropdownContainer');
  let currentThickness = '2';

  function closeAllDropdowns(exceptId) {
    document.querySelectorAll('.cursor-dropdown-list.open').forEach(list => {
      if (!exceptId || list.id !== exceptId) list.classList.remove('open');
    });
    document.querySelectorAll('.cursor-dropdown-selected.open').forEach(sel => {
      if (!exceptId || sel.id !== exceptId.replace('List', 'Selected')) {
        sel.classList.remove('open');
        sel.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function renderThicknessDropdown(selectedValue) {
    currentThickness = selectedValue;
    const selected = thicknessOptions.find(o => o.value === selectedValue) || thicknessOptions[0];
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    thicknessDropdownContainer.innerHTML = `
      <div class="cursor-dropdown-selected" id="thicknessDropdownSelected" tabindex="0" role="button" aria-haspopup="listbox" aria-expanded="false">
        <span class="${isDark ? 'dark-preview-bar' : ''}" style="display:inline-block;vertical-align:middle;margin-right:0.5rem;width:${selected.width}px;height:1.25rem;border-radius:0.1875rem;background:#111;"></span>
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="thicknessDropdownList" role="listbox">
        ${thicknessOptions.map(o => `
          <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}" tabindex="0" role="option" aria-selected="${o.value === selectedValue}">
            <span class="${isDark ? 'dark-preview-bar' : ''}" style="display:inline-block;vertical-align:middle;margin-right:0.5rem;width:${o.width}px;height:1.25rem;border-radius:0.1875rem;background:#111;"></span>
            <span class="cursor-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
    updateSettingsLivePreview(true);
  }
  chrome.storage.sync.get(['Thickness'], (result) => {
    renderThicknessDropdown(result.Thickness || '2');
  });

  // --- Toggle Buttons ---

  let currentBlink = 'false'; // 'false' means Blink is ON (Yes)
  let currenttypewriterAnimation = 'false'; // 'false' means OFF (No)
  let currentTranslucentMode = 'false'; // 'false' means OFF (No)

  const blinkToggle = document.getElementById('blinkToggle');
  const typewriterAnimationToggle = document.getElementById('typewriterAnimationToggle');
  const translucentModeToggle = document.getElementById('translucentModeToggle');

  const trueOption = chrome.i18n.getMessage("trueOption") || 'ON';
  const falseOption = chrome.i18n.getMessage("falseOption") || 'OFF';

  function updateToggleUI(button, isActive) {
    if (isActive) {
      button.classList.add('active');
      button.innerText = trueOption;
    } else {
      button.classList.remove('active');
      button.innerText = falseOption;
    }
  }

  // Initialize Toggles
  chrome.storage.sync.get(['Blink', 'typewriterAnimation', 'TranslucentMode'], (result) => {
    // Blink logic: stored 'false' means blink ON. stored 'true' means blink OFF.
    currentBlink = result.Blink !== undefined ? String(result.Blink) : 'false';
    const isBlinkOn = currentBlink === 'false';
    updateToggleUI(blinkToggle, isBlinkOn);

    currenttypewriterAnimation = result.typewriterAnimation !== undefined ? String(result.typewriterAnimation) : 'false';
    const isTypewriterOn = currenttypewriterAnimation === 'true';
    updateToggleUI(typewriterAnimationToggle, isTypewriterOn);

    currentTranslucentMode = result.TranslucentMode !== undefined ? String(result.TranslucentMode) : 'false';
    const isTranslucentOn = currentTranslucentMode === 'true';
    updateToggleUI(translucentModeToggle, isTranslucentOn);
  });

  // Blink Click Handler
  blinkToggle.addEventListener('click', () => {
    const isCurrentlyOn = currentBlink === 'false';
    const newState = !isCurrentlyOn;
    // Update state. If newState is ON (true), we store 'false'. If OFF (false), we store 'true'.
    currentBlink = newState ? 'false' : 'true';
    chrome.storage.sync.set({ Blink: currentBlink });
    updateToggleUI(blinkToggle, newState);
    updateSettingsLivePreview(true);
  });

  // Typewriter Animation Click Handler
  typewriterAnimationToggle.addEventListener('click', () => {
    const isCurrentlyOn = currenttypewriterAnimation === 'true';
    const newState = !isCurrentlyOn;
    currenttypewriterAnimation = newState ? 'true' : 'false';
    chrome.storage.sync.set({ typewriterAnimation: newState });
    updateToggleUI(typewriterAnimationToggle, newState);
    updateSettingsLivePreview(true);
  });

  // Translucent Mode Click Handler
  translucentModeToggle.addEventListener('click', () => {
    const isCurrentlyOn = currentTranslucentMode === 'true';
    const newState = !isCurrentlyOn;
    currentTranslucentMode = newState ? 'true' : 'false';
    chrome.storage.sync.set({ TranslucentMode: newState });
    updateToggleUI(translucentModeToggle, newState);
    updateSettingsLivePreview(true);
  });

  // --- Rainbow Dropdown for Gradient ---
  const gradientOptions = [
    { value: 'dynamic', label: chrome.i18n.getMessage("gradientDynamic") || 'Dynamic' },
    { value: 'rainbow', label: chrome.i18n.getMessage("gradientRainbow") || 'Rainbow' },
    { value: 'red', label: chrome.i18n.getMessage("gradientRed") || 'Red' },
    { value: 'snow', label: chrome.i18n.getMessage("gradientSnow") || 'Snow' },
    { value: 'ocean', label: chrome.i18n.getMessage("gradientOcean") || 'Ocean' },
    { value: 'forest', label: chrome.i18n.getMessage("gradientForest") || 'Forest' },
    { value: 'fire', label: chrome.i18n.getMessage("gradientFire") || 'Fire' },
    { value: 'ice', label: chrome.i18n.getMessage("gradientIce") || 'Ice' },
    { value: 'neon', label: chrome.i18n.getMessage("gradientNeon") || 'Neon' },
    { value: 'gold', label: chrome.i18n.getMessage("gradientGold") || 'Gold' },
    { value: 'silver', label: chrome.i18n.getMessage("gradientSilver") || 'Silver' },
    { value: 'twilight', label: chrome.i18n.getMessage("gradientTwilight") || 'Twilight' },
    { value: 'vintage', label: chrome.i18n.getMessage("gradientVintage") || 'Vintage' },
    { value: 'tropical', label: chrome.i18n.getMessage("gradientTropical") || 'Tropical' },
    { value: 'floral', label: chrome.i18n.getMessage("gradientFloral") || 'Floral' },
    { value: 'candy', label: chrome.i18n.getMessage("gradientCandy") || 'Candy' },
    { value: 'emerald', label: chrome.i18n.getMessage("gradientEmerald") || 'Emerald' },
    { value: 'sunset', label: chrome.i18n.getMessage("gradientSunset") || 'Sunset' },
    { value: 'galaxy', label: chrome.i18n.getMessage("gradientGalaxy") || 'Galaxy' },
    { value: 'aurora', label: chrome.i18n.getMessage("gradientAurora") || 'Aurora' }
  ];
  const gradientDropdownContainer = document.getElementById('gradientDropdownContainer');
  let currentGradient = 'rainbow';

  function renderGradientDropdown(selectedValue) {
    currentGradient = selectedValue;
    const selected = gradientOptions.find(o => o.value === selectedValue) || gradientOptions[0];
    const selectedGradColors = getGradientColors(selected.value);
    const selectedGradCSS = `linear-gradient(-45deg, ${selectedGradColors.join(', ')})`;
    gradientDropdownContainer.innerHTML = `
      <div class="cursor-dropdown-selected" id="gradientDropdownSelected" tabindex="0" role="button" aria-haspopup="listbox" aria-expanded="false">
        <span style="display:inline-block;vertical-align:middle;margin-right:0.5rem;width:0.375rem;height:1.25rem;border-radius:0.1875rem;background:${selectedGradCSS};background-size:400% 400%;animation:gradientAnimation 20s linear infinite;"></span>
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="gradientDropdownList" role="listbox">
        ${gradientOptions.map(o => {
      const gradColors = getGradientColors(o.value);
      const gradCSS = `linear-gradient(-45deg, ${gradColors.join(', ')})`;
      return `
            <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}" tabindex="0" role="option" aria-selected="${o.value === selectedValue}">
              <span style="display:inline-block;vertical-align:middle;margin-right:0.5rem;width:0.375rem;height:1.25rem;border-radius:0.1875rem;background:${gradCSS};background-size:400% 400%;animation:gradientAnimation 20s linear infinite;"></span>
              <span class="cursor-label">${o.label}</span>
            </div>
          `;
    }).join('')}
      </div>
    `;
    updateSettingsLivePreview(true);
  }
  chrome.storage.sync.get(['gradientStyle'], (result) => {
    renderGradientDropdown(result.gradientStyle || 'rainbow');
  });

  // Setup dropdown event listeners once
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.cursor-dropdown-selected')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  // Thickness dropdown listener
  thicknessDropdownContainer.addEventListener('click', (e) => {
    if (e.target.closest('.cursor-dropdown-selected')) {
      e.stopPropagation();
      closeAllDropdowns('thicknessDropdownList');
      const listDiv = document.getElementById('thicknessDropdownList');
      const selectedDiv = document.getElementById('thicknessDropdownSelected');
      listDiv.classList.toggle('open');
      selectedDiv.classList.toggle('open');
      selectedDiv.setAttribute('aria-expanded', selectedDiv.classList.contains('open'));
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      chrome.storage.sync.set({ Thickness: value });
      renderThicknessDropdown(value);
      document.getElementById('thicknessDropdownSelected').focus();
    }
  });

  thicknessDropdownContainer.addEventListener('keydown', (e) => {
    const isTrigger = document.activeElement.classList.contains('cursor-dropdown-selected');
    const list = document.getElementById('thicknessDropdownList');
    const isOpen = list.classList.contains('open');

    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      if (isTrigger) {
        // Toggle dropdown
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.activeElement.dispatchEvent(clickEvent);
      } else if (document.activeElement.classList.contains('cursor-dropdown-option')) {
        // Select option
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.activeElement.dispatchEvent(clickEvent);
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();

      // Main Navigation if dropdown is closed
      if (isTrigger && !isOpen) {
        if (e.key === 'ArrowDown') document.getElementById('blinkToggle').focus();
        if (e.key === 'ArrowUp') document.getElementById('gradientDropdownSelected').focus();
        return;
      }

      // Dropdown Option Navigation
      const options = Array.from(thicknessDropdownContainer.querySelectorAll('.cursor-dropdown-option'));
      const currentIndex = options.indexOf(document.activeElement);
      let nextIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % options.length;
      } else {
        nextIndex = (currentIndex - 1 + options.length) % options.length;
      }

      if (currentIndex === -1 && options.length > 0) {
        options[0].focus();
      } else if (options.length > 0) {
        options[nextIndex].focus();
      }
    }
  });

  // Gradient dropdown listener
  gradientDropdownContainer.addEventListener('click', (e) => {
    if (e.target.closest('.cursor-dropdown-selected')) {
      e.stopPropagation();
      closeAllDropdowns('gradientDropdownList');
      const listDiv = document.getElementById('gradientDropdownList');
      const selectedDiv = document.getElementById('gradientDropdownSelected');
      listDiv.classList.toggle('open');
      selectedDiv.classList.toggle('open');
      selectedDiv.setAttribute('aria-expanded', selectedDiv.classList.contains('open'));
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      chrome.storage.sync.set({ gradientStyle: value });
      renderGradientDropdown(value);
      document.getElementById('gradientDropdownSelected').focus();
    }
  });

  gradientDropdownContainer.addEventListener('keydown', (e) => {
    const isTrigger = document.activeElement.classList.contains('cursor-dropdown-selected');
    const list = document.getElementById('gradientDropdownList');
    const isOpen = list.classList.contains('open');

    // Tab Loop (Reverse)
    if (e.shiftKey && e.key === 'Tab' && isTrigger) {
      e.preventDefault();
      document.getElementById('translucentModeToggle').focus();
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      if (e.key === ' ') e.preventDefault();
      if (isTrigger) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.activeElement.dispatchEvent(clickEvent);
      } else if (document.activeElement.classList.contains('cursor-dropdown-option')) {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
        document.activeElement.dispatchEvent(clickEvent);
      }
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();

      // Main Navigation if dropdown is closed
      if (isTrigger && !isOpen) {
        if (e.key === 'ArrowDown') document.getElementById('thicknessDropdownSelected').focus();
        if (e.key === 'ArrowUp') document.getElementById('translucentModeToggle').focus();
        return;
      }

      const options = Array.from(gradientDropdownContainer.querySelectorAll('.cursor-dropdown-option'));
      const currentIndex = options.indexOf(document.activeElement);
      let nextIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % options.length;
      } else {
        nextIndex = (currentIndex - 1 + options.length) % options.length;
      }

      if (currentIndex === -1 && options.length > 0) {
        options[0].focus();
      } else if (options.length > 0) {
        options[nextIndex].focus();
      }
    }
  });

  // Toggle Buttons Navigation
  [blinkToggle, typewriterAnimationToggle, translucentModeToggle].forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      // Prevent default scrolling for arrows
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
      }
    });
  });

  blinkToggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') document.getElementById('typewriterAnimationToggle').focus();
    if (e.key === 'ArrowUp') document.getElementById('thicknessDropdownSelected').focus();
  });

  typewriterAnimationToggle.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') document.getElementById('translucentModeToggle').focus();
    if (e.key === 'ArrowUp') document.getElementById('blinkToggle').focus();
  });

  translucentModeToggle.addEventListener('keydown', (e) => {
    // Tab Loop (Forward)
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('gradientDropdownSelected').focus();
    }
    if (e.key === 'ArrowDown') document.getElementById('gradientDropdownSelected').focus();
    if (e.key === 'ArrowUp') document.getElementById('typewriterAnimationToggle').focus();
  });


});
