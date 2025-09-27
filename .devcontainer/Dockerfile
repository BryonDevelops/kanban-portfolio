# Use the official Node.js 20 image as the base
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20

# Install additional tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
    curl \
    wget \
    git \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3-dev \
    libxss1 \
    libasound2-dev \
    libxtst6 \
    xauth \
    xvfb \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install Supabase CLI
RUN npm install -g supabase

# Set the default shell
ENV SHELL /bin/bash

# Create workspace directory
RUN mkdir -p /workspaces/kanban-portfolio
WORKDIR /workspaces/kanban-portfolio

# Copy package files for better caching
COPY package*.json ./
COPY .npmrc ./

# Install dependencies (this will be overridden by postCreateCommand, but helps with caching)
RUN npm ci --only=production || true

# Switch to node user
USER node