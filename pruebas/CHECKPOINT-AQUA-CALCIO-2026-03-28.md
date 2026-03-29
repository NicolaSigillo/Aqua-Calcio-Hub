# Checkpoint Aqua Calcio - 2026-03-28

## Estado actual del proyecto
- Tipo: web estatica (HTML, CSS, JS).
- Objetivo: hub visual de liga para resultados, jornadas, ranking de jugadores, equipos y highlights globales.
- Entrada principal: index.html.
- Datos centralizados en JSON para escalar jornada a jornada.

## Estructura de archivos relevante
- index.html: estructura de secciones y navegacion.
- styles.css: diseno visual, responsive y animaciones.
- app.js: carga de datos, calculos y render dinamico.
- data/aqua-calcio.json: toda la data editable de la liga.
- assets/videos/: videos de highlights.
- assets/images/: logo e imagenes.
- ../.vscode/settings.json: Live Server configurado para abrir directo /pruebas.

## Lo que ya esta implementado
1. Tabla de liga con columnas tipo Premier: PJ, G, E, P, GF, GC, DG, Pts, Ultimos 5.
2. Vista de jornadas con marcador, MVP, top stats y bitacora.
3. Ranking de jugadores con todos los jugadores (incluso sin minutos) y formula de impacto.
4. Seccion de equipos con roster y posiciones.
5. Highlights globales de video con titulo, descripcion y fecha.
6. Branding dinamico desde JSON (colores y logo).

## Formula de Impacto actual (ranking jugadores)
En app.js, por jugador:
- avgRating = ratingSum / ratedMatches (si ratedMatches > 0, si no 0)
- impact = (avgRating * 10) + (goals * 2) + (assists * 1.5) + (mvp * 3)

Interpretacion rapida:
- El rating pesa mas (multiplicado por 10).
- Luego goles, asistencias y MVP como bonificaciones.
- Jugadores sin partidos quedan con impacto 0 pero aparecen en tabla.

## Como cargar RAPIDO una nueva jornada
Editar: data/aqua-calcio.json

1. Ir al arreglo matchdays.
2. Agregar un nuevo objeto jornada con:
- id: jornada_04
- number: 4
- date: YYYY-MM-DD
- matches: lista de partidos

3. En cada partido cargar:
- homeTeamId y awayTeamId
- score.home y score.away
- mvpPlayerId
- playerStats (playerId, teamId, goals, assists, rating, notes)
- matchLog (phase, sequence, description)

4. Guardar archivo y refrescar navegador. Todo se recalcula solo.

Plantilla minima:
{
  "id": "jornada_04",
  "number": 4,
  "date": "2026-03-22",
  "matches": [
    {
      "id": "j04_match_01",
      "homeTeamId": "iv_reich",
      "awayTeamId": "pargos_fc",
      "score": { "home": 2, "away": 1 },
      "mvpPlayerId": "javi",
      "playerStats": [],
      "matchLog": [],
      "highlights": { "images": [], "videos": [] }
    }
  ]
}

## Como cargar RAPIDO nuevos highlights de video
Editar: data/aqua-calcio.json en highlights.videos

1. Copiar el mp4 a assets/videos/
2. Agregar objeto en highlights.videos:
{
  "id": "hl_004",
  "title": "Titulo highlight",
  "description": "Descripcion corta",
  "file": "assets/videos/nombre del archivo.mp4",
  "postedAt": "2026-03-29"
}

3. Guardar y refrescar. Aparece automaticamente.

## Prompt de continuidad para otra IA
Usa este texto como base:

"Estoy continuando el proyecto Aqua Calcio Hub. Revisa CHECKPOINT-AQUA-CALCIO-2026-03-28.md y data/aqua-calcio.json. Mantener stack HTML/CSS/JS sin framework. No romper estructura de datos ni calculos de tabla/ranking. Quiero extender funcionalidades manteniendo el estilo actual." 

## Publicacion gratis recomendada
Opcion recomendada: GitHub Pages

1. Crear repositorio en GitHub (publico).
2. Subir el contenido de la carpeta pruebas como raiz del repo.
3. En GitHub ir a Settings > Pages.
4. En Build and deployment seleccionar Deploy from a branch.
5. Elegir branch main y carpeta /(root). Guardar.
6. Esperar 1-2 minutos y abrir el link generado.

Resultado: tendras URL publica para compartir.

Opciones alternas gratuitas:
- Netlify Drop: arrastrar carpeta pruebas y publicar instantaneo.
- Cloudflare Pages: conectar repo y auto deploy por cada cambio.

## Checklist antes de compartir link
- Verificar que data/aqua-calcio.json no tenga comas sobrantes.
- Confirmar que rutas de videos e imagenes existen.
- Abrir tabla, jornadas y highlights en movil y desktop.
- Confirmar que no haya errores de consola.
