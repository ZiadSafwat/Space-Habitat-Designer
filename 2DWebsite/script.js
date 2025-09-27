// Constants and Configuration
const SCALE = 50;
const MIN_SPACE_PER_PERSON = 10.0;
const GRID_SIZE = SCALE;

// Define available items with more details and image paths
const ITEMS = [
    { 
        name: "Sleeping Pod", 
        width: 1.0, 
        length: 2.0, 
        color: "#4fc3f7", 
        icon: "images/Sleeping Pod -Quarters.png",
        per_person: true, 
        category: "Sleep",
        description: "Sleeping area for one astronaut"
    },
    { 
        name: "Control Console", 
        width: 2.0, 
        length: 1.0, 
        color: "#5c6bc0", 
        icon: "images/Command - Control Console.png",
        per_person: false, 
        category: "Control",
        description: "Habitat control and monitoring system"
    },
    { 
        name: "Exercise Equipment", 
        width: 2.0, 
        length: 2.0, 
        color: "#ffb74d", 
        icon: "images/Gym - Exercise Equipment.png",
        per_person: false, 
        category: "Exercise",
        description: "Equipment for physical exercise"
    },
    { 
        name: "Storage Module", 
        width: 1.0, 
        length: 1.0, 
        color: "#78909c", 
        icon: "images/General Storage Module.png",
        per_person: false, 
        category: "Storage",
        description: "Storage for supplies and equipment"
    },
    { 
        name: "Waste Management", 
        width: 1.5, 
        length: 1.5, 
        color: "#66bb6a", 
        icon: "images/Waste Management - Recycling Unit.png",
        per_person: false, 
        category: "Waste",
        description: "Waste processing and management system"
    },
    { 
        name: "Research Workstation", 
        width: 2.5, 
        length: 1.5, 
        color: "#26a69a", 
        icon: "images/Laboratory -Research Workstation.png",
        per_person: false, 
        category: "Research",
        description: "Scientific research equipment"
    },
    { 
        name: "Airlock Door", 
        width: 2.0, 
        length: 2.0, 
        color: "#ff9800", 
        icon: "images/Airlock Door - Habitat Entrance.png",
        per_person: false, 
        category: "Access",
        description: "Pressurized entry/exit point"
    },
    { 
        name: "Hydroponics Module", 
        width: 3.0, 
        length: 2.0, 
        color: "#4caf50", 
        icon: "images/Hydroponics - Agriculture Module.png",
        per_person: false, 
        category: "Life Support",
        description: "Plant growth for food and oxygen"
    }
];

