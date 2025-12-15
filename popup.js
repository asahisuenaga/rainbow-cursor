const helloTranslations = [
  'Hello', // en
  'ሰላም', // am
  'مرحبا', // ar
  'Здравей', // bg
  'হ্যালো', // bn
  'Hola', // ca
  'Ahoj', // cs
  'Hej', // da
  'Hallo', // de
  'Γειά', // el
  'Hola', // es
  'Tere', // et
  'سلام', // fa
  'Hei', // fi
  'Kumusta', // fil
  'Bonjour', // fr
  'હેલો', // gu
  'שלום', // he
  'नमस्ते', // hi
  'Bok', // hr
  'Helló', // hu
  'Halo', // id
  'Ciao', // it
  'こんにちは', // ja
  'ಹಲೋ', // kn
  '안녕하세요', // ko
  'Labas', // lt
  'Sveiki', // lv
  'ഹലോ', // ml
  'नमस्कार', // mr
  'Halo', // ms
  'Hallo', // nl
  'Hei', // no
  'Cześć', // pl
  'Olá', // pt_BR
  'Olá', // pt_PT
  'Salut', // ro
  'Привет', // ru
  'Ahoj', // sk
  'Živjo', // sl
  'Здраво', // sr
  'Hej', // sv
  'Hujambo', // sw
  'வணக்கம்', // ta
  'హలో', // te
  'สวัสดี', // th
  'Merhaba', // tr
  'Привіт', // uk
  'Xin chào', // vi
  '你好', // zh_CN
  '你好', // zh_TW
];

let helloIndex = 0;
let typingTimeout = null;
let typingState = { text: '', phase: 'typing', charIndex: 0 };

