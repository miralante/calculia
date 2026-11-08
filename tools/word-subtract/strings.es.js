/* ============================================================
   Calculia — Problemas de restar: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➖ Problemas de restar',
    instruction: 'Lee el problema y elige la respuesta.',
    explain: '{a} − {b} = {r}: quedan {r}.',
    hint: '🤔 ¿Se quita algo o se pregunta cuánto falta? Entonces se resta.',
    next: 'Siguiente →',
    endTitle: 'Has terminado',
    endSummary: 'Has acertado {n} de {total} a la primera. Ahora tienes {stars} {starsWord}.',
    btnMenu: 'Volver al inicio',

    problems: {
      1: 'Tenías {a} galletas y te comes {b}. ¿Cuántas te quedan?',
      2: 'En la nevera había {a} zumos y se venden {b}. ¿Cuántos quedan?',
      3: 'Necesitas {a} globos para la fiesta y tienes {b}. ¿Cuántos te faltan?',
      4: 'Tienes {a} euros y compras algo que cuesta {b}. ¿Cuánto dinero te queda?',
      5: 'Hay {a} personas en el autobús y {b} se bajan en la parada. ¿Cuántas quedan?',
      6: 'Un libro tiene {a} páginas y ya has leído {b}. ¿Cuántas páginas te faltan?'
    }
  }, 'es');
})();
