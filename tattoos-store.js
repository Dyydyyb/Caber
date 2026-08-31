// tattoos-store.js - Conexión Supabase Cloud Database + Storage para Caber Tattoo
const TattooStore = (() => {
  const SUPABASE_URL = 'https://ipbfgmgcvctxrzvuihun.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwYmZnbWdjdmN0eHJ6dnVpaHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDk4MzMsImV4cCI6MjEwMzc4NTgzM30.WhhBjYrKI24dfe-jbzVsq__otpXJLbNgPc6r4H8_I1s';

  const STORAGE_KEY = 'caber_tattoos_cache_v1';
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

  // Helper para headers
  function getHeaders(preferReturn = false) {
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    };
    if (preferReturn) {
      headers['Prefer'] = 'return=representation';
    }
    return headers;
  }

  // Mapear de base de datos a objeto JS
  function mapFromDB(row) {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      category: row.category,
      categoryLabel: row.category_label || row.category,
      imageSrc: row.image_src,
      showInSlider: row.show_in_slider !== false,
      showInGallery: row.show_in_gallery !== false,
      createdAt: row.created_at || Date.now()
    };
  }

  // Mapear de objeto JS a base de datos
  function mapToDB(t) {
    return {
      id: t.id || 'tattoo_' + Date.now(),
      title: t.title,
      description: t.description || '',
      category: t.category,
      category_label: t.categoryLabel || t.category,
      image_src: t.imageSrc,
      show_in_slider: t.showInSlider !== false,
      show_in_gallery: t.showInGallery !== false,
      created_at: t.createdAt || Date.now()
    };
  }

  // Lectura en caché local para respuesta instantánea
  function getCached() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_TATTOOS;
  }

  function setCached(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {}
  }

  // Obtener todos los tatuajes desde Supabase Cloud
  async function fetchAll() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/tattoos?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapFromDB);
          setCached(mapped);
          return mapped;
        }
      }
    } catch (e) {
      console.warn('Fallo al conectar con Supabase, usando caché local:', e);
    }
    return getCached();
  }

  // Síncrono (para render inicial rápido sin parpadeo)
  function getAll() {
    return getCached();
  }

  function getSliderTattoos() {
    return getCached().filter(t => t.showInSlider !== false);
  }

  function getGalleryTattoos() {
    return getCached().filter(t => t.showInGallery !== false);
  }

  function getById(id) {
    return getCached().find(t => t.id === id);
  }

  // Guardar (insertar o actualizar) en Supabase
  async function save(tattoo) {
    const dbPayload = mapToDB(tattoo);

    // Actualizar caché inmediatamente
    const current = getCached();
    const existingIndex = current.findIndex(t => t.id === dbPayload.id);
    if (existingIndex !== -1) {
      current[existingIndex] = mapFromDB(dbPayload);
    } else {
      current.unshift(mapFromDB(dbPayload));
    }
    setCached(current);

    // Persistir en Supabase Cloud
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/tattoos?on_conflict=id`, {
        method: 'POST',
        headers: {
          ...getHeaders(true),
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(dbPayload)
      });
      return res.ok;
    } catch (e) {
      console.error('Error al guardar en Supabase:', e);
      return false;
    }
  }

  // Eliminar en Supabase
  async function remove(id) {
    // Actualizar caché
    const current = getCached().filter(t => t.id !== id);
    setCached(current);

    // Eliminar de Supabase Cloud
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/tattoos?id=eq.${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return res.ok;
    } catch (e) {
      console.error('Error al eliminar en Supabase:', e);
      return false;
    }
  }

  // Subir archivo al bucket de Supabase Storage o devolver DataURL comprimido
  async function uploadImageFile(file) {
    try {
      const fileExt = file.name ? file.name.split('.').pop() : 'jpg';
      const fileName = `tattoo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/tattoos/${fileName}`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': file.type || 'image/jpeg'
        },
        body: file
      });

      if (uploadRes.ok) {
        return `${SUPABASE_URL}/storage/v1/object/public/tattoos/${fileName}`;
      }
    } catch (e) {
      console.warn('No se pudo subir a storage bucket, usando fallback:', e);
    }
    return null;
  }

  function reset() {
    setCached(DEFAULT_TATTOOS);
    return DEFAULT_TATTOOS;
  }

  function checkPin(pin) {
    return pin === (localStorage.getItem(PIN_KEY) || DEFAULT_PIN);
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
    getCached,
    fetchAll,
    getSliderTattoos,
    getGalleryTattoos,
    getById,
    save,
    remove,
    uploadImageFile,
    reset,
    checkPin,
    setPin,
    DEFAULT_TATTOOS
  };
})();