document.addEventListener('DOMContentLoaded', () => {
  // Get references to elements
  const saveButton = document.getElementById('saveButton');
  const maker = document.getElementById('maker');
  const infoMessage = document.getElementById("infoMessage");
  const redirectContainer = document.getElementById("redirectContainer");
  const optionsContainer = document.getElementById("optionsContainer");
  const livePreviewSection = document.getElementById('livePreviewSection');

  // Helper function to set localized text
  function setLocalizedText(id, messageKey) {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = chrome.i18n.getMessage(messageKey);
    }
  }

  // Set localized text for all elements
  setLocalizedText('closeUpgradePopup', 'closeButton');
  setLocalizedText('submitCodeButton', 'submitButton');
  setLocalizedText('title', 'title');
  setLocalizedText('ThicknessLabel', 'ThicknessLabel');
  setLocalizedText('BlinkLabel', 'BlinkLabel');
  setLocalizedText('SmoothAnimationLabel', 'SmoothAnimationLabel');
  setLocalizedText('TranslucentModeLabel', 'TranslucentModeLabel');
  setLocalizedText('gradientLabel', 'gradientLabel');
  setLocalizedText('infoMessageText', 'infoMessage');
  setLocalizedText('redirectButton', 'openDocsButton');
  setLocalizedText('saveButton', 'saveButton');
  setLocalizedText('maker', 'maker');
  setLocalizedText('settingsLivePreviewLabel', 'livePreviewLabel');

  // Load saved settings (only needed to trigger renderDropdown functions later)
  chrome.storage.sync.get(['Thickness', 'Blink', 'gradientStyle', 'TranslucentMode'], () => {
    // No need to set values here as dropdowns are rendered later
  });

  // Event listener for "Save" button to close the popup
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      window.close();
    });
  }

  // Event listener for "Feedback" button
  if (maker) {
    maker.addEventListener('click', () => {
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
      // Show message and button if not in Google Docs
      infoMessage.innerHTML = `<p>${chrome.i18n.getMessage("notInDocsMessage")}</p>`;
      redirectContainer.style.display = 'block';

      // Hide settings elements
      if (optionsContainer) optionsContainer.style.display = 'none';
      if (saveButton) saveButton.style.display = 'none';
      if (livePreviewSection) livePreviewSection.style.display = 'none';

      // Event listener for "Open Google Docs" button
      document.getElementById('redirectButton').addEventListener('click', () => {
        window.open('https://docs.google.com/document', '_blank');
        window.close();
      });
    } else {
      // Hide redirect message and show live preview if in Google Docs
      if (redirectContainer) redirectContainer.style.display = 'none';
      if (livePreviewSection) livePreviewSection.style.display = 'block';
      updateSettingsLivePreview();
    }
  });
  // The redundant block of code that ran the Google Docs check a second time was removed.

  // Map of locale codes to helloTranslations index
  const localeToHelloIndex = {
    'en': 0, 'am': 1, 'ar': 2, 'bg': 3, 'bn': 4, 'ca': 5, 'cs': 6, 'da': 7, 'de': 8, 'el': 9, 'es': 10, 'et': 11, 'fa': 12, 'fi': 13, 'fil': 14, 'fr': 15, 'gu': 16, 'he': 17, 'hi': 18, 'hr': 19, 'hu': 20, 'id': 21, 'it': 22, 'ja': 23, 'kn': 24, 'ko': 25, 'lt': 26, 'lv': 27, 'ml': 28, 'mr': 29, 'ms': 30, 'nl': 31, 'no': 32, 'pl': 33, 'pt': 34, 'pt_BR': 34, 'pt_PT': 35, 'ro': 36, 'ru': 37, 'sk': 38, 'sl': 39, 'sr': 40, 'sv': 41, 'sw': 42, 'ta': 43, 'te': 44, 'th': 45, 'tr': 46, 'uk': 47, 'vi': 48, 'zh': 49, 'zh_CN': 49, 'zh_TW': 50
  };

  // On first load, set helloIndex to user's locale
  (function setHelloIndexToLocale() {
    const userLocale = (chrome.i18n.getUILanguage() || '').replace('-', '_');
    // Simplified locale lookup logic by combining 'pt' and 'zh' cases
    const baseLocale = userLocale.split('_')[0];
    if (localeToHelloIndex.hasOwnProperty(userLocale)) {
      helloIndex = localeToHelloIndex[userLocale];
    } else if (localeToHelloIndex.hasOwnProperty(baseLocale)) {
      // Handles 'pt' and 'zh' base locales which map to a different index than their variants
      if (baseLocale === 'pt' && userLocale !== 'pt_PT') {
        helloIndex = localeToHelloIndex['pt_BR']; // Use pt_BR for base 'pt' and other variants
      } else if (baseLocale === 'zh' && userLocale !== 'zh_TW') {
        helloIndex = localeToHelloIndex['zh_CN']; // Use zh_CN for base 'zh' and other variants
      } else {
        helloIndex = localeToHelloIndex[baseLocale];
      }
    } else {
      helloIndex = 0;
    }
  })();
  // NOTE: The localeToHelloIndex mapping for 'pt' and 'zh' is a little messy 
  // in the original code. I kept the original messy map and simplified the logic
  // to avoid breaking the expected behavior, but the map itself is still used.

  function getGradientColors(gradientValue, applyTranslucent = false) {
    // Match the color arrays from script.js
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

    // Apply translucent mode if enabled
    if (applyTranslucent) {
      colors = colors.map(color => {
        // Add 80 hex opacity to each color
        return color + '80';
      });
    }

    return colors;
  }

  function updateSettingsLivePreview(updateCaretOnly = false) {
    if (!isGoogleDocs) return;
    const thicknessObj = thicknessOptions.find(o => o.value === currentThickness) || thicknessOptions[0];
    const blinkObj = blinkOptions.find(o => o.value === currentBlink) || blinkOptions[0];
    const smoothAnimationObj = smoothAnimationOptions.find(o => o.value === currentSmoothAnimation) || smoothAnimationOptions[0];
    const translucentModeObj = translucentModeOptions.find(o => o.value === currentTranslucentMode) || translucentModeOptions[0];
    const gradientColors = getGradientColors(currentGradient, translucentModeObj.translucent);
    const gradientCSS = `linear-gradient(-45deg, ${gradientColors.join(', ')})`;
    const previewBox = document.getElementById('settingsLivePreview');
    const livePreviewLabel = chrome.i18n.getMessage('livePreviewLabel') || 'Live Preview';
    const labelElement = previewBox.parentElement.querySelector('#settingsLivePreviewLabel');
    if (labelElement) labelElement.textContent = livePreviewLabel;

    // Typing animation logic
    const helloText = helloTranslations[helloIndex % helloTranslations.length];
    if (!typingState.text || typingState.text !== helloText) {
      typingState = { text: helloText, phase: 'typing', charIndex: 0 };
    }
    let displayText = helloText.slice(0, typingState.charIndex);

    // Calculate animation duration based on blink speed
    let animationStyle = '';
    let backgroundStyle = gradientCSS;

    if (blinkObj.blink) {
      const duration = blinkObj.speed === 0.5 ? '2.8s' : '1.4s';
      animationStyle = `animation: caret-blink ${duration} steps(1) infinite, gradientAnimation 20s linear infinite;`;
    } else {
      animationStyle = `animation: gradientAnimation 20s linear infinite;`;
    }

    // Add smooth transition if enabled
    let smoothTransition = '';
    if (smoothAnimationObj.smooth) {
      smoothTransition = 'transition: all 80ms ease;';
    }

    let caretClass = `live-gradient-bar live-gradient-animated`;
    let caretStyle = `display:inline-block;vertical-align:bottom;width:${thicknessObj.width}px;height:20px;margin-left:8px;border-radius:3px;background:${backgroundStyle};background-size:400% 400%;${animationStyle}${smoothTransition}`;

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
      </style>
      <div class='cursor-dropdown-selected' style='overflow: hidden; display: flex; align-items: center; justify-content: center; gap: 0;'>
        <span style='font-size: 14px; font-family: inherit; color: inherit; user-select: none;'>${displayText}</span>
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

  // Prevents the context menu from popping up
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // --- Rainbow Dropdown for Thickness ---
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
      if (!exceptId || sel.id !== exceptId.replace('List', 'Selected')) sel.classList.remove('open');
    });
  }

  function renderThicknessDropdown(selectedValue) {
    currentThickness = selectedValue;
    const selected = thicknessOptions.find(o => o.value === selectedValue) || thicknessOptions[0];
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    thicknessDropdownContainer.innerHTML = `
      <div class="cursor-dropdown-selected" id="thicknessDropdownSelected">
        <span class="${isDark ? 'dark-preview-bar' : ''}" style="display:inline-block;vertical-align:middle;margin-right:8px;width:${selected.width}px;height:20px;border-radius:3px;background:#111;"></span>
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="thicknessDropdownList">
        ${thicknessOptions.map(o => `
          <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}">
            <span class="${isDark ? 'dark-preview-bar' : ''}" style="display:inline-block;vertical-align:middle;margin-right:8px;width:${o.width}px;height:20px;border-radius:3px;background:#111;"></span>
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

  // --- Rainbow Dropdown for Blink ---
  const blinkOptions = [
    // Note: The value names are confusing ('false' means blink is TRUE, 'true' means blink is FALSE) but kept for compatibility
    { value: 'false', label: chrome.i18n.getMessage("trueOption") || 'Yes', blink: true, speed: 1.0 },
    { value: 'half', label: '0.5x', blink: true, speed: 0.5 },
    { value: 'true', label: chrome.i18n.getMessage("falseOption") || 'No', blink: false, speed: 0 }
  ];
  const blinkDropdownContainer = document.getElementById('blinkDropdownContainer');
  let currentBlink = 'false';

  function createBlinkPreviewBar(option, thickness = 4) {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const animationDuration = option.speed === 0 ? '0s' : option.speed === 0.5 ? '2.8s' : '1.4s';
    return `<span class="${isDark ? 'dark-preview-bar' : ''}" style="display:inline-block;vertical-align:middle;margin-right:8px;width:${thickness}px;height:20px;border-radius:3px;background:#111;${option.blink ? `animation:caret-blink ${animationDuration} steps(1) infinite;` : ''}"></span>`;
  }

  function renderBlinkDropdown(selectedValue) {
    currentBlink = selectedValue;
    const selected = blinkOptions.find(o => o.value === selectedValue) || blinkOptions[0];

    blinkDropdownContainer.innerHTML = `
      <div class="cursor-dropdown-selected" id="blinkDropdownSelected">
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="blinkDropdownList">
        ${blinkOptions.map(o => `
          <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}">
            <span class="cursor-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
    updateSettingsLivePreview(true);
  }
  chrome.storage.sync.get(['Blink'], (result) => {
    renderBlinkDropdown(result.Blink !== undefined ? String(result.Blink) : 'false');
  });

  // --- Rainbow Dropdown for Smooth Animation ---
  const smoothAnimationOptions = [
    { value: 'true', label: chrome.i18n.getMessage("trueOption") || 'Yes', smooth: true },
    { value: 'false', label: chrome.i18n.getMessage("falseOption") || 'No', smooth: false }
  ];
  const smoothAnimationDropdownContainer = document.getElementById('smoothAnimationDropdownContainer');
  let currentSmoothAnimation = 'false';

  function renderSmoothAnimationDropdown(selectedValue) {
    currentSmoothAnimation = selectedValue;
    const selected = smoothAnimationOptions.find(o => o.value === selectedValue) || smoothAnimationOptions[0];

    smoothAnimationDropdownContainer.innerHTML = `
      <div class="cursor-dropdown-selected" id="smoothAnimationDropdownSelected">
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="smoothAnimationDropdownList">
        ${smoothAnimationOptions.map(o => `
          <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}">
            <span class="cursor-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
    updateSettingsLivePreview(true);
  }
  chrome.storage.sync.get(['SmoothAnimation'], (result) => {
    // Note: The result from storage can be a boolean, but dropdown values are strings. The original code
    // handled this with a String() cast, which is preserved.
    renderSmoothAnimationDropdown(result.SmoothAnimation !== undefined ? String(result.SmoothAnimation) : 'false');
  });

  // --- Rainbow Dropdown for Translucent Mode ---
  const translucentModeOptions = [
    { value: 'true', label: chrome.i18n.getMessage("trueOption") || 'Yes', translucent: true },
    { value: 'false', label: chrome.i18n.getMessage("falseOption") || 'No', translucent: false }
  ];
  const translucentModeDropdownContainer = document.getElementById('translucentModeDropdownContainer');
  let currentTranslucentMode = 'false';

  function renderTranslucentModeDropdown(selectedValue) {
    currentTranslucentMode = selectedValue;
    const selected = translucentModeOptions.find(o => o.value === selectedValue) || translucentModeOptions[0];

    translucentModeDropdownContainer.innerHTML = `
      <div class="cursor-dropdown-selected" id="translucentModeDropdownSelected">
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="translucentModeDropdownList">
        ${translucentModeOptions.map(o => `
          <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}">
            <span class="cursor-label">${o.label}</span>
          </div>
        `).join('')}
      </div>
    `;
    updateSettingsLivePreview(true);
  }
  chrome.storage.sync.get(['TranslucentMode'], (result) => {
    renderTranslucentModeDropdown(result.TranslucentMode !== undefined ? String(result.TranslucentMode) : 'false');
  });

  // --- Rainbow Dropdown for Gradient ---
  const gradientOptions = [
    // Removed the 'gradient' property since it's redundant; colors are fetched by getGradientColors
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
      <div class="cursor-dropdown-selected" id="gradientDropdownSelected">
        <span style="display:inline-block;vertical-align:middle;margin-right:8px;width:6px;height:20px;border-radius:3px;background:${selectedGradCSS};background-size:400% 400%;animation:gradientAnimation 20s linear infinite;"></span>
        <span class="cursor-label">${selected.label}</span>
        <span class="cursor-dropdown-arrow">▼</span>
      </div>
      <div class="cursor-dropdown-list" id="gradientDropdownList">
        ${gradientOptions.map(o => {
      const gradColors = getGradientColors(o.value);
      const gradCSS = `linear-gradient(-45deg, ${gradColors.join(', ')})`;
      return `
            <div class="cursor-dropdown-option${o.value === selectedValue ? ' selected' : ''}" data-value="${o.value}">
              <span style="display:inline-block;vertical-align:middle;margin-right:8px;width:6px;height:20px;border-radius:3px;background:${gradCSS};background-size:400% 400%;animation:gradientAnimation 20s linear infinite;"></span>
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

  // Thickness dropdown listener
  thicknessDropdownContainer.addEventListener('click', (e) => {
    if (e.target.closest('.cursor-dropdown-selected')) {
      e.stopPropagation();
      closeAllDropdowns('thicknessDropdownList');
      const listDiv = document.getElementById('thicknessDropdownList');
      const selectedDiv = document.getElementById('thicknessDropdownSelected');
      listDiv.classList.toggle('open');
      selectedDiv.classList.toggle('open');
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      chrome.storage.sync.set({ Thickness: value });
      renderThicknessDropdown(value);
    }
  });

  // Blink dropdown listener
  blinkDropdownContainer.addEventListener('click', (e) => {
    if (e.target.closest('.cursor-dropdown-selected')) {
      e.stopPropagation();
      closeAllDropdowns('blinkDropdownList');
      const listDiv = document.getElementById('blinkDropdownList');
      const selectedDiv = document.getElementById('blinkDropdownSelected');
      listDiv.classList.toggle('open');
      selectedDiv.classList.toggle('open');
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      chrome.storage.sync.set({ Blink: value });
      renderBlinkDropdown(value);
    }
  });

  // Smooth Animation dropdown listener
  smoothAnimationDropdownContainer.addEventListener('click', (e) => {
    if (e.target.closest('.cursor-dropdown-selected')) {
      e.stopPropagation();
      closeAllDropdowns('smoothAnimationDropdownList');
      const listDiv = document.getElementById('smoothAnimationDropdownList');
      const selectedDiv = document.getElementById('smoothAnimationDropdownSelected');
      listDiv.classList.toggle('open');
      selectedDiv.classList.toggle('open');
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      // The original code converted the string 'true'/'false' to a boolean here, which is preserved.
      chrome.storage.sync.set({ SmoothAnimation: value === 'true' });
      renderSmoothAnimationDropdown(value);
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
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      chrome.storage.sync.set({ gradientStyle: value });
      renderGradientDropdown(value);
    }
  });

  // Translucent Mode dropdown listener
  translucentModeDropdownContainer.addEventListener('click', (e) => {
    if (e.target.closest('.cursor-dropdown-selected')) {
      e.stopPropagation();
      closeAllDropdowns('translucentModeDropdownList');
      const listDiv = document.getElementById('translucentModeDropdownList');
      const selectedDiv = document.getElementById('translucentModeDropdownSelected');
      listDiv.classList.toggle('open');
      selectedDiv.classList.toggle('open');
    } else if (e.target.closest('.cursor-dropdown-option')) {
      e.stopPropagation();
      const value = e.target.closest('.cursor-dropdown-option').getAttribute('data-value');
      chrome.storage.sync.set({ TranslucentMode: value === 'true' });
      renderTranslucentModeDropdown(value);
    }
  });
});
