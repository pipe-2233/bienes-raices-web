/* =========================================================
   Proyectos activos — edita aquí para agregar, quitar o
   cambiar proyectos. La página se arma sola con estos datos.

   Campos:
   id          identificador único (sin espacios). Se usa en el enlace: #p-<id>
   titulo      nombre del proyecto
   zona        municipio (se usa en el filtro de ubicación)
   sector      referencia más precisa
   tipo        "Campestre" | "Comercial" | "Inversión"
   precio      número en pesos (null = "Consultar")
   precioNota  texto pequeño junto al precio
   area        texto del área, p. ej. "1.000 – 1.770 m²"
   areaNum     área mayor en m², para ordenar
   fin         financiación corta para la tarjeta (null si no aplica)
   imgs        fotos (la primera es la portada)
   etiquetas   chips de la tarjeta
   detalle     filas de "Características" en la ventana flotante
   financiacion  lista de modalidades de pago
   ubicacion   texto + distancias
   mapa        búsqueda para Google Maps
   descripcion párrafos
   ========================================================= */
window.PROYECTOS = [
  {
    id: 'samanes',
    titulo: 'Samanes del Overo',
    zona: 'Bugalagrande',
    sector: 'Entre Bugalagrande y Tuluá, por doble calzada',
    tipo: 'Campestre',
    precio: 150000000,
    precioNota: 'desde',
    area: '1.000 – 1.770 m²',
    areaNum: 1770,
    fin: 'Hasta 90 meses',
    imgs: ['assets/img/samanes-plano.jpg', 'assets/img/samanes-aerea.jpg', 'assets/img/samanes-lotes.jpg'],
    etiquetas: ['Escritura independiente', 'Servicios'],
    detalle: [
      ['Área de los lotes', '1.000 a 1.770 m²'],
      ['Lotes campestres', 'desde $150.000.000'],
      ['Lote comercial', '$250.000.000'],
      ['Servicios', 'Agua, energía y alcantarillado'],
      ['Escrituras', 'Independientes por lote'],
      ['Uso', 'Casa campestre, inversión o patrimonio']
    ],
    financiacion: [
      'Financiación directa hasta 90 meses',
      'Opciones según tu presupuesto: te enviamos el plan por WhatsApp'
    ],
    ubicacion: {
      texto: 'Sector estratégico con acceso por doble calzada, a pocos minutos de Bugalagrande.',
      distancias: [['Bugalagrande', 'pocos minutos'], ['Tuluá', '~15 min']]
    },
    mapa: 'Bugalagrande, Valle del Cauca',
    descripcion: [
      'Proyecto de lotes campestres para construir tu casa, descansar y disfrutar de la tranquilidad del campo sin alejarte de la ciudad.',
      'Tenemos dos mapas del proyecto con los lotes disponibles, sus medidas y precios. Pídelos por WhatsApp y te los enviamos actualizados.'
    ]
  },
  {
    id: 'comfandi',
    titulo: 'Lotes Campestres Comfandi',
    zona: 'Tuluá',
    sector: 'Sector Chancos, junto al centro recreacional Comfandi',
    tipo: 'Campestre',
    precio: 115000000,
    precioNota: 'desde · $115.000 el m²',
    area: '1.000 – 2.000 m²',
    areaNum: 2000,
    fin: 'Hasta 5 años',
    imgs: ['assets/img/chancos-comfandi.jpg'],
    etiquetas: ['Escritura inmediata', '5 min de Tuluá'],
    detalle: [
      ['Área de los lotes', '1.000 a 2.000 m²'],
      ['Valor del m²', '$115.000'],
      ['Ejemplo 1.000 m²', '$115.000.000'],
      ['Ejemplo 2.000 m²', '$230.000.000'],
      ['Escrituras', 'Inmediatas'],
      ['Ideal para', 'Casa campestre, recreación, cultivo o espacio deportivo']
    ],
    financiacion: [
      'Cuota inicial del 30 %',
      'Saldo financiado directamente hasta 5 años'
    ],
    ubicacion: {
      texto: 'Junto al centro recreacional Comfandi (piscinas con olas), en un sector de alta valorización.',
      distancias: [['Tuluá', '5 min'], ['Doble calzada Tuluá–Buga', '2 min']]
    },
    mapa: 'Chancos, Tuluá, Valle del Cauca',
    descripcion: [
      'Lotes campestres de la medida que necesites, rodeados de naturaleza y a minutos de la ciudad.',
      'Agenda tu visita y te mostramos los lotes disponibles.'
    ]
  },
  {
    id: 'super-lote',
    titulo: 'Súper lote campestre a orilla de la doble calzada',
    zona: 'Bugalagrande',
    sector: 'Orilla de la doble calzada',
    tipo: 'Inversión',
    precio: 295000000,
    precioNota: 'con financiación',
    area: '17.531 m²',
    areaNum: 17531,
    fin: 'Financiación',
    imgs: ['assets/img/super-lote.jpg'],
    etiquetas: ['Licencias', 'Escrituras'],
    detalle: [
      ['Área', '17.531 m²'],
      ['Precio', '$295.000.000'],
      ['Licencias', 'Sí'],
      ['Escrituras', 'Sí'],
      ['Servicios', 'Agua y energía'],
      ['Frente', 'Sobre la doble calzada']
    ],
    financiacion: ['Financiación directa: pregunta por el plan de pagos'],
    ubicacion: {
      texto: 'A orilla de la doble calzada, con acceso inmediato.',
      distancias: [['Bugalagrande', '2 min'], ['Tuluá', '16 min']]
    },
    mapa: 'Bugalagrande, Valle del Cauca',
    descripcion: [
      'Terreno amplio para proyecto campestre, parcelación o inversión, con licencias y escrituras al día.'
    ]
  },
  {
    id: 'mirador-el-filo',
    titulo: 'Mirador El Filo — finca con punto de negocio',
    zona: 'La Tulia',
    sector: 'Cruces El Filo, La Tulia',
    tipo: 'Comercial',
    precio: 295000000,
    precioNota: 'precio especial',
    area: '9.193 m²',
    areaNum: 9193,
    fin: null,
    imgs: ['assets/img/mirador-el-filo.jpg'],
    etiquetas: ['Punto de negocio', 'Vista al valle'],
    detalle: [
      ['Área', '9.193 m²'],
      ['Precio', '$295.000.000'],
      ['Uso', 'Finca con punto de negocio'],
      ['Vista', 'Panorámica de todo el Valle del Cauca']
    ],
    financiacion: ['Pregunta por las opciones de pago'],
    ubicacion: {
      texto: 'Mirador El Filo, La Tulia (Bolívar, Valle del Cauca). Un lugar privilegiado desde donde se ve todo el valle.',
      distancias: [['Tuluá', 'consulta la ruta']]
    },
    mapa: 'La Tulia, Bolívar, Valle del Cauca',
    descripcion: [
      'Oportunidad de negocio con una de las mejores vistas del Valle del Cauca. Ideal para restaurante, mirador o finca de descanso.'
    ]
  },
  {
    id: 'portal-verde',
    titulo: 'Portal Verde',
    zona: 'Andalucía',
    sector: 'Andalucía, Valle',
    tipo: 'Campestre',
    precio: null,
    precioNota: 'consulta el valor',
    area: '300 – 500 m²',
    areaNum: 500,
    fin: 'Hasta 18 meses',
    imgs: ['assets/img/portal-verde.jpg'],
    etiquetas: ['Lotes pequeños'],
    detalle: [
      ['Área de los lotes', '300 a 500 m²'],
      ['Tipo', 'Lote campestre'],
      ['Uso', 'Construir tu casa a tu gusto']
    ],
    financiacion: ['Financiamos tu lote hasta 18 meses'],
    ubicacion: {
      texto: 'Andalucía, Valle del Cauca.',
      distancias: [['Tuluá', 'consulta la ruta']]
    },
    mapa: 'Andalucía, Valle del Cauca',
    descripcion: [
      'El lote campestre para la casa que sueñas. Lotes de tamaño práctico con financiación directa para empezar ya.'
    ]
  },
  {
    id: 'balcones-sevilla',
    titulo: 'Balcones de Sevilla',
    zona: 'Sevilla',
    sector: 'Sector Tres Esquinas',
    tipo: 'Campestre',
    precio: null,
    precioNota: 'consulta disponibilidad',
    area: 'Consultar',
    areaNum: 0,
    fin: null,
    imgs: ['assets/img/balcones-sevilla.jpg'],
    etiquetas: ['Montaña', 'Clima fresco'],
    detalle: [
      ['Sector', 'Tres Esquinas'],
      ['Tipo', 'Lotes de montaña'],
      ['Entorno', 'Paisaje cafetero, clima fresco']
    ],
    financiacion: ['Pregunta por las opciones de pago'],
    ubicacion: {
      texto: 'Sevilla, Valle del Cauca, sector Tres Esquinas.',
      distancias: [['Tuluá', 'consulta la ruta']]
    },
    mapa: 'Sevilla, Valle del Cauca',
    descripcion: [
      'Lotes en la montaña con vista abierta y clima fresco. Escríbenos para conocer áreas y precios disponibles.'
    ]
  },
  {
    id: 'bugalagrande-3-plazas',
    titulo: 'Terreno de 3 plazas sobre la doble calzada',
    zona: 'Bugalagrande',
    sector: 'Orilla de la doble calzada',
    tipo: 'Inversión',
    precio: null,
    precioNota: 'consulta el precio actualizado',
    area: '3 plazas (≈19.200 m²)',
    areaNum: 19200,
    fin: null,
    imgs: ['assets/img/bugalagrande.jpg'],
    etiquetas: ['Bodegas', 'Cultivo'],
    detalle: [
      ['Área', '3 plazas (≈19.200 m²)'],
      ['Frente', 'Sobre la doble calzada'],
      ['Uso', 'Bodegas, cultivo o proyecto comercial']
    ],
    financiacion: ['Pregunta por las opciones de pago'],
    ubicacion: {
      texto: 'A la orilla de la doble calzada en Bugalagrande.',
      distancias: [['Tuluá', '~16 min']]
    },
    mapa: 'Bugalagrande, Valle del Cauca',
    descripcion: [
      'Oportunidad de inversión con frente a la vía principal del centro del Valle.'
    ]
  }
];
