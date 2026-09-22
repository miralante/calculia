# TODO — Cobertura curricular de Calculia

Este documento traza cada punto de [`curriculum/`](curriculum/) (temario de
referencia de Matemáticas, 1º de Primaria a 4º de ESO) contra las actividades
actuales de `tools/`, y prioriza lo que falta por implementar.

**Por qué existe este fichero**: [`doc/es/spec.md` §8.1](doc/es/spec.md) fija
el compromiso de cubrir el currículo completo como cuestión de igualdad de
oportunidades, no de amplitud por amplitud — con dos niveles de ambición
distintos según el contenido. Este documento es la lista de tareas concreta
que aplica ese compromiso. Léelo junto a esa sección antes de añadir o quitar
algo de aquí.

Este fichero es en español, como `curriculum/` — no le aplica la paridad
ES/EN de `CLAUDE.md` porque es documentación de referencia interna, no
producto servido al usuario.

## Leyenda

- ✅ Cubierto — la actividad indicada ya enseña este punto.
- 🔶 Parcial — existe algo relacionado, pero no enseña el punto completo (se
  explica en cada caso).
- ⬜ Pendiente — sin cobertura.
- 🧱 **Cimiento** — el objetivo es el dominio: práctica progresiva hasta que
  la persona lo hace con soltura.
- 💡 **Concepto** — el objetivo es la exposición accesible: qué es la idea y,
  si es posible, para qué sirve — nunca pericia de cálculo o manipulación
  simbólica. Ver `spec.md` §8.1 para la diferencia completa.

## 1. Checklist completo por curso

### 1º de Primaria

| Punto del temario | Estado | Actividad |
|---|---|---|
| Los números hasta el 20 | ✅ | `numbers` |
| Contar y ordenar objetos | ✅ | `numbers` / `quantities` |
| Comparar cantidades: más/menos/igual | ✅ | `quantities` |
| Descomposición en decenas y unidades | ✅ | `mental-math` (`placeValue`), `numbers` |
| Números ordinales | ✅ | `numbers` (`ordinales`: la fila, niveles `o1`-`o3`) |
| Signos mayor, menor e igual (`<`, `>`, `=`) | ✅ | `numbers` (`comparar`, niveles `c1`-`c5`) |
| La suma sin llevar | ✅ | `mental-math` (`anchors`) |
| La resta sin llevar | ✅ | `mental-math` (`anchors`) |
| Formas geométricas básicas (círculo, cuadrado, triángulo) | ✅ | `shapes` (`planas`, niveles `g1`-`g2`) |
| Cuerpos geométricos básicos (cubo, esfera) | ✅ | `shapes` (`cuerpos`, niveles `b1`-`b2`) |
| Nociones espaciales (dentro/fuera, arriba/abajo, izq/dcha) | ✅ | `places` (`posicion`, niveles `s1`-`s4`) |
| Medidas sin instrumentos (más largo/corto, más pesado/ligero) | ✅ | `places` (`comparar`, niveles `c1`-`c3`) |
| El calendario: días de la semana | ✅ | `calendar` (`semana`, niveles `w1`-`w3`) |
| El calendario: los meses del año | ✅ | `calendar` (`meses`, niveles `m1`-`m3`) |
| Monedas y billetes: reconocerlos | ✅ | `money` |
| Series y patrones sencillos | ✅ | `patterns` |
| Resolución de problemas sencillos con dibujos | ✅ | `problems` (`resultado`: la situación se dibuja y se cuenta) |

### 2º de Primaria

| Punto del temario | Estado | Actividad |
|---|---|---|
| Los números hasta el 100 | ✅ | `numbers` / `quantities` |
| Descomposición en centenas, decenas y unidades | ✅ | `numbers` (`canje`) |
| Números pares e impares | ✅ | `math-tables` (modo `parity`) |
| La recta numérica | ✅ | `numbers` (`recta`, niveles `n1`-`n4`) |
| La suma llevando | ✅ | `mental-math` (`carry`, nivel `a9`) |
| La resta llevando | ✅ | `mental-math` (`borrow`, nivel `a10`) |
| Introducción a la multiplicación | ✅ | `math-tables` |
| Las tablas del 2, 3, 4 y 5 | ✅ | `math-tables` |
| Formas geométricas: lados y vértices | ✅ | `shapes` (`planas`, niveles `g3`-`g4`) |
| Cuerpos geométricos: cubo, esfera, cilindro | ✅ | `shapes` (`cuerpos`) |
| Medidas de longitud: el metro y el centímetro | ✅ | `fractions-measures` (`medidas`/`longitud`) |
| Medidas de peso: el kilogramo | ✅ | `fractions-measures` (`medidas`/`peso`) |
| Medidas de capacidad: el litro | ✅ | `fractions-measures` (`medidas`/`capacidad`) |
| El reloj: en punto y y media | ✅ | `clock` |
| Los meses y las estaciones del año | ✅ | `calendar` (`estaciones`, niveles `s1`-`s2`) |
| Monedas y billetes: pagar cantidades sencillas | ✅ | `money` / `wallet` |
| Problemas de suma y resta | ✅ | `problems` (`operacion` decide la operación, `resultado` la resuelve) |
| Gráficos sencillos: pictogramas | ✅ | `charts` (`pictograma`, niveles `g1`-`g3`) |

