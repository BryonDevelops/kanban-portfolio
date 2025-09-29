# Base image with Node.js 20 and VS Code devcontainer tooling
FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:20

ARG DEBIAN_FRONTEND=noninteractive

# Install tooling and libraries required by Playwright, Cypress, Sharp, and other build steps
RUN apt-get update \
    && apt-get -y install --no-install-recommends \
    curl \
    wget \
    git \
    git-lfs \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    python3 \
    python3-pip \
    pkg-config \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libnss3-dev \
    libxss1 \
    libasound2 \
    libasound2-dev \
    libxtst6 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxkbcommon0 \
    libxfixes3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libxcb-dri3-0 \
    libx11-xcb1 \
    xauth \
    xvfb \
    unzip \
    libvips42 \
    && git lfs install \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Supabase CLI for local development workflows
RUN npm install -g supabase

ENV SHELL=/bin/bash

# Ensure workspace directory exists and is owned by node user
RUN mkdir -p /workspaces/kanban-portfolio \
    && chown -R node:node /workspaces/kanban-portfolio
WORKDIR /workspaces/kanban-portfolio

# Use the non-root node user provided by the base image
USER node

