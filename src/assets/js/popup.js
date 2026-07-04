document.addEventListener('DOMContentLoaded', () => {
  function setLocalizedText(id, messageKey) {
    const element = document.getElementById(id);
    if (element) {
      element.innerText = chrome.i18n.getMessage(messageKey);
    }
  }

  setLocalizedText('gradientLabel', 'gradientLabel');
  setLocalizedText('gradientTypeLabel', 'gradientTypeLabel');
  setLocalizedText('ThicknessLabel', 'ThicknessLabel');
  setLocalizedText('BlinkLabel', 'BlinkLabel');
  setLocalizedText('typewriterAnimationLabel', 'typewriterAnimationLabel');
  setLocalizedText('TranslucentModeLabel', 'TranslucentModeLabel');

  function getGradientColors(gradientValue, applyTranslucent = false) {
    const gradientStyles = {
      rainbow: ['#ff69b4', '#9370db', '#48c9b0', '#ffd700', '#ff69b4'],
      multicolor: ['#e6e6e6', '#333333'],

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
      invertedPurple: ['#aa00ff', '#64dd17', '#6a008a', '#aeea00', '#aa00ff'],
    };
    let colors = gradientStyles[gradientValue] || gradientStyles.rainbow;

    if (applyTranslucent) {
      colors = colors.map(color => {
        return color + '80';
      });
    }
    return colors;
  }

  const thicknessInput = document.getElementById('thicknessInput');
  const gradientTypeInput = document.getElementById('gradientTypeInput');
  const ThicknessKey = 'Thickness';

  const BlinkKey = 'Blink';
  const TypewriterAnimationKey = 'typewriterAnimation';
  const TranslucentModeKey = 'TranslucentMode';
  const GradientTypeKey = 'GradientType';

  const blinkToggle = document.getElementById('blinkToggle');
  const typewriterAnimationToggle = document.getElementById('typewriterAnimationToggle');
  const translucentModeToggle = document.getElementById('translucentModeToggle');

  const gradientTypeOptions = [
    { value: 'linear', label: chrome.i18n.getMessage('gradientLinear') || 'Linear' },
    { value: 'segmented', label: chrome.i18n.getMessage('gradientSegmented') || 'Segmented' },
    { value: 'fade', label: chrome.i18n.getMessage('gradientFade') || 'Fade' },
  ];

  function resizeSelect(select) {
    if (!select) return;
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      const temp = document.createElement('span');
      temp.style.cssText = 'visibility:hidden;position:fixed;font-size:1rem;font-family:inherit;white-space:nowrap;padding:0 .5rem';
      temp.textContent = selectedOption.text;
      document.body.appendChild(temp);
      const width = temp.offsetWidth;
      document.body.removeChild(temp);
      select.style.width = `${Math.max(width + 16, 40)}px`;
    }
  }

  function renderSelectOptions(select, options, selectedValue) {
    if (!select) return;
    select.innerHTML = options.map(option => `
      <option value="${option.value}" ${option.value === selectedValue ? 'selected' : ''}>${option.label}</option>
    `).join('');
    resizeSelect(select);
  }

  const saveOptions = async () => {
    await chrome.storage.sync.set({
      [BlinkKey]: blinkToggle.checked,
      [TypewriterAnimationKey]: typewriterAnimationToggle.checked,
      [TranslucentModeKey]: translucentModeToggle.checked,
      [ThicknessKey]: thicknessInput.value || '2',
      [GradientTypeKey]: gradientTypeInput.value || 'linear',
    });
  };

  const restoreOptions = async () => {
    const result = await chrome.storage.sync.get({
      [BlinkKey]: true,
      [TypewriterAnimationKey]: false,
      [TranslucentModeKey]: false,
      [ThicknessKey]: '2',
      [GradientTypeKey]: 'linear',
    });

    blinkToggle.checked = result[BlinkKey];
    typewriterAnimationToggle.checked = result[TypewriterAnimationKey];
    translucentModeToggle.checked = result[TranslucentModeKey];
    thicknessInput.value = result[ThicknessKey] || '2';
    renderSelectOptions(gradientTypeInput, gradientTypeOptions, result[GradientTypeKey] || 'linear');
  };

  blinkToggle.addEventListener('change', saveOptions);
  typewriterAnimationToggle.addEventListener('change', saveOptions);
  translucentModeToggle.addEventListener('change', saveOptions);
  thicknessInput.addEventListener('change', () => { saveOptions(); resizeSelect(thicknessInput); });
  gradientTypeInput?.addEventListener('change', () => { saveOptions(); resizeSelect(gradientTypeInput); });
  

  restoreOptions();

  const gradientOptions = [
    { value: 'multicolor', label: chrome.i18n.getMessage("gradientMulticolor") || 'Multicolor' },
    { value: 'rainbow', label: chrome.i18n.getMessage("gradientRainbow") || 'Rainbow' },

    { value: 'microRed', label: chrome.i18n.getMessage("gradientMicroRed") || 'Crimson Depth' },
    { value: 'microOrange', label: chrome.i18n.getMessage("gradientMicroOrange") || 'Tangerine Glow' },
    { value: 'microYellow', label: chrome.i18n.getMessage("gradientMicroYellow") || 'Solar Flare' },
    { value: 'microGreen', label: chrome.i18n.getMessage("gradientMicroGreen") || 'Forest Shade' },
    { value: 'microBlue', label: chrome.i18n.getMessage("gradientMicroBlue") || 'Deep Cobalt' },
    { value: 'microPurple', label: chrome.i18n.getMessage("gradientMicroPurple") || 'Midnight Plum' },

    { value: 'radicalRed', label: chrome.i18n.getMessage("gradientRadicalRed") || 'Laser Strike' },
    { value: 'radicalOrange', label: chrome.i18n.getMessage("gradientRadicalOrange") || 'Magma Crack' },
    { value: 'radicalYellow', label: chrome.i18n.getMessage("gradientRadicalYellow") || 'Lightning Strike' },
    { value: 'radicalGreen', label: chrome.i18n.getMessage("gradientRadicalGreen") || 'Matrix Neon' },
    { value: 'radicalBlue', label: chrome.i18n.getMessage("gradientRadicalBlue") || 'Electric Void' },
    { value: 'radicalPurple', label: chrome.i18n.getMessage("gradientRadicalPurple") || 'Cyber Violet' },

    { value: 'extremeRed', label: chrome.i18n.getMessage("gradientExtremeRed") || 'Heartbeat Pulsar' },
    { value: 'extremeOrange', label: chrome.i18n.getMessage("gradientExtremeOrange") || 'Solar Wind' },
    { value: 'extremeYellow', label: chrome.i18n.getMessage("gradientExtremeYellow") || 'Kinetic Energy' },
    { value: 'extremeGreen', label: chrome.i18n.getMessage("gradientExtremeGreen") || 'Acid Wave' },
    { value: 'extremeBlue', label: chrome.i18n.getMessage("gradientExtremeBlue") || 'Sonic Boom' },
    { value: 'extremePurple', label: chrome.i18n.getMessage("gradientExtremePurple") || 'Gamma Ray' },

    { value: 'harmonicRed', label: chrome.i18n.getMessage("gradientHarmonicRed") || 'Sunset Rose' },
    { value: 'harmonicOrange', label: chrome.i18n.getMessage("gradientHarmonicOrange") || 'Autumn Gold' },
    { value: 'harmonicYellow', label: chrome.i18n.getMessage("gradientHarmonicYellow") || 'Citrus Grove' },
    { value: 'harmonicGreen', label: chrome.i18n.getMessage("gradientHarmonicGreen") || 'Bio Lumina' },
    { value: 'harmonicBlue', label: chrome.i18n.getMessage("gradientHarmonicBlue") || 'Deep Ocean' },
    { value: 'harmonicPurple', label: chrome.i18n.getMessage("gradientHarmonicPurple") || 'Cosmic Velvet' },

    { value: 'invertedRed', label: chrome.i18n.getMessage("gradientInvertedRed") || 'Crimson Teal' },
    { value: 'invertedOrange', label: chrome.i18n.getMessage("gradientInvertedOrange") || 'Amber Indigo' },
    { value: 'invertedYellow', label: chrome.i18n.getMessage("gradientInvertedYellow") || 'Marigold Violet' },
    { value: 'invertedGreen', label: chrome.i18n.getMessage("gradientInvertedGreen") || 'Emerald Magenta' },
    { value: 'invertedBlue', label: chrome.i18n.getMessage("gradientInvertedBlue") || 'Sapphire Tangerine' },
    { value: 'invertedPurple', label: chrome.i18n.getMessage("gradientInvertedPurple") || 'Amethyst Lime' },
  ];
  const gradientCarouselTrack = document.getElementById('gradientCarouselTrack');
  const gradientPrev = document.getElementById('gradientPrev');
  const gradientNext = document.getElementById('gradientNext');
  let currentGradient = 'rainbow';

  function createGradientItem(option, selectedValue) {
    const gradColors = getGradientColors(option.value);
    const isSelected = option.value === selectedValue;
    let gradCSS, extraStyle;

    if (option.value === 'multicolor') {
      const pieColors = ['#ff073a', '#ff8c00', '#ffd700', '#39ff14', '#00c9ff', '#1e90ff', '#9370db', '#ff69b4'];
      const continuousColors = [...pieColors, pieColors[0]];
      const slices = continuousColors.map((c, i) => `${c} ${(i / pieColors.length) * 100}%`).join(',');
      gradCSS = `conic-gradient(${slices})`;
      extraStyle = '';
    } else {
      gradCSS = `linear-gradient(-45deg, ${gradColors.join(', ')})`;
      extraStyle = 'background-size:400% 400%;animation:gradientAnimation 20s linear infinite;';
    }

    return `
      <button
        type="button"
        class="gradient-carousel-item${isSelected ? ' selected' : ''}"
        data-value="${option.value}"
        aria-label="${option.label}"
        aria-pressed="${isSelected}"
        role="option"
        title="${option.label}"
        style="background:${gradCSS};${extraStyle}"
      ></button>
    `;
  }

  function updateGradientNavButtons() {
    if (!gradientCarouselTrack || !gradientPrev || !gradientNext) return;

    const canScrollLeft = gradientCarouselTrack.scrollLeft > 0;
    const canScrollRight = gradientCarouselTrack.scrollLeft + gradientCarouselTrack.clientWidth < gradientCarouselTrack.scrollWidth - 1;

    gradientPrev.classList.toggle('hidden', !canScrollLeft);
    gradientNext.classList.toggle('hidden', !canScrollRight);
  }

  function renderGradientCarousel(selectedValue) {
    currentGradient = selectedValue;
    if (!gradientCarouselTrack) return;

    gradientCarouselTrack.innerHTML = gradientOptions.map(option => createGradientItem(option, selectedValue)).join('');

    if (selectedValue) {
      const selectedItem = gradientCarouselTrack.querySelector(`[data-value="${selectedValue}"]`);
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: 'instant', inline: 'start', block: 'nearest' });
      }
    }

    updateGradientNavButtons();
  }

  function saveGradientStyle(value) {
    chrome.storage.sync.set({ gradientStyle: value });
  }

  function handleGradientSelection(value) {
    if (!value || value === currentGradient) return;
    saveGradientStyle(value);
    currentGradient = value;
    gradientCarouselTrack.querySelectorAll('.gradient-carousel-item').forEach(item => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    const selectedItem = gradientCarouselTrack.querySelector(`[data-value="${value}"]`);
    if (selectedItem) {
      selectedItem.classList.add('selected');
      selectedItem.setAttribute('aria-pressed', 'true');
      selectedItem.focus({ preventScroll: true });
      selectedItem.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    updateGradientNavButtons();
  }

  if (gradientCarouselTrack) {
    gradientCarouselTrack.addEventListener('click', (event) => {
      const item = event.target.closest('.gradient-carousel-item');
      if (item && gradientCarouselTrack.contains(item)) {
        handleGradientSelection(item.dataset.value);
      }
    });

    gradientCarouselTrack.addEventListener('scroll', updateGradientNavButtons);
  }

  gradientPrev?.addEventListener('click', () => {
    if (!gradientCarouselTrack) return;
    gradientCarouselTrack.scrollBy({ left: -gradientCarouselTrack.clientWidth, behavior: 'smooth' });
  });

  gradientNext?.addEventListener('click', () => {
    if (!gradientCarouselTrack) return;
    gradientCarouselTrack.scrollBy({ left: gradientCarouselTrack.clientWidth, behavior: 'smooth' });
  });

  chrome.storage.sync.get(['gradientStyle'], (result) => {
    renderGradientCarousel(result.gradientStyle || 'rainbow' );
  });

  function focusSelectedGradientItem() {
    const selectedItem = gradientCarouselTrack?.querySelector('.gradient-carousel-item.selected');
    if (selectedItem) {
      selectedItem.focus();
      selectedItem.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  }
});
