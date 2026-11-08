/* ============================================================
   Calculia — Problemas de sumar: textos (ES)
   Archivo específico del idioma. Se carga desde index.html.
   ============================================================ */
(function () {
  'use strict';

  App.i18n.register({
    title: '➕ Problemas de sumar',
    instruction: 'Lee el problema y elige la respuesta.',
    explain: '{a} + {b} = {r}: son {r} en total.',
    hint: '🤔 ¿Se juntan o se añaden cosas? Entonces se suma.',
    next: 'Siguiente →',
    endTitle: 'Has terminado',
    endSummary: 'Has acertado {n} de {total} a la primera. Ahora tienes {stars} {starsWord}.',
    btnMenu: 'Volver al inicio',

    problems: {
      1: 'Tienes {a} galletas y te dan {b} más. ¿Cuántas tienes ahora?',
      2: 'Hay {a} personas en el autobús. En la parada suben {b}. ¿Cuántas personas hay ahora?',
      3: 'Compras {a} manzanas en una tienda y {b} en otra. ¿Cuántas manzanas compras en total?',
      4: 'Tienes {a} globos rojos y {b} globos azules. ¿Cuántos globos tienes?',
      5: 'Tienes {a} euros en la cartera y te dan {b} euros más. ¿Cuántos euros tienes?',
      6: 'Un equipo marca {a} goles en la primera parte y {b} en la segunda. ¿Cuántos goles marca en total?'
    }
  }, 'es');
})();
