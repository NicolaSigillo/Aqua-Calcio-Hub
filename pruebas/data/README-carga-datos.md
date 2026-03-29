# Carga de datos Aqua Calcio

## Cuando pasar la data
Pasamela ahora mismo. Con las primeras 3 jornadas completas ya puedo construir:
- Tabla de liga tipo Premier (PJ, G, E, P, Pts, ultimos 5).
- Vista por jornadas con detalle.
- Ranking de jugadores.
- Seccion de equipos.

## Archivo base
Completa este archivo:
- data/aqua-calcio.template.json

Luego lo renombramos a:
- data/aqua-calcio.json

## Minimo necesario para comenzar
1. Equipos (nombre, logo opcional, jugadores y posicion).
2. Partidos de las 3 jornadas (local, visitante, marcador).
3. Goles por jugador por partido.
4. MVP por partido.
5. Si tienes, imagenes/videos destacados por partido.

## Formato multimedia
- Imagenes: assets/images/matchdays/jornada_0X/
- Videos: assets/videos/matchdays/jornada_0X/
- En el JSON guarda rutas relativas como:
  - assets/images/matchdays/jornada_01/foto_01.jpg
  - assets/videos/matchdays/jornada_01/resumen.mp4

## Nota
Si aun no tienes todo, pasa primero:
- equipos + jugadores
- resultados de 3 jornadas
Y despues agregamos bitacora y multimedia sin romper la pagina.
