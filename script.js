// Constants and Configuration
const SCALE = 50;
const MIN_SPACE_PER_PERSON = 10.0;
const GRID_SIZE = SCALE;

// Define available items with more details and image paths
const ITEMS = [
    { 
        name: "Waste Collection Unit", 
        width: 1.5, 
        length: 1.5, 
        color: "#8d6e63", 
        icon: "images/Human Waste-1 (Waste Collection).png",
        per_person: false, 
        category: "Sanitation",
        description: "Waste collection and management system"
    },
    { 
        name: "Hygiene Station", 
        width: 1.5, 
        length: 1.5, 
        color: "#5c6bc0", 
        icon: "images/Human Waste-2 (Cleansing)  Hygiene-1 (Cleansing).png",
        per_person: false, 
        category: "Hygiene",
        description: "Personal hygiene and cleaning station"
    },
    { 
        name: "Non-Cleansing Station", 
        width: 1.5, 
        length: 1.5, 
        color: "#7e57c2", 
        icon: "images/Hygiene-2 (Non-Cleansing).png",
        per_person: false, 
        category: "Hygiene",
        description: "Non-cleansing hygiene equipment"
    },
    { 
        name: "Work Surface", 
        width: 2.0, 
        length: 1.0, 
        color: "#78909c", 
        icon: "images/Logistics-1 (Work Surface).png",
        per_person: false, 
        category: "Workspace",
        description: "General purpose work area"
    },
    { 
        name: "Storage Cabinet", 
        width: 1.0, 
        length: 0.5, 
        color: "#8d6e63", 
        icon: "images/Logistics-2 (Temporary Storage).png",
        per_person: false, 
        category: "Storage",
        description: "Temporary storage for supplies"
    },
    { 
        name: "Computer Workstation", 
        width: 1.5, 
        length: 1.0, 
        color: "#455a64", 
        icon: "images/Maintenance-1 (Computer)  EVA-2 (ComputerData).png",
        per_person: false, 
        category: "Workspace",
        description: "Computer station for data analysis and monitoring"
    },
    { 
        name: "Maintenance Workbench", 
        width: 2.0, 
        length: 1.0, 
        color: "#5d4037", 
        icon: "images/Maintenance-2 (Work Surface)  EVA-1 (Suit Testing).png",
        per_person: false, 
        category: "Maintenance",
        description: "Workbench for equipment maintenance"
    },
    { 
        name: "Food Preparation Area", 
        width: 2.0, 
        length: 1.0, 
        color: "#ff7043", 
        icon: "images/Meal Preparation-1 (Food Prep).png",
        per_person: false, 
        category: "Galley",
        description: "Food preparation and cooking station"
    },
    { 
        name: "Medical Computer Station", 
        width: 1.5, 
        length: 1.0, 
        color: "#d32f2f", 
        icon: "images/Medical Computer Station.png",
        per_person: false, 
        category: "Medical",
        description: "Medical monitoring and diagnostics"
    },
    { 
        name: "Waste Management System", 
        width: 2.0, 
        length: 1.5, 
        color: "#689f38", 
        icon: "images/Waste Management.png",
        per_person: false, 
        category: "Sanitation",
        description: "Waste processing and recycling system"
    },
    // Sleep-related units for analysis (beds)
    { 
        name: "Sleeping Pod", 
        width: 2.2, 
        length: 1.0, 
        color: "#3949ab", 
        icon: "images/Sleeping Pod.png",
        per_person: true,
        capacity: 1,
        category: "Sleep",
        description: "Individual sleeping pod with privacy"
    },
    { 
        name: "Crew Bunk Bed", 
        width: 2.0, 
        length: 1.2, 
        color: "#1e88e5", 
        icon: "images/Crew Bunk Bed.png",
        per_person: false,
        capacity: 2,
        category: "Sleep",
        description: "Two-level bunk sleeping unit"
    },
    { 
        name: "Private Crew Quarters", 
        width: 2.5, 
        length: 1.8, 
        color: "#1976d2", 
        icon: "images/Private Crew Quarters.png",
        per_person: true,
        capacity: 1,
        category: "Sleep",
        description: "Enclosed crew sleeping and personal storage"
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
        
        // Set opacity based on dragging and multi-level view
        const itemAlpha = this.dragging ? 0.8 : (appState.multiLevelMode && this.level !== appState.currentLevel ? 0.4 : 1.0);
        
        // Draw the item image to fill the entire box
        const img = itemImages[this.data.name];
        if (img) {
            // Set global alpha for the image
            ctx.globalAlpha = itemAlpha;
            
            // Draw the image to fill the entire box
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // Calculate dimensions to fill the box while maintaining aspect ratio
            const boxAspect = w / l;
            const imgAspect = img.width / img.height;
            
            let drawWidth, drawHeight, x, y;
            
            if (boxAspect > imgAspect) {
                // Box is wider than image (relative to height)
                drawHeight = l;
                drawWidth = drawHeight * imgAspect;
                x = -drawWidth / 2;
                y = -l / 2;
            } else {
                // Box is taller than image (relative to width)
                drawWidth = w;
                drawHeight = drawWidth / imgAspect;
                x = -w / 2;
                y = -drawHeight / 2;
            }
            
            // Draw the image to fill the box
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
        }
        
        // Draw selection border if this item is selected
        if (this === appState.selectedItem) {
            ctx.globalAlpha = itemAlpha;
            ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
            ctx.lineWidth = 3 / appState.zoomLevel;
            ctx.setLineDash([5, 5]);
            ctx.strokeRect(-w / 2, -l / 2, w, l);
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
    // Store previous environment to detect changes
    const previousEnv = appState.environment;
    
    // Update all parameters
    appState.habitatLength = parseFloat(document.getElementById("habitat-length").value) || 1;
    appState.habitatWidth = parseFloat(document.getElementById("habitat-width").value) || 1;
    appState.habitatHeight = parseFloat(document.getElementById("habitat-height").value) || 1;
    appState.habitatShape = document.getElementById("habitat-shape").value;
    appState.numAstronauts = parseInt(document.getElementById("num-astronauts").value) || 1;
    appState.missionDuration = parseInt(document.getElementById("mission-duration").value) || 10;
    appState.environment = document.getElementById("environment").value;
    
    // Clear the canvas if environment has changed
    if (e && e.target && e.target.id === 'environment' && appState.environment !== previousEnv) {
        clearCanvas();
        showNotification(`Environment changed to ${appState.environment}. Canvas has been cleared.`, 'info');
    }
    
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
    // Show the design analysis modal instead of toggling simulation mode
    showDesignAnalysis();
}

function showDesignAnalysis() {
    // Update the modal with current analysis data
    updateModalAnalysis();
    
    // Show the modal
    const modal = document.getElementById('design-analysis-modal');
    modal.classList.add('show');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Close modal when clicking the close button or outside the modal
    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    };
    
    document.getElementById('close-analysis-modal').onclick = closeModal;
    document.getElementById('close-analysis-btn').onclick = closeModal;
    
    // Close when clicking outside the modal content
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    // Add PDF export functionality
    document.getElementById('export-pdf-btn').onclick = exportToPDF;
}

function calculateHabitatVolume(asString = false) {
    const shape = HABITAT_SHAPES[appState.habitatShape];
    // Use shape-specific volume formula for accuracy
    const baseVolume = shape.calculateVolume(
        appState.habitatLength,
        appState.habitatWidth,
        appState.habitatHeight
    );
    const levels = appState.multiLevelMode ? appState.totalLevels : 1;
    const volume = baseVolume * levels;
    return asString ? volume.toFixed(1) : volume;
}

function calculateRequiredVolume(asString = false) {
    // Align with feedback formula for consistency
    // Base required space per astronaut
    const base = (appState.numAstronauts || 0) * MIN_SPACE_PER_PERSON;
    // Mission duration factor: +10% per 30 days
    const durationFactor = 1 + ((appState.missionDuration || 0) / 30) * 0.1;
    // Environment multiplier
    let envMultiplier = 1.0;
    if (appState.environment === 'Mars') envMultiplier = 1.25;
    else if (appState.environment === 'Moon') envMultiplier = 1.15;
    else if (appState.environment === 'Space') envMultiplier = 1.05;
    const total = base * durationFactor * envMultiplier;
    return asString ? total.toFixed(1) : total;
}

function calculateAreaUsage() {
    const shape = HABITAT_SHAPES[appState.habitatShape];
    // Area per level in square meters (use shape.calculateArea, not pixel bbox)
    const areaPerLevel = shape.calculateArea(appState.habitatLength, appState.habitatWidth);

    // Sum used area across all levels in square meters (do NOT use SCALE here)
    let usedAreaM2 = 0;
    for (let level = 0; level < appState.totalLevels; level++) {
        const items = placedItems[level] || [];
        for (const item of items) {
            usedAreaM2 += (item.data.width || 0) * (item.data.length || 0);
        }
    }

    // Total available area accounts for multi-level mode
    const levels = appState.multiLevelMode ? appState.totalLevels : 1;
    const totalAvailableM2 = areaPerLevel * levels;

    if (totalAvailableM2 <= 0) return 0;
    const pct = (usedAreaM2 / totalAvailableM2) * 100;
    return Number(Math.max(0, Math.min(100, pct)).toFixed(2));
}

function countBeds() {
    let bedCount = 0;
    for (let level = 0; level < appState.totalLevels; level++) {
        const items = placedItems[level] || [];
        for (const item of items) {
            const name = (item.data.name || '').toLowerCase();
            const isSleep = (item.data.category === 'Sleep') || name.includes('bed') || name.includes('sleep');
            if (isSleep) {
                const cap = Number(item.data.capacity);
                bedCount += Number.isFinite(cap) && cap > 0 ? cap : 1;
            }
        }
    }
    return bedCount;
}

// Compute weighted systems coverage based on placed items
function computeSystemsCoverage() {
    // Weights by category (sum ~= 1.0)
    const WEIGHTS = {
        'Sleep': 0.35,
        'Medical': 0.15,
        'Sanitation': 0.10,
        'Hygiene': 0.05,
        'Galley': 0.10,
        'Storage': 0.10,
        'Workspace': 0.15
    };
    // Minimum requirements per category
    const astronauts = appState.numAstronauts || 1;
    const REQUIRED = {
        'Sleep': Math.max(1, astronauts), // beds >= astronauts
        'Medical': 1,
        'Sanitation': 1,
        'Hygiene': 1,
        'Galley': 1,
        'Storage': 1,
        'Workspace': 1
    };

    // Count items by category and compute sleep capacity
    const flat = placedItems.flat();
    const counts = {};
    let sleepCapacity = 0;
    for (const it of flat) {
        const cat = it.data.category || 'Other';
        counts[cat] = (counts[cat] || 0) + 1;
        if (cat === 'Sleep') {
            const cap = Number(it.data.capacity);
            sleepCapacity += Number.isFinite(cap) && cap > 0 ? cap : 1;
        }
    }

    // Replace Sleep count with capacity-based count
    if (sleepCapacity > 0) counts['Sleep'] = sleepCapacity;

    // Compute weighted score
    let score = 0;
    let totalWeights = 0;
    Object.entries(WEIGHTS).forEach(([cat, w]) => {
        totalWeights += w;
        const actual = counts[cat] || 0;
        const required = REQUIRED[cat] || 1;
        const ratio = Math.max(0, Math.min(1, actual / required));
        score += ratio * w;
    });

    const pct = totalWeights > 0 ? (score / totalWeights) * 100 : 0;
    const percentage = Number(pct.toFixed(2));

    let status = 'info';
    if (percentage < 60) status = 'danger';
    else if (percentage < 80) status = 'warning';
    else status = 'good';

    return { percentage, status };
}

function calculateStructureEfficiency() {
    // Base efficiency based on habitat shape
    let efficiency = 0;
    switch(appState.habitatShape) {
        case 'cylinder':
            efficiency = 90; // Cylinders are very efficient in space
            break;
        case 'sphere':
            efficiency = 95; // Most efficient but harder to build
            break;
        case 'rectangle':
        default:
            efficiency = 85; // Standard efficiency for rectangular shapes
    }
    
    // Adjust based on number of levels (more levels = slightly less efficient)
    efficiency -= (appState.totalLevels - 1) * 2;
    
    // Ensure efficiency is within bounds
    return Math.max(50, Math.min(100, efficiency));
}

function updateModalAnalysis() {
    // Calculate all values
    const volumeTotal = calculateHabitatVolume();
    const volumeRequired = calculateRequiredVolume();
    const areaUsage = calculateAreaUsage();
    const bedsAvailable = countBeds();
    const structureEfficiency = calculateStructureEfficiency();
    const systems = computeSystemsCoverage();
    
    // Function to safely update element text content
    const updateElement = (id, value, suffix = '') => {
        const el = document.getElementById(id);
        if (el) el.textContent = `${value}${suffix}`;
    };
    
    // Update modal values (two decimals)
    updateElement('modal-volume-total', volumeTotal.toFixed(2), ' m³');
    updateElement('modal-volume-required', volumeRequired.toFixed(2), ' m³');
    updateElement('modal-area-usage', areaUsage.toFixed ? areaUsage.toFixed(2) : Number(areaUsage).toFixed(2), '%');
    updateElement('modal-beds-available', `${bedsAvailable}/${appState.numAstronauts}`);
    updateElement('modal-structure-efficiency', Number(structureEfficiency).toFixed(2), '%');
    updateElement('modal-equipment-score', systems.percentage.toFixed(2), '%');
    
    // Calculate overall status based on analysis (priority: danger > warning > good > info)
    let overallStatus = 'info'; // Default to info (blue)
    const statusPriority = { 'danger': 4, 'warning': 3, 'good': 2, 'info': 1 };
    
    const updateStatus = (newStatus) => {
        if (statusPriority[newStatus] > statusPriority[overallStatus]) {
            overallStatus = newStatus;
        }
    };
    
    // Check volume status
    if (volumeTotal < volumeRequired) {
        updateStatus('danger'); // Not enough volume is critical
    } else {
        updateStatus('good');
    }
    
    // Check beds status
    if (bedsAvailable < appState.numAstronauts) {
        updateStatus('danger'); // Not enough beds is critical
    } else {
        updateStatus('good');
    }
    
    // Check structure efficiency
    if (structureEfficiency < 75) {
        updateStatus('danger'); // Low structural integrity is critical
    } else if (structureEfficiency < 90) {
        updateStatus('warning'); // Average structural integrity needs attention
    } else {
        updateStatus('good');
    }
    
    // Check area usage
    if (areaUsage >= 90) {
        updateStatus('danger'); // Over 90% usage is critical
    } else if (areaUsage >= 80) {
        updateStatus('warning'); // 80-90% usage needs attention
    } else {
        updateStatus('info'); // Under 80% is informational
    }

    // Systems coverage affects status
    updateStatus(systems.status);
    
    // Apply status class to modal
    const modal = document.getElementById('design-analysis-modal');
    if (modal) {
        // Remove all status classes
        modal.classList.remove('status-danger', 'status-warning', 'status-good', 'status-info');
        // Add current status class
        modal.classList.add(`status-${overallStatus}`);
    }
    
    // Update summary based on the analysis
    updateAnalysisSummary();
}

function updateAnalysisSummary() {
    const summaryElement = document.getElementById('analysis-summary');
    if (!summaryElement) return;
    
    // Get values from the modal display
    const getNumericValue = (id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        const text = el.textContent.trim();
        // Remove non-numeric characters and parse
        const value = parseFloat(text.replace(/[^0-9.-]+/g, ''));
        return isNaN(value) ? 0 : value;
    };
    
    // Get values from the modal display
    const volumeTotal = getNumericValue('modal-volume-total');
    const volumeRequired = getNumericValue('modal-volume-required');
    const areaUsage = getNumericValue('modal-area-usage');
    
    // Get beds info
    let bedsAvailable = 0;
    let bedsNeeded = appState.numAstronauts || 0;
    const bedsEl = document.getElementById('modal-beds-available');
    if (bedsEl) {
        const bedsText = bedsEl.textContent.trim();
        const bedsMatch = bedsText.match(/(\d+)\s*\/\s*(\d+)/);
        if (bedsMatch) {
            bedsAvailable = parseInt(bedsMatch[1]) || 0;
            bedsNeeded = parseInt(bedsMatch[2]) || 0;
        }
    }
    
    const structureEfficiency = getNumericValue('modal-structure-efficiency');
    
    let summary = '<h3>Design Summary</h3>';
    
    // Volume analysis
    if (volumeTotal >= volumeRequired) {
        summary += `<p>✅ Your habitat has sufficient volume (${volumeTotal.toFixed(2)} m³) for the mission requirements (${volumeRequired.toFixed(2)} m³).</p>`;
    } else {
        const needed = (volumeRequired - volumeTotal).toFixed(2);
        summary += `<p>❌ Your habitat needs ${needed} m³ more volume to meet the mission requirements.</p>`;
    }
    
    // Beds analysis
    if (bedsAvailable >= bedsNeeded) {
        summary += `<p>✅ You have enough sleeping accommodations for all ${bedsNeeded} astronauts.</p>`;
    } else {
        const needed = bedsNeeded - bedsAvailable;
        summary += `<p>❌ You need ${needed} more sleeping ${needed === 1 ? 'space' : 'spaces'} for your crew.</p>`;
    }
    
    // Structure analysis
    if (structureEfficiency >= 90) {
        summary += `<p>✅ Excellent structural integrity (${structureEfficiency.toFixed(2)}%). Your habitat is well-designed for space conditions.</p>`;
    } else if (structureEfficiency >= 75) {
        summary += `<p>⚠️ Average structural integrity (${structureEfficiency.toFixed(2)}%). Consider reinforcing your design for better safety margins.</p>`;
    } else {
        summary += `<p>❌ Low structural integrity (${structureEfficiency.toFixed(2)}%). Your habitat may not withstand space conditions. Consider redesigning.</p>`;
    }
    
    // Area usage analysis
    if (areaUsage < 70) {
        summary += `<p>ℹ️ Your area usage is ${Number(areaUsage).toFixed(2)}%. You have room for additional modules or expansion.</p>`;
    } else if (areaUsage < 90) {
        summary += `<p>ℹ️ Your area usage is ${Number(areaUsage).toFixed(2)}%. Efficient use of space, but consider future expansion needs.</p>`;
    } else {
        summary += `<p>⚠️ Your area usage is ${Number(areaUsage).toFixed(2)}%. Your habitat is reaching maximum capacity. Consider a larger design or more efficient layout.</p>`;
    }
    
    // Units breakdown (counts per category and per item)
    const systems = computeSystemsCoverage();
    const flatItems = placedItems.flat();
    const byCategory = {};
    const byItem = {};
    for (const it of flatItems) {
        const cat = it.data.category || 'Other';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
        const name = it.data.name || 'Unknown';
        byItem[name] = (byItem[name] || 0) + 1;
    }

    // Build readable breakdown HTML
    const totalUnits = flatItems.length;
    const uniqueTypes = Object.keys(byItem).length;
    let breakdownHtml = `<h3>Units Breakdown</h3>`;
    breakdownHtml += `<p>Total Units Placed: <strong>${totalUnits}</strong> — Unique Types: <strong>${uniqueTypes}</strong></p>`;

    // Show categories summary
    if (totalUnits > 0) {
        breakdownHtml += '<ul style="margin:0.5rem 0 0.75rem 1.2rem;">';
        Object.entries(byCategory)
            .sort((a,b)=> b[1]-a[1])
            .forEach(([cat,count])=>{
                breakdownHtml += `<li><strong>${cat}</strong>: ${count}</li>`;
            });
        breakdownHtml += '</ul>';

        // Top 5 item types
        breakdownHtml += '<div style="margin-top:0.5rem">';
        breakdownHtml += '<p style="margin:0 0 0.25rem 0"><strong>Top Items</strong>:</p>';
        const topItems = Object.entries(byItem).sort((a,b)=> b[1]-a[1]).slice(0,5);
        breakdownHtml += '<ul style="margin:0 0 0.75rem 1.2rem;">';
        topItems.forEach(([name,count])=>{
            breakdownHtml += `<li>${name}: ${count}</li>`;
        });
        breakdownHtml += '</ul></div>';
    } else {
        breakdownHtml += '<p>No units placed yet.</p>';
    }

    summaryElement.innerHTML = summary + breakdownHtml;
}

async function exportToPDF() {
    // Get user data from localStorage
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Calculate all metrics
    const volumeTotal = calculateHabitatVolume();
    const volumeRequired = calculateRequiredVolume();
    const areaUsage = calculateAreaUsage();
    const bedsAvailable = countBeds();
    const structureEfficiency = calculateStructureEfficiency();
    const numAstronauts = appState.numAstronauts || 1;
    
    // Create a promise to handle the canvas to image conversion
    const getDesignImage = () => {
        return new Promise((resolve) => {
            const shape = HABITAT_SHAPES[appState.habitatShape];
            const bbox = shape.getBoundingBox(appState.habitatLength, appState.habitatWidth);
            
            // Create a temporary canvas for the design
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // Set canvas size to match the design with some padding
            const padding = 20;
            const scale = 0.5; // Scale down for PDF
            tempCanvas.width = (bbox.width + padding * 2) * scale;
            tempCanvas.height = (bbox.height + padding * 2) * scale;
            
            // Fill with white background
            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            
            // Scale and position the design
            tempCtx.save();
            tempCtx.translate(padding * scale, padding * scale);
            tempCtx.scale(scale, scale);
            
            // Draw the habitat border
            shape.draw(tempCtx, appState.habitatLength, appState.habitatWidth, appState.habitatHeight, 0, 0, 1);
            
            // Draw all items
            for (let level = 0; level < appState.totalLevels; level++) {
                for (const item of placedItems[level]) {
                    const w = item.data.width * SCALE;
                    const l = item.data.length * SCALE;
                    
                    tempCtx.save();
                    const centerX = item.x + w / 2;
                    const centerY = item.y + l / 2;
                    
                    tempCtx.translate(centerX, centerY);
                    tempCtx.rotate(item.rotation * Math.PI / 180);
                    
                    // Draw a simple rectangle for each item
                    tempCtx.fillStyle = item.data.color || '#3498db';
                    tempCtx.fillRect(-w/2, -l/2, w, l);
                    
                    // Add item label
                    tempCtx.fillStyle = 'white';
                    tempCtx.font = `bold ${Math.min(w, l) * 0.2}px Arial`;
                    tempCtx.textAlign = 'center';
                    tempCtx.textBaseline = 'middle';
                    tempCtx.fillText(item.data.name.charAt(0).toUpperCase(), 0, 0);
                    
                    tempCtx.restore();
                }
            }
            
            tempCtx.restore();
            
            // Convert canvas to data URL
            const imageData = tempCanvas.toDataURL('image/png');
            resolve(imageData);
        });
    };
    
    // Get the design image
    const designImage = await getDesignImage();
    
    // Create a container for the PDF with PDF-optimized styles
    const container = document.createElement('div');
    container.style.padding = '15px';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.width = '210mm'; // A4 width in mm
    container.style.margin = '0 auto';
    container.style.color = '#333';
    container.style.lineHeight = '1.4';
    container.style.fontSize = '12px';
    
    // Add design image section
    const imageSection = document.createElement('div');
    imageSection.style.margin = '15px 0';
    imageSection.style.textAlign = 'center';
    imageSection.style.breakInside = 'avoid';
    
    const imageTitle = document.createElement('h3');
    imageTitle.textContent = 'Design Overview';
    imageTitle.style.color = '#2c3e50';
    imageTitle.style.borderBottom = '1px solid #eee';
    imageTitle.style.padding = '0 0 5px 0';
    imageTitle.style.margin = '0 0 10px 0';
    imageTitle.style.fontSize = '14px';
    
    const img = document.createElement('img');
    img.src = designImage;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.border = '1px solid #eee';
    img.style.borderRadius = '4px';
    img.style.marginTop = '10px';
    
    imageSection.appendChild(imageTitle);
    imageSection.appendChild(img);
    container.appendChild(imageSection);
    
    // Add header with PDF-optimized styles
    const header = document.createElement('header');
    header.style.marginBottom = '15px';
    header.style.paddingBottom = '10px';
    header.style.borderBottom = '1px solid #2c3e50';
    header.style.breakInside = 'avoid';
    header.style.breakAfter = 'avoid';
    
    const title = document.createElement('h1');
    title.textContent = 'SPACE HABITAT DESIGN ANALYSIS REPORT';
    title.style.color = '#2c3e50';
    title.style.textAlign = 'center';
    title.style.margin = '0 0 5px 0';
    title.style.padding = '0';
    title.style.fontSize = '18px';
    title.style.letterSpacing = '0.5px';
    title.style.breakAfter = 'avoid';
    title.style.breakInside = 'avoid';
    
    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Comprehensive Design Evaluation';
    subtitle.style.textAlign = 'center';
    subtitle.style.color = '#7f8c8d';
    subtitle.style.margin = '0 0 5px 0';
    subtitle.style.padding = '0';
    subtitle.style.fontSize = '14px';
    subtitle.style.fontWeight = 'normal';
    subtitle.style.breakAfter = 'avoid';
    subtitle.style.breakInside = 'avoid';
    
    const date = document.createElement('div');
    date.textContent = 'Report Generated: ' + new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    date.style.textAlign = 'center';
    date.style.color = '#7f8c8d';
    date.style.margin = '0 0 10px 0';
    date.style.padding = '0';
    date.style.fontSize = '11px';
    date.style.breakAfter = 'avoid';
    date.style.breakInside = 'avoid';
    
    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(date);
    container.appendChild(header);
    
    // Add user information section with PDF-optimized styles
    const userInfoSection = document.createElement('section');
    userInfoSection.style.marginBottom = '15px';
    userInfoSection.style.padding = '10px';
    userInfoSection.style.backgroundColor = '#f8f9fa';
    userInfoSection.style.borderRadius = '4px';
    userInfoSection.style.borderLeft = '3px solid #3498db';
    userInfoSection.style.breakInside = 'avoid';
    userInfoSection.style.breakAfter = 'avoid';
    
    const userInfoTitle = document.createElement('h3');
    userInfoTitle.textContent = 'Mission Information';
    userInfoTitle.style.margin = '0 0 8px 0';
    userInfoTitle.style.padding = '0 0 5px 0';
    userInfoTitle.style.color = '#2c3e50';
    userInfoTitle.style.borderBottom = '1px solid #eee';
    userInfoTitle.style.fontSize = '14px';
    userInfoTitle.style.breakAfter = 'avoid';
    userInfoTitle.style.breakInside = 'avoid';
    
    userInfoSection.appendChild(userInfoTitle);
    
    const userInfoGrid = document.createElement('table');
    userInfoGrid.style.width = '100%';
    userInfoGrid.style.borderCollapse = 'collapse';
    userInfoGrid.style.margin = '0';
    userInfoGrid.style.padding = '0';
    userInfoGrid.style.breakInside = 'avoid';
    
    const addInfoRow = (label, value) => {
        const row = document.createElement('tr');
        
        const labelCell = document.createElement('td');
        labelCell.textContent = label;
        labelCell.style.fontWeight = 'bold';
        labelCell.style.color = '#2c3e50';
        labelCell.style.padding = '4px 8px';
        labelCell.style.borderBottom = '1px solid #eee';
        labelCell.style.width = '40%';
        
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        valueCell.style.padding = '4px 8px';
        valueCell.style.borderBottom = '1px solid #eee';
        
        row.appendChild(labelCell);
        row.appendChild(valueCell);
        userInfoGrid.appendChild(row);
    };
    
    addInfoRow('Designer:', userData.name || 'Not specified');
    addInfoRow('Mission Type:', userData.missionType ? 
        userData.missionType.charAt(0).toUpperCase() + userData.missionType.slice(1).replace('-', ' ') : 
        'Not specified');
    addInfoRow('Number of Astronauts:', numAstronauts.toString());
    addInfoRow('Design Date:', new Date().toLocaleDateString());
    
    userInfoSection.appendChild(userInfoGrid);
    container.appendChild(userInfoSection);
    
    // Add Habitat Specifications with PDF-optimized styles
    const specsSection = document.createElement('section');
    specsSection.style.marginBottom = '15px';
    specsSection.style.breakInside = 'avoid';
    
    const specsTitle = document.createElement('h3');
    specsTitle.textContent = 'Habitat Specifications';
    specsTitle.style.color = '#2c3e50';
    specsTitle.style.borderBottom = '1px solid #eee';
    specsTitle.style.padding = '0 0 5px 0';
    specsTitle.style.margin = '0 0 10px 0';
    specsTitle.style.fontSize = '14px';
    specsTitle.style.breakAfter = 'avoid';
    
    specsSection.appendChild(specsTitle);
    
    const specsGrid = document.createElement('div');
    specsGrid.style.display = 'block';
    specsGrid.style.marginTop = '10px';
    specsGrid.style.breakInside = 'avoid';
    
    const createSpecCard = (title, value, icon, status = '') => {
        const card = document.createElement('div');
        card.style.padding = '10px';
        card.style.margin = '0 10px 10px 0';
        card.style.display = 'inline-block';
        card.style.width = 'calc(50% - 20px)';
        card.style.minWidth = '200px';
        card.style.boxSizing = 'border-box';
        card.style.verticalAlign = 'top';
        card.style.borderRadius = '4px';
        card.style.backgroundColor = '#fff';
        card.style.border = '1px solid #eee';
        card.style.borderLeft = `3px solid ${status === 'warning' ? '#f39c12' : status === 'error' ? '#e74c3c' : '#2ecc71'}`;
        card.style.breakInside = 'avoid';
        
        const cardHeader = document.createElement('div');
        cardHeader.style.display = 'flex';
        cardHeader.style.alignItems = 'center';
        cardHeader.style.marginBottom = '5px';
        
        const iconEl = document.createElement('span');
        iconEl.textContent = icon;
        iconEl.style.marginRight = '10px';
        iconEl.style.fontSize = '20px';
        
        const titleEl = document.createElement('h4');
        titleEl.textContent = title;
        titleEl.style.margin = '0';
        titleEl.style.padding = '0';
        titleEl.style.fontSize = '12px';
        titleEl.style.color = '#2c3e50';
        
        cardHeader.appendChild(iconEl);
        cardHeader.appendChild(titleEl);
        
        const valueEl = document.createElement('div');
        valueEl.textContent = value;
        valueEl.style.fontSize = '18px';
        valueEl.style.fontWeight = 'bold';
        valueEl.style.color = '#2c3e50';
        valueEl.style.margin = '5px 0 0 0';
        
        card.appendChild(cardHeader);
        card.appendChild(valueEl);
        
        return card;
    };
    
    // Add specification cards with proper number formatting
    const volumeStatus = volumeTotal >= volumeRequired ? 'good' : 'error';
    const volumeTotalStr = typeof volumeTotal === 'number' ? volumeTotal.toFixed(1) : 'N/A';
    const volumeRequiredStr = typeof volumeRequired === 'number' ? volumeRequired.toFixed(1) : 'N/A';
    
    specsGrid.appendChild(createSpecCard(
        'Total Volume', 
        `${volumeTotalStr} m³`, 
        '📦',
        volumeStatus
    ));
    
    specsGrid.appendChild(createSpecCard(
        'Required Volume', 
        `${volumeRequiredStr} m³`, 
        '🎯',
        'info'
    ));
    
    const bedsStatus = bedsAvailable >= numAstronauts ? 'good' : 'error';
    specsGrid.appendChild(createSpecCard(
        'Sleeping Accommodations', 
        `${bedsAvailable} / ${numAstronauts}`, 
        '🛏️',
        bedsStatus
    ));
    
    const areaStatus = areaUsage > 90 ? 'warning' : 'good';
    specsGrid.appendChild(createSpecCard(
        'Area Utilization', 
        `${areaUsage.toFixed(1)}%`, 
        '📏',
        areaStatus
    ));
    
    const structureStatus = structureEfficiency < 75 ? 'error' : structureEfficiency < 90 ? 'warning' : 'good';
    specsGrid.appendChild(createSpecCard(
        'Structural Efficiency', 
        `${structureEfficiency.toFixed(1)}%`, 
        '🏗️',
        structureStatus
    ));
    
    specsSection.appendChild(specsGrid);
    container.appendChild(specsSection);
    
    // Add Detailed Analysis with PDF-optimized styles
    const analysisSection = document.createElement('section');
    analysisSection.style.marginBottom = '15px';
    analysisSection.style.breakInside = 'avoid';
    
    const analysisTitle = document.createElement('h3');
    analysisTitle.textContent = 'Detailed Analysis';
    analysisTitle.style.color = '#2c3e50';
    analysisTitle.style.borderBottom = '1px solid #eee';
    analysisTitle.style.padding = '0 0 5px 0';
    analysisTitle.style.margin = '0 0 10px 0';
    analysisTitle.style.fontSize = '14px';
    analysisTitle.style.breakAfter = 'avoid';
    
    analysisSection.appendChild(analysisTitle);
    
    // Volume Analysis with PDF-optimized styles
    const volumeAnalysis = document.createElement('div');
    volumeAnalysis.style.marginBottom = '10px';
    volumeAnalysis.style.padding = '10px';
    volumeAnalysis.style.backgroundColor = volumeTotal >= volumeRequired ? '#e8f8f5' : '#fdedec';
    volumeAnalysis.style.borderRadius = '4px';
    volumeAnalysis.style.borderLeft = `3px solid ${volumeTotal >= volumeRequired ? '#27ae60' : '#e74c3c'}`;
    volumeAnalysis.style.breakInside = 'avoid';
    
    const volumeTitle = document.createElement('h4');
    volumeTitle.textContent = 'Volume Analysis';
    volumeTitle.style.margin = '0 0 5px 0';
    volumeTitle.style.padding = '0';
    volumeTitle.style.fontSize = '13px';
    volumeTitle.style.color = volumeTotal >= volumeRequired ? '#27ae60' : '#e74c3c';
    volumeTitle.style.breakAfter = 'avoid';
    
    const volumeText = document.createElement('p');
    volumeText.style.margin = '0';
    volumeText.style.padding = '0';
    volumeText.style.fontSize = '11px';
    volumeText.style.lineHeight = '1.4';
    if (volumeTotal >= volumeRequired) {
        volumeText.textContent = `Your habitat provides sufficient volume (${volumeTotal.toFixed(1)} m³) for the mission requirements (${volumeRequired.toFixed(1)} m³). This ensures adequate living and working space for the crew.`;
    } else {
        const needed = (volumeRequired - volumeTotal).toFixed(1);
        volumeText.textContent = `Your habitat needs an additional ${needed} m³ of volume to meet the minimum requirements for ${numAstronauts} astronauts. Consider adding more modules or increasing the size of existing ones.`;
    }
    
    volumeAnalysis.appendChild(volumeTitle);
    volumeAnalysis.appendChild(volumeText);
    
    // Beds Analysis
    const bedsAnalysis = document.createElement('div');
    bedsAnalysis.style.marginBottom = '20px';
    bedsAnalysis.style.padding = '15px';
    bedsAnalysis.style.backgroundColor = bedsAvailable >= numAstronauts ? '#e8f8f5' : '#fdedec';
    bedsAnalysis.style.borderRadius = '8px';
    bedsAnalysis.style.borderLeft = `4px solid ${bedsAvailable >= numAstronauts ? '#27ae60' : '#e74c3c'}`;
    
    const bedsTitle = document.createElement('h4');
    bedsTitle.textContent = 'Crew Accommodation';
    bedsTitle.style.marginTop = '0';
    bedsTitle.style.color = bedsAvailable >= numAstronauts ? '#27ae60' : '#e74c3c';
    
    const bedsText = document.createElement('p');
    if (bedsAvailable >= numAstronauts) {
        bedsText.textContent = `You have sufficient sleeping accommodations for all ${numAstronauts} astronauts.`;
        if (bedsAvailable > numAstronauts) {
            bedsText.textContent += ` You have ${bedsAvailable - numAstronauts} extra sleeping spaces available.`;
        }
    } else {
        const needed = numAstronauts - bedsAvailable;
        bedsText.textContent = `You need ${needed} more sleeping ${needed === 1 ? 'space' : 'spaces'} to accommodate all ${numAstronauts} astronauts.`;
    }
    
    bedsAnalysis.appendChild(bedsTitle);
    bedsAnalysis.appendChild(bedsText);
    
    // Structure Analysis
    const structureAnalysis = document.createElement('div');
    structureAnalysis.style.marginBottom = '20px';
    structureAnalysis.style.padding = '15px';
    
    let structureColor, structureBg;
    if (structureEfficiency >= 90) {
        structureColor = '#27ae60';
        structureBg = '#e8f8f5';
    } else if (structureEfficiency >= 75) {
        structureColor = '#f39c12';
        structureBg = '#fef9e7';
    } else {
        structureColor = '#e74c3c';
        structureBg = '#fdedec';
    }
    
    structureAnalysis.style.backgroundColor = structureBg;
    structureAnalysis.style.borderRadius = '8px';
    structureAnalysis.style.borderLeft = `4px solid ${structureColor}`;
    
    const structureTitle = document.createElement('h4');
    structureTitle.textContent = 'Structural Integrity';
    structureTitle.style.marginTop = '0';
    structureTitle.style.color = structureColor;
    
    const structureText = document.createElement('p');
    if (structureEfficiency >= 90) {
        structureText.textContent = `Excellent structural integrity (${structureEfficiency.toFixed(1)}%). Your habitat is well-designed to withstand the harsh conditions of space with strong structural support.`;
    } else if (structureEfficiency >= 75) {
        structureText.textContent = `Moderate structural integrity (${structureEfficiency.toFixed(1)}%). Your habitat has an acceptable structure but could benefit from additional support elements to improve safety margins.`;
    } else {
        structureText.textContent = `Low structural integrity (${structureEfficiency.toFixed(1)}%). Your habitat may not be able to withstand the stresses of space. Consider adding more structural elements or redistributing the mass.`;
    }
    
    structureAnalysis.appendChild(structureTitle);
    structureAnalysis.appendChild(structureText);
    
    // Area Usage Analysis
    const areaAnalysis = document.createElement('div');
    areaAnalysis.style.marginBottom = '20px';
    areaAnalysis.style.padding = '15px';
    
    let areaColor, areaBg;
    if (areaUsage < 70) {
        areaColor = '#27ae60';
        areaBg = '#e8f8f5';
    } else if (areaUsage < 90) {
        areaColor = '#f39c12';
        areaBg = '#fef9e7';
    } else {
        areaColor = '#e74c3c';
        areaBg = '#fdedec';
    }
    
    areaAnalysis.style.backgroundColor = areaBg;
    areaAnalysis.style.borderRadius = '8px';
    areaAnalysis.style.borderLeft = `4px solid ${areaColor}`;
    
    const areaTitle = document.createElement('h4');
    areaTitle.textContent = 'Space Utilization';
    areaTitle.style.marginTop = '0';
    areaTitle.style.color = areaColor;
    
    const areaText = document.createElement('p');
    if (areaUsage < 70) {
        areaText.textContent = `Your area usage is efficient (${areaUsage.toFixed(1)}%). You have room for additional modules or expansion if needed.`;
    } else if (areaUsage < 90) {
        areaText.textContent = `Your area usage is good (${areaUsage.toFixed(1)}%). The habitat makes efficient use of available space while allowing for some future expansion.`;
    } else {
        areaText.textContent = `Your habitat is reaching maximum capacity (${areaUsage.toFixed(1)}% used). Consider optimizing the layout or increasing the habitat size to accommodate future needs.`;
    }
    
    areaAnalysis.appendChild(areaTitle);
    areaAnalysis.appendChild(areaText);
    
    // Add all analysis sections
    analysisSection.appendChild(volumeAnalysis);
    analysisSection.appendChild(bedsAnalysis);
    analysisSection.appendChild(structureAnalysis);
    analysisSection.appendChild(areaAnalysis);
    
    container.appendChild(analysisSection);
    
    // Add Recommendations
    const recommendations = [];
    
    if (volumeTotal < volumeRequired) {
        const needed = (volumeRequired - volumeTotal).toFixed(1);
        recommendations.push({
            priority: 'High',
            text: `Add approximately ${needed} m³ of additional volume to meet minimum requirements.`
        });
    }
    
    if (bedsAvailable < numAstronauts) {
        const needed = numAstronauts - bedsAvailable;
        recommendations.push({
            priority: 'High',
            text: `Add ${needed} more sleeping ${needed === 1 ? 'accommodation' : 'accommodations'} for the crew.`
        });
    }
    
    if (structureEfficiency < 75) {
        recommendations.push({
            priority: 'High',
            text: 'Improve structural integrity by adding support beams or redistributing mass.'
        });
    } else if (structureEfficiency < 90) {
        recommendations.push({
            priority: 'Medium',
            text: 'Consider adding additional structural elements to improve safety margins.'
        });
    }
    
    if (areaUsage > 90) {
        recommendations.push({
            priority: 'Medium',
            text: 'The habitat is reaching maximum capacity. Consider optimizing the layout or expanding the habitat size.'
        });
    }
    
    if (recommendations.length > 0) {
        const recSection = document.createElement('section');
        recSection.style.marginBottom = '30px';
        
        const recTitle = document.createElement('h3');
        recTitle.textContent = 'Recommendations';
        recTitle.style.color = '#2c3e50';
        recTitle.style.borderBottom = '1px solid #eee';
        recTitle.style.paddingBottom = '10px';
        recTitle.style.marginTop = '0';
        
        recSection.appendChild(recTitle);
        
        const recList = document.createElement('ul');
        recList.style.paddingLeft = '20px';
        recList.style.margin = '15px 0 0 0';
        
        // Sort recommendations by priority (High first, then Medium, then Low)
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        recommendations.forEach(rec => {
            const item = document.createElement('li');
            item.style.marginBottom = '10px';
            item.style.paddingLeft = '10px';
            item.style.borderLeft = `3px solid ${
                rec.priority === 'High' ? '#e74c3c' : rec.priority === 'Medium' ? '#f39c12' : '#3498db'
            }`;
            
            const priorityLabel = document.createElement('span');
            priorityLabel.textContent = `[${rec.priority}] `;
            priorityLabel.style.fontWeight = 'bold';
            priorityLabel.style.color = rec.priority === 'High' ? '#e74c3c' : 
                                      rec.priority === 'Medium' ? '#f39c12' : '#3498db';
            
            const text = document.createElement('span');
            text.textContent = rec.text;
            
            item.appendChild(priorityLabel);
            item.appendChild(text);
            recList.appendChild(item);
        });
        
        recSection.appendChild(recList);
        container.appendChild(recSection);
    }
    
    // Add Footer
    const footer = document.createElement('footer');
    footer.style.marginTop = '40px';
    footer.style.paddingTop = '20px';
    footer.style.borderTop = '1px solid #eee';
    footer.style.textAlign = 'center';
    footer.style.fontSize = '12px';
    footer.style.color = '#7f8c8d';
    
    const footerText = document.createElement('p');
    footerText.textContent = 'This report was generated by Space Habitat Designer. For more information, visit our website.';
    
    const copyright = document.createElement('p');
    copyright.textContent = `© ${new Date().getFullYear()} Space Habitat Designer. All rights reserved.`;
    
    footer.appendChild(footerText);
    footer.appendChild(copyright);
    container.appendChild(footer);
    
    // Configure PDF options for better rendering
    const opt = {
        margin: [10, 10, 10, 10], // Smaller margins to maximize space
        filename: `space-habitat-analysis_${userData.name ? userData.name.replace(/\s+/g, '-').toLowerCase() : 'design'}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
            type: 'jpeg', 
            quality: 0.8 
        },
        html2canvas: { 
            scale: 1.5, // Slightly reduced scale for better rendering
            logging: false,
            useCORS: true, // Enable CORS for the design image
            letterRendering: false, // Disable for better performance
            allowTaint: true, // Allow tainted canvas
            scrollX: 0,
            scrollY: 0,
            windowWidth: 794, // A4 width in pixels at 72dpi
            width: 794,
            height: container.scrollHeight,
            x: 0,
            y: 0,
            scale: 1,
            dpi: 300,
            backgroundColor: '#FFFFFF'
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4',
            orientation: 'portrait',
            compress: true
        },
        pagebreak: { 
            mode: 'avoid-all',
            before: '.page-break-before',
            after: '.page-break-after',
            avoid: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'table', 'ul', 'ol', 'img']
        }
    };
    
    // Create a temporary container for PDF generation
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '20mm';
    tempContainer.style.boxSizing = 'border-box';
    document.body.appendChild(tempContainer);
    
    // Clone the content to the temporary container
    const contentClone = container.cloneNode(true);
    tempContainer.appendChild(contentClone);
    
    // Generate PDF from the temporary container
    html2pdf()
        .set(opt)
        .from(tempContainer)
        .save()
        .then(() => {
            showNotification('PDF report generated successfully!', 'success');
            // Clean up
            document.body.removeChild(tempContainer);
        })
        .catch(err => {
            console.error('Error generating PDF:', err);
            showNotification('Error generating PDF report. Please try again.', 'error');
            // Clean up even if there's an error
            document.body.removeChild(tempContainer);
        });
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
        
        // Create a temporary canvas for export with higher resolution (2x for better quality)
        const scaleFactor = 2; // Scale factor for higher resolution
        const exportCanvas = document.createElement('canvas');
        const exportCtx = exportCanvas.getContext('2d');
        
        // Calculate the required size for the export with margin
        const margin = 100 * scaleFactor; // Larger margin for better framing
        const width = (bbox.width * scaleFactor) + (margin * 2);
        const height = (bbox.height * scaleFactor) + (margin * 2);
        
        // Set canvas size with higher resolution
        exportCanvas.width = width;
        exportCanvas.height = height;
        
        // Fill with white background
        exportCtx.fillStyle = 'white';
        exportCtx.fillRect(0, 0, width, height);
        
        // Set up the export context with scaling
        exportCtx.save();
        exportCtx.translate(margin, margin);
        exportCtx.scale(scaleFactor, scaleFactor);
        
        // Enable image smoothing for better quality
        exportCtx.imageSmoothingEnabled = true;
        exportCtx.imageSmoothingQuality = 'high';
        
        // Draw grid if enabled
        if (appState.showGrid) {
            exportCtx.strokeStyle = "#f0f0f0";
            exportCtx.lineWidth = 1 / scaleFactor;
            
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
        
        // Draw habitat border with higher quality
        exportCtx.save();
        exportCtx.scale(1, 1);
        shape.draw(exportCtx, appState.habitatLength, appState.habitatWidth, appState.habitatHeight, 0, 0, 1);
        exportCtx.restore();
        
        // Draw all items with improved rendering
        for (let level = 0; level < appState.totalLevels; level++) {
            for (const item of placedItems[level]) {
                const w = item.data.width * SCALE;
                const l = item.data.length * SCALE;
                
                exportCtx.save();
                
                const centerX = item.x + w / 2;
                const centerY = item.y + l / 2;

                exportCtx.translate(centerX, centerY);
                exportCtx.rotate(item.rotation * Math.PI / 180);
                
                // Draw the item image (with fallback to prevent security errors)
                try {
                    const img = itemImages[item.data.name];
                    if (img && img.complete && img.naturalHeight !== 0) {
                        // Calculate dimensions to fill the box while maintaining aspect ratio
                        const boxAspect = w / l;
                        const imgAspect = img.width / img.height;
                        
                        let drawWidth, drawHeight, x, y;
                        
                        if (boxAspect > imgAspect) {
                            // Box is wider than image (relative to height)
                            drawHeight = l;
                            drawWidth = drawHeight * imgAspect;
                            x = -drawWidth / 2;
                            y = -l / 2;
                        } else {
                            // Box is taller than image (relative to width)
                            drawWidth = w;
                            drawHeight = drawWidth / imgAspect;
                            x = -w / 2;
                            y = -drawHeight / 2;
                        }
                        
                        // Draw the image with high quality
                        exportCtx.imageSmoothingEnabled = true;
                        exportCtx.imageSmoothingQuality = 'high';
                        exportCtx.drawImage(img, x, y, drawWidth, drawHeight);
                        
                        // Draw selection border if the item is selected
                        if (item === appState.selectedItem) {
                            exportCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
                            exportCtx.lineWidth = 3 / scaleFactor;
                            exportCtx.setLineDash([5, 5]);
                            exportCtx.strokeRect(-w/2, -l/2, w, l);
                        }
                    } else {
                        // Fallback: draw a colored rectangle with the first letter
                        exportCtx.fillStyle = item.data.color;
                        exportCtx.fillRect(-w/2, -l/2, w, l);
                        exportCtx.fillStyle = 'white';
                        exportCtx.font = 'bold ' + (Math.min(w, l) * 0.4) + 'px Arial';
                        exportCtx.textAlign = 'center';
                        exportCtx.textBaseline = 'middle';
                        exportCtx.fillText(item.data.name.charAt(0), 0, 0);
                    }
                } catch (error) {
                    console.warn('Error drawing image for export:', error);
                    // Fallback: draw a colored rectangle with the first letter
                    exportCtx.fillStyle = item.data.color;
                    exportCtx.fillRect(-w/2, -l/2, w, l);
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
        
        // Add a nice header with logo and details
        exportCtx.save();
        exportCtx.fillStyle = '#f8f9fa';
        exportCtx.fillRect(0, 0, width, 70);
        
        // Draw a subtle border
        exportCtx.strokeStyle = '#dee2e6';
        exportCtx.lineWidth = 1;
        exportCtx.strokeRect(0, 0, width, 70);
        
        // Add title and metadata
        exportCtx.fillStyle = '#212529';
        exportCtx.font = `bold ${18 * scaleFactor}px 'Segoe UI', Arial, sans-serif`;
        exportCtx.textBaseline = 'middle';
        exportCtx.fillText('SPACE HABITAT DESIGN', 20 * scaleFactor, 35 * scaleFactor);
        
        // Add details on the right
        const details = [
            `Habitat: ${shape.name}`,
            `Dimensions: ${appState.habitatLength}m × ${appState.habitatWidth}m × ${appState.habitatHeight}m`,
            `Astronauts: ${appState.numAstronauts} • Duration: ${appState.missionDuration} days`,
            `Generated: ${new Date().toLocaleDateString()}`
        ];
        
        exportCtx.font = `${11 * scaleFactor}px 'Segoe UI', Arial, sans-serif`;
        exportCtx.textAlign = 'right';
        details.forEach((text, i) => {
            exportCtx.fillText(text, width - (20 * scaleFactor), (25 + (i * 15)) * scaleFactor);
        });
        exportCtx.restore();
        
        // Add a subtle watermark
        exportCtx.save();
        exportCtx.globalAlpha = 0.1;
        exportCtx.font = `bold ${60 * scaleFactor}px 'Segoe UI', Arial, sans-serif`;
        exportCtx.fillStyle = '#000';
        exportCtx.textAlign = 'center';
        exportCtx.textBaseline = 'middle';
        exportCtx.fillText('SPACE HABITAT', width / 2, height / 2);
        exportCtx.restore();
        
        // Add border around the entire export
        exportCtx.strokeStyle = '#dee2e6';
        exportCtx.lineWidth = 2 * scaleFactor;
        exportCtx.strokeRect(0, 0, width, height);
        
        // Create a new canvas for final export with higher quality
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = width;
        finalCanvas.height = height;
        const finalCtx = finalCanvas.getContext('2d');
        
        // Set white background
        finalCtx.fillStyle = 'white';
        finalCtx.fillRect(0, 0, width, height);
        
        // Draw the content with better quality
        finalCtx.imageSmoothingEnabled = true;
        finalCtx.imageSmoothingQuality = 'high';
        finalCtx.drawImage(exportCanvas, 0, 0, width, height);
        
        // Convert to Blob for better quality
        finalCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `space-habitat-design_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = url;
            link.click();
            
            // Clean up
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
            showNotification('Design exported as high-quality PNG', 'success');
        }, 'image/png', 1);
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
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const headerControls = document.getElementById('header-controls');
    
    if (mobileMenuToggle && headerControls) {
        mobileMenuToggle.addEventListener('click', function() {
            headerControls.classList.toggle('active');
            const icon = this.querySelector('i');
            if (headerControls.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !headerControls.contains(e.target)) {
                headerControls.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
    
    // Try to load saved design on startup
    setTimeout(loadSavedDesign, 500);
}

// Initialize the application when the page loads
window.addEventListener('DOMContentLoaded', init);
window.addEventListener('resize', resizeCanvas);
 