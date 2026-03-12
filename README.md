1️⃣compiamos del template:
                git clone https://github.com/jonatanjmissora/ts-ragazzi-calendar.git

2️⃣instalamos las dependencias:
                pnpm install

3️⃣creamos .env, y configuramos las variables de entorno
                BETTER_AUTH_SECRET=4Ja61mQqx8i4YgnrzwQVIU81tGLRLail
                BETTER_AUTH_URL=http://localhost:3000

                VITE_BETTER_AUTH_BASE_URL=http://localhost:3000

                # Para el servidor (sin prefijo VITE_)
                BETTER_AUTH_BASE_URL=http://localhost:3000

                DATABASE_URL=

4️⃣ creamos las tablas para Neon en db/pagos/schema.ts

5️⃣ ejecutamos el push a neon:
                  npx drizzle-kit push


CREATE RUBROS
===========

1️⃣ creamos el db/drizzle.ts y borramos el db.ts

2️⃣ anexamos a db/schema.ts la tabla de db/rubros/schema.ts

3️⃣ creamos el db/rubros/rubro-validation.ts y db/rubros/create-rubro-db.ts

4️⃣ creamos el server/rubros/create-rubro-server.ts

5️⃣ creamos el queries/rubros/use-create-rubro.ts

6️⃣ creamos el component/rubros/rubros-create.tsx

7️⃣ creamos la routes/admin/create-rubro/index.tsx

LIST RUBROS
===========

1️⃣ creamos el db/rubros/get-rubros-db.ts

2️⃣ creamos el server/rubros/get-rubros-server.ts

3️⃣ creamos el queries/rubros/rubros-query.ts

4️⃣ creamos el routes/admin/route.tsx colocamos en el loader un ensureQueryData(rubrosQueryOptions)

5️⃣ creamos la routes/admin/index.tsx hacemos el suspense/skelton para cargar RubrosList con el 

6️⃣ creamos el component/rubros/rubros-list.tsx usamos el useSuspenseQuery(rubrosQueryOptions)











