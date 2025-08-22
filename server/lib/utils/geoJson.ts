/* eslint-disable @typescript-eslint/no-explicit-any */
// Fungsi untuk mengelompokkan data berdasarkan block, estate, dan afdeling
const groupDataBlok = (data: any[]) => {
  return data.reduce((groups, item) => {
    const groupKey = `${item.block}-${item.estate}-${item.afdeling}`;
    if (!groups[groupKey]) {
      groups[groupKey] = {
        type: 'Feature',
        properties: {
          block: item.block,
          estate: item.estate,
          afdeling: item.afdeling,
        },
        geometry: {
          type: 'Polygon', // Ubah menjadi Polygon
          coordinates: [[]], // Menampung koordinat untuk membentuk poligon
        },
      };
    }
    groups[groupKey].geometry.coordinates[0].push([parseFloat(item.lon), parseFloat(item.lat)]);
    return groups;
  }, {} as Record<string, any>);
};

// Fungsi untuk menutup koordinat poligon (menghubungkan titik pertama dan terakhir)
const closePolygon = (coordinates: number[][]) => {
  if (coordinates[0] !== coordinates[coordinates.length - 1]) {
    coordinates.push(coordinates[0]); // Menambahkan titik pertama ke akhir untuk menutup poligon
  }
  return coordinates;
};

// Mengonversi data terkelompok menjadi format GeoJSON
const convertToGeoJSON = (groupedData: Record<string, any>) => {
  // Menutup setiap poligon untuk memastikan koordinat pertama dan terakhir sama
  Object.values(groupedData).forEach((feature: any) => {
    feature.geometry.coordinates[0] = closePolygon(feature.geometry.coordinates[0]);
  });

  return {
    type: 'FeatureCollection',
    features: Object.values(groupedData),
  };
};

const listBlockPlotToGeoJSON = (data: any[]) => {
  const groupedData = groupDataBlok(data);
  return convertToGeoJSON(groupedData);
};

export { listBlockPlotToGeoJSON };
