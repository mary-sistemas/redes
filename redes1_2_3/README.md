# Repaso de Redes · UT1–UT4

Web interactiva para repasar el módulo de **Planificación y Administración de Redes** de ASIR (unidades 1 a 4). Cada tema explica el porqué con analogías, incluye simuladores paso a paso y termina con preguntas tipo examen para autoevaluarse.

**Ver la web:** https://mary-sistemas.github.io/redes/redes1_2_3/

## Temas

| Unidad | Tema | Estado |
|---|---|---|
| UT1 | Sistemas de numeración | ✅ Disponible |
| UT1 | Redes locales y medios | ✅ Disponible |
| UT2 | Capas y protocolos | ✅ Disponible |
| UT2 | Wireshark y tramas | ✅ Disponible |
| UT2 | Normalización e IEEE 802 | ✅ Disponible |
| UT3 | Señal y modulación | ✅ Disponible |
| UT3 | Cables y categorías | ✅ Disponible |
| UT3 | Crimpado y comprobador | ✅ Disponible |
| UT3 | Wi-Fi | ✅ Disponible |
| UT3 | Cableado estructurado | ✅ Disponible |
| UT4 | Tramas y direcciones MAC | ✅ Disponible |
| UT4 | Ethernet, dominios y EtherChannel | ✅ Disponible |
| UT4 | El conmutador | ✅ Disponible |
| UT4 | Configurar el switch (Cisco IOS, terminal simulado) | ✅ Disponible |
| UT4 | STP | ✅ Disponible |
| UT4 | Preparar los test de la práctica (ejercicios resueltos y simulacro) | ✅ Disponible |

## Estructura

```
repaso-redes/
├── index.html          portada con todos los temas
├── temas/
│   ├── numeracion.html     una página por tema
│   ├── redes-locales.html
│   ├── capas.html
│   ├── wireshark.html
│   ├── normas.html
│   ├── senal.html
│   ├── cables.html
│   ├── crimpado.html
│   ├── wifi.html
│   ├── estructurado.html
│   └── tramas · dominios · conmutador · ios · stp (UT4)
├── assets/
│   ├── estilos.css     estilos comunes (tema claro y oscuro)
│   ├── comun.js        botón de tema y progreso guardado
│   ├── numeracion.js   simuladores y preguntas de cada tema
│   ├── redes-locales.js
│   ├── capas.js
│   ├── wireshark.js
│   ├── normas.js
│   ├── senal.js · cables.js · crimpado.js
│   ├── wifi.js · estructurado.js
│   ├── cli.js          terminal simulado de Cisco IOS
│   └── tramas.js · dominios.js · conmutador.js · ios.js · stp.js
└── README.md
```

HTML, CSS y JavaScript sin dependencias ni compilación: se abre `index.html` en el navegador y funciona.

## Añadir un tema nuevo

1. Copia `temas/capas.html` como `temas/<tema>.html` y cambia el contenido.
2. Si tiene simuladores, crea `assets/<tema>.js` y enlázalo al final de la página.
3. En `index.html`, cambia la tarjeta del tema de `<div class="tarjeta pronto">` a `<a class="tarjeta" href="temas/<tema>.html" data-tema="<tema>" data-total="<nº preguntas>">`.

## Publicar en GitHub Pages

1. Crea un repositorio público llamado `repaso-redes` y sube estos archivos.
2. En el repositorio: **Settings → Pages → Build and deployment**, elige **Deploy from a branch**, rama `main` y carpeta `/ (root)`.
3. En un par de minutos la web estará en `https://TU-USUARIO.github.io/repaso-redes/`.

## Autoría

Hecho por Mary Joy Manalansan, estudiante de ASIR, como material de estudio. Si encuentras un error, abre un *issue*.
