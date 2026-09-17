const Api = {
  backendConfigurado() {
    return Boolean(window.APP_CONFIG && window.APP_CONFIG.APPS_SCRIPT_URL);
  },

  async obtenerDatos() {
    if (!this.backendConfigurado()) return { posts: [], ubicaciones: [], perfiles: [] };
    try {
      const resp = await fetch(window.APP_CONFIG.APPS_SCRIPT_URL);
      const data = await resp.json();
      return { posts: data.posts || [], ubicaciones: data.ubicaciones || [], perfiles: data.perfiles || [] };
    } catch (err) {
      console.error("No se pudo cargar el muro familiar:", err);
      return { posts: [], ubicaciones: [], perfiles: [], error: err };
    }
  },

  async publicar(payload) {
    const resp = await fetch(window.APP_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error || "Error desconocido");
    return data;
  },

  archivoABase64(archivo) {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result.split(",")[1]);
      lector.onerror = reject;
      lector.readAsDataURL(archivo);
    });
  },

  zonaHorariaLocal() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  },

  // Best-effort: convierte lat/lon en ciudad/país usando Nominatim (OpenStreetMap).
  // Si falla (sin red, límite de uso, etc.) devuelve null y el usuario completa a mano.
  async geocodificarInverso(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=es`;
      const resp = await fetch(url);
      const data = await resp.json();
      const direccion = data.address || {};
      return {
        ciudad: direccion.city || direccion.town || direccion.village || direccion.county || "",
        pais: direccion.country || ""
      };
    } catch (err) {
      return null;
    }
  },

  obtenerUbicacionActual() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Este navegador no soporta geolocalización"));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        (err) => reject(err),
        { timeout: 10000 }
      );
    });
  }
};
