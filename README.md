# Booking App - Vietnamese Home Rental Platform

A modern, responsive booking platform for Vietnamese home rentals, inspired by Localhome.vn. Built with Next.js 15 and TypeScript.

## ✨ Features

- 🏠 **Home Listings**: Beautiful cards showing rental properties with images, pricing, and details
- 🌍 **Multi-Location Support**: Browse homes in different Vietnamese cities (Cần Thơ, An Giang, Kiên Giang)
- 📅 **Booking Calendar**: Interactive calendar showing availability across all properties
- 💰 **Dynamic Pricing**: Display original and discounted prices
- 📱 **Responsive Design**: Mobile-friendly interface with collapsible navigation
- 🎨 **Modern UI**: Clean design with gradient backgrounds and smooth animations
- ⚡ **Interactive Booking**: One-click booking with loading states and confirmation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd booking-app
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
booking-app/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable React components
│   │   │   ├── Header.tsx       # Navigation header
│   │   │   ├── Header.module.css
│   │   │   ├── HomeCard.tsx     # Property listing card
│   │   │   └── HomeCard.module.css
│   │   ├── globals.css          # Global styles
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main page
│   │   └── page.module.css      # Page-specific styles
│   └── ...
├── public/                      # Static assets
├── package.json
└── README.md
```

## 🎨 Design Features

- **Color Scheme**: Pink/red gradient theme matching Vietnamese rental platforms
- **Typography**: Clean, readable fonts with proper hierarchy
- **Cards**: Hover effects and smooth transitions
- **Mobile-First**: Responsive design that works on all devices
- **Interactive Elements**: Buttons with loading states and hover effects

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: CSS Modules, CSS Grid, Flexbox
- **Build**: Turbopack (Next.js dev server)
- **Package Manager**: npm

## 📱 Responsive Design

The app is fully responsive and includes:
- Mobile hamburger menu
- Adaptive grid layouts
- Touch-friendly interactive elements
- Optimized calendar view for mobile

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Components

### Header Component
- Responsive navigation with mobile menu
- Sticky positioning
- Gradient background matching theme

### HomeCard Component
- Reusable property listing component
- Configurable for different display modes
- Interactive booking functionality
- Customizable gradient backgrounds

### Main Page
- Multiple sections for different locations
- Dynamic data rendering
- Booking calendar integration

## 🌟 Future Enhancements

- Backend API integration
- User authentication
- Payment gateway integration
- Advanced search and filtering
- Real-time availability updates
- Email notifications
- Multi-language support

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
# homestay-booking
