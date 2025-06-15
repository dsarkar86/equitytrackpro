// Collection of stock photo URLs for use throughout the app

// Modern real estate properties
export const propertyImages = [
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Single family home
  "https://images.unsplash.com/photo-1490122417551-6ee9691429d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Condo building
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Craftsman home
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Modern house
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Luxury property
  "https://images.unsplash.com/photo-1513584684374-8bab748fbf90?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"  // Townhouse
];

// Home renovation/maintenance images
export const maintenanceImages = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Renovation
  "https://images.unsplash.com/photo-1631253666062-84aa92b8cd23?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Kitchen renovation
  "https://images.unsplash.com/photo-1621905251918-48416bd8575a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Bathroom remodel
  "https://images.unsplash.com/photo-1532555624875-373844e1b8ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Painting
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Roof work
  "https://images.unsplash.com/photo-1581578731548-9c782c1c6ed6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"  // Home improvement
];

// Construction trades workers
export const tradesImages = [
  "https://images.unsplash.com/photo-1516822003754-cca485356ecb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Electrician
  "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Carpenter
  "https://images.unsplash.com/photo-1581578731548-9c782c1c6ed7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80", // Plumber
  "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"  // HVAC technician
];

// Function to get a random image from an array
export function getRandomImage(images: string[]): string {
  return images[Math.floor(Math.random() * images.length)];
}

// Function to get an image by index (with fallback)
export function getImageByIndex(images: string[], index: number): string {
  return images[index % images.length];
}
