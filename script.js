/**
 * CABER TATTOO - Interactive Functionality
 * Official WhatsApp: +54 9 11 2723-3546 (5491127233546)
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_PHONE = '5491127233546';

  // -------------------------------------------------------------
  // 1. Header Scrolled State
  // -------------------------------------------------------------
  const header = document.getElementById('mainHeader');
  const updateHeaderScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();

  // -------------------------------------------------------------
  // 2. Mobile Menu Toggle
  // -------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // -------------------------------------------------------------
  // 3. Render Dynamic Gallery & Filter Buttons from TattooStore
  // -------------------------------------------------------------
  const galleryGrid = document.getElementById('galleryGrid');
  const portfolioFilters = document.getElementById('portfolioFilters');

  const renderDynamicGallery = () => {
    if (!galleryGrid || typeof TattooStore === 'undefined') return;

    const galleryTattoos = TattooStore.getGalleryTattoos();
    galleryGrid.innerHTML = '';

    // Extract unique categories for filter tabs
    const categoriesMap = new Map();
    categoriesMap.set('all', 'Todos');

    galleryTattoos.forEach((item, index) => {
      if (item.category && item.categoryLabel) {
        categoriesMap.set(item.category, item.categoryLabel);
      }

      const card = document.createElement('div');
      card.className = `gallery-item group relative aspect-[3/4] cursor-pointer reveal reveal-delay-${(index % 4) + 1}`;
      card.setAttribute('data-category', item.category || 'otros');
      card.setAttribute('data-src', item.imageSrc);
      card.setAttribute('data-title', item.title);
      card.setAttribute('data-desc', item.description || '');
      card.setAttribute('data-tag', item.categoryLabel || 'Tatuaje');

      card.innerHTML = `
        <img src="${item.imageSrc}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="gallery-overlay">
          <span class="tag-badge">${item.categoryLabel || 'Tatuaje'}</span>
          <h3 class="font-serif text-base font-bold text-white mt-1">${item.title}</h3>
          <p class="text-xs text-gray-300 line-clamp-1 mt-0.5">${item.description || ''}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        openModal(item.imageSrc, item.title, item.description || '', item.categoryLabel || 'Tatuaje');
      });

      galleryGrid.appendChild(card);
    });

    // Update filter tabs
    if (portfolioFilters) {
      portfolioFilters.innerHTML = '';
      categoriesMap.forEach((label, catKey) => {
        const btn = document.createElement('button');
        btn.className = `filter-btn ${catKey === 'all' ? 'active' : ''}`;
        btn.setAttribute('data-filter', catKey);
        btn.textContent = label;

        btn.addEventListener('click', () => {
          portfolioFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const allCards = galleryGrid.querySelectorAll('.gallery-item');
          allCards.forEach(item => {
            const itemCat = item.getAttribute('data-category');
            if (catKey === 'all' || itemCat === catKey) {
              item.style.display = 'block';
              item.style.opacity = '0';
              item.style.transform = 'scale(0.95)';
              setTimeout(() => {
                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              }, 30);
            } else {
              item.style.display = 'none';
            }
          });
        });

        portfolioFilters.appendChild(btn);
      });
    }
  };

  // -------------------------------------------------------------
  // 4. Lightbox Modal
  // -------------------------------------------------------------
  const lightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxQuoteBtn = document.getElementById('lightboxQuoteBtn');
  const closeLightbox = document.getElementById('closeLightbox');

  const openModal = (src, title, desc, tag) => {
    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxDesc.textContent = desc;
    lightboxTag.textContent = tag;

    const encodedMsg = encodeURIComponent(`Hola Caber! Estuve viendo en tu web el tatuaje "${title}" (${tag}) y me gustaría cotizar algo de ese estilo.`);
    lightboxQuoteBtn.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMsg}`;

    lightbox.classList.remove('pointer-events-none');
    lightbox.style.opacity = '1';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    lightbox.style.opacity = '0';
    lightbox.classList.add('pointer-events-none');
    document.body.style.overflow = '';
  };

  if (closeLightbox) {
    closeLightbox.addEventListener('click', closeModal);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Render initial dynamic gallery
  renderDynamicGallery();

  // -------------------------------------------------------------
  // 5. Interactive Quotation & Booking Calculator
  // -------------------------------------------------------------
  const choices = {
    studio: 'Avellaneda',
    style: 'Black & Grey / Sombras',
    placement: 'Brazo / Antebrazo',
    size: 'Pequeño / Mediano (hasta 12 cm)'
  };

  const setupStepChoices = (containerId, key) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const buttons = container.querySelectorAll('.choice-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        choices[key] = btn.getAttribute('data-value');
        updateQuoteSummary();
      });
    });
  };

  setupStepChoices('stepStudio', 'studio');
  setupStepChoices('stepStyle', 'style');
  setupStepChoices('stepPlacement', 'placement');
  setupStepChoices('stepSize', 'size');

  const liveSummaryText = document.getElementById('liveSummaryText');
  const btnSendQuote = document.getElementById('btnSendQuote');

  const updateQuoteSummary = () => {
    const textPreview = `"Hola Caber! Quiero consultar por un tattoo:\n• Estudio: ${choices.studio}\n• Estilo: ${choices.style}\n• Zona: ${choices.placement}\n• Tamaño: ${choices.size}."`;
    
    if (liveSummaryText) {
      liveSummaryText.textContent = textPreview;
    }

    const whatsappMessage = `Hola Caber! Quiero consultar para hacerme un tatuaje:\n\n📍 Estudio preferido: ${choices.studio}\n🎨 Estilo: ${choices.style}\n💪 Zona del cuerpo: ${choices.placement}\n📏 Tamaño aproximado: ${choices.size}\n\n¿Tenés fechas disponibles para coordinar?`;
    
    if (btnSendQuote) {
      btnSendQuote.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;
    }
  };

  // Initial calculation trigger
  updateQuoteSummary();

  // -------------------------------------------------------------
  // 6. FAQ Accordions
  // -------------------------------------------------------------
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isHidden = content.classList.contains('hidden');

        // Close all other accordions
        faqItems.forEach(other => {
          const otherContent = other.querySelector('.faq-content');
          const otherIcon = other.querySelector('.faq-icon');
          if (otherContent) otherContent.classList.add('hidden');
          if (otherIcon) otherIcon.innerHTML = '&plus;';
        });

        if (isHidden) {
          content.classList.remove('hidden');
          if (icon) icon.innerHTML = '&minus;';
        } else {
          content.classList.add('hidden');
          if (icon) icon.innerHTML = '&plus;';
        }
      });
    }
  });

  // -------------------------------------------------------------
  // 7. 3D Coverflow Slider Logic (con datos dinámicos de TattooStore)
  // -------------------------------------------------------------
  const coverflowSlider = document.getElementById('coverflowSlider');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const dotsContainer = document.getElementById('sliderDots');

  const initCoverflowFromStore = () => {
    if (!coverflowSlider || typeof TattooStore === 'undefined') return;

    const sliderTattoos = TattooStore.getSliderTattoos();
    if (sliderTattoos.length === 0) return;

    // Remove existing slides before rendering
    const oldSlides = coverflowSlider.querySelectorAll('.coverflow-slide');
    oldSlides.forEach(s => s.remove());

    sliderTattoos.forEach((item, index) => {
      const slide = document.createElement('div');
      slide.className = 'coverflow-slide';
      slide.setAttribute('data-index', index);
      slide.setAttribute('data-src', item.imageSrc);
      slide.setAttribute('data-title', item.title);
      slide.setAttribute('data-desc', item.description || '');
      slide.setAttribute('data-tag', item.categoryLabel || 'Tatuaje');

      slide.innerHTML = `
        <img src="${item.imageSrc}" alt="${item.title}">
        <div class="slide-caption">
          <span class="tag-badge">${item.categoryLabel || 'Tatuaje'}</span>
          <h4 class="font-serif text-sm sm:text-base font-bold text-white mt-1">${item.title}</h4>
        </div>
      `;

      coverflowSlider.appendChild(slide);
    });

    const slides = coverflowSlider.querySelectorAll('.coverflow-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoPlayTimer = null;

    // Create Indicator Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir al slide ${i + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(i);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      });
    }

    const updateSlider = () => {
      slides.forEach((slide, i) => {
        slide.className = 'coverflow-slide';

        // Calculate cyclic distance
        let diff = (i - currentIndex + totalSlides) % totalSlides;
        if (diff > totalSlides / 2) diff -= totalSlides;

        if (diff === 0) {
          slide.classList.add('active');
        } else if (diff === -1) {
          slide.classList.add('prev-1');
        } else if (diff === 1) {
          slide.classList.add('next-1');
        } else if (diff === -2) {
          slide.classList.add('prev-2');
        } else if (diff === 2) {
          slide.classList.add('next-2');
        } else if (diff < -2) {
          slide.classList.add('hidden-far-left');
        } else if (diff > 2) {
          slide.classList.add('hidden-far-right');
        }
      });

      // Update Dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, idx) => {
          if (idx === currentIndex) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    };

    const goToSlide = (index) => {
      currentIndex = (index + totalSlides) % totalSlides;
      updateSlider();
    };

    const nextSlide = () => {
      goToSlide(currentIndex + 1);
    };

    const prevSlide = () => {
      goToSlide(currentIndex - 1);
    };

    if (nextBtn) {
      nextBtn.onclick = (e) => {
        e.stopPropagation();
        nextSlide();
        resetAutoPlay();
      };
    }

    if (prevBtn) {
      prevBtn.onclick = (e) => {
        e.stopPropagation();
        prevSlide();
        resetAutoPlay();
      };
    }

    // Clicking a slide: if active, open modal; if side, advance to it
    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => {
        if (i === currentIndex) {
          const src = slide.getAttribute('data-src');
          const title = slide.getAttribute('data-title');
          const desc = slide.getAttribute('data-desc');
          const tag = slide.getAttribute('data-tag');
          if (src) openModal(src, title, desc, tag);
        } else {
          goToSlide(i);
          resetAutoPlay();
        }
      });
    });

    // Auto Advance every 2.4 seconds (más rápido y dinámico)
    const startAutoPlay = () => {
      if (!autoPlayTimer) {
        autoPlayTimer = setInterval(nextSlide, 2400);
      }
    };

    const stopAutoPlay = () => {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    };

    const resetAutoPlay = () => {
      stopAutoPlay();
      startAutoPlay();
    };

    coverflowSlider.addEventListener('mouseenter', stopAutoPlay);
    coverflowSlider.addEventListener('mouseleave', startAutoPlay);

    // Touch support (swipe left/right)
    let touchStartX = 0;
    let touchEndX = 0;

    coverflowSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    coverflowSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchEndX < touchStartX - 40) {
        nextSlide();
      } else if (touchEndX > touchStartX + 40) {
        prevSlide();
      }
      startAutoPlay();
    }, { passive: true });

    // Initialize
    updateSlider();
    startAutoPlay();
  };

  initCoverflowFromStore();

  // -------------------------------------------------------------
  // 8. Scroll Reveal Observer
  // -------------------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

});

