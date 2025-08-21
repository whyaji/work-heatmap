# Work Heatmap - Quality Control Worker Analytics

A comprehensive dashboard application for tracking and visualizing quality control worker activities using coordinate data and H3 hexagonal grid clustering.

## Features

### 🗺️ Interactive Heatmap Dashboard

- **Real-time Worker Tracking**: Live visualization of worker coordinates on an interactive map
- **H3 Hexagonal Clustering**: Advanced spatial clustering using H3-js for efficient coordinate grouping
- **Activity Heatmap**: Color-coded intensity map showing worker density and activity patterns
- **React Leaflet Integration**: Modern, responsive map interface with OpenStreetMap tiles

### 📊 Data Analytics

- **Real-time Statistics**: Live dashboard showing total coordinates, active users, and data coverage
- **Coordinate History**: Comprehensive tracking of all worker movements and activities
- **User Management**: Individual worker tracking and activity monitoring
- **Geofence Support**: Track whether workers are inside designated work zones

### 🔍 Advanced Filtering & Pagination

- **Date Range Filtering**: Filter data by specific date ranges
- **User Selection**: Filter by individual workers or view all users
- **Pagination**: Efficient data loading with configurable page sizes
- **Real-time Updates**: Automatic data refresh and filtering

### 🎨 Modern UI/UX

- **Chakra UI Components**: Beautiful, accessible interface components
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Mode**: Built-in theme support
- **Smooth Animations**: Engaging user experience with CSS animations

## Technology Stack

### Frontend

- **React 19** with TypeScript
- **Chakra UI** for component library
- **React Leaflet** for map visualization
- **H3-js** for hexagonal grid clustering
- **React Query** for data fetching and caching
- **React Router** for navigation

### Backend

- **Hono** for fast HTTP server
- **Drizzle ORM** for database operations
- **MySQL** database with optimized schema
- **JWT Authentication** for secure access
- **Zod** for request validation

### Database Schema

- **User Management**: Worker profiles, roles, and permissions
- **Coordinate History**: GPS tracking, timestamps, and metadata
- **H3 Indexing**: Spatial indexing for efficient queries
- **Activity Tracking**: Worker actions and status monitoring

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- MySQL database
- Environment variables configured

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd work-heatmap
   ```

2. **Install dependencies**

   ```bash
   # Install backend dependencies
   cd server
   bun install

   # Install frontend dependencies
   cd ../frontend
   bun install
   ```

3. **Configure environment**

   ```bash
   # Copy and configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run database migrations**

   ```bash
   cd server
   bun run drizzle-kit push
   ```

5. **Start the application**

   ```bash
   # Start backend server
   cd server
   bun run dev

   # Start frontend (in new terminal)
   cd frontend
   bun run dev
   ```

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Coordinate History

- `GET /api/v1/coordinate-history` - Get coordinate data with filtering and pagination
  - Query parameters: `page`, `limit`, `startDate`, `endDate`, `userId`

### Users

- `GET /api/v1/user` - Get all users

## Dashboard Features

### Heatmap Visualization

The dashboard uses H3 hexagonal grid clustering to efficiently visualize large amounts of coordinate data:

- **Resolution 9 H3 Cells**: Optimal balance between detail and performance
- **Dynamic Clustering**: Automatic grouping of nearby coordinates
- **Intensity Mapping**: Color-coded activity levels based on coordinate density
- **Interactive Popups**: Detailed information for each cluster

### Data Filtering

- **Date Range Selection**: Filter by start and end dates
- **User Filtering**: Select specific workers or view all
- **Real-time Updates**: Filters apply immediately to the map and statistics

### Pagination

- **Configurable Page Size**: Default 100 records per page
- **Navigation Controls**: Previous/next page buttons
- **Page Indicators**: Current page and total pages display

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
