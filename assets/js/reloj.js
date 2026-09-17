// Utilidades de hora local por zona horaria (IANA), usando Luxon.
const Reloj = {
  ahora(zonaHoraria) {
    return luxon.DateTime.now().setZone(zonaHoraria);
  },
  formatoHora(dt) {
    return dt.toFormat("HH:mm:ss");
  },
  formatoDia(dt) {
    return dt.setLocale("es").toFormat("cccc d 'de' LLLL");
  },
  esDeNoche(dt) {
    const h = dt.hour;
    return h < 6 || h >= 20;
  },
  desfaseTexto(dt) {
    const offset = dt.offset / 60;
    const signo = offset >= 0 ? "+" : "";
    return `UTC${signo}${offset}`;
  }
};
