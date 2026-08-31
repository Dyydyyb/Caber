// admin.js - Lógica y gestión reactiva del Panel de Administración Caber Tattoo
document.addEventListener('DOMContentLoaded', () => {
  const SESSION_AUTH_KEY = 'caber_admin_auth_active';

  // Elements
  const loginScreen = document.getElementById('loginScreen');
  const adminPanel = document.getElementById('adminPanel');
  const pinForm = document.getElementById('pinForm');
  const inputPin = document.getElementById('inputPin');
  const loginError = document.getElementById('loginError');
  const btnLogout = document.getElementById('btnLogout');

  // Stats
  const statTotal = document.getElementById('statTotal');
  const statSlider = document.getElementById('statSlider');
  const statGallery = document.getElementById('statGallery');
  const statCategories = document.getElementById('statCategories');

  // Grid & Filters
  const tattoosGrid = document.getElementById('tattoosGrid');
  const emptyState = document.getElementById('emptyState');
  const adminFilters = document.getElementById('adminFilters');
  const btnOpenAddModal = document.getElementById('btnOpenAddModal');
  const btnEmptyAdd = document.getElementById('btnEmptyAdd');
  const btnExportJSON = document.getElementById('btnExportJSON');
  const btnResetDefault = document.getElementById('btnResetDefault');

  // Modal & Form
  const tattooModal = document.getElementById('tattooModal');
  const modalTitle = document.getElementById('modalTitle');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const tattooForm = document.getElementById('tattooForm');

  const editTattooId = document.getElementById('editTattooId');
  const imagePreview = document.getElementById('imagePreview');
  const previewPlaceholder = document.getElementById('previewPlaceholder');
  const fileInput = document.getElementById('fileInput');
  const imageUrlInput = document.getElementById('imageUrlInput');
  const tattooTitle = document.getElementById('tattooTitle');
  const tattooCategorySelect = document.getElementById('tattooCategorySelect');
  const customCategoryInput = document.getElementById('customCategoryInput');
  const tattooDesc = document.getElementById('tattooDesc');
  const checkSlider = document.getElementById('checkSlider');
  const checkGallery = document.getElementById('checkGallery');

  let currentFilter = 'all';
  let activeImageSrc = '';

  // -------------------------------------------------------------
  // 1. Auth & Session Handling
  // -------------------------------------------------------------
  const checkSession = () => {
    const isAuth = sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
    if (isAuth) {
      loginScreen.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      loadAndRenderTattoos();
    } else {
      loginScreen.classList.remove('hidden');
      adminPanel.classList.add('hidden');
      inputPin.focus();
    }
  };

  pinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = inputPin.value.trim();
    if (TattooStore.checkPin(pin)) {
      loginError.classList.add('hidden');
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      inputPin.value = '';
      checkSession();
    } else {
      loginError.classList.remove('hidden');
      inputPin.value = '';
      inputPin.focus();
    }
  });

  btnLogout.addEventListener('click', () => {
    if (confirm('¿Cerrar sesión del panel de administración?')) {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
      checkSession();
    }
  });

  // -------------------------------------------------------------
  // 2. Render Tattoos & Metrics
  // -------------------------------------------------------------
  const loadAndRenderTattoos = () => {
    const allTattoos = TattooStore.getAll();

    // Update Stats
    statTotal.textContent = allTattoos.length;
    statSlider.textContent = allTattoos.filter(t => t.showInSlider).length;
    statGallery.textContent = allTattoos.filter(t => t.showInGallery).length;

    const uniqueCats = new Set(allTattoos.map(t => t.categoryLabel || t.category));
    statCategories.textContent = uniqueCats.size;

    // Filter Items
    let filtered = allTattoos;
    if (currentFilter === 'slider') {
      filtered = allTattoos.filter(t => t.showInSlider);
    } else if (currentFilter === 'gallery') {
      filtered = allTattoos.filter(t => t.showInGallery);
    }

    tattoosGrid.innerHTML = '';

    if (filtered.length === 0) {
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      filtered.forEach(tattoo => {
        const card = createTattooCard(tattoo);
        tattoosGrid.appendChild(card);
      });
    }
  };

  const createTattooCard = (tattoo) => {
    const card = document.createElement('div');
    card.className = 'admin-card rounded-2xl overflow-hidden flex flex-col justify-between';

    card.innerHTML = `
      <div>
        <div class="relative aspect-[3/4] bg-black overflow-hidden group">
          <img src="${tattoo.imageSrc}" alt="${tattoo.title}" class="w-full h-full object-cover">
          
          <!-- Badges Overlay -->
          <div class="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            <span class="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/80 text-white backdrop-blur border border-white/10">
              ${tattoo.categoryLabel || tattoo.category}
            </span>
          </div>

          <!-- Publication Status Indicators -->
          <div class="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            ${tattoo.showInSlider ? '<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/30">Slider</span>' : ''}
            ${tattoo.showInGallery ? '<span class="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-950/90 text-indigo-300 border border-indigo-500/30">Galería</span>' : ''}
          </div>
        </div>

        <div class="p-4 space-y-2">
          <h3 class="font-serif text-sm font-bold text-white leading-snug line-clamp-1">${tattoo.title}</h3>
          <p class="text-xs text-gray-400 line-clamp-2 leading-relaxed">${tattoo.description || 'Sin descripción técnica cargada.'}</p>
        </div>
      </div>

      <div class="p-4 pt-0 flex items-center justify-between border-t border-border/60 mt-2">
        <button class="btn-edit text-xs text-gray-300 hover:text-white font-semibold flex items-center gap-1 py-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          <span>Editar</span>
        </button>

        <button class="btn-delete text-xs text-gray-500 hover:text-rose-400 font-semibold flex items-center gap-1 py-1.5 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          <span>Eliminar</span>
        </button>
      </div>
    `;

    // Bind Edit Button
    card.querySelector('.btn-edit').addEventListener('click', () => {
      openEditModal(tattoo);
    });

    // Bind Delete Button
    card.querySelector('.btn-delete').addEventListener('click', () => {
      if (confirm(`¿Estás seguro de eliminar el tatuaje "${tattoo.title}"?`)) {
        TattooStore.remove(tattoo.id);
        loadAndRenderTattoos();
      }
    });

    return card;
  };

  // -------------------------------------------------------------
  // 3. Filter Buttons Handler
  // -------------------------------------------------------------
  adminFilters.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      adminFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      loadAndRenderTattoos();
    });
  });

  // -------------------------------------------------------------
  // 4. Modal Open & Close Logic
  // -------------------------------------------------------------
  const openModal = () => {
    tattooModal.classList.remove('pointer-events-none');
    tattooModal.style.opacity = '1';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    tattooModal.style.opacity = '0';
    tattooModal.classList.add('pointer-events-none');
    document.body.style.overflow = '';
    tattooForm.reset();
    activeImageSrc = '';
    imagePreview.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
    editTattooId.value = '';
    customCategoryInput.classList.add('hidden');
  };

  const openAddModal = () => {
    modalTitle.textContent = 'Nuevo Tatuaje';
    tattooForm.reset();
    editTattooId.value = '';
    activeImageSrc = '';
    imagePreview.classList.add('hidden');
    previewPlaceholder.classList.remove('hidden');
    checkSlider.checked = true;
    checkGallery.checked = true;
    customCategoryInput.classList.add('hidden');
    tattooCategorySelect.value = 'black-grey';
    openModal();
  };

  const openEditModal = (tattoo) => {
    modalTitle.textContent = 'Editar Tatuaje';
    editTattooId.value = tattoo.id;
    tattooTitle.value = tattoo.title;
    tattooDesc.value = tattoo.description || '';
    checkSlider.checked = tattoo.showInSlider !== false;
    checkGallery.checked = tattoo.showInGallery !== false;

    // Set Image
    activeImageSrc = tattoo.imageSrc;
    imageUrlInput.value = tattoo.imageSrc.startsWith('data:') ? '(Imagen subida guardada)' : tattoo.imageSrc;
    imagePreview.src = tattoo.imageSrc;
    imagePreview.classList.remove('hidden');
    previewPlaceholder.classList.add('hidden');

    // Set Category
    let found = false;
    for (let opt of tattooCategorySelect.options) {
      if (opt.value === tattoo.category) {
        tattooCategorySelect.value = tattoo.category;
        found = true;
        break;
      }
    }
    if (!found) {
      tattooCategorySelect.value = 'custom';
      customCategoryInput.classList.remove('hidden');
      customCategoryInput.value = tattoo.categoryLabel || tattoo.category;
    } else {
      customCategoryInput.classList.add('hidden');
    }

    openModal();
  };

  btnOpenAddModal.addEventListener('click', openAddModal);
  btnEmptyAdd.addEventListener('click', openAddModal);
  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);

  tattooModal.addEventListener('click', (e) => {
    if (e.target === tattooModal) closeModal();
  });

  // Category Selector Change
  tattooCategorySelect.addEventListener('change', () => {
    if (tattooCategorySelect.value === 'custom') {
      customCategoryInput.classList.remove('hidden');
      customCategoryInput.focus();
    } else {
      customCategoryInput.classList.add('hidden');
    }
  });

  // -------------------------------------------------------------
  // 5. Image Upload & Compression Handling
  // -------------------------------------------------------------
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using HTML Canvas to keep localStorage light & fast
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 900;
        const scaleSize = MAX_WIDTH / img.width;
        
        if (scaleSize < 1) {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        activeImageSrc = compressedBase64;
        imagePreview.src = compressedBase64;
        imagePreview.classList.remove('hidden');
        previewPlaceholder.classList.add('hidden');
        imageUrlInput.value = '(Foto local lista para guardar)';
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  imageUrlInput.addEventListener('input', () => {
    const val = imageUrlInput.value.trim();
    if (val && !val.startsWith('(')) {
      activeImageSrc = val;
      imagePreview.src = val;
      imagePreview.classList.remove('hidden');
      previewPlaceholder.classList.add('hidden');
    }
  });

  // -------------------------------------------------------------
  // 6. Form Submission (Save Tattoo)
  // -------------------------------------------------------------
  tattooForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!activeImageSrc) {
      alert('Por favor subí una foto o ingresá una URL para el tatuaje.');
      return;
    }

    const title = tattooTitle.value.trim();
    if (!title) {
      alert('Por favor ingresá un título para el tatuaje.');
      return;
    }

    let category = tattooCategorySelect.value;
    let categoryLabel = tattooCategorySelect.options[tattooCategorySelect.selectedIndex].getAttribute('data-label');

    if (category === 'custom') {
      const customVal = customCategoryInput.value.trim();
      if (!customVal) {
        alert('Por favor escribí el nombre de la nueva categoría.');
        return;
      }
      category = customVal.toLowerCase().replace(/\s+/g, '-');
      categoryLabel = customVal;
    }

    const newTattoo = {
      id: editTattooId.value || null,
      title: title,
      description: tattooDesc.value.trim(),
      category: category,
      categoryLabel: categoryLabel,
      imageSrc: activeImageSrc,
      showInSlider: checkSlider.checked,
      showInGallery: checkGallery.checked
    };

    TattooStore.save(newTattoo);
    closeModal();
    loadAndRenderTattoos();
  });

  // -------------------------------------------------------------
  // 7. Utility: Export Backup & Reset
  // -------------------------------------------------------------
  btnExportJSON.addEventListener('click', () => {
    const allData = TattooStore.getAll();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `caber_tattoos_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  btnResetDefault.addEventListener('click', () => {
    if (confirm('¿Restablecer el catálogo a las 8 fotos oficiales iniciales? Esto borrará las modificaciones locales.')) {
      TattooStore.reset();
      loadAndRenderTattoos();
    }
  });

  // Check Session on load
  checkSession();
});