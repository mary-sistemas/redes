# Repaso de Redes · UT1–UT3

Web interactiva para repasar el módulo de **Planificación y Administración de Redes** de ASIR (unidades 1 a 3). Cada tema explica el porqué con analogías, incluye simuladores paso a paso y termina con preguntas tipo examen para autoevaluarse.

**Ver la web:** `https://TU-USUARIO.github.io/repaso-redes/`

## Temas

| Unidad | Tema | Estado |
|---|---|---|
| UT1 | Sistemas de numeración | Próximamente |
| UT1 | Puertas lógicas | Próximamente |
| UT1 | Redes locales y medios | Próximamente |
| UT2 | Capas y protocolos | ✅ Disponible |
| UT2 | Wireshark y tramas | Próximamente |
| UT2 | Normalización e IEEE 802 | Próximamente |
| UT3 | Señal y modulación | Próximamente |
| UT3 | Cables y categorías | Próximamente |
| UT3 | Crimpado y comprobador | Próximamente |
| UT3 | Wi-Fi | Próximamente |
| UT3 | Cableado estructurado | Próximamente |

## Estructura

```
repaso-redes/
├── index.html          portada con todos los temas
├── temas/
│   └── capas.html      una página por tema
├── assets/
│   ├── estilos.css     estilos comunes (tema claro y oscuro)
│   ├── comun.js        botón de tema y progreso guardado
│   └── capas.js        simuladores y preguntas del tema Capas
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
