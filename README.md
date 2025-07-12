# RaReReviews 🌟

A comprehensive review platform where users can share honest reviews about everything - from restaurants and gadgets to services and experiences. Built with modern web technologies and featuring an excellent user experience.

![RaReReviews Landing Page](https://via.placeholder.com/800x400?text=RaReReviews+Landing+Page)

## ✨ Features

### 🔐 Authentication
- Secure authentication via Replit Auth
- User profiles with avatars and stats
- Session management with PostgreSQL storage

### 📝 Review System
- Rich text editor for detailed reviews
- Star rating system (1-5 stars)
- Image upload support (up to 5 images per review)
- Draft functionality to save work in progress
- Categories for organized browsing

### 🗂️ Categories
- Pre-defined categories: Restaurants, Technology, Travel, Beauty, Shopping, Health
- Color-coded category system
- Category-specific filtering

### 🔍 Browse & Search
- Advanced filtering by category, rating, and keywords
- Multiple sorting options (recent, rating, helpful, oldest)
- Grid and list view modes
- Search across review titles and content

### 👤 User Dashboard
- Personal review management
- Draft reviews
- User statistics (total reviews, average rating, helpful votes)
- Analytics section (coming soon)

### 🎨 Modern UI/UX
- Responsive design for all devices
- Clean, intuitive interface
- Dark mode support
- Smooth animations and transitions
- Accessible design patterns

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for lightweight routing
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Hook Form** + **Zod** for form validation

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon PostgreSQL** for data storage
- **Multer** for file uploads
- **Passport.js** with OpenID Connect for authentication

### Database
- **PostgreSQL** with the following tables:
  - Users (with Replit Auth integration)
  - Categories
  - Reviews
  - Review Votes
  - Sessions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/rarereviews.git
cd rarereviews
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
REPL_ID=your_replit_app_id
REPLIT_DOMAINS=your_domain.replit.app
```

4. Set up the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management

## 🏗️ Project Structure

```
rarereviews/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express application
│   ├── db.ts             # Database connection
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database operations
│   └── replitAuth.ts     # Authentication setup
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── uploads/              # User uploaded images
```

## 🔑 Key Features Explained

### Review Creation
Users can create detailed reviews with:
- Rich text content with formatting options
- 1-5 star ratings
- Multiple image uploads
- Category selection
- Draft saving functionality

### Voting System
- Users can vote reviews as "helpful" or "not helpful"
- Vote counts are displayed on review cards
- Prevents duplicate voting per user

### Search & Filtering
- Full-text search across review titles and content
- Filter by category, minimum rating
- Sort by recency, rating, or helpfulness
- Pagination for large result sets

## 🔒 Security Features

- Secure session management
- File upload validation
- SQL injection prevention via Drizzle ORM
- Authentication middleware protection
- CORS and security headers

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop computers
- Tablets
- Mobile phones
- Various screen sizes and orientations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Replit](https://replit.com) for seamless development
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Database powered by [Neon](https://neon.tech/)

## 📞 Support

If you have any questions or need help setting up the project, please open an issue or contact the maintainers.

---

**RaReReviews** - Share honest reviews, discover authentic experiences! 🌟