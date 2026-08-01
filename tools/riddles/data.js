/* ============================================================
   Datos: adivinanzas tradicionales (es) y riddles en inglés (en).
   Formato: { text, answer, options: string[3], correct: indice }
   Para ampliar: añadir objetos al array del idioma correspondiente.
   'correct' apunta a options. app.js usa DATA[App.i18n.locale()].
   ============================================================ */
const DATA = {
  es: [
    {
        text: "Blanca por dentro, verde por fuera. Si quieres que te lo diga, espera.",
        answer: "La pera",
        options: ["La pera", "La manzana", "El plátano"],
        correct: 0
    },
    {
        text: "Tiene ojos y no ve, tiene agua y no la bebe, tiene cola y no la menea. ¿Qué es?",
        answer: "El pez",
        options: ["El pez", "El gato", "El río"],
        correct: 0
    },
    {
        text: "Oro parece, plata no es. ¿Qué es?",
        answer: "El plátano",
        options: ["El plátano", "La moneda", "El anillo"],
        correct: 0
    },
    {
        text: "Sin ser médico, me meten en la boca tres veces al día. ¿Qué soy?",
        answer: "El tenedor",
        options: ["El tenedor", "El plato", "El vaso"],
        correct: 0
    },
    {
        text: "Tengo agujas y no sé coser, tengo números y no sé leer. ¿Qué soy?",
        answer: "El reloj",
        options: ["El reloj", "La almohada", "El calendario"],
        correct: 0
    },
    {
        text: "Casa sin puerta, casa sin ventana, dentro hay un tesoro que todo lo guarda.",
        answer: "La nuez",
        options: ["La nuez", "El cofre", "La caja"],
        correct: 0
    },
    {
        text: "Va por el agua sin mojarse, va por la tierra sin mancharse. ¿Qué es?",
        answer: "El sol",
        options: ["El sol", "El pez", "El pájaro"],
        correct: 0
    },
    {
        text: "Tiene dientes y no come, tiene boca y no habla. ¿Qué es?",
        answer: "La cremallera",
        options: ["La cremallera", "El libro", "La sierra"],
        correct: 0
    },
    {
        text: "Blanca como la nieve, dulce como la miel, me encuentran en la cocina y en el desayuno también.",
        answer: "La leche",
        options: ["La leche", "El pan", "El huevo"],
        correct: 0
    },
    {
        text: "Tiene patas y no camina, tiene cabeza y no piensa. ¿Qué es?",
        answer: "La mesa",
        options: ["La mesa", "La silla", "La cama"],
        correct: 0
    },
    {
        text: "Cuanto más le quitas, más grande es. ¿Qué es?",
        answer: "El agujero",
        options: ["El agujero", "El globo", "La burbuja"],
        correct: 0
    },
    {
        text: "Tiene cuello y no tiene cabeza. ¿Qué es?",
        answer: "La botella",
        options: ["La botella", "El vaso", "La jarra"],
        correct: 0
    },
    {
        text: "Sin moverme, viajo por el mundo. ¿Qué soy?",
        answer: "El mapa",
        options: ["El mapa", "El avión", "El globo"],
        correct: 0
    },
    {
        text: "Siempre tengo hambre y nunca duermo. ¿Qué soy?",
        answer: "El fuego",
        options: ["El fuego", "El león", "El viento"],
        correct: 0
    },
    {
        text: "Tengo manos y no puedo aplaudir. ¿Qué soy?",
        answer: "El reloj",
        options: ["El reloj", "El maniquí", "La marioneta"],
        correct: 0
    },
    {
        text: "Rojo por fuera, rojo por dentro. ¿Qué es?",
        answer: "El tomate",
        options: ["El tomate", "La sandía", "La cereza"],
        correct: 0
    },
    {
        text: "Sin ser ave, vuelo sin alas. ¿Qué soy?",
        answer: "El tiempo",
        options: ["El tiempo", "El viento", "El avión"],
        correct: 0
    },
    {
        text: "Tiene hojas y no es árbol, tiene números y no es reloj. ¿Qué es?",
        answer: "El libro",
        options: ["El libro", "La carpeta", "El cuaderno"],
        correct: 0
    },
    {
        text: "Todos me usan para caminar y yo nunca camino. ¿Qué soy?",
        answer: "El zapato",
        options: ["El zapato", "El camino", "La pisada"],
        correct: 0
    },
    {
        text: "Tengo llave y no abro puertas. ¿Qué soy?",
        answer: "El piano",
        options: ["El piano", "La cerradura", "El candado"],
        correct: 0
    },
    {
        text: "Todos me cortan pero nadie me ve. ¿Qué soy?",
        answer: "El viento",
        options: ["El viento", "El pelo", "El agua"],
        correct: 0
    },
    {
        text: "Blanca por fuera, coloreada por dentro. ¿Qué es?",
        answer: "La sandía",
        options: ["La sandía", "El coco", "La naranja"],
        correct: 0
    },
    {
        text: "Tiene corona y no es rey. ¿Qué es?",
        answer: "La fresa",
        options: ["La fresa", "La margarita", "El nabo"],
        correct: 0
    },
    {
        text: "Vivo sin comer, duermo sin cansancio. ¿Qué soy?",
        answer: "La planta",
        options: ["La planta", "La piedra", "El pez"],
        correct: 0
    },
    {
        text: "Tiene cuerdas y no es zapato. ¿Qué es?",
        answer: "La guitarra",
        options: ["La guitarra", "El violín", "El arco"],
        correct: 0
    },
    {
        text: "Todos me tienen en la cara. ¿Qué soy?",
        answer: "La nariz",
        options: ["La nariz", "Los ojos", "La boca"],
        correct: 0
    },
    {
        text: "Tiene dientes y vive en el mar. ¿Qué es?",
        answer: "El tiburón",
        options: ["El tiburón", "El pez espada", "La ballena"],
        correct: 0
    },
    {
        text: "Sin ser teléfono, tengo cordón. ¿Qué soy?",
        answer: "Las zapatillas",
        options: ["Las zapatillas", "El pantalón", "El jersey"],
        correct: 0
    },
    {
        text: "Todos me tienen 24. ¿Qué soy?",
        answer: "Las horas",
        options: ["Las horas", "Los dedos", "Los meses"],
        correct: 0
    },
    {
        text: "Tengo siete hermanos y cada uno vive en su casa. ¿Qué soy?",
        answer: "Los días de la semana",
        options: ["Los días de la semana", "Los meses del año", "Los dedos de la mano"],
        correct: 0
    },
    {
        text: "Rojo y redondo como una bola, con rabo verde y sabroso. ¿Qué es?",
        answer: "La cereza",
        options: ["La cereza", "La fresa", "La uva"],
        correct: 0
    },
    {
        text: "Tiene brazos y no pelea. ¿Qué es?",
        answer: "El árbol",
        options: ["El árbol", "El soldadito", "El juguete"],
        correct: 0
    },
    {
        text: "Todos me usan en la noche y nunca me ven de día. ¿Qué soy?",
        answer: "La luna",
        options: ["La luna", "Las estrellas", "El sueño"],
        correct: 0
    },
    {
        text: "Tiene aguas y no es mar. ¿Qué es?",
        answer: "El mapa",
        options: ["El mapa", "La bañera", "El vaso"],
        correct: 0
    },
    {
        text: "Todos me tienen en pares. ¿Qué soy?",
        answer: "Los calcetines",
        options: ["Los calcetines", "Los guantes", "Los zapatos"],
        correct: 0
    },
    {
        text: "Tiene suelo y no es casa, tiene techo y no es edificio. ¿Qué es?",
        answer: "El paraguas",
        options: ["El paraguas", "La tienda", "El coche"],
        correct: 0
    },
    {
        text: "Todos me tienen una vez al año. ¿Qué soy?",
        answer: "El cumpleaños",
        options: ["El cumpleaños", "El año nuevo", "La Navidad"],
        correct: 0
    },
    {
        text: "Tiene letras y no sabe leer. ¿Qué es?",
        answer: "El teléfono",
        options: ["El teléfono", "El libro", "El cuaderno"],
        correct: 0
    },
    {
        text: "Todos me pisan pero nadie me nota. ¿Qué soy?",
        answer: "El suelo",
        options: ["El suelo", "El camino", "La hierba"],
        correct: 0
    },
    {
        text: "Tiene puntos y no es juego, tiene rayas y no es cebra. ¿Qué es?",
        answer: "El dado",
        options: ["El dado", "El parchís", "El dominó"],
        correct: 0
    },
    {
        text: "Blanca por dentro, blanca por fuera, todos me usan para jugar. ¿Qué soy?",
        answer: "La bola de nieve",
        options: ["La bola de nieve", "La nieve", "El algodón"],
        correct: 0
    },
    {
        text: "Todos me tienen en la boca. ¿Qué soy?",
        answer: "La lengua",
        options: ["La lengua", "Los dientes", "Los labios"],
        correct: 0
    },
    {
        text: "Tiene velas y no es cumpleaños. ¿Qué es?",
        answer: "El barco",
        options: ["El barco", "El pastel", "La tarta"],
        correct: 0
    },
    {
        text: "Todos me tienen en las manos. ¿Qué soy?",
        answer: "Los dedos",
        options: ["Los dedos", "Las palmas", "Las uñas"],
        correct: 0
    },
    {
        text: "Tiene luna y no es cielo. ¿Qué es?",
        answer: "El queso",
        options: ["El queso", "La luna", "El plato"],
        correct: 0
    },
    {
        text: "Todos me tienen en la espalda. ¿Qué soy?",
        answer: "La mochila",
        options: ["La mochila", "El bolsillo", "El jersey"],
        correct: 0
    },
    {
        text: "Tiene pelo y no es cabeza. ¿Qué es?",
        answer: "El pincel",
        options: ["El pincel", "La brocha", "El lápiz"],
        correct: 0
    },
    {
        text: "Todos me tienen en los pies. ¿Qué soy?",
        answer: "Los dedos",
        options: ["Los dedos", "Las uñas", "Las plantas"],
        correct: 0
    },
    {
        text: "Tiene ojos y no ve. ¿Qué es?",
        answer: "La aguja",
        options: ["La aguja", "El alfiler", "El hilo"],
        correct: 0
    },
    {
        text: "Todos me tienen en la nariz. ¿Qué soy?",
        answer: "Los mocos",
        options: ["Los mocos", "El olor", "Los estornudos"],
        correct: 0
    },
    {
        text: "Tiene boca y no habla, tiene labios y no besa. ¿Qué es?",
        answer: "El zapato",
        options: ["El zapato", "La boca", "El río"],
        correct: 0
    },
    {
        text: "Todos me tienen en el cuello. ¿Qué soy?",
        answer: "La corbata",
        options: ["La corbata", "El collar", "Los pendientes"],
        correct: 0
    },
    {
        text: "Tiene agua y no es mar, tiene olas y no es playa. ¿Qué es?",
        answer: "La bañera",
        options: ["La bañera", "El vaso", "El río"],
        correct: 0
    },
    {
        text: "Todos me tienen en la cabeza. ¿Qué soy?",
        answer: "El pelo",
        options: ["El pelo", "Los ojos", "La nariz"],
        correct: 0
    },
    {
        text: "Tengo llave y no abro puerta. ¿Qué soy?",
        answer: "El piano",
        options: ["El piano", "La cerradura", "El candado"],
        correct: 0
    },
    {
        text: "Todos me tienen en pares. ¿Qué soy?",
        answer: "Los pendientes",
        options: ["Los pendientes", "Los collares", "Las pulseras"],
        correct: 0
    },
    {
        text: "Tiene patas y no camina, tiene velas y no es cumpleaños. ¿Qué es?",
        answer: "La mesa",
        options: ["La mesa", "La cama", "La silla"],
        correct: 0
    },
    {
        text: "Todos me tienen en la mano. ¿Qué soy?",
        answer: "El anillo",
        options: ["El anillo", "El reloj", "La pulsera"],
        correct: 0
    },
    {
        text: "Tiene ruedas y no es coche, tiene colchón y no es cama. ¿Qué es?",
        answer: "El carrito",
        options: ["El carrito", "La maleta", "La silla"],
        correct: 0
    },
    {
        text: "Todos me tienen en la boca y en la nariz. ¿Qué soy?",
        answer: "Los mocos",
        options: ["Los mocos", "El aire", "La mucosidad"],
        correct: 0
    },
    {
        text: "Tiene líquido y no es río, tiene espuma y no es mar. ¿Qué es?",
        answer: "La cerveza",
        options: ["La cerveza", "El baño", "El jacuzzi"],
        correct: 0
    },
    {
        text: "Todos me tienen en la pared. ¿Qué soy?",
        answer: "El cuadro",
        options: ["El cuadro", "El reloj", "El espejo"],
        correct: 0
    },
    {
        text: "Tiene puntos y no es juego. ¿Qué es?",
        answer: "El dado",
        options: ["El dado", "El parchís", "El dominó"],
        correct: 0
    },
    {
        text: "Todos me tienen en la ventana. ¿Qué soy?",
        answer: "La cortina",
        options: ["La cortina", "El cristal", "El marco"],
        correct: 0
    },
    {
        text: "Tiene plumas y no vuela. ¿Qué es?",
        answer: "La almohada",
        options: ["La almohada", "El pájaro", "El avión"],
        correct: 0
    },
    {
        text: "Todos me tienen en la cocina. ¿Qué soy?",
        answer: "El fuego",
        options: ["El fuego", "El plato", "El vaso"],
        correct: 0
    },
    {
        text: "Tiene teclas y no es piano. ¿Qué es?",
        answer: "El ordenador",
        options: ["El ordenador", "La máquina", "El mando"],
        correct: 0
    },
    {
        text: "Todos me tienen en la mesa. ¿Qué soy?",
        answer: "El mantel",
        options: ["El mantel", "El plato", "El vaso"],
        correct: 0
    },
    {
        text: "Tiene arena y no es playa. ¿Qué es?",
        answer: "El reloj de arena",
        options: ["El reloj de arena", "La hora", "El tiempo"],
        correct: 0
    },
    {
        text: "Todos me tienen en el baño. ¿Qué soy?",
        answer: "La toalla",
        options: ["La toalla", "El jabón", "El champú"],
        correct: 0
    },
    {
        text: "Tiene líquido y no es botella. ¿Qué es?",
        answer: "La bañera",
        options: ["La bañera", "El vaso", "La jarra"],
        correct: 0
    },
    {
        text: "Todos me tienen en la calle. ¿Qué soy?",
        answer: "La farola",
        options: ["La farola", "El coche", "La acera"],
        correct: 0
    },
    {
        text: "Tiene ruedas y no es juguete. ¿Qué es?",
        answer: "La maleta",
        options: ["La maleta", "El coche", "La bicicleta"],
        correct: 0
    },
    {
        text: "Todos me tienen en la cama. ¿Qué soy?",
        answer: "La almohada",
        options: ["La almohada", "La manta", "La sábana"],
        correct: 0
    },
    {
        text: "Tiene pelo y no es animal. ¿Qué es?",
        answer: "El maíz",
        options: ["El maíz", "El trigo", "La barba"],
        correct: 0
    },
    {
        text: "Todos me tienen en el jardín. ¿Qué soy?",
        answer: "La flor",
        options: ["La flor", "La hierba", "El árbol"],
        correct: 0
    },
    {
        text: "Tiene semillas y no es fruta. ¿Qué es?",
        answer: "El melón",
        options: ["El melón", "La sandía", "La calabaza"],
        correct: 0
    },
    {
        text: "Todos me tienen en el coche. ¿Qué soy?",
        answer: "Las ruedas",
        options: ["Las ruedas", "Los asientos", "Las ventanas"],
        correct: 0
    },
    {
        text: "Tiene hueso y no es carne. ¿Qué es?",
        answer: "El melocotón",
        options: ["El melocotón", "La cereza", "La ciruela"],
        correct: 0
    },
    {
        text: "Todos me tienen en la escuela. ¿Qué soy?",
        answer: "La pizarra",
        options: ["La pizarra", "El libro", "El lápiz"],
        correct: 0
    },
    {
        text: "Tiene pelo y no es perro. ¿Qué es?",
        answer: "El coco",
        options: ["El coco", "La nuez", "La avellana"],
        correct: 0
    },
    {
        text: "Todos me tienen en la playa. ¿Qué soy?",
        answer: "La arena",
        options: ["La arena", "El agua", "La concha"],
        correct: 0
    },
    {
        text: "Tiene plumas y no es pájaro. ¿Qué es?",
        answer: "La pluma",
        options: ["La pluma", "El pincel", "El algodón"],
        correct: 0
    },
    {
        text: "Todos me tienen en el frigorífico. ¿Qué soy?",
        answer: "El hielo",
        options: ["El hielo", "La leche", "El agua"],
        correct: 0
    },
    {
        text: "Tiene escamas y no es pez. ¿Qué es?",
        answer: "La piña",
        options: ["La piña", "El coco", "El melón"],
        correct: 0
    },
    {
        text: "Todos me tienen en el armario. ¿Qué soy?",
        answer: "La percha",
        options: ["La percha", "La ropa", "El cajón"],
        correct: 0
    },
    {
        text: "Tiene círculos y no es moneda. ¿Qué es?",
        answer: "La rosquilla",
        options: ["La rosquilla", "La galleta", "La pizza"],
        correct: 0
    },
    {
        text: "Todos me tienen en la televisión. ¿Qué soy?",
        answer: "El mando",
        options: ["El mando", "La pantalla", "El botón"],
        correct: 0
    },
    {
        text: "Tiene agujas y no cose, tiene cara y no habla. ¿Qué es?",
        answer: "El reloj",
        options: ["El reloj", "El cojín", "La almohada"],
        correct: 0
    },
    {
        text: "Todos me tienen en la escuela. ¿Qué soy?",
        answer: "El libro",
        options: ["El libro", "La silla", "La mesa"],
        correct: 0
    },
    {
        text: "Tiene dientes y no muerde, tiene boca y no come. ¿Qué es?",
        answer: "El peine",
        options: ["El peine", "El tenedor", "La cremallera"],
        correct: 0
    },
    {
        text: "Todos me tienen en la calle. ¿Qué soy?",
        answer: "El banco",
        options: ["El banco", "La farola", "El coche"],
        correct: 0
    }
  ],
  en: [
    {
        text: "White inside, green outside, and shaped like a little egg. What am I?",
        answer: "A pear",
        options: ["A pear", "An apple", "A banana"],
        correct: 0
    },
    {
        text: "I have eyes but cannot see, I have water but cannot drink it, I have a tail but do not wag it. What am I?",
        answer: "A fish",
        options: ["A fish", "A cat", "A river"],
        correct: 0
    },
    {
        text: "It looks like gold, but it isn't gold. What is it?",
        answer: "A banana",
        options: ["A banana", "A coin", "A ring"],
        correct: 0
    },
    {
        text: "I am not a doctor, but I go into your mouth three times a day. What am I?",
        answer: "A fork",
        options: ["A fork", "A plate", "A cup"],
        correct: 0
    },
    {
        text: "I have hands but cannot clap, I have a face but cannot smile, and I tell you the time. What am I?",
        answer: "A clock",
        options: ["A clock", "A pillow", "A calendar"],
        correct: 0
    },
    {
        text: "A house with no door and no window, and inside it keeps a little treasure. What is it?",
        answer: "A walnut",
        options: ["A walnut", "A treasure chest", "A box"],
        correct: 0
    },
    {
        text: "It crosses water without getting wet, and crosses land without getting dirty. What is it?",
        answer: "The sun",
        options: ["The sun", "A fish", "A bird"],
        correct: 0
    },
    {
        text: "I have teeth but cannot eat, I have a mouth but cannot speak. What am I?",
        answer: "A zip",
        options: ["A zip", "A book", "A saw"],
        correct: 0
    },
    {
        text: "White as snow, sweet as honey, you find it at breakfast every day. What is it?",
        answer: "Milk",
        options: ["Milk", "Bread", "An egg"],
        correct: 0
    },
    {
        text: "I have legs but cannot walk, I have a top but no head. What am I?",
        answer: "A table",
        options: ["A table", "A chair", "A bed"],
        correct: 0
    },
    {
        text: "The more you take away from me, the bigger I get. What am I?",
        answer: "A hole",
        options: ["A hole", "A balloon", "A bubble"],
        correct: 0
    },
    {
        text: "I have a neck but no head. What am I?",
        answer: "A bottle",
        options: ["A bottle", "A cup", "A jug"],
        correct: 0
    },
    {
        text: "Without ever moving, I can show you the whole world. What am I?",
        answer: "A map",
        options: ["A map", "An aeroplane", "A globe"],
        correct: 0
    },
    {
        text: "I am always hungry and I never sleep. What am I?",
        answer: "Fire",
        options: ["Fire", "A lion", "The wind"],
        correct: 0
    },
    {
        text: "I have hands but I cannot clap. What am I?",
        answer: "A clock",
        options: ["A clock", "A mannequin", "A puppet"],
        correct: 0
    },
    {
        text: "Red outside, red inside too. What is it?",
        answer: "A tomato",
        options: ["A tomato", "A watermelon", "A cherry"],
        correct: 0
    },
    {
        text: "I am not a bird, but I fly without wings. What am I?",
        answer: "Time",
        options: ["Time", "The wind", "An aeroplane"],
        correct: 0
    },
    {
        text: "I have pages but I am not a tree, I have a spine but I cannot bend it. What am I?",
        answer: "A book",
        options: ["A book", "A folder", "A notebook"],
        correct: 0
    },
    {
        text: "Everyone uses me to walk, but I never walk myself. What am I?",
        answer: "A shoe",
        options: ["A shoe", "A path", "A footprint"],
        correct: 0
    },
    {
        text: "I have keys but I open no doors. What am I?",
        answer: "A piano",
        options: ["A piano", "A lock", "A padlock"],
        correct: 0
    },
    {
        text: "Everyone can feel me, but no one can see me. What am I?",
        answer: "The wind",
        options: ["The wind", "Hair", "Water"],
        correct: 0
    },
    {
        text: "White outside, colourful inside. What is it?",
        answer: "A watermelon",
        options: ["A watermelon", "A coconut", "An orange"],
        correct: 0
    },
    {
        text: "I wear a little green crown, but I am not a king. What am I?",
        answer: "A strawberry",
        options: ["A strawberry", "A daisy", "A turnip"],
        correct: 0
    },
    {
        text: "I live without eating, I sleep without ever getting tired. What am I?",
        answer: "A plant",
        options: ["A plant", "A stone", "A fish"],
        correct: 0
    },
    {
        text: "I have strings but I am not a shoe. What am I?",
        answer: "A guitar",
        options: ["A guitar", "A violin", "A bow"],
        correct: 0
    },
    {
        text: "Everyone has one right in the middle of their face. What is it?",
        answer: "A nose",
        options: ["A nose", "Eyes", "A mouth"],
        correct: 0
    },
    {
        text: "I have teeth and I live in the sea. What am I?",
        answer: "A shark",
        options: ["A shark", "A swordfish", "A whale"],
        correct: 0
    },
    {
        text: "I am not a telephone, but I have laces. What am I?",
        answer: "Trainers",
        options: ["Trainers", "Trousers", "A jumper"],
        correct: 0
    },
    {
        text: "Everyone has 24 of me in a day. What am I?",
        answer: "Hours",
        options: ["Hours", "Fingers", "Months"],
        correct: 0
    },
    {
        text: "I have seven brothers, and each one has a different name. What am I?",
        answer: "The days of the week",
        options: ["The days of the week", "The months of the year", "The fingers of the hand"],
        correct: 0
    },
    {
        text: "Round and red like a little ball, with a green stalk and a sweet taste. What am I?",
        answer: "A cherry",
        options: ["A cherry", "A strawberry", "A grape"],
        correct: 0
    },
    {
        text: "I have arms but I never fight. What am I?",
        answer: "A tree",
        options: ["A tree", "A toy soldier", "A toy"],
        correct: 0
    },
    {
        text: "Everyone can see me at night, but never during the day. What am I?",
        answer: "The moon",
        options: ["The moon", "The stars", "A dream"],
        correct: 0
    },
    {
        text: "I have places called capitals, but I am not the sea. What am I?",
        answer: "A map",
        options: ["A map", "A bathtub", "A cup"],
        correct: 0
    },
    {
        text: "Everyone has two of me, and I always come in a pair. What am I?",
        answer: "Socks",
        options: ["Socks", "Gloves", "Shoes"],
        correct: 0
    },
    {
        text: "I have a floor and I am not a house, I have a roof and I am not a building. What am I?",
        answer: "An umbrella",
        options: ["An umbrella", "A tent", "A car"],
        correct: 0
    },
    {
        text: "Everyone has me only once a year, and it is a very happy day. What am I?",
        answer: "A birthday",
        options: ["A birthday", "New Year", "Christmas"],
        correct: 0
    },
    {
        text: "I have letters but I cannot read. What am I?",
        answer: "A telephone",
        options: ["A telephone", "A book", "A notebook"],
        correct: 0
    },
    {
        text: "Everyone steps on me, but nobody notices me. What am I?",
        answer: "The ground",
        options: ["The ground", "The path", "The grass"],
        correct: 0
    },
    {
        text: "I have dots but I am not a game, I have squares but I am not a zebra. What am I?",
        answer: "A dice",
        options: ["A dice", "Ludo", "Dominoes"],
        correct: 0
    },
    {
        text: "White inside and white outside, and everyone throws me for fun in winter. What am I?",
        answer: "A snowball",
        options: ["A snowball", "Snow", "Cotton wool"],
        correct: 0
    },
    {
        text: "Everyone has me inside their mouth. What am I?",
        answer: "A tongue",
        options: ["A tongue", "Teeth", "Lips"],
        correct: 0
    },
    {
        text: "I have sails but I am not a birthday cake. What am I?",
        answer: "A boat",
        options: ["A boat", "A cake", "A gift"],
        correct: 0
    },
    {
        text: "Everyone has ten of me on their hands. What am I?",
        answer: "Fingers",
        options: ["Fingers", "Palms", "Nails"],
        correct: 0
    },
    {
        text: "I have holes but I am not the moon. What am I?",
        answer: "Cheese",
        options: ["Cheese", "The moon", "A plate"],
        correct: 0
    },
    {
        text: "Everyone carries me on their back to school. What am I?",
        answer: "A backpack",
        options: ["A backpack", "A pocket", "A jumper"],
        correct: 0
    },
    {
        text: "I have bristles but I am not an animal. What am I?",
        answer: "A paintbrush",
        options: ["A paintbrush", "A broom", "A pencil"],
        correct: 0
    },
    {
        text: "Everyone has ten of me on their feet. What am I?",
        answer: "Toes",
        options: ["Toes", "Toenails", "Soles"],
        correct: 0
    },
    {
        text: "I have an eye but I cannot see. What am I?",
        answer: "A needle",
        options: ["A needle", "A pin", "A thread"],
        correct: 0
    },
    {
        text: "Everyone gets me when they have a cold. What am I?",
        answer: "A runny nose",
        options: ["A runny nose", "A smell", "A sneeze"],
        correct: 0
    },
    {
        text: "I have a mouth but I never speak, I have a tongue but I never taste. What am I?",
        answer: "A shoe",
        options: ["A shoe", "A mouth", "A river"],
        correct: 0
    },
    {
        text: "Everyone wears me around their neck for a smart look. What am I?",
        answer: "A tie",
        options: ["A tie", "A necklace", "Earrings"],
        correct: 0
    },
    {
        text: "I have water but I am not the sea, I have waves but I am not a beach. What am I?",
        answer: "A bathtub",
        options: ["A bathtub", "A cup", "A river"],
        correct: 0
    },
    {
        text: "Everyone has me on top of their head. What am I?",
        answer: "Hair",
        options: ["Hair", "Eyes", "A nose"],
        correct: 0
    },
    {
        text: "I have keys but I cannot open a single door. What am I?",
        answer: "A piano",
        options: ["A piano", "A lock", "A padlock"],
        correct: 0
    },
    {
        text: "Everyone wears me in pairs on their ears. What am I?",
        answer: "Earrings",
        options: ["Earrings", "Necklaces", "Bracelets"],
        correct: 0
    },
    {
        text: "I have legs but I cannot walk, I have candles but I am not a birthday cake. What am I?",
        answer: "A table",
        options: ["A table", "A bed", "A chair"],
        correct: 0
    },
    {
        text: "Everyone wears me on a finger. What am I?",
        answer: "A ring",
        options: ["A ring", "A watch", "A bracelet"],
        correct: 0
    },
    {
        text: "I have wheels but I am not a car, I have a seat but I am not a bed. What am I?",
        answer: "A pram",
        options: ["A pram", "A suitcase", "A chair"],
        correct: 0
    },
    {
        text: "Everyone gets me in their nose and mouth when they have a cold. What am I?",
        answer: "Mucus",
        options: ["Mucus", "Air", "A cold"],
        correct: 0
    },
    {
        text: "I am a liquid but I am not from a river, I have foam but I am not the sea. What am I?",
        answer: "Soap",
        options: ["Soap", "A bath", "A jacuzzi"],
        correct: 0
    },
    {
        text: "Everyone hangs me on a wall to look at. What am I?",
        answer: "A picture",
        options: ["A picture", "A clock", "A mirror"],
        correct: 0
    },
    {
        text: "I have dots but I am not a game. What am I?",
        answer: "A dice",
        options: ["A dice", "Ludo", "Dominoes"],
        correct: 0
    },
    {
        text: "Everyone hangs me by a window to keep out the light. What am I?",
        answer: "A curtain",
        options: ["A curtain", "Glass", "A frame"],
        correct: 0
    },
    {
        text: "I have feathers but I do not fly. What am I?",
        answer: "A pillow",
        options: ["A pillow", "A bird", "An aeroplane"],
        correct: 0
    },
    {
        text: "Everyone has me in their kitchen to cook food. What am I?",
        answer: "A cooker",
        options: ["A cooker", "A plate", "A cup"],
        correct: 0
    },
    {
        text: "I have keys but I am not a piano. What am I?",
        answer: "A computer",
        options: ["A computer", "A machine", "A remote control"],
        correct: 0
    },
    {
        text: "Everyone spreads me on a table before eating. What am I?",
        answer: "A tablecloth",
        options: ["A tablecloth", "A plate", "A cup"],
        correct: 0
    },
    {
        text: "I have sand but I am not a beach, and I measure time as I fall. What am I?",
        answer: "An hourglass",
        options: ["An hourglass", "The time", "A clock"],
        correct: 0
    },
    {
        text: "Everyone uses me to dry off after a bath. What am I?",
        answer: "A towel",
        options: ["A towel", "Soap", "Shampoo"],
        correct: 0
    },
    {
        text: "I am a liquid but I am not from a bottle, and you soak in me. What am I?",
        answer: "Bath water",
        options: ["Bath water", "A glass of water", "A jug"],
        correct: 0
    },
    {
        text: "Everyone sees me lighting up the street at night. What am I?",
        answer: "A street lamp",
        options: ["A street lamp", "A car", "The pavement"],
        correct: 0
    },
    {
        text: "I have wheels but I am not a toy, and you pack clothes inside me for a trip. What am I?",
        answer: "A suitcase",
        options: ["A suitcase", "A car", "A bicycle"],
        correct: 0
    },
    {
        text: "Everyone rests their head on me at night. What am I?",
        answer: "A pillow",
        options: ["A pillow", "A blanket", "A sheet"],
        correct: 0
    },
    {
        text: "I have silk but I am not a shirt, and I grow on a plant. What am I?",
        answer: "Corn",
        options: ["Corn", "Wheat", "A beard"],
        correct: 0
    },
    {
        text: "Everyone grows me in a garden and I have petals. What am I?",
        answer: "A flower",
        options: ["A flower", "Grass", "A tree"],
        correct: 0
    },
    {
        text: "I have seeds but I am not a fruit tree. What am I?",
        answer: "A pumpkin",
        options: ["A pumpkin", "A watermelon", "A melon"],
        correct: 0
    },
    {
        text: "Everyone finds me under a car, and I am round and I roll. What am I?",
        answer: "A wheel",
        options: ["A wheel", "A seat", "A window"],
        correct: 0
    },
    {
        text: "I have a stone inside me but I am not made of rock. What am I?",
        answer: "A peach",
        options: ["A peach", "A cherry", "A plum"],
        correct: 0
    },
    {
        text: "Everyone writes on me at school with chalk. What am I?",
        answer: "A blackboard",
        options: ["A blackboard", "A book", "A pencil"],
        correct: 0
    },
    {
        text: "I have a hard shell but I am not an egg. What am I?",
        answer: "A coconut",
        options: ["A coconut", "A walnut", "A hazelnut"],
        correct: 0
    },
    {
        text: "Everyone finds me on the beach, small and made of tiny grains. What am I?",
        answer: "Sand",
        options: ["Sand", "Water", "A shell"],
        correct: 0
    },
    {
        text: "I have spikes but I am not a hedgehog, and I grow on top of a tree. What am I?",
        answer: "A pineapple",
        options: ["A pineapple", "A coconut", "A melon"],
        correct: 0
    },
    {
        text: "Everyone keeps me in the freezer, and I am frozen water. What am I?",
        answer: "Ice",
        options: ["Ice", "Milk", "Water"],
        correct: 0
    },
    {
        text: "I have scales but I am not a fish. What am I?",
        answer: "A pine cone",
        options: ["A pine cone", "A coconut", "A melon"],
        correct: 0
    },
    {
        text: "Everyone keeps me in the wardrobe to hang up clothes. What am I?",
        answer: "A coat hanger",
        options: ["A coat hanger", "Clothes", "A drawer"],
        correct: 0
    },
    {
        text: "I have a hole in the middle but I am not a coin. What am I?",
        answer: "A doughnut",
        options: ["A doughnut", "A biscuit", "A pizza"],
        correct: 0
    },
    {
        text: "Everyone uses me to change the channel on the television. What am I?",
        answer: "A remote control",
        options: ["A remote control", "A screen", "A button"],
        correct: 0
    },
    {
        text: "I have hands but I never clap, I have a face but I never smile. What am I?",
        answer: "A clock",
        options: ["A clock", "A cushion", "A pillow"],
        correct: 0
    },
    {
        text: "Everyone finds me at school full of pages to read. What am I?",
        answer: "A book",
        options: ["A book", "A chair", "A desk"],
        correct: 0
    },
    {
        text: "I have teeth but I never bite, I have a mouth but I never eat. What am I?",
        answer: "A comb",
        options: ["A comb", "A fork", "A zip"],
        correct: 0
    },
    {
        text: "Everyone sits on me in the park to rest. What am I?",
        answer: "A bench",
        options: ["A bench", "A street lamp", "A car"],
        correct: 0
    }
  ]
};
