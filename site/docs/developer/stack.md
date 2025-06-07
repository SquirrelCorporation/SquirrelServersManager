---
title: "Tech Stack Overview"
icon: "🛠️"
layout: FeatureGuideLayout
time: "3 min read"
signetColor: '#8e44ad'
nextStep:
  icon: "🧩"
  title: "Plugin Development"
  description: "Learn how to extend SSM with custom plugins."
  link: "/docs/developer/plugins"
credits: true
---

# SSM Tech Stack Overview

Squirrel Servers Manager (SSM) is built with a modern, scalable, and maintainable technology stack. This page details the core technologies and patterns used in both the server and client applications.

## 🖥️ Server (Backend)

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript, modular, dependency injection)
- **API:** REST & WebSocket (Socket.IO)
- **ORM/Database:** [Mongoose](https://mongoosejs.com/) (MongoDB ODM)
- **Task Queue:** [Bull](https://github.com/OptimalBits/bull) (Redis-backed job queue)
- **Authentication:** Passport.js (JWT, Bearer, custom strategies)
- **Configuration:** dotenv, @nestjs/config
- **Validation:** class-validator, Joi
- **Logging:** pino, nestjs-pino, pino-mongodb
- **Container Management:** dockerode, dockerode-compose
- **Ansible Integration:** Python subprocess, custom Ansible runner
- **Monitoring:** prom-client, prometheus-query
- **Other Integrations:** AWS ECR SDK, Redis, PostHog analytics
- **Testing:** Vitest, Supertest, Testcontainers, Python unittest (for Ansible)
- **Code Quality:** ESLint, Prettier, strict TypeScript config
- **Architecture:**
  - Clean architecture: domain, application, infrastructure, presentation
  - Modular: src/modules/* for features, src/infrastructure/* for adapters
  - DTOs, interfaces, and dependency injection throughout

## 🖥️ Client (Frontend)

- **Framework:** [React 18](https://react.dev/) (TypeScript)
- **UI Library:** [Ant Design Pro](https://procomponents.ant.design/), Ant Design 5
- **State & Routing:** [UmiJS Max](https://umijs.org/), plugin-based routing
- **Charts & Visualization:** @ant-design/charts, @antv/g2plot
- **Code Editor:** Monaco Editor (with YAML/JSON support)
- **Drag & Drop:** @dnd-kit/core
- **Terminal Emulation:** xterm.js
- **Animation:** framer-motion, rc-banner-anim, rc-tween-one
- **Internationalization:** UmiJS i18n
- **Testing:** Vitest, Testing Library, Jest
- **Code Quality:** ESLint, Prettier, strict TypeScript config
- **Architecture:**
  - Modular: src/pages/* for routes, src/components/* for UI, src/services/* for API
  - Plugin system: src/plugins/*
  - Shared types and utilities in src/types, src/utils

## 🔗 Shared Library

- **Location:** `shared-lib/` (imported by both server and client)
- **Purpose:** Shared types, API contracts, and utilities for type-safe integration

---

This stack enables SSM to deliver a robust, extensible, and user-friendly experience for both administrators and developers. For more details, see the codebase or reach out on [Discord](https://discord.gg/cnQjsFCGKJ). 