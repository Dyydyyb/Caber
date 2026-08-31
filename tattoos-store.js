// tattoos-store.js - Repositorio central de datos y persistencia para Caber Tattoo
const TattooStore = (() => {
  const STORAGE_KEY = 'caber_tattoos_db_v1';
  const PIN_KEY = 'caber_admin_pin_v1';
  const DEFAULT_PIN = 'caber2026';

  const DEFAULT_TATTOOS = [
    {
      id: 'tattoo_1',
      title: 'Manga Filigrana Ornamental',
      description: 'Técnica Black & Grey en antebrazo y codo con sombreado de transición suave y contraste profundo.',
      category: 'black-grey',
      categoryLabel: 'Black & Grey',
      imageSrc: 'assets/images/tattoo-filigrana.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000001
    },
    {
      id: 'tattoo_2',
      title: 'Script en Cuello & Clavícula',
      description: 'Caligrafía fluida vertical con líneas rojas y negras en cuello y trapecio, adaptada a la anatomía.',
      category: 'lettering',
      categoryLabel: 'Lettering Custom',
      imageSrc: 'assets/images/tattoo-cuello-script.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000002
    },
    {
      id: 'tattoo_3',
      title: 'Daga Biomecánica & Sombras',
      description: 'Pieza de alto contraste en brazo con volumen anatómico, filo de acero y texturas oscuras.',
      category: 'dark-realism',
      categoryLabel: 'Dark Realism',
      imageSrc: 'assets/images/tattoo-daga-biomecanica.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000003
    },
    {
      id: 'tattoo_4',
      title: 'Máscaras Hannya & Teatro Noh',
      description: 'Dualidad oriental con sombreado degradado y trabajo de textura en antebrazo.',
      category: 'black-grey',
      categoryLabel: 'Black & Grey',
      imageSrc: 'assets/images/tattoo-mascaras.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000004
    },
    {
      id: 'tattoo_5',
      title: 'Mano Demoníaca & Ojos Anime',
      description: 'Composición oscura con desgarro de piel y saturación de tinta roja con pentagrama de detalle fino.',
      category: 'dark-realism',
      categoryLabel: 'Dark Realism',
      imageSrc: 'assets/images/tattoo-anime-dark.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000005
    },
    {
      id: 'tattoo_6',
      title: 'Blackwork & Texturas en Muñeca',
      description: 'Geometría y sólidos puros en articulación, con acabado mate y líneas de altísima definición.',
      category: 'blackwork',
      categoryLabel: 'Blackwork',
      imageSrc: 'assets/images/tattoo-muneca-blackwork.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000006
    },
    {
      id: 'tattoo_7',
      title: 'Lettering Gótico / Unforgettable',
      description: 'Composición caligráfica con terminaciones ornamentales afiladas y relleno saturado.',
      category: 'lettering',
      categoryLabel: 'Lettering Custom',
      imageSrc: 'assets/images/tattoo-unforgettable.jpg',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000007
    },
    {
      id: 'tattoo_8',
      title: 'Custom Script en Antebrazo',
      description: 'Tipografía fluida diseñada a mano alzada con sombreado de transición suave.',
      category: 'lettering',
      categoryLabel: 'Lettering Custom',
      imageSrc: 'assets/images/tattoo-lettering.png',
      showInSlider: true,
      showInGallery: true,
      createdAt: 1725000008
    }
  ];

  function getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        saveAll(DEFAULT_TATTOOS);
        return DEFAULT_TATTOOS;
      }
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TATTOOS;
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
      return DEFAULT_TATTOOS;
    }
  }

  function saveAll(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  function getSliderTattoos() {
    return getAll().filter(t => t.showInSlider !== false);
  }

  function getGalleryTattoos() {
    return getAll().filter(t => t.showInGallery !== false);
  }

  function getById(id) {
    return getAll().find(t => t.id === id);
  }

  function save(tattoo) {
    const items = getAll();
    if (tattoo.id) {
      const idx = items.findIndex(t => t.id === tattoo.id);
      if (idx !== -1) {
        items[idx] = Object.assign({}, items[idx], tattoo, { updatedAt: Date.now() });
      } else {
        items.unshift(Object.assign({}, tattoo, { id: 'tattoo_' + Date.now(), createdAt: Date.now() }));
      }
    } else {
      items.unshift(Object.assign({}, tattoo, { id: 'tattoo_' + Date.now(), createdAt: Date.now() }));
    }
    saveAll(items);
    return true;
  }

  function remove(id) {
    const items = getAll().filter(t => t.id !== id);
    saveAll(items);
    return true;
  }

  function reset() {
    saveAll(DEFAULT_TATTOOS);
    return DEFAULT_TATTOOS;
  }

  function getPin() {
    return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
  }

  function checkPin(pin) {
    return pin === getPin();
  }

  function setPin(newPin) {
    if (newPin && newPin.length >= 4) {
      localStorage.setItem(PIN_KEY, newPin);
      return true;
    }
    return false;
  }

  return {
    getAll,
    getSliderTattoos,
    getGalleryTattoos,
    getById,
    save,
    remove,
    reset,
    checkPin,
    setPin,
    DEFAULT_TATTOOS
  };
})();