# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created `.env.example` with clear instructions on configuring `NEXT_PUBLIC_API_URL` for IP access.

### Changed
- Updated Next.js API proxy path in `src/config/api.ts` to use a relative URL (`/api/proxy`). This allows the frontend to be accessed via local IP while properly routing proxy requests.
- Redesigned Profile page with Tinder-style high-fidelity UI and dynamic progress ring.
- Fixed API proxy errors by enabling backend database synchronization.
- Added `/uploads` prefix handling for profile photos.
- Integrated logout functionality in the new Profile screen.
- Fixed NextAuth session issues on IP access by removing hardcoded `localhost` variables from `package.json` and moving them to a configurable `.env` file.
