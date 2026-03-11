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


CREAMOS EL QUERYCLIENT
==================

1️⃣ creamos el queries/query-client.ts con la funcion getQueryClient()

2️⃣ actualizamos el router.tsx y el __root.tsx para usar el getQueryClient()


CREATE PAGO
==========

1️⃣ creamos el db/drizzle.ts y borramos el db.ts

2️⃣ anexamos a db/schema.ts la tabla de db/pagos/schema.ts

3️⃣ creamos el db/pagos/pago-validation.ts

4️⃣ creamos el /components/pagos/create-pago.tsx










