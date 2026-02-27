export const getAQIClass = (aqi) => {
    if(aqi <= 50) return "good";
    if(aqi <= 100) return "moderate";
    if(aqi <= 150) return "unhealthy";
    return "hazardous";
};

export const getAQIText = (aqi) => {
    if(aqi <= 50) return "good";
    if(aqi <= 100) return "moderate";
    if(aqi <= 150) return "unhealthy";
    return "hazardous";
}