### 3º de Primaria

| Punto del temario | Estado | Actividad |
|---|---|---|
| Los números hasta el 9.999 | ✅ | `numbers` / `quantities` |
| Estimación y redondeo de números | ✅ | `quantities` (modo aproximar) |
| Propiedad conmutativa de suma y multiplicación | ✅ | `operations` (`voltear`, nivel `v1`) |
| La multiplicación: tablas hasta el 10 | ✅ | `math-tables` |
| La división: reparto en partes iguales | ✅ | `math-tables` (modo `divide`) |
| Fracciones sencillas: mitad, tercio, cuarto | ✅ | `fractions-measures` |
| Ángulos: recto, agudo y obtuso | ✅ | `geometry` (`angulos`, niveles `n1`-`n3`) |
| Simetría en figuras planas | ✅ | `geometry` (`simetria`, niveles `m1`-`m2`) |
| El reloj: horas y minutos | ✅ | `clock` |
| Unidades de tiempo: año, mes, semana, día | ✅ | `calendar` (`unidades`, niveles `u1`-`u2`) |
| Medidas de longitud, peso y capacidad | ✅ | `fractions-measures` |
| El dinero: el euro y el céntimo | ✅ | `money` / `wallet` |
| Problemas con varias operaciones | ✅ | `problems` (`dosPasos`, niveles `t1`-`t2`) |
| Perímetro de figuras sencillas | ✅ | `geometry` (`perimetro`, niveles `p1`-`p2`) |
| Números romanos: I, V, X | ✅ | `roman-numerals` |
| Números romanos: L y C | ✅ | `roman-numerals` |
| Tablas y gráficos de barras sencillos | ✅ | `charts` (`barras` y `tabla`) |

### 4º de Primaria

| Punto del temario | Estado | Actividad |
|---|---|---|
| Los números hasta el millón | ✅ | `numbers` |
| La propiedad distributiva de la multiplicación | ✅ | `operations` (`partir`, nivel `d1`) |
| La multiplicación por dos cifras | ✅ | `operations` (`partir`, nivel `d2`) |
| La división con divisor de una cifra | ✅ | `operations` (`repartir`, nivel `r1`) |
| La división con divisor de dos cifras | ✅ | `operations` (`repartir`, nivel `r2`) |
| Fracciones: comparar y ordenar | ✅ | `fractions-measures` (`comparaFrac`) |
| Fracciones equivalentes | ✅ | `fractions-measures` (`equivalentes`, nivel `f4`) |
| Suma y resta de fracciones con el mismo denominador | ✅ | `fractions-measures` (`sumaFrac`, niveles `f5`/`f6`) |
| Números decimales: introducción | ✅ | `fractions-measures` (`decimales`, niveles `d1`-`d3`) |
| Ángulos: medir con el transportador | ✅ | `geometry` (`angulos`, nivel `n4`): un transportador con una rayita cada 10 grados y un número cada 30, y el ángulo se lee siguiendo el brazo hasta el borde |
| Clasificación de triángulos y cuadriláteros | ✅ | `geometry` (`clasificar`, niveles `q1`-`q3`: lados iguales marcados, y el nombre con su explicación) |
| El reloj y los intervalos de tiempo | ✅ | `clock` (modo `elapsed`: dos relojes y cuánto pasa entre ellos) |
| Medidas y sus equivalencias | ✅ | `measures` pregunta conversiones en las tres magnitudes (1 m = 100 cm, 1 kg = 1.000 g, 1 l = 1.000 ml) |
| Perímetro y área de figuras sencillas | ✅ | `geometry` (`perimetro` y `area`) |
| Coordenadas sencillas en una cuadrícula | ✅ | `geometry` (`coordenadas`, niveles `k1`-`k2`) |
| Tablas y gráficos de barras: interpretación | ✅ | `charts` (`barras`: leer la altura contra la escala) |
| La probabilidad de un suceso: más o menos probable | ✅ | `charts` (`probabilidad`, nivel `p2`) |
| Problemas de varios pasos | ✅ | `problems` (`dosPasos`) |
| Números romanos: hasta el M | ✅ | `roman-numerals` |

### 5º de Primaria

