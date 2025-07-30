FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

RUN npm run db:generate --schema=src/database/prisma/schema.prisma

RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./

CMD ["npm", "run", "start:prod"]



EXPOSE 3000