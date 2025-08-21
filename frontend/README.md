# Work Heatmap Admin Panel - Frontend

A modern React-based admin panel for tracking QC (Quality Control) teams across Central Kalimantan with interactive heatmap visualization.

## Features

### 🗺️ Interactive Heatmap

- **React Leaflet Integration**: Real-time map visualization using OpenStreetMap
- **Central Kalimantan Coverage**: Sample locations in key cities including:
  - Palangkaraya (Capital)
  - Sampit (Industrial Zone)
  - Pangkalan Bun (Port Area)
  - Kuala Pembuang (Coastal Region)
  - Muara Teweh (Mining Area)
- **Team Status Indicators**: Visual representation of active/inactive teams
- **Heatmap Circles**: Coverage areas for active QC teams

### 📊 Admin Dashboard

- **Real-time Statistics**: Active teams, total members, response times, coverage areas
- **Team Management**: Detailed information for each QC team
- **Quick Actions**: Send messages, assign tasks, view reports, manage schedules
- **Activity Monitoring**: Recent activities and team status updates

### 🎨 Modern UI/UX

- **Responsive Design**: Mobile-friendly interface
- **Tailwind CSS**: Modern styling with consistent design system
- **Interactive Elements**: Hover effects, transitions, and smooth animations
- **Professional Layout**: Clean, organized admin panel structure

## Technology Stack

- **React 19**: Latest React with modern hooks and features
- **TypeScript**: Type-safe development
- **React Leaflet**: Interactive map components
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **TanStack Router**: Modern routing solution

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd work-heatmap/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   bun install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the onboarding page

### Building for Production

```bash
npm run build
# or
yarn build
# or
bun run build
```

The built files will be in the `dist/` directory.

## Project Structure

```
frontend/
├── src/
│   ├── feature/
│   │   └── onboarding/
│   │       └── screen/
│   │           └── OnboardingScreen.tsx    # Main onboarding component
│   ├── routes/
│   │   └── index.tsx                       # Route configuration
│   ├── main.tsx                            # Application entry point
│   ├── index.css                           # Tailwind CSS imports
│   └── styles.css                          # Custom styles and Leaflet fixes
├── public/                                 # Static assets
├── package.json                            # Dependencies and scripts
└── README.md                               # This file
```

## Onboarding Screen Components

### Header Section

- **Brand Identity**: Work Heatmap Admin Panel logo and title
- **Navigation**: Dashboard access and settings menu
- **System Description**: QC Team Tracking & Management System

### Welcome Section

- **Hero Message**: Introduction to the heatmap dashboard
- **Call-to-Action**: Get Started and View Tutorial buttons
- **Gradient Background**: Professional blue gradient design

### Statistics Overview

- **Active Teams**: Number of currently active QC teams
- **Total Members**: Combined team member count
- **Average Response**: Team response time metrics
- **Coverage Area**: Number of covered regions

### Interactive Map

- **Central Kalimantan Focus**: Centered on the region with appropriate zoom level
- **Team Markers**: Clickable markers for each QC team location
- **Status Indicators**: Visual representation of team activity
- **Heatmap Overlay**: Coverage circles for active teams
- **Interactive Popups**: Team information on marker click

### Team Details Sidebar

- **Selected Team Info**: Detailed information for clicked team
- **Quick Actions**: Common administrative tasks
- **Recent Activity**: Latest team activities and updates

### Features Overview

- **Real-time Tracking**: Live monitoring capabilities
- **Performance Analytics**: Data-driven insights
- **Mobile Ready**: Responsive design for all devices

## Map Configuration

### Sample Locations

The onboarding page includes sample QC team locations across Central Kalimantan:

1. **Palangkaraya** (-2.2084, 113.9163) - City Center
2. **Sampit** (-2.5333, 112.9500) - Industrial Zone
3. **Pangkalan Bun** (-2.6833, 111.6167) - Port Area
4. **Kuala Pembuang** (-3.0000, 112.8500) - Coastal Region
5. **Muara Teweh** (-0.5833, 115.1667) - Mining Area

### Map Features

- **OpenStreetMap Tiles**: Free, detailed map data
- **Custom Markers**: Team-specific location indicators
- **Heatmap Circles**: 50km radius coverage areas for active teams
- **Interactive Controls**: Zoom, pan, and attribution controls

## Customization

### Adding New Teams

To add new QC teams, modify the `qcLocations` array in `OnboardingScreen.tsx`:

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

### Styling Modifications

- **Colors**: Update Tailwind CSS classes for color schemes
- **Layout**: Modify grid layouts and spacing
- **Components**: Add or remove dashboard sections as needed

### Map Customization

- **Tile Provider**: Change map tile source in `TileLayer` component
- **Marker Icons**: Customize marker appearance and behavior
- **Coverage Areas**: Adjust heatmap circle sizes and colors

## Browser Compatibility

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Chrome Mobile 90+
- **Map Support**: All browsers with WebGL support

## Performance Considerations

- **Lazy Loading**: Map components load only when needed
- **Optimized Assets**: Efficient image and icon handling
- **Responsive Images**: Appropriate sizing for different screen sizes
- **Efficient Rendering**: React optimization for smooth interactions

## Troubleshooting

### Common Issues

1. **Map Not Displaying**
   - Check if Leaflet CSS is properly imported
   - Verify internet connection for map tiles
   - Check browser console for JavaScript errors

2. **Markers Not Showing**
   - Ensure Leaflet icon URLs are accessible
   - Check coordinate format (latitude, longitude)
   - Verify marker event handlers are properly configured

3. **Styling Issues**
   - Confirm Tailwind CSS is properly configured
   - Check custom CSS for conflicts
   - Verify responsive breakpoints

### Development Tips

- Use browser dev tools to inspect map elements
- Check network tab for map tile loading
- Test on different screen sizes for responsiveness
- Verify TypeScript types for proper development experience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Work Heatmap system. Please refer to the main project license for details.

## Support

For technical support or questions about the onboarding page:

- Check the troubleshooting section above
- Review the code comments for implementation details
- Contact the development team for assistance

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