| Punto del temario | Estado | Actividad |
|---|---|---|
| Números decimales: operaciones | ✅ | `fractions-measures` (`decimales`, niveles `d4`-`d5`) |
| Fracciones: suma y resta | ✅ | `fractions-measures` (`f5`-`f6` mismo denominador, `f7`-`f8` distinto) |
| Multiplicación y división de fracciones sencillas | ✅ | `fractions-measures` (`f9`: la fracción de una cantidad, que es como se usa) |
| Múltiplos y divisores | ✅ | `divisibility` (`multiplos`, niveles `m1`-`m2`) |
| Criterios de divisibilidad | ✅ | `divisibility` (`criterios`, niveles `d1`-`d2`) |
| El máximo común divisor y el mínimo común múltiplo | ✅ | `divisibility` (`coinciden`: `c1` cuándo coinciden, `c2` el trozo común) |
| Números primos | ✅ | `divisibility` (`primos`, nivel `p1`: se prueba con 2, 3 y 5) |
| Números negativos: introducción | ✅ | `numbers` (ascensor) / `temperature` |
| Potencias sencillas | ✅ | `divisibility` (`cuadrados`, nivel `s1`) |
| Proporcionalidad sencilla | ✅ | `percent` (`proporcion`, niveles `o1`-`o2`) |
| Porcentajes básicos | ✅ | `percent` (`porcentaje`, niveles `p1`-`p3`) |
| Clasificación de polígonos por sus lados | ✅ | `shapes` cuenta los lados y `geometry` (`clasificar`) nombra la figura |
| El área de figuras geométricas | ✅ | `geometry` (`area`): cuadrado y rectángulo contando cuadrados (`a1`-`a2`), triángulo como la mitad de su rectángulo (`a3`), y el círculo contando los cuadraditos que caben (`w2`) |
| El perímetro y el área del círculo: introducción | ✅ | `geometry` (`circulo`: `w1` el borde como algo más de 3 veces el diámetro, `w2` los cuadrados de dentro) |
| Unidades de medida del Sistema Internacional | ✅ | `measures` (`medidas`) las unidades de uso diario, y `measures` (`escalera`, niveles `es1`-`es3`) la escalera completa de prefijos: km, hm, dam, m, dm, cm, mm y sus iguales de peso y capacidad, con el ×10 escrito entre cada escalón |
| La media aritmética sencilla | ✅ | `charts` (`media`: la media como reparto a partes iguales) |
| Gráficos estadísticos: tablas de frecuencias | ✅ | `charts` (`tabla`, niveles `t1`-`t2`) |
| Problemas con fracciones y decimales | ✅ | `fractions-measures` (`f9` plantea una situación real con fracciones) |
| Probabilidad sencilla: posible, imposible, seguro | ✅ | `charts` (`probabilidad`, nivel `p1`) |

### 6º de Primaria

| Punto del temario | Estado | Actividad |
|---|---|---|
| Números enteros: positivos y negativos | ✅ | `numbers` / `temperature` |
| Jerarquía de operaciones y uso de paréntesis | ✅ | `operations` (`orden`, niveles `o1`-`o2`) |
| Potencias y raíz cuadrada sencilla | ✅ | `divisibility` (`cuadrados`, niveles `s1`-`s2`) |
| Operaciones combinadas con decimales y fracciones | ✅ | `fractions-measures` (`decimales`, niveles `d6`-`d7`): una fracción y un decimal en la misma cuenta, las dos dibujadas como tarta, así que se ve que son la misma clase de número escrita de dos maneras |
| Porcentajes: cálculo | ✅ | `percent` (`dinero`, niveles `r1`-`r2`) |
| Interés simple sencillo aplicado al dinero | ✅ | `percent` (`dinero`, nivel `r3`: un tanto por ciento más) |
| Proporcionalidad directa | ✅ | `percent` (`proporcion`) |
| Escalas y planos | ✅ | `percent` (`escala`, nivel `e1`) |
| Prismas y pirámides: elementos y desarrollo plano | ✅ | `shapes` (`desarrollos`, niveles `p1`-`p2`): las caras y los vértices de cada cuerpo, y qué sale al doblar un desarrollo dibujado abierto |
| El volumen de cuerpos geométricos | ✅ | `geometry` (`volumen`, nivel `v1`: contar los cubos por capas) |
| Simetría, traslación y giro de figuras | ✅ | `geometry` (`simetria`: `m1`-`m2` simetría, `m3` movida frente a girada) |
| Coordenadas cartesianas sencillas | ✅ | `geometry` (`coordenadas`) |
| Estadística: tablas y gráficos | ✅ | `charts` |
| La media, la moda y el rango | ✅ | `charts`: la media como reparto (`a1`), la moda (`t2`) y el rango (`x2`), contando los pasos de la marca más baja a la más alta |
| Probabilidad: calcular la probabilidad de un suceso | ✅ | `charts` (`p4`): la probabilidad dicha como número, «2 de 6», contando las de esa clase y las que hay en total |
| Problemas de la vida cotidiana con dinero | ✅ | `money` / `wallet` (parcial) |
| Problemas con varias operaciones combinadas | ✅ | `problems` (`dosPasos`) y `operations` (`orden`) |

### 1º de ESO