// NASA-style habitat shapes based on real concepts
const HABITAT_SHAPES = {
    "capsule": {
        name: "Capsule Module",
        description: "Capsule-shaped habitat with hemispherical ends",
        icon: "🚀",
        calculateVolume: (length, width, height) => {
            // Volume of cylindrical part + two hemispherical ends
            const radius = width / 2;
            const cylinderLength = length - width; // Subtract the hemispherical ends
            const cylinderVolume = Math.PI * radius * radius * cylinderLength;
            const sphereVolume = (4/3) * Math.PI * radius * radius * radius;
            return cylinderVolume + sphereVolume;
        },
        calculateArea: (length, width) => Math.PI * (width/2) * (width/2),
        getBoundingBox: (length, width) => {
            return {
                width: length * SCALE,
                height: width * SCALE
            };
        },
        draw: function(ctx, length, diameter, height, offsetX, offsetY, zoomLevel) {
            const radius = diameter * SCALE / 2;
            const capsuleLength = length * SCALE;
            
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.lineWidth = 4 / zoomLevel;
            ctx.setLineDash([]);
            
            // Draw capsule body (rectangle with rounded ends)
            ctx.beginPath();
            // Left semicircle
            ctx.arc(offsetX + radius, offsetY + radius, radius, Math.PI/2, 3*Math.PI/2);
            // Top line
            ctx.lineTo(offsetX + radius + capsuleLength - diameter * SCALE, offsetY);
            // Right semicircle
            ctx.arc(offsetX + radius + capsuleLength - diameter * SCALE, offsetY + radius, radius, 3*Math.PI/2, Math.PI/2);
            // Bottom line
            ctx.closePath();
            ctx.stroke();
            
            // Draw internal decks
            const deckCount = 2;
            const deckSpacing = capsuleLength / (deckCount + 1);
            
            for (let i = 1; i <= deckCount; i++) {
                const deckY = offsetY + radius + i * deckSpacing;
                ctx.beginPath();
                ctx.moveTo(offsetX + radius, deckY);
                ctx.lineTo(offsetX + radius + capsuleLength - diameter * SCALE, deckY);
                ctx.stroke();
            }
            
            // Draw docking port at front
            ctx.beginPath();
            ctx.arc(offsetX + radius + capsuleLength - diameter * SCALE, offsetY + radius, radius * 0.3, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.font = `${14 / zoomLevel}px Arial`;
            ctx.fillText(`Capsule: ${length}m length, ${diameter}m diameter`, offsetX + 10 / zoomLevel, offsetY + 20 / zoomLevel);
        },
        isPointInside: function(x, y, length, diameter) {
            const radius = diameter * SCALE / 2;
            const capsuleLength = length * SCALE;
            
            // Check if point is within the capsule shape
            // Left hemisphere
            if (x <= radius) {
                const centerX = radius;
                const centerY = radius;
                const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
                return distance <= radius;
            }
            // Right hemisphere
            else if (x >= capsuleLength - radius) {
                const centerX = capsuleLength - radius;
                const centerY = radius;
                const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
                return distance <= radius;
            }
            // Middle rectangular part
            else {
                return y >= 0 && y <= diameter * SCALE && x >= 0 && x <= capsuleLength;
            }
        }
    },
    "modular-base": {
        name: "Modular Surface Base",
        description: "Expandable surface base with interconnected modules",
        icon: "🏠",
        calculateVolume: (length, width, height) => length * width * height * 4, // Approximate for 4 modules
        calculateArea: (length, width) => length * width * 4, // Approximate for 4 modules
        getBoundingBox: (length, width) => {
            return {
                width: 5 * length * SCALE,
                height: 2.5 * length * SCALE
            };
        },
        draw: function(ctx, moduleSize, width, height, offsetX, offsetY, zoomLevel) {
            const size = moduleSize * SCALE;
            
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.lineWidth = 4 / zoomLevel;
            ctx.setLineDash([]);
            
            // Draw four interconnected modules in a cross pattern
            ctx.strokeRect(offsetX, offsetY, size, size); // Center module
            ctx.strokeRect(offsetX + size, offsetY, size, size); // Right module
            ctx.strokeRect(offsetX - size, offsetY, size, size); // Left module
            ctx.strokeRect(offsetX, offsetY + size, size, size); // Bottom module
            
            // Draw connections
            ctx.beginPath();
            ctx.moveTo(offsetX + size, offsetY + size/2);
            ctx.lineTo(offsetX + size * 2, offsetY + size/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + size/2);
            ctx.lineTo(offsetX - size, offsetY + size/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(offsetX + size/2, offsetY + size);
            ctx.lineTo(offsetX + size/2, offsetY + size * 2);
            ctx.stroke();
            
            // Draw rover bay
            ctx.strokeRect(offsetX - size * 1.5, offsetY - size * 0.5, size * 0.8, size * 0.8);
            
            // Draw solar array
            ctx.strokeStyle = "#ff9800";
            ctx.beginPath();
            ctx.moveTo(offsetX + size * 2.5, offsetY);
            ctx.lineTo(offsetX + size * 3.5, offsetY);
            ctx.lineTo(offsetX + size * 3.5, offsetY + size);
            ctx.lineTo(offsetX + size * 2.5, offsetY + size);
            ctx.closePath();
            ctx.stroke();
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.font = `${14 / zoomLevel}px Arial`;
            ctx.fillText(`Modular Base: ${moduleSize}m modules`, offsetX + 10 / zoomLevel, offsetY + 20 / zoomLevel);
        },
        isPointInside: function(x, y, moduleSize, width) {
            const size = moduleSize * SCALE;
            // Check if point is in any of the four modules
            return (x >= 0 && x <= size && y >= 0 && y <= size) ||
                   (x >= size && x <= size * 2 && y >= 0 && y <= size) ||
                   (x >= -size && x <= 0 && y >= 0 && y <= size) ||
                   (x >= 0 && x <= size && y >= size && y <= size * 2);
        }
    },
    "torus": {
        name: "Rotating Torus",
        description: "Rotating space station for artificial gravity",
        icon: "⭕",
        calculateVolume: (majorRadius, minorRadius, height) => (Math.PI * minorRadius * minorRadius) * (2 * Math.PI * majorRadius),
        calculateArea: (majorRadius, minorRadius) => Math.PI * minorRadius * minorRadius,
        getBoundingBox: (majorRadius, minorRadius) => {
            const radius = majorRadius * SCALE;
            return {
                width: 2 * radius,
                height: 2 * radius
            };
        },
        draw: function(ctx, majorRadius, minorRadius, height, offsetX, offsetY, zoomLevel) {
            const R = majorRadius * SCALE;
            const r = minorRadius * SCALE;
            const centerX = offsetX + R;
            const centerY = offsetY + R;
            
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.lineWidth = 4 / zoomLevel;
            ctx.setLineDash([]);
            
            // Draw torus
            ctx.beginPath();
            ctx.arc(centerX, centerY, R, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, R - r, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw spokes to central hub
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI / 3);
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(centerX + Math.cos(angle) * (R - r/2), centerY + Math.sin(angle) * (R - r/2));
                ctx.stroke();
            }
            
            // Draw central hub
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.font = `${14 / zoomLevel}px Arial`;
            ctx.fillText(`Rotating Torus: R=${majorRadius}m, r=${minorRadius}m`, offsetX + 10 / zoomLevel, offsetY + 20 / zoomLevel);
        },
        isPointInside: function(x, y, majorRadius, minorRadius) {
            const R = majorRadius * SCALE;
            const r = minorRadius * SCALE;
            const centerX = R;
            const centerY = R;
            const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            return distance <= R && distance >= (R - r);
        }
    },
    "sphere": {
        name: "Spherical Module",
        description: "Spherical habitat module for space stations",
        icon: "🔴",
        calculateVolume: (diameter, width, height) => (4/3) * Math.PI * (diameter/2) * (diameter/2) * (diameter/2),
        calculateArea: (diameter, width) => Math.PI * (diameter/2) * (diameter/2),
        getBoundingBox: (diameter, width) => {
            return {
                width: diameter * SCALE,
                height: diameter * SCALE
            };
        },
        draw: function(ctx, diameter, width, height, offsetX, offsetY, zoomLevel) {
            const radius = diameter * SCALE / 2;
            const centerX = offsetX + radius;
            const centerY = offsetY + radius;
            
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.lineWidth = 4 / zoomLevel;
            ctx.setLineDash([]);
            
            // Draw sphere
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw docking ports
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI / 2);
                const portX = centerX + Math.cos(angle) * radius * 0.8;
                const portY = centerY + Math.sin(angle) * radius * 0.8;
                
                ctx.beginPath();
                ctx.arc(portX, portY, radius * 0.15, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // Draw internal deck
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.font = `${14 / zoomLevel}px Arial`;
            ctx.fillText(`Spherical Module: ${diameter}m diameter`, offsetX + 10 / zoomLevel, offsetY + 20 / zoomLevel);
        },
        isPointInside: function(x, y, diameter, width) {
            const radius = diameter * SCALE / 2;
            const centerX = radius;
            const centerY = radius;
            const distance = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));
            return distance <= radius;
        }
    },
    "custom": {
        name: "Custom Rectangular",
        description: "Custom rectangular habitat design",
        icon: "⬜",
        calculateVolume: (length, width, height) => length * width * height,
        calculateArea: (length, width) => length * width,
        getBoundingBox: (length, width) => {
            return {
                width: length * SCALE,
                height: width * SCALE
            };
        },
        draw: function(ctx, length, width, height, offsetX, offsetY, zoomLevel) {
            const l = length * SCALE;
            const w = width * SCALE;
            
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.lineWidth = 4 / zoomLevel;
            ctx.setLineDash([]);
            ctx.strokeRect(offsetX, offsetY, l, w);
            
            // Draw internal walls for compartments
            ctx.beginPath();
            ctx.moveTo(offsetX + l/3, offsetY);
            ctx.lineTo(offsetX + l/3, offsetY + w);
            ctx.moveTo(offsetX + l*2/3, offsetY);
            ctx.lineTo(offsetX + l*2/3, offsetY + w);
            ctx.stroke();
            
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
            ctx.font = `${14 / zoomLevel}px Arial`;
            ctx.fillText(`Custom: ${length}m × ${width}m × ${height}m`, offsetX + 10 / zoomLevel, offsetY + 20 / zoomLevel);
        },
        isPointInside: function(x, y, length, width) {
            return x >= 0 && x <= length * SCALE && y >= 0 && y <= width * SCALE;
        }
    }
};

