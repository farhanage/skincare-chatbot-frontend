# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set production environment variables directly
ENV REACT_APP_API_BASE_URL=https://skincare-api.farhanage.site/api
ENV REACT_APP_VIT_INFERENCE_URL=https://farhanage-skincare-disease-vit.hf.space/api

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy built assets from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Expose port
EXPOSE $PORT

# Note: The actual CMD is in heroku.yml
