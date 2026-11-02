/* ============================================================
   Calculia — Problemas de multiplicar: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '✖️ Problemas de multiplicar',
    instruction: 'Lee el problema y elige la respuesta.',
    explain: '{a} × {b} = {r}: son {r} en total.',
    hint: '🤔 ¿Hay grupos iguales que se repiten? Entonces se multiplica.',
    next: 'Siguiente →',
    endTitle: 'Has terminado',
    endSummary: 'Has acertado {n} de {total} a la primera. Ahora tienes {stars} estrellas.',
    btnMenu: 'Volver al inicio',

    problems: {
      1: 'Una caja tiene {a} huevos. Compras {b} cajas. ¿Cuántos huevos tienes?',
      2: 'En una clase hay {a} filas de {b} sillas. ¿Cuántas sillas hay?',
      3: 'Pides {a} pizzas y cada una tiene {b} trozos. ¿Cuántos trozos hay?',
      4: 'Hay {a} bicis y cada bici tiene {b} ruedas. ¿Cuántas ruedas hay?',
      5: 'Cada paquete tiene {a} lápices. Compras {b} paquetes. ¿Cuántos lápices compras?',
      6: 'Tienes {a} bolsas con {b} caramelos en cada una. ¿Cuántos caramelos tienes?'
    }
  }, 'es');
})();