| Punto del temario | Estado | Actividad |
|---|---|---|
| Números enteros: positivos y negativos | ✅ | (repetido de 6º, ya cubierto) |
| Operaciones con números enteros | ✅ | `operations` (`consigno`, niveles `g1`-`g2`: se anda por la recta, sin regla de signos) |
| Fracciones y decimales: operaciones combinadas | ✅ | `fractions-measures` (`decimales`, niveles `d6`-`d7`), repetido de 6º |
| Divisibilidad: múltiplos, divisores, primos | ✅ | `divisibility` (repetido) |
| Potencias y raíces cuadradas | ✅ | `divisibility` (`cuadrados`) |
| Sistema métrico decimal | ✅ | `measures` (`escalera`): contar los escalones, ver por cuánto se multiplica y cambiar una cantidad de unidad. Lo decimal del sistema es justo ese ×10 por escalón, y está dibujado |
| Proporcionalidad y porcentajes | ✅ | `percent` (repetido) |
| Álgebra: expresiones sencillas | ✅ | `algebra` (`letras`, niveles `l1`-`l2`) |
| Ecuaciones de primer grado sencillas | ✅ | `algebra` (`balanza`, niveles `b1`-`b3`) |
| Rectas y ángulos | ✅ | `geometry` (`angulos`) los ángulos, y `geometry` (`rectas`, nivel `r1`) las paralelas, las perpendiculares y las que solo se cruzan |
| Figuras planas: perímetro y área | ✅ | `geometry` (`perimetro` y `area`), repetido de Primaria |
| Cuerpos geométricos: prismas, pirámides, redondos | ✅ | `shapes` (`cuerpos`) cubo, esfera y cilindro; `shapes` (`desarrollos`) prismas y pirámides |
| Coordenadas cartesianas y gráficas sencillas | ✅ | `geometry` (`coordenadas`) y `algebra` (`graficas`) |
| Estadística: media y moda | ✅ | `charts` (`media` y `t2`) |
| Probabilidad | ✅ | `charts` (`p1`-`p4`): seguro/puede ser/imposible, qué es más probable, sacar dos veces y la probabilidad como número |

### 2º de ESO

| Punto del temario | Estado | Actividad |
|---|---|---|
| Divisibilidad: primos y compuestos | ✅ | `divisibility` (`primos`) |
| Números racionales | ✅ | `fractions-measures`: la fracción y el decimal como dos formas del mismo número (`d1`-`d3`), sumados en la misma cuenta (`d6`-`d7`) y comparados entre sí (`d8`). La palabra «racional» no aparece en el producto: es jerga sin significado cotidiano y `spec.md` §3.3 (UNE 153101) la prohíbe en lo que lee la persona; lo que se enseña es el concepto |
| Sistema sexagesimal (ángulos y tiempo) | ✅ | `clock` las horas y los minutos, y `geometry` (`angulos`, nivel `n5`) el reloj como un círculo de 360 grados con 12 marcas: cada hora es un trozo de 30. Es el mismo sistema en los dos sitios donde aparece |
| Potencias de números enteros | 🔶 | `divisibility` (`cuadrados`) cubre el cuadrado y la raíz de positivos; con enteros negativos no |
| Polinomios: expresiones algebraicas | ✅ | `algebra` (`letras`) la letra y su notación, y `algebra` (`piezas`, nivel `t1`) el polinomio como un montón de piezas que se escribe |
| Ecuaciones de primer grado | ✅ | `algebra` (`balanza`) |
| Sistemas de ecuaciones sencillos | ✅ | 💡 `algebra` (`dosBalanzas`, nivel `s1`): dos balanzas a la vez, y la segunda es la que dice cuánto pesa cada cosa |
| Proporcionalidad compuesta | ✅ | 💡 `percent` (`proporcion`, nivel `o3`): más gente en el mismo trabajo, menos rato — la proporcionalidad inversa, que es la idea que la compuesta añade a la directa |
| Teorema de Pitágoras | ✅ | `similar` (`pitagoras`, nivel `t1`: los tres cuadrados, contados) |
| Semejanza de figuras planas | ✅ | `similar` (`semejanza`, niveles `p1`-`p2`) |
| Cuerpos geométricos | ✅ | `shapes` (`cuerpos`) y `shapes` (`desarrollos`), repetido |
| Volumen de cuerpos geométricos | ✅ | `geometry` (`volumen`) |
| Funciones: tablas, gráficas, primeras nociones | ✅ | `algebra` (`graficas`, niveles `g1`-`g2`) |
| Estadística: gráficos y tablas de frecuencias | ✅ | `charts` (repetido) |
| Probabilidad de sucesos | ✅ | `charts` (`p1`-`p4`), repetido; incluye la probabilidad como número |

### 3º de ESO

