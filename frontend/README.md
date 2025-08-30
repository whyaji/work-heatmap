# Work Heatmap Admin Panel - Frontend

A React-based admin panel for tracking QC teams across Central Kalimantan with interactive heatmap visualization.

## Features

- **Interactive Heatmap**: React Leaflet with OpenStreetMap integration
- **Central Kalimantan Coverage**: Sample locations in key cities
- **Team Management**: Real-time statistics and team status monitoring
- **Modern UI**: Responsive design with Chakra UI

## Tech Stack

- **React 19** with TypeScript
- **React Leaflet** for map visualization
- **Chakra UI V2** for styling
- **Vite** for build tooling

## Quick Start

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Start development server**

   ```bash
   bun run dev
   ```

3. **Open browser**
   Navigate to `http://localhost:5183`

## Project Structure

```
frontend/
├── src/
│   ├── feature/          # Feature components
│   ├── routes/           # Route configuration
│   └──  main.tsx          # App entry point
├── public/               # Static assets
└── package.json          # Dependencies
```

### Map Features

- OpenStreetMap tiles
- Custom team markers
- Interactive controls

## Customization

### Adding New Teams

Modify the `qcLocations` array in `OnboardingScreen.tsx`:

```typescript
const qcLocations = [
  // ... existing locations
  {
    id: 6,
    name: 'QC Team New Location',
    position: [latitude, longitude] as [number, number],
    status: 'active',
    lastActivity: '1 hour ago',
    teamSize: 6,
    area: 'New Area Description',
  },
];
```

## Build

```bash
npm run build
# or bun run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Part of the Work Heatmap system
