export const popupStyles = `
.mapboxgl-popup-anchor-top {
  max-width: 250px;
  animation: fadein 0.2s;
}

.mapboxgl-popup-content {
  border-radius: 3px;
  border: 2px solid white;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
  min-width: 300px;
  padding: 0;
  cursor: pointer;
}

.mapboxgl-popup-close-button {
  padding-top: 2px;
  padding-right: 5px;
  font-size: 18px;
  font-family: Tahoma, Verdana, sans-serif;
  color: white;
  font-weight: bold;
  z-index:10;
}

.mapboxgl-popup-close-button:hover {
  color: #999;
  background: transparent;
}

.body .hero-map {
  line-height: 1.4;
}

.bottom-left {
  position: absolute;
  bottom: 8px; 
  left: 16px;
  color: white;
  text-justify: left;
  font-weight: bold;
}
.bottom-left p {
  float: left; 
  position: relative; 
  text-align: left;
  font-weight: bold;
}
.strata-card {
  z-index: 5;
}

// Strata card styles

.popup-card {
  position: relative;
  width: 260px;
  font-family: sans-serif;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

}


.view-hint {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-top: 10px;
}

.popup-content {
  padding: 10px;
}

.popup-address {
  font-weight: 600;
  margin-bottom: 8px;
}

.popup-label {
  font-size: 12px;
  font-weight: 500;
}

.popup-select {
  width: 100%;
  padding: 6px;
  margin-top: 5px;
  margin-bottom: 10px;
  border-radius: 4px;
  border: 1px solid #ddd;

  
}

.popup-details {
  font-size: 13px;
  line-height: 1.4;
}

/* Container adjustments */
.popup-card.default-cursor {
  cursor: default; /* Removes the pointer from the whole card */
}

.field-group {
  margin-bottom: 12px;
}

/* The New Button UI */
.popup-btn-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 4px;
  background-color: #1a1a1a; /* Change to your primary brand color */
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.popup-btn-primary:hover {
  background-color: #333333; /* Slightly lighter shade for hover */
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.popup-btn-primary:active {
  transform: translateY(0);
  box-shadow: none;
}

/* Ensure the SVG icon scales nicely */
.popup-btn-primary svg {
  transition: transform 0.2s ease;
}

.popup-btn-primary:hover svg {
  transform: translateX(3px); /* Arrow slides right on hover */
}


`;