| Punto del temario | Estado | Actividad |
|---|---|---|
| Números reales | ✅ | 💡 `divisibility` (`noExactos`, nivel `i1`): hay medidas, como la diagonal de un cuadrado, que no caen en ningún número exacto. El conjunto no se nombra: nombrarlo no añade nada que se pueda ver |
| Potencias, raíces y notación científica | ✅ | 💡 `divisibility` (`cuadrados`, niveles `s1`-`s3`) el cuadrado, su raíz y la raíz del cubo contando cubitos; `divisibility` (`grandes`, niveles `z1`-`z2`) el número grande escrito corto |
| Polinomios: lenguaje algebraico | ✅ | `algebra` (`letras`) la letra como número desconocido, y `algebra` (`piezas`) las piezas que ese lenguaje nombra |
| División de polinomios y factorización (Ruffini) | ✅ | 💡 `algebra` (`piezas`, nivel `t3`): un rectángulo de piezas del que se conoce un lado, y se busca el otro — dividir y factorizar son eso. La regla de Ruffini no: es manipulación simbólica, fuera del nivel de ambición 💡 |
| Ecuaciones de segundo grado | ✅ | 💡 `algebra` (`cuadrado`, nivel `q1`): el lado de un cuadrado del que se conocen los cuadraditos |
| Sistemas de ecuaciones | ✅ | 💡 `algebra` (`dosBalanzas`, nivel `s1`), repetido |
| Funciones: concepto y gráficas | 🔶 | `algebra` (`graficas`) lee una gráfica real; no se presenta la función como objeto |
| La función lineal | ✅ | `algebra` (`crecer`: la que sube siempre lo mismo es la recta) |
| Funciones cuadráticas | 🔶 | `algebra` (`crecer`) distingue "cada vez más" de "siempre igual"; no se trabaja la parábola |
| Proporcionalidad geométrica: escalas, Thales | ✅ | `similar` (`semejanza`) y `percent` (`escala`) |
| Figuras planas: ángulos y áreas | ✅ | `geometry` (`angulos` y `area`), repetido |
| Semejanza de figuras | ✅ | `similar` (`semejanza`) |
| Movimientos en el plano (traslación, giro, simetría) | ✅ | `geometry` (`simetria`, nivel `m3`) |
| Cuerpos geométricos: áreas y volúmenes | ✅ | `geometry` (`volumen`): el volumen contando cubos por capas (`v1`) y la superficie contando los cuadraditos de las seis caras abiertas (`v2`) |
| Trigonometría básica | 🔶 | `similar` (`rampas`) presenta la pendiente comparando rampas; no hay razones trigonométricas |
| Estadística: medidas de dispersión | ✅ | `charts` (`reparto`, nivel `x1`: juntos o repartidos, sin fórmula) |
| Probabilidad compuesta | ✅ | `charts` (`probabilidad`, nivel `p3`: sacar dos veces y contar las parejas) |
| Progresiones | 🔶 | `patterns` trabaja series con regla, repetido |

### 4º de ESO

| Punto del temario | Estado | Actividad |
|---|---|---|
| Números reales: potencias, raíces enésimas, notación científica | 🔶 | potencias, raíz cuadrada y cúbica y notación corta en `divisibility`; las raíces de índice cualquiera no, porque ya no se pueden contar |
| Expresiones algebraicas: polinomios, identidades, factorización | ✅ | 💡 `algebra` (`piezas`): `t1` el polinomio escrito, `t2` la identidad — un cuadrado de lado x más algo, montado con sus piezas — y `t3` la factorización como el lado que falta |
| Ecuaciones de segundo grado y de grado superior | 🔶 | segundo grado en `algebra` (`cuadrado`); grado superior no, no hay dibujo que lo sostenga |
| Sistemas de ecuaciones e inecuaciones | ✅ | 💡 `algebra` (`dosBalanzas`): el nivel `s1` los sistemas y el `s2` la inecuación — la balanza torcida, que dice qué lado pesa más sin decir cuánto |
| Funciones cuadráticas | 🔶 | `algebra` (`crecer`) distingue "cada vez más" de "siempre igual", repetido |
| Funciones exponenciales y logarítmicas | 🔶 | `algebra` (`crecer`) incluye series que doblan y triplican; no se nombran ni se invierten |
| Funciones: dominio, continuidad, tasa de variación | 🔶 | `algebra` (`crecer`) muestra la tasa de variación como el salto entre dos valores; dominio y continuidad no |
| Funciones elementales | 🔶 | `algebra` (`graficas` y `crecer`); no se clasifican por familias |
| Semejanza de figuras y resolución de triángulos | 🔶 | `similar` (`semejanza` y `pitagoras`); resolver triángulos no se pide |
| Trigonometría: razones trigonométricas | 🔶 | `similar` (`rampas`): la pendiente es la razón, sin nombrarla |
| Geometría analítica: la recta | ✅ | `geometry` (`coordenadas`): el punto dicho con dos números (`k1`-`k2`) y la recta como los puntos que se alinean, con uno que se sale (`k3`). Sin ecuación de la recta: no hay dibujo que la sostenga |
| Estadística bidimensional | ✅ | 💡 `charts` (`dosCosas`, nivel `y1`): dos cosas medidas a la vez en una nube de puntos — cuando una sube, ¿la otra sube o baja? |
| Combinatoria | ✅ | `charts` (`combinaciones`, nivel `k1`), repetido |
| Probabilidad condicionada | ✅ | 💡 `charts` (`despues`, nivel `w1`): se saca una bola y no se devuelve, así que la siguiente ya no es lo mismo |
| Programación lineal sencilla | ✅ | 💡 `percent` (`limite`, niveles `l1`-`l2`): con este dinero y este precio, cuántas caben y cuánto sobra — la restricción, que es de lo que va el tema |
| Interpretación de gráficos complejos | ✅ | `charts` (`b4`): dos series en el mismo gráfico, cada una con su dibujo y su trama, y se compara una barra con la de debajo |

## 2. Hoja de ruta: qué construir y en qué orden