// Enhanced Application State
const appState = {
    habitatLength: 10.0,
    habitatWidth: 5.0,
    habitatHeight: 3.0,
    habitatShape: "capsule",
    numAstronauts: 4,
    missionDuration: 30,
    environment: "Mars",
    zoomLevel: 1.0,
    showGrid: true,
    snapToGrid: true,
    multiLevelMode: false,
    currentLevel: 0,
    totalLevels: 3,
    activeTool: 'select',
    offsetX: 0,
    offsetY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    selectedItem: null,
    simulationMode: false,
    showVisibility: false
};

// DOM Elements
const canvas = document.getElementById("habitat");
const ctx = canvas.getContext("2d");
const container = document.getElementById("habitat-container");
const templatesDiv = document.getElementById("templates");
const feedbackDiv = document.getElementById("feedback");
const tooltip = document.getElementById("tooltip");
const levelIndicator = document.getElementById("level-indicator");
const importFileInput = document.getElementById("import-file-input");

// Arrays to store items (now supports multiple levels)
const placedItems = [[], [], []]; // Three levels
let draggingItem = null;

// Image cache for item icons
const itemImages = {};

// Preload images
function preloadImages() {
    ITEMS.forEach(item => {
        const img = new Image();
        // Add crossOrigin attribute to avoid CORS issues
        img.crossOrigin = "anonymous";
        img.src = item.icon;
        img.onload = () => {
            itemImages[item.name] = img;
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${item.icon}`);
            // Create a fallback colored rectangle
            const canvas = document.createElement('canvas');
            canvas.width = 40;
            canvas.height = 40;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = item.color;
            ctx.fillRect(0, 0, 40, 40);
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.name.charAt(0), 20, 20);
            itemImages[item.name] = canvas;
        };
    });
}

// ===============================================
// ENHANCED ITEM CLASS WITH MULTI-LEVEL SUPPORT
// ===============================================

class Item {
    constructor(data, x, y, level = 0) {
        this.data = data;
        this.x = x;
        this.y = y;
        this.level = level;
        this.rotation = 0;
        this.dragging = false;
        this.offsetX = 0;
        this.offsetY = 0;
        this.id = Date.now() + Math.random();
    }

    get width() {
        return (Math.abs(this.rotation % 360) === 90 || Math.abs(this.rotation % 360) === 270) 
            ? this.data.length * SCALE 
            : this.data.width * SCALE;
    }

    get length() {
        return (Math.abs(this.rotation % 360) === 90 || Math.abs(this.rotation % 360) === 270) 
            ? this.data.width * SCALE 
            : this.data.length * SCALE;
    }

    draw(ctx) {
        // Only draw items on the current level (or if in multi-level view mode)
        if (this.level !== appState.currentLevel && !appState.multiLevelMode) return;
        
        const w = this.data.width * SCALE;
        const l = this.data.length * SCALE;
        
        ctx.save();
        
        // Apply level offset for multi-level view
        const levelOffset = appState.multiLevelMode ? this.level * 20 : 0;
        
        const centerX = this.x + this.width / 2 + levelOffset;
        const centerY = this.y + this.length / 2 + levelOffset;

        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation * Math.PI / 180);
        
        // Adjust opacity for items not on current level in multi-level view
        if (appState.multiLevelMode && this.level !== appState.currentLevel) {
            ctx.globalAlpha = 0.4;
        }
        
        ctx.fillStyle = this.data.color;
        ctx.globalAlpha = this.dragging ? 0.6 : (appState.multiLevelMode && this.level !== appState.currentLevel ? 0.4 : 0.8);
        ctx.fillRect(-w / 2, -l / 2, w, l);
        
        ctx.globalAlpha = 1.0;
        ctx.strokeStyle = this === appState.selectedItem ? getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() : "#333";
        ctx.lineWidth = (this === appState.selectedItem ? 3 : 1) / appState.zoomLevel;
        ctx.setLineDash(this === appState.selectedItem ? [5, 5] : []);
        ctx.strokeRect(-w / 2, -l / 2, w, l);
        
        // Draw the item image
        const img = itemImages[this.data.name];
        if (img) {
            ctx.globalAlpha = this.dragging ? 0.8 : (appState.multiLevelMode && this.level !== appState.currentLevel ? 0.6 : 1.0);
            const imgSize = Math.min(w, l) * 0.6;
            ctx.drawImage(img, -imgSize/2, -imgSize/2, imgSize, imgSize);
        }
        
        ctx.globalAlpha = 1.0;
        
        // Add level indicator for multi-level view
        if (appState.multiLevelMode) {
            ctx.fillStyle = "black";
            ctx.font = `${10 / appState.zoomLevel}px Arial`;
            ctx.fillText(`L${this.level + 1}`, 0, l/2 - 10 / appState.zoomLevel);
        }
        
        ctx.restore();
    }

    contains(mx, my) {
        const x = (mx - appState.offsetX) / appState.zoomLevel;
        const y = (my - appState.offsetY) / appState.zoomLevel;
        
        const levelOffset = appState.multiLevelMode ? this.level * 20 : 0;
        const adjustedX = this.x + levelOffset;
        const adjustedY = this.y + levelOffset;
        
        return x >= adjustedX && x <= adjustedX + this.width && 
               y >= adjustedY && y <= adjustedY + this.length;
    }

    checkCollision(otherItems) {
        for (let item of otherItems) {
            if (item.id !== this.id && item.level === this.level) {
                if (this.x < item.x + item.width &&
                    this.x + this.width > item.x &&
                    this.y < item.y + item.length &&
                    this.y + this.length > item.y) {
                    return true;
                }
            }
        }
        return false;
    }

    isInsideHabitat() {
        const shape = HABITAT_SHAPES[appState.habitatShape];
        // Check if all four corners are inside the habitat
        const corners = [
            {x: this.x, y: this.y},
            {x: this.x + this.width, y: this.y},
            {x: this.x, y: this.y + this.length},
            {x: this.x + this.width, y: this.y + this.length}
        ];
        
        return corners.every(corner => 
            shape.isPointInside(corner.x, corner.y, appState.habitatLength, appState.habitatWidth)
        );
    }

    rotate(delta) {
        this.rotation = (this.rotation + delta + 360) % 360;
    }
}

// ===============================================
// VISIBILITY ANALYSIS
// ===============================================

function calculateVisibility() {
    // Simple visibility analysis - check if critical areas are accessible
    const criticalItems = placedItems[appState.currentLevel].filter(item => 
        item.data.category === "Sleep" || item.data.category === "Medical" || 
        item.data.category === "Control");
    
    let allVisible = true;
    criticalItems.forEach(item => {
        // Check if item is not blocked by other items (simplified)
        const blockingItems = placedItems[appState.currentLevel].filter(other => 
            other.id !== item.id && 
            Math.abs(other.x - item.x) < 3 * SCALE && 
            Math.abs(other.y - item.y) < 3 * SCALE);
        
        if (blockingItems.length > 2) {
            allVisible = false;
        }
    });
    
    return allVisible;
}

// ===============================================
// DRAWING AND RENDERING (ENHANCED)
// ===============================================

function draw() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight - document.querySelector('.canvas-controls').offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(appState.offsetX, appState.offsetY);
    ctx.scale(appState.zoomLevel, appState.zoomLevel);
    
    if (appState.showGrid) {
        drawGrid();
    }
    drawHabitatBorder();
    
    // Draw items from all levels (with transparency for non-current levels in multi-level mode)
    for (let level = 0; level < appState.totalLevels; level++) {
        placedItems[level].forEach(item => item.draw(ctx));
    }
    
    ctx.restore();
}

function drawGrid() {
    const habitatWidth = appState.habitatLength * SCALE;
    const habitatHeight = appState.habitatWidth * SCALE;
    
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1 / appState.zoomLevel;
    ctx.setLineDash([]);
    
    for (let x = 0; x <= habitatWidth; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, habitatHeight);
        ctx.stroke();
    }
    
    for (let y = 0; y <= habitatHeight; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(habitatWidth, y);
        ctx.stroke();
    }
}

function drawHabitatBorder() {
    const shape = HABITAT_SHAPES[appState.habitatShape];
    shape.draw(ctx, appState.habitatLength, appState.habitatWidth, appState.habitatHeight, 0, 0, appState.zoomLevel);
}

// ===============================================
// PLACEMENT AND VALIDATION (ENHANCED FOR MULTI-LEVEL)
// ===============================================

function snap(coord) {
    if (appState.snapToGrid) {
        return Math.round(coord / GRID_SIZE) * GRID_SIZE;
    }
    return coord;
}

function validatePlacement(item) {
    const shape = HABITAT_SHAPES[appState.habitatShape];
    
    item.x = snap(item.x);
    item.y = snap(item.y);

    let isValid = true;
    
    // Check if item is inside habitat boundaries
    if (!item.isInsideHabitat()) {
        isValid = false;
        showNotification("Invalid: Out of habitat bounds", "error");
    }
    
    if (isValid && item.checkCollision(placedItems[item.level])) {
        isValid = false;
        showNotification("Invalid: Collision detected", "error");
    }

    if (!isValid) {
        const index = placedItems[item.level].indexOf(item);
        if (index > -1) placedItems[item.level].splice(index, 1);
        appState.selectedItem = null;
    } else {
        showNotification(`Placed ${item.data.name} on Level ${item.level + 1}`, "success");
    }
    
    draw();
    updateFeedback();
}

// ===============================================
// EVENT HANDLERS
// ===============================================

function handleParameterChange(e) {
    appState.habitatLength = parseFloat(document.getElementById("habitat-length").value) || 1;
    appState.habitatWidth = parseFloat(document.getElementById("habitat-width").value) || 1;
    appState.habitatHeight = parseFloat(document.getElementById("habitat-height").value) || 1;
    appState.habitatShape = document.getElementById("habitat-shape").value;
    appState.numAstronauts = parseInt(document.getElementById("num-astronauts").value) || 1;
    appState.missionDuration = parseInt(document.getElementById("mission-duration").value) || 10;
    appState.environment = document.getElementById("environment").value;
    
    draw();
    updateFeedback();
}

function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    if (appState.activeTool === 'select') {
        // Check if clicked on an item
        appState.selectedItem = null;
        for (let level = 0; level < appState.totalLevels; level++) {
            for (let i = placedItems[level].length - 1; i >= 0; i--) {
                const item = placedItems[level][i];
                if (item.contains(mx, my)) {
                    appState.selectedItem = item;
                    item.dragging = true;
                    // Calculate offset for accurate drag in canvas coordinates
                    item.offsetX = (mx - appState.offsetX) / appState.zoomLevel - item.x;
                    item.offsetY = (my - appState.offsetY) / appState.zoomLevel - item.y;
                    draggingItem = item;
                    
                    // Bring to front
                    placedItems[level].splice(i, 1);
                    placedItems[level].push(item);
                    draw();
                    return;
                }
            }
        }
        draw();
    } else if (appState.activeTool === 'move') {
        // Start panning
        appState.isDragging = true;
        appState.dragStartX = e.clientX - appState.offsetX;
        appState.dragStartY = e.clientY - appState.offsetY;
        canvas.style.cursor = 'grabbing';
    }
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    // Update tooltip position
    tooltip.style.left = `${e.clientX}px`;
    tooltip.style.top = `${e.clientY}px`;
    
    updateTooltip(mx, my);
    
    if (draggingItem && draggingItem.dragging) {
        // Move the dragged item (in canvas coordinates)
        let newX = (mx - appState.offsetX) / appState.zoomLevel - draggingItem.offsetX;
        let newY = (my - appState.offsetY) / appState.zoomLevel - draggingItem.offsetY;

        // Apply snapping for real-time visual feedback
        if (appState.snapToGrid) {
            newX = snap(newX);
            newY = snap(newY);
        }

        draggingItem.x = newX;
        draggingItem.y = newY;
        draw();
    } else if (appState.isDragging) {
        // Pan the canvas
        appState.offsetX = e.clientX - appState.dragStartX;
        appState.offsetY = e.clientY - appState.dragStartY;
        draw();
    } else if (appState.activeTool === 'move') {
        canvas.style.cursor = 'grab';
    }
}

function handleMouseUp(e) {
    if (draggingItem) {
        draggingItem.dragging = false;
        validatePlacement(draggingItem); // Final placement check (with snapping)
        draggingItem = null;
    }
    
    if (appState.isDragging) {
        appState.isDragging = false;
        canvas.style.cursor = appState.activeTool === 'move' ? 'grab' : 'default';
    }
    
    draw();
}

function handleDragStart(e) {
    if (e.target.className.includes("item-template")) {
        const index = e.target.dataset.index;
        const itemData = ITEMS[index];
        e.dataTransfer.setData("text/plain", JSON.stringify(itemData));
        e.dataTransfer.effectAllowed = "copy";
    }
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const itemData = JSON.parse(e.dataTransfer.getData("text/plain"));
    
    // Calculate center point in canvas coordinates
    let x = (mx - appState.offsetX) / appState.zoomLevel - (itemData.width * SCALE) / 2;
    let y = (my - appState.offsetY) / appState.zoomLevel - (itemData.length * SCALE) / 2;
    
    const newItem = new Item(itemData, x, y, appState.currentLevel);
    placedItems[appState.currentLevel].push(newItem);
    validatePlacement(newItem);
}

function handleWheel(e) {
    e.preventDefault();
    
    // Zoom with Ctrl/Cmd + wheel
    if (e.ctrlKey || e.metaKey) {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomCanvas(delta, e.clientX, e.clientY);
    } 
    // Rotate item with wheel while selecting/dragging (90 degree snap)
    else if (draggingItem || appState.selectedItem) {
        const item = draggingItem || appState.selectedItem;
        const delta = e.deltaY > 0 ? 90 : -90;
        item.rotate(delta);
        draw();
    } 
    // Pan vertically with wheel
    else {
        appState.offsetY -= e.deltaY * 0.5; // Smooth panning
        draw();
    }
}

function handleKeyDown(e) {
    if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomCanvas(0.1);
    } else if (e.key === "-") {
        e.preventDefault();
        zoomCanvas(-0.1);
    } else if (e.key === "Delete" && appState.selectedItem) {
        e.preventDefault();
        deleteItem(appState.selectedItem);
    }
}

// ===============================================
// TOOL & UTILITY FUNCTIONS
// ===============================================

function setActiveTool(tool) {
    appState.activeTool = tool;
    
    document.querySelectorAll('.canvas-controls .control-btn').forEach(btn => {
        // Exclude state-toggles from active-tool group
        if (btn.id !== 'grid-toggle' && btn.id !== 'snap-grid-toggle' && 
            btn.id !== 'multi-level-toggle' && btn.id !== 'visibility-btn') {
            btn.classList.remove('active');
        }
    });
    
    if (document.getElementById(`${tool}-tool`)) {
        document.getElementById(`${tool}-tool`).classList.add('active');
    }
    
    canvas.style.cursor = tool === 'move' ? 'grab' : 'default';
}

function toggleSnapToGrid() {
    appState.snapToGrid = !appState.snapToGrid;
    document.getElementById('snap-grid-toggle').classList.toggle('active', appState.snapToGrid);
    showNotification(`Snap to Grid: ${appState.snapToGrid ? 'ON' : 'OFF'}`, 'success');
}

function toggleMultiLevel() {
    appState.multiLevelMode = !appState.multiLevelMode;
    document.getElementById('multi-level-toggle').classList.toggle('active', appState.multiLevelMode);
    document.getElementById('level-controls').style.display = appState.multiLevelMode ? 'flex' : 'none';
    levelIndicator.style.display = appState.multiLevelMode ? 'block' : 'none';
    showNotification(`Multi-level mode: ${appState.multiLevelMode ? 'ON' : 'OFF'}`, 'success');
    draw();
}

function setActiveLevel(level) {
    appState.currentLevel = level;
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
    });
    levelIndicator.textContent = `Level ${level + 1}`;
    showNotification(`Switched to Level ${level + 1}`, 'success');
    draw();
}

function toggleGrid() {
    appState.showGrid = !appState.showGrid;
    document.getElementById('grid-toggle').classList.toggle('active', appState.showGrid);
    draw();
}

function toggleSimulation() {
    appState.simulationMode = !appState.simulationMode;
    document.getElementById('simulation-btn').innerHTML = appState.simulationMode ? 
        '<i class="fas fa-pause"></i> Stop Simulation' : 
        '<i class="fas fa-play"></i> Simulation';
    document.getElementById('simulation-controls').style.display = appState.simulationMode ? 'flex' : 'none';
    
    if (appState.simulationMode) {
        const visibility = calculateVisibility();
        showNotification(`Simulation started. Visibility: ${visibility ? 'Good' : 'Poor'}`, 
            visibility ? 'success' : 'warning');
    } else {
        showNotification('Simulation stopped', 'success');
    }
    
    draw();
}

function toggleVisibility() {
    if (!appState.simulationMode) {
        showNotification('Please start simulation first', 'warning');
        return;
    }
    
    appState.showVisibility = !appState.showVisibility;
    document.getElementById('visibility-btn').classList.toggle('active', appState.showVisibility);
    
    const visibility = calculateVisibility();
    showNotification(`Visibility analysis: ${visibility ? 'Good' : 'Poor'}`, 
        visibility ? 'success' : 'warning');
}

function zoomCanvas(delta, centerX, centerY) {
    const prevZoom = appState.zoomLevel;
    appState.zoomLevel = Math.max(0.5, Math.min(3, appState.zoomLevel + delta));
    
    // Adjust offset to zoom toward cursor (Pinched Zoom)
    if (centerX !== undefined && centerY !== undefined) {
        const rect = canvas.getBoundingClientRect();
        const x = centerX - rect.left;
        const y = centerY - rect.top;
        
        const zoomFactor = appState.zoomLevel / prevZoom;
        appState.offsetX = x - (x - appState.offsetX) * zoomFactor;
        appState.offsetY = y - (y - appState.offsetY) * zoomFactor;
    }
    
    document.getElementById('zoom-display').textContent = `${Math.round(appState.zoomLevel * 100)}%`;
    draw();
}

function resetView() {
    appState.zoomLevel = 1.0;
    appState.offsetX = 0;
    appState.offsetY = 0;
    document.getElementById('zoom-display').textContent = '100%';
    draw();
    showNotification('View reset to default', 'success');
}

function clearCanvas() {
    if (confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
        for (let level = 0; level < appState.totalLevels; level++) {
            placedItems[level].length = 0;
        }
        appState.selectedItem = null;
        draw();
        updateFeedback();
        showNotification("Canvas cleared", "success");
    }
}

function deleteItem(item) {
    const index = placedItems[item.level].indexOf(item);
    if (index > -1) {
        placedItems[item.level].splice(index, 1);
        if (appState.selectedItem === item) {
            appState.selectedItem = null;
        }
        draw();
        updateFeedback();
        showNotification(`Deleted ${item.data.name}`, "success");
    }
}

function updateTooltip(mx, my) {
    for (let level = 0; level < appState.totalLevels; level++) {
        for (let i = placedItems[level].length - 1; i >= 0; i--) {
            const item = placedItems[level][i];
            if (item.contains(mx, my)) {
                tooltip.innerHTML = `
                    <strong>${item.data.name}</strong><br>
                    ${item.data.description}<br>
                    Size: ${item.data.width}m × ${item.data.length}m<br>
                    Rotation: ${item.rotation}°<br>
                    Level: ${item.level + 1}
                `;
                tooltip.style.display = 'block';
                return;
            }
        }
    }
    tooltip.style.display = 'none';
}

// ===============================================
// FEEDBACK AND ANALYSIS
// ===============================================

function updateFeedback() {
    const shape = HABITAT_SHAPES[appState.habitatShape];
    const totalVolume = shape.calculateVolume(
        appState.habitatLength, 
        appState.habitatWidth, 
        appState.habitatHeight
    ) * (appState.multiLevelMode ? appState.totalLevels : 1);
    
    let requiredVolume = appState.numAstronauts * MIN_SPACE_PER_PERSON * (1 + (appState.missionDuration / 30) * 0.1);
    if (appState.environment === "Mars") requiredVolume *= 1.25;
    else if (appState.environment === "Moon") requiredVolume *= 1.15;
    else if (appState.environment === "Space") requiredVolume *= 1.05;

    const usedArea = placedItems.flat().reduce((sum, item) => sum + (item.data.width * item.data.length), 0);
    const totalArea = shape.calculateArea(appState.habitatLength, appState.habitatWidth) * (appState.multiLevelMode ? appState.totalLevels : 1);
    const areaUsage = Math.min(100, (usedArea / totalArea) * 100);

    const bedCount = placedItems.flat().filter(item => item.data.name === "Sleeping Pod").length;
    
    // Calculate structural efficiency based on shape
    let structureEfficiency = 85;
    if (appState.habitatShape === "capsule") structureEfficiency = 90;
    else if (appState.habitatShape === "torus") structureEfficiency = 88;
    else if (appState.habitatShape === "sphere") structureEfficiency = 98;
    else if (appState.habitatShape === "modular-base") structureEfficiency = 82;
    
    // Adjust based on environment
    if (appState.environment === "Space") structureEfficiency *= 1.05;
    else if (appState.environment === "Mars") structureEfficiency *= 0.95;
    
    document.getElementById("volume-total").textContent = `${totalVolume.toFixed(1)} m³`;
    document.getElementById("volume-required").textContent = `${requiredVolume.toFixed(1)} m³`;
    document.getElementById("area-usage").textContent = `${areaUsage.toFixed(1)}%`;
    document.getElementById("beds-available").textContent = `${bedCount}/${appState.numAstronauts}`;
    document.getElementById("structure-efficiency").textContent = `${structureEfficiency.toFixed(1)}%`;

    let feedbackStatus = "good";

    if (totalVolume < requiredVolume || bedCount < appState.numAstronauts || usedArea > totalArea) {
        feedbackStatus = "error";
    } else if (areaUsage > 85) {
        feedbackStatus = "warning";
    }

    feedbackDiv.className = feedbackStatus;
    
    document.getElementById("volume-total").className = `feedback-value ${totalVolume >= requiredVolume ? "good" : "error"}`;
    document.getElementById("area-usage").className = `feedback-value ${areaUsage < 85 ? "good" : areaUsage < 95 ? "warning" : "error"}`;
    document.getElementById("beds-available").className = `feedback-value ${bedCount >= appState.numAstronauts ? "good" : "error"}`;
    document.getElementById("structure-efficiency").className = `feedback-value ${structureEfficiency > 85 ? "good" : structureEfficiency > 75 ? "warning" : "error"}`;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 0.8rem 1.2rem;
        border-radius: 4px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    notification.style.background = 
        type === 'success' ? getComputedStyle(document.documentElement).getPropertyValue('--success').trim() : 
        type === 'error' ? getComputedStyle(document.documentElement).getPropertyValue('--error').trim() : 
        getComputedStyle(document.documentElement).getPropertyValue('--warning').trim();
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// ===============================================
// SAVE AND EXPORT
// ===============================================

function getDesignData() {
    return {
        habitat: {
            length: appState.habitatLength,
            width: appState.habitatWidth,
            height: appState.habitatHeight,
            shape: appState.habitatShape
        },
        astronauts: appState.numAstronauts,
        missionDuration: appState.missionDuration,
        environment: appState.environment,
        items: placedItems.flat().map(item => ({
            type: item.data.name,
            x: item.x,
            y: item.y,
            rotation: item.rotation,
            level: item.level
        })),
        timestamp: new Date().toISOString()
    };
}

function saveDesign() {
    const designData = getDesignData();
    localStorage.setItem('spaceHabitatDesign', JSON.stringify(designData));
    showNotification('Design saved successfully to local storage', 'success');
}

function exportPNG() {
    try {
        const shape = HABITAT_SHAPES[appState.habitatShape];
        const bbox = shape.getBoundingBox(appState.habitatLength, appState.habitatWidth);
        
        // Create a temporary canvas for export with proper sizing
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // Calculate the required size for the export with margin
        const margin = 50;
        const width = bbox.width + margin * 2;
        const height = bbox.height + margin * 2;
        
        exportCanvas.width = width;
        exportCanvas.height = height;
        
        // Fill with white background
        exportCtx.fillStyle = 'white';
        exportCtx.fillRect(0, 0, width, height);
        
        // Set up the export context
        exportCtx.save();
        exportCtx.translate(margin, margin);
        exportCtx.scale(1, 1); // Fixed scale for export
        
        // Draw grid if enabled
        if (appState.showGrid) {
            exportCtx.strokeStyle = "#e0e0e0";
            exportCtx.lineWidth = 1;
            
            for (let x = 0; x <= bbox.width; x += GRID_SIZE) {
                exportCtx.beginPath();
                exportCtx.moveTo(x, 0);
                exportCtx.lineTo(x, bbox.height);
                exportCtx.stroke();
            }
            
            for (let y = 0; y <= bbox.height; y += GRID_SIZE) {
                exportCtx.beginPath();
                exportCtx.moveTo(0, y);
                exportCtx.lineTo(bbox.width, y);
                exportCtx.stroke();
            }
        }
        
        // Draw habitat border
        shape.draw(exportCtx, appState.habitatLength, appState.habitatWidth, appState.habitatHeight, 0, 0, 1);
        
        // Draw all items
        for (let level = 0; level < appState.totalLevels; level++) {
            for (const item of placedItems[level]) {
                const w = item.data.width * SCALE;
                const l = item.data.length * SCALE;
                
                exportCtx.save();
                
                const centerX = item.x + w / 2;
                const centerY = item.y + l / 2;

                exportCtx.translate(centerX, centerY);
                exportCtx.rotate(item.rotation * Math.PI / 180);
                
                exportCtx.fillStyle = item.data.color;
                exportCtx.fillRect(-w / 2, -l / 2, w, l);
                
                exportCtx.strokeStyle = "#333";
                exportCtx.lineWidth = 1;
                exportCtx.strokeRect(-w / 2, -l / 2, w, l);
                
                // Draw the item image (with fallback to prevent security errors)
                try {
                    const img = itemImages[item.data.name];
                    if (img && img.complete && img.naturalHeight !== 0) {
                        const imgSize = Math.min(w, l) * 0.6;
                        exportCtx.drawImage(img, -imgSize/2, -imgSize/2, imgSize, imgSize);
                    } else {
                        // Fallback: draw the first letter of the item name
                        exportCtx.fillStyle = 'white';
                        exportCtx.font = 'bold ' + (Math.min(w, l) * 0.4) + 'px Arial';
                        exportCtx.textAlign = 'center';
                        exportCtx.textBaseline = 'middle';
                        exportCtx.fillText(item.data.name.charAt(0), 0, 0);
                    }
                } catch (error) {
                    console.warn('Error drawing image for export:', error);
                    // Fallback: draw the first letter of the item name
                    exportCtx.fillStyle = 'white';
                    exportCtx.font = 'bold ' + (Math.min(w, l) * 0.4) + 'px Arial';
                    exportCtx.textAlign = 'center';
                    exportCtx.textBaseline = 'middle';
                    exportCtx.fillText(item.data.name.charAt(0), 0, 0);
                }
                
                exportCtx.restore();
            }
        }
        
        exportCtx.restore();
        
        // Add title and details
        exportCtx.fillStyle = "#000";
        exportCtx.font = "bold 16px Arial";
        exportCtx.fillText("Space Habitat Design", 10, 20);
        exportCtx.font = "12px Arial";
        exportCtx.fillText(`Habitat: ${shape.name}`, 10, height - 40);
        exportCtx.fillText(`Dimensions: ${appState.habitatLength}m × ${appState.habitatWidth}m × ${appState.habitatHeight}m`, 10, height - 25);
        exportCtx.fillText(`Astronauts: ${appState.numAstronauts}, Duration: ${appState.missionDuration} days`, 10, height - 10);
        
        // Perform download
        const dataURL = exportCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `space-habitat-design_${new Date().toISOString().slice(0, 10)}.png`;
        link.href = dataURL;
        link.click();
        
        showNotification('Design exported as PNG', 'success');
    } catch (error) {
        console.error('Error exporting PNG:', error);
        showNotification('Error exporting PNG. Please try again.', 'error');
    }
}

function exportJSON() {
    const designData = getDesignData();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(designData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `space-habitat-design_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showNotification('Design exported as JSON', 'success');
}

// ===============================================
// IMPORT FUNCTIONALITY
// ===============================================

function importJSON() {
    importFileInput.click();
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const designData = JSON.parse(event.target.result);
            loadDesign(designData);
            showNotification('Design imported successfully', 'success');
        } catch (error) {
            console.error('Error importing design:', error);
            showNotification('Error importing design. Please check the file format.', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset the file input
    e.target.value = '';
}

function loadSavedDesign() {
    const savedDesign = localStorage.getItem('spaceHabitatDesign');
    if (savedDesign) {
        try {
            const designData = JSON.parse(savedDesign);
            loadDesign(designData);
            showNotification('Saved design loaded', 'success');
        } catch (error) {
            console.error('Error loading saved design:', error);
            showNotification('Error loading saved design', 'error');
        }
    } else {
        showNotification('No saved design found', 'warning');
    }
}

function loadDesign(designData) {
    // Update habitat parameters
    appState.habitatLength = designData.habitat.length || 10;
    appState.habitatWidth = designData.habitat.width || 5;
    appState.habitatHeight = designData.habitat.height || 3;
    appState.habitatShape = designData.habitat.shape || "capsule";
    appState.numAstronauts = designData.astronauts || 4;
    appState.missionDuration = designData.missionDuration || 30;
    appState.environment = designData.environment || "Mars";
    
    // Update UI inputs
    document.getElementById("habitat-length").value = appState.habitatLength;
    document.getElementById("habitat-width").value = appState.habitatWidth;
    document.getElementById("habitat-height").value = appState.habitatHeight;
    document.getElementById("habitat-shape").value = appState.habitatShape;
    document.getElementById("num-astronauts").value = appState.numAstronauts;
    document.getElementById("mission-duration").value = appState.missionDuration;
    document.getElementById("environment").value = appState.environment;
    
    // Clear current items
    for (let level = 0; level < appState.totalLevels; level++) {
        placedItems[level].length = 0;
    }
    
    // Load items from design data
    if (designData.items) {
        designData.items.forEach(itemData => {
            const itemTemplate = ITEMS.find(item => item.name === itemData.type);
            if (itemTemplate) {
                const item = new Item(itemTemplate, itemData.x, itemData.y, itemData.level || 0);
                item.rotation = itemData.rotation || 0;
                placedItems[item.level].push(item);
            }
        });
    }
    
    // Reset view and redraw
    resetView();
    updateFeedback();
}

function showHelp() {
    alert(`NASA-Style Space Habitat Designer - Help Guide

1. HABITAT TYPES:
- Capsule Module: Capsule-shaped habitat with hemispherical ends
- Modular Surface Base: Expandable base with interconnected modules
- Rotating Torus: Space station with artificial gravity
- Spherical Module: Spherical habitat for space stations
- Custom Rectangular: Custom rectangular design

2. DRAG AND DROP: Drag items from the library to the canvas to place them.

3. MOVING ITEMS: Click and drag placed items to reposition them.

4. ROTATING ITEMS: Use the **mouse wheel** while dragging an item to rotate it by 90°.

5. ZOOMING & PANNING: 
- Use the Pan tool (Arrows) to move the view.
- Use **Ctrl/Cmd + mouse wheel** to zoom centered on the cursor.
- Use **+/-** buttons for simple zoom.

6. MULTI-LEVEL DESIGN: 
- Enable Multi-level mode to design habitats with multiple floors.
- Switch between levels using the level buttons.

7. SIMULATION MODE:
- Start simulation to analyze your design.
- Check Visibility to ensure critical areas are accessible.

8. SNAP TO GRID: Use the 'Snap (1m)' button for precise, meter-aligned placement.

9. DELETE: Select an item and press the **Delete** key to remove it.

10. DESIGN PARAMETERS: Adjust the habitat dimensions and mission parameters in the sidebar.

11. IMPORT/EXPORT: 
- Save designs to local storage
- Export designs as PNG images or JSON files
- Import previously saved JSON designs

12. FEEDBACK: Check the analysis panel at the bottom for design viability (Volume, Area, Beds, Structural Integrity).`);
}

// ===============================================
// INITIALIZATION
// ===============================================

function createItemTemplates() {
    ITEMS.forEach((itemData, index) => {
        const div = document.createElement("div");
        div.className = "item-template";
        div.draggable = true;
        div.dataset.index = index;
        
        div.innerHTML = `
            <img class="item-icon" src="${itemData.icon}" alt="${itemData.name}" style="background-color: ${itemData.color}; padding: 5px; border-radius: 4px;">
            <div class="item-name">${itemData.name}</div>
            <div class="item-details">${itemData.width}m × ${itemData.length}m</div>
        `;
        
        templatesDiv.appendChild(div);
    });
}

function setupEventListeners() {
    // Input controls
    document.getElementById("num-astronauts").addEventListener("input", handleParameterChange);
    document.getElementById("mission-duration").addEventListener("input", handleParameterChange);
    document.getElementById("environment").addEventListener("change", handleParameterChange);
    document.getElementById("habitat-shape").addEventListener("change", handleParameterChange);
    document.getElementById("habitat-length").addEventListener("input", handleParameterChange);
    document.getElementById("habitat-width").addEventListener("input", handleParameterChange);
    document.getElementById("habitat-height").addEventListener("input", handleParameterChange);
    
    // Buttons
    document.getElementById("clear-btn").addEventListener("click", clearCanvas);
    document.getElementById("save-btn").addEventListener("click", saveDesign);
    document.getElementById("load-saved-btn").addEventListener("click", loadSavedDesign);
    document.getElementById("import-json-btn").addEventListener("click", importJSON);
    document.getElementById("export-png-btn").addEventListener("click", exportPNG);
    document.getElementById("export-json-btn").addEventListener("click", exportJSON);
    document.getElementById("help-btn").addEventListener("click", showHelp);
    
    // File import
    importFileInput.addEventListener("change", handleFileImport);
    
    // Tool buttons
    document.getElementById("select-tool").addEventListener("click", () => setActiveTool('select'));
    document.getElementById("move-tool").addEventListener("click", () => setActiveTool('move'));
    document.getElementById("grid-toggle").addEventListener("click", toggleGrid);
    document.getElementById("snap-grid-toggle").addEventListener("click", toggleSnapToGrid);
    document.getElementById("multi-level-toggle").addEventListener("click", toggleMultiLevel);
    document.getElementById("zoom-in").addEventListener("click", () => zoomCanvas(0.2));
    document.getElementById("zoom-out").addEventListener("click", () => zoomCanvas(-0.2));
    document.getElementById("reset-view").addEventListener("click", resetView);
    
    // New feature buttons
    document.getElementById("simulation-btn").addEventListener("click", toggleSimulation);
    document.getElementById("visibility-btn").addEventListener("click", toggleVisibility);
    
    // Level controls
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setActiveLevel(parseInt(this.dataset.level));
        });
    });
    
    // Canvas events
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel);
    
    // Drag and drop from sidebar
    templatesDiv.addEventListener("dragstart", handleDragStart);
    canvas.addEventListener("dragover", handleDragOver);
    canvas.addEventListener("drop", handleDrop);
    
    // Keyboard events
    document.addEventListener("keydown", handleKeyDown);
}

function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight - document.querySelector('.canvas-controls').offsetHeight;
    draw();
}

function init() {
    resizeCanvas();
    preloadImages();
    createItemTemplates();
    setupEventListeners();
    draw();
    updateFeedback();
    
    // Hide simulation controls initially
    document.getElementById('simulation-controls').style.display = 'none';
    document.getElementById('level-controls').style.display = 'none';
    levelIndicator.style.display = 'none';
    
    // Try to load saved design on startup
    setTimeout(loadSavedDesign, 500);
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', resizeCanvas);
 