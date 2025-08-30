# Work Heatmap - Quality Control Worker Analytics

A dashboard application for tracking and visualizing quality control worker activities using coordinate data and grid clustering.

## Features

- **Interactive Heatmap**: Real-time worker tracking with clustering
- **Data Analytics**: Live statistics, coordinate history, and user management
- **Advanced Filtering**: Date range, user selection, and pagination
- **Modern UI**: Responsive design with Chakra UI components
- **Export Data**: Export map to PNG or PDF and export coordinate to geoJSON or CSV

## Tech Stack

- **Frontend**: React 19 + TypeScript, Chakra UI V2, React Leaflet, H3-js
- **Backend**: Hono, Drizzle ORM, MySQL, JWT Auth, Redis
- **Database**: User management, coordinate history, H3 indexing

## Quick Start

1. **Install dependencies**

   ```bash
   bun install
   cd ../frontend && bun install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit with your database credentials
   ```

3. **Run migrations**

   ```bash
   bun run drizzle-kit migrate
   ```

4. **Start the app**

   ```bash
   # Backend
   bun run dev

   # Frontend (new terminal)
   cd frontend && bun run dev
   ```

5. **Deploy the app (using pm2)**

   ```bash
   # Frontend (new terminal)
   cd frontend && bun run build

   # Backend
   bun install -g pm2
   pm2 start bun --name cwa-app -- run start
   ```

## API Endpoints

- `POST /api/v1/auth/login` - User login
- `GET /api/v1/coordinate-history` - Get coordinate data
- `GET /api/v1/user/available` - Get all users

## Dashboard Features

- **H3 Clustering**: Resolution 9 cells for optimal performance
- **Real-time Updates**: Automatic data refresh and filtering
- **Interactive Maps**: React Leaflet with OpenStreetMap tiles
- **Responsive Design**: Works on desktop and mobile

## License

MIT License
