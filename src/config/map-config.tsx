export const MAP_SOURCES = {
  BASE: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
  SATELLITE: `https://api.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}@2x.jpg90?access_token=${
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
  }`,
  // SATELLITE: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
  ELEVATION: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
} as const;
