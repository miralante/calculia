/* ============================================================
   Calculia — Problemas de dividir: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➗ Problemas de dividir',
    instruction: 'Lee el problema y elige la respuesta.',
    explain: '{a} ÷ {b} = {r}: a cada uno le tocan {r}.',
    hint: '🤔 ¿Se reparte en partes iguales o se cuentan grupos? Entonces se divide.',
    next: 'Siguiente →',
    endTitle: 'Has terminado',
    endSummary: 'Has acertado {n} de {total} a la primera. Ahora tienes {stars} estrellas.',
    btnMenu: 'Volver al inicio',

    problems: {
      1: 'Tienes {a} galletas y las repartes entre {b} amigos, todos igual. ¿Cuántas le tocan a cada uno?',
      2: 'Tienes {a} euros y los repartes entre {b} personas por igual. ¿Cuánto recibe cada una?',
      3: 'Tienes {a} libros y pones {b} en cada estante. ¿Cuántos estantes necesitas?',
      4: 'Tienes {a} caramelos y los repartes entre {b} amigos a partes iguales. ¿Cuántos caramelos recibe cada amigo?',
      5: 'Hay {a} zumos y los metes en cajas de {b}. ¿Cuántas cajas llenas sacas?',
      6: 'Tienes {a} trozos de pizza y los repartes entre {b} amigos. ¿Cuántos trozos le tocan a cada uno?'
    }
  }, 'es');
})();