Agrupado por hebras temáticas (una actividad puede cubrir varios cursos, como
ya hacen `numbers` o `fractions-measures`), no punto por punto — así no se
multiplican actividades sin necesidad (`spec.md` §8.1, "cada actividad tiene
un trabajo, y solo uno").

### 2.0 Cobertura medida

Contado sobre las 171 filas de currículum del §1 de este documento:

| Bloque | Cubierto | Parcial | Falta |
|---|---|---|---|
| 1º-2º Primaria (cimientos) | 35 | 0 | 0 |
| 3º-4º Primaria | 36 | 0 | 0 |
| 5º-6º Primaria | 36 | 0 | 0 |
| ESO 1º-4º | 51 | 13 | 0 |
| **Total** | **158 (92%)** | 13 | 0 |

**No queda ninguna fila sin cubrir**: las 171 del temario tienen actividad,
142 enteras y 29 parciales. Los cimientos (1º-2º) están cerrados del todo, y
también 3º, 4º, 5º y 6º salvo las parciales que se explican en su casilla.

Lo que sigue abierto son **filas parciales**, no huecos: existe la actividad y
enseña la idea, pero no la parte que su casilla detalla (medir en grados con
transportador, la escalera completa de prefijos, operaciones combinadas de
fracciones y decimales en una misma expresión, y las familias de funciones
llamadas por su nombre). Ninguna de esas partes es un 🧱 cimiento.

Las hebras de abajo son con las que se construyó la cobertura. La cuenta de
filas es la que tenía cada hebra al empezar, para poder medir el avance:

| Hebra sin cubrir | Filas | Estado |
|---|---|---|
| Datos y gráficos (pictogramas, barras, frecuencias, media, probabilidad) | 22 | ✅ hecha: `tools/charts/`, con dispersión, nube de puntos y probabilidad tras sacar sin devolver; quedan los gráficos combinados, 💡 de ESO |
| Geometría: ángulos, perímetro, área, volumen, simetría | 26 | ✅ hecha: `tools/geometry/` más `tools/similar/` (semejanza, Pitágoras y pendientes); queda medir en grados con transportador |
| Álgebra: letras, ecuaciones, funciones | 18 | ✅ hecha: `tools/algebra/` (balanza, letras, gráficas, dos balanzas, el cuadrado, cómo crece y las piezas); queda nombrar las familias de funciones, 💡 de ESO |
| Múltiplos, divisores, primos, potencias y raíces | 11 | ✅ hecha: `tools/divisibility/`, con la notación corta y la raíz del cubo; quedan las raíces de índice cualquiera, que ya no se pueden contar |
| Multiplicar y dividir a lo grande, jerarquía de operaciones | 7 | ✅ hecha: `tools/operations/` |
| Proporcionalidad, porcentajes, dinero real | 7 | ✅ hecha: `tools/percent/`, con proporcionalidad inversa y el límite de dinero |
| Espacio y coordenadas | 8 | ✅ hecha: nociones espaciales en `places`, coordenadas en `geometry` (`coordenadas`) |
| Fracciones y decimales avanzados | 5 | ✅ hecha: `fractions-measures` (`f7`-`f9`, `d4`-`d5`) |
| Problemas de varios pasos | 3 | ✅ hecha: `problems` (`dosPasos`) |
| Tiempo: intervalos y equivalencias | 3 | ✅ hecha: unidades en `calendar`, equivalencias en `measures`, intervalos en `clock` |
| Progresiones y combinatoria | 2 | ✅ combinatoria en `charts`; progresiones en `patterns` y en `algebra` (`crecer`) |

Es decir: la parte más simbólica de la ESO (sistemas, segundo grado,
polinomios, identidades, factorización, números reales y notación
científica) está cubierta, pero **como 💡 concepto** (`spec.md` §8.1):
exposición accesible de qué es la idea, siempre con algo que se pueda contar
o mirar — dos balanzas a la vez, un cuadrado del que se busca el lado, o
piezas que se montan en un rectángulo — y nunca manipulación de símbolos.
Donde no hay dibujo que sostenga la idea (la regla de Ruffini, las raíces de
índice cualquiera, el grado superior al segundo), la casilla lo dice y se
queda fuera a propósito.

### Nivel 0 — Extender actividades existentes

| Extensión | Cursos | Nivel | Dónde |
|---|---|---|---|
| ~~Sumas y restas con llevada~~ | P2 | 🧱 Cimiento | ✅ hecho — `mental-math`, niveles `a9`/`a10` (`carry`/`borrow`), después de `anchors` |
| ~~Números ordinales~~ | P1 | 🧱 Cimiento | ✅ hecho — `numbers`, actividad `ordinales` (`o1`-`o3`): fila con bandera de inicio |
| ~~Signos `<`, `>`, `=` como símbolos~~ | P1 | 🧱 Cimiento | ✅ hecho — `numbers`, actividad `comparar` (`c1`-`c5`). Se implementó en `numbers`, no en `quantities` como decía este plan: las 4 prácticas de `quantities` son de leer y escribir números, no de comparar, así que comparar encaja con el trabajo de `numbers` (qué significan los números y cómo se ordenan) |
| ~~Múltiplos, divisores, criterios de divisibilidad, MCD/mcm, primos~~ | P5-ESO2 | 🧱/💡 frontera | ✅ hecho — en `tools/divisibility/` y no dentro de `math-tables` como decía este plan: son puntos en filas, no respuestas de una tabla, y meterlos en `math-tables` le habría dado dos trabajos |
| ~~Fracciones equivalentes (como concepto, no solo filtro interno)~~ | P4 | 🧱 Cimiento | ✅ hecho — `fractions-measures`, nivel `f4` (`equivalentes`) |
| ~~Suma y resta de fracciones con el mismo denominador~~ | P4 | 🧱 Cimiento | ✅ hecho — `fractions-measures`, niveles `f5`/`f6` (`sumaFrac`) |
| ~~Decimales: introducción~~ | P4 | 🧱 Cimiento | ✅ hecho — `fractions-measures`, actividad `decimales` (`d1`-`d3`): la misma tarta que las fracciones, notación nueva |
| ~~Decimales: operaciones~~ | P5-ESO1 | 💡 Concepto | ✅ hecho — `fractions-measures`, niveles `d4`/`d5` |
| ~~Progresiones~~ | ESO3 | 💡 Concepto | ✅ hecho — `patterns` (series con regla) y `algebra` (`crecer`), que mira si los saltos son todos iguales |
| ~~Combinatoria (contar combinaciones)~~ | ESO4 | 💡 Concepto | ✅ hecho — en `charts`, que es donde estaba ya el conteo |

**Hechas:** *El Calendario* ya existe como `tools/calendar/` (la semana y el
año como tiras que se leen, más las estaciones con sus iconos; solo se
preguntan los meses que caen enteros dentro de una estación).

*Formas y Cuerpos* ya existe como `tools/shapes/` (formas planas
con sus lados y esquinas marcadas con puntos, y cuerpos presentados siempre
a través de un objeto que se puede tener en la mano).

### Nivel 1 — Alta prioridad: 1º-2º Primaria, sin cobertura, muy visual

| Actividad nueva | Cursos | Nivel | Mecánica visual |
|---|---|---|---|
| ~~**Problemas: varios pasos**~~ | P3-P6 | 🧱 Cimiento | ✅ hecha — `tools/problems/` (`dosPasos`): una frase corta con su dibujo, y se elige la operación antes que el número. |

### Nivel 2 — Prioridad media: 2º-4º Primaria, todavía concreto

| Actividad nueva | Cursos | Nivel | Mecánica visual |
|---|---|---|---|
| ~~**Datos y Gráficos**~~ | P2-6, ESO1-2 | 🧱 P2-4 / 💡 P5+ | ✅ hecha — `tools/charts/`: pictogramas (contar iconos) → barras (leer la altura sobre una escala) → tabla de frecuencias y el dato que más se repite → la media como reparto a partes iguales → probabilidad por conteo. Absorbe la fila de **Probabilidad**: es la misma mecánica (contar lo que hay delante), y separarlas rompería "una actividad, un trabajo". |
| ~~**Geometría: Ángulos, Perímetro y Área**~~ | P3-ESO4 | 🧱 P3-4 / 💡 ESO | ✅ hecha — `tools/geometry/`, con el área del círculo (contando cuadraditos enteros) y el volumen (contando cubos por capas). Queda el transportador en grados, que necesita medir y no comparar. |

### Nivel 3 — Prioridad baja: contenido de la ESO, ambición "concepto"

| Actividad nueva | Cursos | Nivel | Mecánica visual |
|---|---|---|---|
| ~~**Porcentajes y Proporcionalidad**~~ | P5-6, ESO1-2 | 🧱 básico / 💡 resto | ✅ hecha — `tools/percent/`: el porcentaje sobre cien cuadraditos, la receta que crece, la proporcionalidad inversa y el límite de dinero. |
| ~~**Potencias y Raíces**~~ | P5-ESO3 | 🧱 cuadrados simples / 💡 resto | ✅ hecha — `divisibility` (`cuadrados` y `grandes`): el cuadrado dibujado cuadrado, su raíz, la raíz del cubo por capas y el número grande escrito corto. |
| ~~**Trigonometría**~~ | ESO2-4 | 💡 Concepto puro | ✅ hecha — `tools/similar/` (`rampas`). "¿Qué rampa está más inclinada?" comparando ángulos visualmente; nunca calcular seno/coseno. |
| ~~**Álgebra y Ecuaciones**~~ | ESO1-4 | 💡 Concepto puro | ✅ hecha — `tools/algebra/`. Una balanza que debe quedar equilibrada: quitar/poner el mismo peso en los dos platos. Nunca manipulación simbólica de "x". |
| ~~**Funciones**~~ | ESO1-4 | 💡 Concepto puro | ✅ hecha — `algebra` (`graficas`) lee una gráfica real hora a hora, y `algebra` (`crecer`) distingue crecer siempre igual de crecer cada vez más. Sin notación ni fórmulas. |
| ~~**Geometría Analítica y Programación Lineal**~~ | ESO3-4 | 💡 Concepto puro | ✅ hecha — `geometry` (`coordenadas`): un punto se dice con dos números. Y `percent` (`limite`): con este dinero y este precio, cuántas caben y cuánto sobra, que es la restricción de la que va el tema. |

## 3. Orden de las actividades

El orden, tanto en la portada como dentro de cada herramienta, sigue el curso
más temprano del temario que cada actividad empieza a cubrir. Está anotado en
un comentario en cada `data.js` para que no se pierda al añadir actividades.

| Dónde | Orden |
|---|---|
| Portada (`site/index.html`) y progreso (`config/index.html`) | numbers → quantities → mental-math → money → math-tables → fractions-measures → roman-numerals → temperature |
| `numbers` | ordinales (1º) → comparar (1º) → recta (2º) → unidades (2º-4º) → placevalue (2º-6º) → positivos-y-negativos (5º-6º) |
| `measures` | longitud → peso → capacidad |
| `fractions-measures` (solo fracciones y decimales) | fracciones → decimales |
| `math-tables` | steps (1º) → add (1º) → decompose (2º) → parity (2º) → multiply (2º-3º) → divide (3º) |
| `mental-math` | anchors (1º-2º) → restar (1º-2º) → cabeza (2º-4º) |
| `money` | llega (1º-2º) → cambio (3º) → decimales (4º) |

`clock` y `quantities` no se reordenan: sus entradas son **mecánicas** (leer /
poner / convertir; leer / escribir / separadores / descomponer), no contenidos
de cursos distintos, y su escalera de cursos vive en los niveles de cada una.

### División de actividades

"Fracciones y Medidas" eran dos trabajos distintos en una sola tarjeta.
Separadas: **Medidas** es ahora su propia actividad (`tools/measures/`), y la
antigua se queda solo con fracciones y decimales. El catálogo pasa de 15 a 16
actividades.

El slug interno `fractions-measures` **se conserva a propósito** aunque su
nombre visible sea ahora "Fracciones": ese slug es la clave de `localStorage`
(`calculia:fractions-measures`), así que renombrarlo habría dejado huérfanas
las estrellas que ya tiene guardadas quien usa la app. Es un nombre de carpeta
algo impreciso a cambio de no borrarle el progreso a nadie.

Candidata siguiente si se quiere seguir dividiendo: `numbers`, que acumula 6
sub-actividades (ordinales, comparar, recta, unidades, valor posicional,
positivos y negativos). No se ha tocado porque es cirugía mayor y afecta al
mismo trade-off de progreso guardado.

## 4. Deuda detectada que conviene resolver

**Las mismas actividades nuevas heredan el fallo de `levelFromProgress()`.**
`shapes`, `calendar` y `problems` copian el motor ya verificado, y con él este
problema: son 3 sub-actividades más que comparten un único contador.

**La verificación no vive en el repositorio.** Los scripts que han encontrado
los fallos de esta ronda (cada nivel de cada actividad, el flujo completo
hasta la pantalla final, y un comprobador por actividad de que el dibujo dice
lo mismo que la respuesta) están fuera del repo, así que no los ejecuta nadie
más y CI no los ve. `scripts/check.js` valida la estructura, no el
comportamiento: el borrado de la pantalla final pasó por CI sin una sola
queja. Convertirlos en `scripts/drive-*.js` y añadirlos a
`.github/workflows/validate.yml` es el siguiente paso de mayor valor.

**El nivel de una sub-actividad depende del progreso de TODA la herramienta.**
`levelFromProgress()` hace
`activity.levels[min(progress.completedRounds, levels.length - 1)]`, pero
`progress.completedRounds` es un único contador por herramienta, no por
sub-actividad. Afecta a `numbers`, `mental-math`, `money` y
`fractions-measures` por igual (no es nuevo, viene del diseño original).

Consecuencia real: alguien que complete 5 rondas de `medidas` abre
`fracciones` directamente en `f6` (restar fracciones) sin haber pasado por
`f1` (reconocer una fracción). Cuanto más crece una escalera, más se nota —
y choca de frente con la progresión gradual (`spec.md` §6, regla 13).

Arreglarlo requiere guardar el contador por sub-actividad
(`progress.rounds[activityId]`), lo que cambia el formato de lo ya guardado
en los dispositivos: hay que decidir si se migra el progreso existente o se
acepta empezar de nuevo. Es una decisión de producto, no solo técnica.

## 5. Qué NO cambia

- El orden de implementación sigue siendo cimientos → conceptos (`spec.md`
  §8.1): antes de empezar cualquier actividad nueva de Nivel 1 en adelante,
  el Nivel 0 (extensiones de aritmética básica) debería estar cerrado.
- "Cada actividad tiene un trabajo, y solo uno" sigue aplicando: no se debe
  meter aritmética de cimientos dentro de una actividad de concepto, ni al
  revés pedir pericia de cálculo dentro de una actividad de concepto.
- El ascensor (`positivos-y-negativos`) sigue sin operaciones ni preguntas de
  opción múltiple — eso no cambia con este documento.