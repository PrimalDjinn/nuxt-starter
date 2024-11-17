FROM node:20.18

# set working directory
WORKDIR /nuxt

# copy package.json and lock
COPY package.json pnpm-lock.yaml ./

# install dependencies in the container
RUN corepack enable && pnpm install && pnpm prune

# copy the rest of the files
COPY . .

RUN pnpm build

# commands to build and run the nuxt app
CMD ["pnpm", "run", "start"]