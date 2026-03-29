# Publicar Aqua Calcio (Gratis)

## Opcion A (mas rapida): Netlify Drop
Ideal si quieres compartir un link hoy mismo en 2 minutos.

1. Abre https://app.netlify.com/drop
2. Arrastra la carpeta `pruebas` completa a esa pagina.
3. Espera a que termine el deploy.
4. Copia el link generado y compartelo.

Notas:
- Si luego cambias jornadas/videos, vuelves a arrastrar `pruebas` y listo.
- Puedes cambiar el subdominio en Site settings > Domain management.

---

## Opcion B (recomendada para version oficial): GitHub Pages
Ideal para mantener historico y actualizar de forma ordenada.

### 1) Crear repo en GitHub
1. En GitHub crea un repositorio publico (ejemplo: `aqua-calcio-hub`).
2. No hace falta README inicial si vas a subir todo desde local.

### 2) Subir tu proyecto desde terminal (Windows PowerShell)
Ejecuta estos comandos desde `C:\Users\nicol\Desktop\POW`:

```powershell
git init
git add .
git commit -m "Aqua Calcio Hub initial publish"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

### 3) Activar Pages
1. En tu repo: Settings > Pages.
2. Source: Deploy from a branch.
3. Branch: `main`.
4. Folder: `/pruebas`.
5. Save.

GitHub te dara un link tipo:
`https://tu-usuario.github.io/tu-repo/`

---

## Actualizar rapido cuando haya nueva jornada o highlights
1. Edita `data/aqua-calcio.json`.
2. Si agregas videos, subelos en `assets/videos/` y agrega su entrada en `highlights.videos`.
3. Guarda cambios.

Si usas Netlify Drop:
- Arrastra de nuevo la carpeta `pruebas` al sitio de Netlify Drop.

Si usas GitHub Pages:
```powershell
git add .
git commit -m "Jornada nueva + highlights"
git push
```

En 30-90 segundos se actualiza el link publico.
