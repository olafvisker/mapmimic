export const MAP_SOURCES = {
  BASE: "https://basemaps.cartocdn.com/gl/voyager-nolabels-gl-style/style.json",
  SATELLITE: "https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png",
  ELEVATION: "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
} as const;
