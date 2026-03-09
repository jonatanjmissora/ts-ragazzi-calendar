vamos a hacer distintos templates, cada uno en su correspondiente rama:

Partiremos del main, con limpieza de codigo.

MAIN BRANCH
==========

1️⃣ BACKEND, creamos las tablas y asociamos con la app

1- le agregamos las siguientes librerias a la instalacion: neon, drizzle, form, query, shadcn, better-auth
        pnpm create @tanstack/start@latest
        pnpm add sonner

2- creamos un proyecto nuevo en (https://console.neon.tech/app/projects) y obtenemos la URL de la base de datos.
* .env
        BETTER_AUTH_SECRET=4Ja61mQqx8i4YgnrzwQVIU81tGLRLail
        BETTER_AUTH_URL=http://localhost:3000
        VITE_BETTER_AUTH_BASE_URL=http://localhost:3000
        BETTER_AUTH_BASE_URL=http://localhost:3000
        DATABASE_URL=<tu_url_de_neon>

4- colocamos db/
* users/schemas.ts        (las tablas que va a crear en neon)
* index.ts                       (asociamos con drizzle)
* schema.ts                    (exporta las tablas)

5- hacemos el push a la base de datos, para crear las carpetas de better-auth en neon
        npx drizzle-kit push

6- quitamos el plugin de neon de 
* vite.config.ts
y creamos 
* drizzle.config.ts
* neon-vite-plugins.ts
       
✅ hasta aca, tenemos la base de datos, con las tablas de better-auth

2️⃣ FRONTEND, asociamos la session con los componentes

1- src/lib/
* auth.ts       (inicializamos better-auth con la configuracion de la base de datos, vemos si hay URL asociada a la base de datos)
* auth-client.ts        (configuramos el client de better-auth para llamar desde los componente con el signIn, signUp y signOut, verificamos si hay URL asociada a la base de datos)
* routes/api/auth/$.ts          (endpoint para manejar las peticiones de auth)

2- instalamos login03 de shadcn
                npx shadcn@latest add login-03

3- google client
dentro de https://console.cloud.google.com/apis/dashboard?project=ts-better-auth-neon
viendo el video https://www.youtube.com/watch?v=xqd51D3O53k&list=LL&index=8        minuto 35
en el starter queda en blanco tanto el archivo .env y en los formularios de login y register, quedan deshabilitados los botones de google

4- creamos los login-form.ts y register-form.ts en donde consumimos el auth-client.ts

✅ hasta aca, tenemos los formularios de login y register funcionando

3️⃣ PROTEGEMOS LAS RUTAS

1- lib/protected-route.ts   (para proteger las rutas que requieren autenticación, utilizando getSession())

2- src/routes/_protected.tsx   (carpeta para proteger las rutas, utilizando el loader del route.ts para verificar si valida la session)

4️⃣ Header.tsx

1- routes/__root.tsx   (agregamos la session al loader, para poder invocar los datos de la session en el Header.tsx y poner el nombre del usuario)

✅ hasta aca, tenemos las rutas protegidas y los datos de la session en el Header

5️⃣ Theme

1- modificamos styles.css para que acepte 3 clases que insertaremos en el html. 

2- modificamos routes/__root.tsx para que en su beforeLoad obtenga el tema de las cookies, y ya venga desde el server, para evitar el flick en la hidratacion.

3- consumimos el theme en el __root.tsx para aplicarlo al html

4- en Header.tsx obtenemos el theme actual y agregamos un boton para cambiar el theme

✅ hasta aca, tenemos el cambio de tema en el Header

6️⃣ ViewTransitions

1- modificamos section-container para que tenga el nombre de la viewTransicion

2- en styles.css agregamos las animaciones de rotate-out y rotate-in

3- en login y register agregamos el viewTransition al link

✅ hasta aca, tenemos las transiciones del login al register


